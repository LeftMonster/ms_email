<template>
    <div class="microsoft-tools-container">
      <div class="header">
        <h1>微软工具</h1>
        <p class="description">本页面提供微软相关工具和功能</p>
      </div>
  
      <div class="tools-section">
        <div class="tools-card">
          <div class="card-header">
            <i class="fas fa-code"></i>
            <h2>微软代码有效性检测</h2>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label for="codeInput">粘贴您要检测的代码：</label>
              <textarea 
                id="codeInput" 
                v-model="code" 
                rows="10" 
                placeholder="在此粘贴微软相关代码..."
              ></textarea>
            </div>
            
            <div class="form-controls">
              <div class="form-group inline">
                <label for="codeType">代码类型：</label>
                <select id="codeType" v-model="codeType">
                  <option value="csharp">C#</option>
                  <option value="vbnet">VB.NET</option>
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="powershell">PowerShell</option>
                  <option value="other">其他</option>
                </select>
              </div>
              
              <div class="options">
                <label>
                  <input type="checkbox" v-model="options.checkSyntax">
                  语法检查
                </label>
                <label>
                  <input type="checkbox" v-model="options.checkBestPractices">
                  最佳实践
                </label>
                <label>
                  <input type="checkbox" v-model="options.checkSecurity">
                  安全漏洞检测
                </label>
                <label>
                  <input type="checkbox" v-model="options.checkPerformance">
                  性能分析
                </label>
              </div>
            </div>
            
            <div class="form-actions">
              <button 
                @click="validateCode" 
                :disabled="isValidating || !code.trim()" 
                class="primary-btn"
              >
                <i v-if="isValidating" class="fas fa-spinner fa-spin"></i>
                <span v-else>检测代码</span>
              </button>
              <button @click="clearAll" class="secondary-btn">清空</button>
            </div>
          </div>
        </div>
  
        <div v-if="validationResult" class="result-card">
          <div class="card-header" :class="resultHeaderClass">
            <i :class="resultIconClass"></i>
            <h2>检测结果</h2>
          </div>
          <div class="card-body">
            <div v-if="validationResult.status === 'success'" class="validation-success">
              <div class="summary">
                <i class="fas fa-check-circle"></i>
                <p>代码检测通过！未发现问题。</p>
              </div>
              <div class="details">
                <p><strong>代码类型:</strong> {{ getCodeTypeName(codeType) }}</p>
                <p><strong>检测项:</strong> {{ getCheckedOptions() }}</p>
                <p><strong>检测时间:</strong> {{ validationResult.timestamp }}</p>
              </div>
            </div>
  
            <div v-else-if="validationResult.status === 'warning'" class="validation-warning">
              <div class="summary">
                <i class="fas fa-exclamation-triangle"></i>
                <p>代码存在潜在问题，但不影响运行。</p>
              </div>
              <div class="issues">
                <h3>发现的问题:</h3>
                <ul>
                  <li v-for="(issue, index) in validationResult.issues" :key="index">
                    <div class="issue-header">
                      <span class="issue-type warning">警告</span>
                      <span class="issue-location" v-if="issue.location">行 {{ issue.location.line }}, 列 {{ issue.location.column }}</span>
                    </div>
                    <div class="issue-message">{{ issue.message }}</div>
                    <div class="issue-suggestion" v-if="issue.suggestion">
                      <strong>建议: </strong>{{ issue.suggestion }}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
  
            <div v-else-if="validationResult.status === 'error'" class="validation-error">
              <div class="summary">
                <i class="fas fa-times-circle"></i>
                <p>代码存在严重问题，无法正常运行。</p>
              </div>
              <div class="issues">
                <h3>发现的错误:</h3>
                <ul>
                  <li v-for="(issue, index) in validationResult.issues" :key="index">
                    <div class="issue-header">
                      <span class="issue-type error">错误</span>
                      <span class="issue-location" v-if="issue.location">行 {{ issue.location.line }}, 列 {{ issue.location.column }}</span>
                    </div>
                    <div class="issue-message">{{ issue.message }}</div>
                    <div class="issue-suggestion" v-if="issue.suggestion">
                      <strong>建议: </strong>{{ issue.suggestion }}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue'
  
  export default {
    name: 'MicrosoftTools',
    
    setup() {
      const code = ref('')
      const codeType = ref('csharp')
      const isValidating = ref(false)
      const validationResult = ref(null)
      const options = ref({
        checkSyntax: true,
        checkBestPractices: true,
        checkSecurity: false,
        checkPerformance: false
      })
  
      const resultHeaderClass = computed(() => {
        if (!validationResult.value) return ''
        
        const status = validationResult.value.status
        if (status === 'success') return 'success-header'
        if (status === 'warning') return 'warning-header'
        if (status === 'error') return 'error-header'
        return ''
      })
      
      const resultIconClass = computed(() => {
        if (!validationResult.value) return ''
        
        const status = validationResult.value.status
        if (status === 'success') return 'fas fa-check-circle'
        if (status === 'warning') return 'fas fa-exclamation-triangle'
        if (status === 'error') return 'fas fa-times-circle'
        return ''
      })
  
      const validateCode = async () => {
        if (!code.value.trim()) return
        
        isValidating.value = true
        
        try {
          // 模拟API调用延迟
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          // 简单模拟验证逻辑
          if (code.value.includes('error') || code.value.includes('错误')) {
            validationResult.value = {
              status: 'error',
              timestamp: new Date().toLocaleString(),
              issues: [
                {
                  type: 'syntax',
                  severity: 'error',
                  message: '语法错误: 代码中包含无效语法',
                  location: { line: 3, column: 10 },
                  suggestion: '检查错误处的语法并修正'
                },
                {
                  type: 'security',
                  severity: 'error',
                  message: '安全问题: 发现潜在的安全漏洞',
                  location: { line: 7, column: 5 },
                  suggestion: '使用安全的API或方法替代当前实现'
                }
              ]
            }
          } else if (code.value.includes('warning') || code.value.includes('警告')) {
            validationResult.value = {
              status: 'warning',
              timestamp: new Date().toLocaleString(),
              issues: [
                {
                  type: 'bestPractice',
                  severity: 'warning',
                  message: '最佳实践: 代码可能不符合微软推荐的最佳实践',
                  location: { line: 12, column: 8 },
                  suggestion: '考虑使用更现代的API或方法'
                },
                {
                  type: 'performance',
                  severity: 'warning',
                  message: '性能问题: 代码可能存在性能瓶颈',
                  location: { line: 18, column: 15 },
                  suggestion: '优化循环结构或考虑使用更高效的算法'
                }
              ]
            }
          } else {
            validationResult.value = {
              status: 'success',
              timestamp: new Date().toLocaleString(),
              issues: []
            }
          }
        } catch (error) {
          console.error('Error validating code:', error)
          validationResult.value = {
            status: 'error',
            timestamp: new Date().toLocaleString(),
            issues: [
              {
                type: 'system',
                severity: 'error',
                message: '系统错误: 验证过程中发生错误',
                suggestion: '请稍后重试或联系客服'
              }
            ]
          }
        } finally {
          isValidating.value = false
        }
      }
      
      const clearAll = () => {
        code.value = ''
        validationResult.value = null
      }
      
      const getCodeTypeName = (type) => {
        const typeMap = {
          'csharp': 'C#',
          'vbnet': 'VB.NET',
          'typescript': 'TypeScript',
          'javascript': 'JavaScript',
          'powershell': 'PowerShell',
          'other': '其他'
        }
        return typeMap[type] || type
      }
      
      const getCheckedOptions = () => {
        const selectedOptions = []
        if (options.value.checkSyntax) selectedOptions.push('语法检查')
        if (options.value.checkBestPractices) selectedOptions.push('最佳实践')
        if (options.value.checkSecurity) selectedOptions.push('安全漏洞检测')
        if (options.value.checkPerformance) selectedOptions.push('性能分析')
        return selectedOptions.join(', ')
      }
  
      return {
        code,
        codeType,
        options,
        isValidating,
        validationResult,
        resultHeaderClass,
        resultIconClass,
        validateCode,
        clearAll,
        getCodeTypeName,
        getCheckedOptions
      }
    }
  }
  </script>
  
  <style scoped>
  .microsoft-tools-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .header {
    margin-bottom: 30px;
  }
  
  .header h1 {
    margin-bottom: 10px;
    color: #333;
  }
  
  .description {
    color: #666;
    font-size: 16px;
  }
  
  .tools-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .tools-card, .result-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .card-header {
    padding: 15px 20px;
    background-color: #f0f0f0;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .card-header h2 {
    margin: 0;
    font-size: 18px;
  }
  
  .card-header i {
    font-size: 20px;
    color: #444;
  }
  
  .success-header {
    background-color: #d4edda;
    color: #155724;
  }
  
  .warning-header {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .error-header {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .card-body {
    padding: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-group.inline {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .form-group.inline label {
    margin-bottom: 0;
    flex-shrink: 0;
  }
  
  textarea, select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
  }
  
  select {
    width: auto;
  }
  
  .form-controls {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .options label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
  }
  
  .form-actions {
    display: flex;
    gap: 10px;
  }
  
  .primary-btn, .secondary-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 120px;
  }
  
  .primary-btn {
    background-color: #0078d7;
    color: white;
  }
  
  .primary-btn:hover:not(:disabled) {
    background-color: #005fa3;
  }
  
  .secondary-btn {
    background-color: #f0f0f0;
    color: #333;
  }
  
  .secondary-btn:hover {
    background-color: #e0e0e0;
  }
  
  .primary-btn:disabled {
    background-color: #9bc3e0;
    cursor: not-allowed;
  }
  
  .validation-success, .validation-warning, .validation-error {
    border-radius: 4px;
    overflow: hidden;
  }
  
  .summary {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .summary i {
    font-size: 24px;
  }
  
  .validation-success .summary i {
    color: #28a745;
  }
  
  .validation-warning .summary i {
    color: #ffc107;
  }
  
  .validation-error .summary i {
    color: #dc3545;
  }
  
  .details {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
  }
  
  .issues h3 {
    margin-top: 0;
    margin-bottom: 15px;
  }
  
  .issues ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .issues li {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 10px;
  }
  
  .issue-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .issue-type {
    font-weight: bold;
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 12px;
  }
  
  .issue-type.warning {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .issue-type.error {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .issue-location {
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #666;
  }
  
  .issue-message {
    margin-bottom: 8px;
  }
  
  .issue-suggestion {
    font-size: 13px;
    color: #555;
    background-color: #e9ecef;
    padding: 8px;
    border-radius: 3px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .form-controls {
      flex-direction: column;
    }
    
    .options {
      flex-direction: column;
    }
    
    .form-actions {
      flex-direction: column;
    }
    
    .primary-btn, .secondary-btn {
      width: 100%;
    }
  }
  </style>