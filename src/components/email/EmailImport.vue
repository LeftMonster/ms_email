<template>
  <div class="email-import">
    <div class="card">
      <h1>邮箱账户导入</h1>
      <p>您可以通过上传包含邮箱账户信息的文本文件来批量导入邮箱账户。</p>

      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="successMessage" class="success">{{ successMessage }}</div>

      <form @submit.prevent="submitImport">

        <!-- 邮箱类型选择部分 -->
        <div class="form-group">
          <label class="form-label">选择邮箱类型</label>

          <div class="email-type-container">
            <div
                v-for="type in accountTypes"
                :key="type.id"
                class="email-type-card"
                :class="{ 'selected': selectedType === type.id }"
                @click="selectedType = type.id"
            >
              <div class="email-type-logo">
                <!--                <img v-if="type.logo_path" :src="require(`@/assets/${type.logo_path}`)" :alt="type.name"/>-->
                <img v-if="type.logo_path" :src='type.logo_path' :alt="type.name"/>
                <div v-else class="logo-placeholder">
                  <i class="fas fa-envelope"></i>
                </div>
              </div>
              <div class="email-type-name">{{ type.name }}</div>
            </div>
          </div>

          <small>不同邮箱类型的凭据格式可能不同，请确保您的文件符合要求。</small>
        </div>

        <!-- 这是文件上传区域部分的代码 -->
        <div class="form-group">
          <label class="form-label">上传凭据文件</label>

          <div class="file-upload-container">
            <div
                class="file-upload-area"
                :class="{'has-file': selectedFileName, 'drag-over': isDragging}"
                @click="triggerFileInput"
                @dragover.prevent="onDragOver"
                @dragleave.prevent="onDragLeave"
                @drop.prevent="onFileDrop"
            >
              <div v-if="!selectedFileName" class="upload-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>点击上传文件或拖拽文件到此处</p>
                <p class="upload-hint">支持 .txt, .csv 格式</p>
              </div>
              <div v-else class="selected-file">
                <i class="fas fa-file-alt"></i>
                <p>{{ selectedFileName }}</p>
                <button class="remove-file-btn" @click.stop="removeFile">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <input
                type="file"
                ref="fileInput"
                accept=".txt,.csv"
                @change="handleFileChange"
                class="hidden-file-input"
                
            />
          </div>

          <small>文件应为文本格式，每行包含一个邮箱账户的信息（如：email----password 或 email,token）</small>
        </div>

        <div class="format-info">
          <h3>支持的格式：</h3>
          <ul>
            <li><code>email@example.com----password</code></li>
            <li><code>email@example.com,password</code></li>
            <li><code>email@example.com;password</code></li>
            <li><code>email@example.com:password</code></li>
            <li><code>email@example.com|password</code></li>
            <li><code>email@example.com password</code> (空格分隔)</li>
          </ul>

          <p>其中 password 也可以是 token，取决于邮箱类型的验证方式。</p>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="loading" class="submit-button">
            <i class="fas fa-cloud-upload-alt" v-if="!loading"></i>
            <i class="fas fa-spinner fa-spin" v-else></i>
            {{ loading ? '提交中...' : '提交导入任务' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 导入结果模态框 -->
    <div v-if="showResultModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h2>导入任务已提交</h2>
        </div>

        <div class="modal-content">
          <p>您的导入任务已成功提交，系统正在处理中。</p>

          <div class="import-stats">
            <div class="stat-item">
              <span class="stat-label">有效记录数：</span>
              <span class="stat-value">{{ importResult.valid_count || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">无效记录数：</span>
              <span class="stat-value">{{ importResult.invalid_count || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">任务ID：</span>
              <span class="stat-value">{{ importResult.task_id || 'N/A' }}</span>
            </div>
          </div>

          <div class="task-actions">
            <router-link :to="`/import-tasks?highlight=${importResult.task_id}`">
              <button>查看任务进度</button>
            </router-link>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeResultModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, computed, onMounted} from 'vue'
import {useStore} from 'vuex'
import {useRouter} from 'vue-router'
import api from '../../services/http'

export default {
  name: 'EmailImport',

  setup() {
    const store = useStore()
    const router = useRouter()

    const loading = ref(false)
    const error = ref(null)
    const successMessage = ref(null)
    const selectedFile = ref(null)
    const selectedFileName = ref('')
    const selectedType = ref('')
    const fileInput = ref(null)
    const showResultModal = ref(false)
    const importResult = ref({})

    // 账户类型数据，通常从API获取
    const accountTypes = ref([])

    // 加载邮箱账户类型

// 加载邮箱账户类型
    const loadAccountTypes = async () => {
      try {
        loading.value = true
        // 从API获取邮箱类型
        const response = await api.get('/emails/account-types/')
        if (response.data.success) {
          accountTypes.value = response.data.data || []
        } else {
          error.value = response.data.message || '加载邮箱类型失败'
        }
      } catch (err) {
        console.error('Error loading account types:', err)
        error.value = '加载邮箱类型失败，请刷新页面重试'
      } finally {
        loading.value = false
      }
    }

    // 触发文件选择
    const triggerFileInput = () => {
      fileInput.value.click()
    }

    // 移除已选择的文件
    const removeFile = () => {
      selectedFile.value = null
      selectedFileName.value = ''
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    // 处理文件选择
    const handleFileChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB限制
          error.value = '文件过大，请上传小于10MB的文件'
          fileInput.value.value = ''
          selectedFile.value = null
          selectedFileName.value = ''
          return
        }

        selectedFile.value = file
        selectedFileName.value = file.name
        error.value = null
      } else {
        selectedFile.value = null
        selectedFileName.value = ''
      }
    }

    // 提交导入任务
    const submitImport = async () => {
      if (!selectedType.value) {
        error.value = '请选择邮箱类型'
        return
      }

      if (!selectedFile.value) {
        error.value = '请选择要上传的文件'
        return
      }

      error.value = null
      loading.value = true

      try {
        const formData = new FormData()
        formData.append('file', selectedFile.value)
        formData.append('account_type', selectedType.value)

        // 调用API提交导入任务
        const response = await api.post('/emails/import/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        if (response.data.success) {
          successMessage.value = '导入任务已提交，正在处理中'
          importResult.value = response.data.data
          showResultModal.value = true

          // 重置表单
          selectedFile.value = null
          selectedFileName.value = ''
          selectedType.value = ''
          if (fileInput.value) {
            fileInput.value.value = ''
          }
        } else {
          error.value = response.data.message || '提交导入任务失败'
        }
      } catch (err) {
        console.error('Error submitting import task:', err)
        error.value = err.response?.data?.message || '提交导入任务失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }

    // 关闭结果模态框
    const closeResultModal = () => {
      showResultModal.value = false
    }

    // 文件拖拽相关状态和方法
    const isDragging = ref(false);

// 当文件拖到上传区域上方时
    const onDragOver = () => {
      isDragging.value = true;
    };

// 当文件离开上传区域时
    const onDragLeave = () => {
      isDragging.value = false;
    };

// 当文件被拖放到上传区域时
    const onFileDrop = (event) => {
      isDragging.value = false;
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];

        // 检查文件类型
        const validExtensions = ['.txt', '.csv'];
        const fileName = file.name.toLowerCase();
        const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));

        if (!isValidFile) {
          error.value = '请上传.txt或.csv格式的文件';
          return;
        }

        // 检查文件大小
        if (file.size > 10 * 1024 * 1024) { // 10MB限制
          error.value = '文件过大，请上传小于10MB的文件';
          return;
        }

        selectedFile.value = file;
        selectedFileName.value = file.name;
        error.value = null;
      }
    };

    onMounted(() => {
      loadAccountTypes()
    })

    return {
      loading,
      error,
      successMessage,
      selectedFile,
      selectedFileName,
      selectedType,
      accountTypes,
      fileInput,
      showResultModal,
      importResult,
      handleFileChange,
      triggerFileInput,
      removeFile,
      submitImport,
      closeResultModal,
      isDragging,
      onDragOver,
      onDragLeave,
      onFileDrop
    }
  }
}
</script>

<style scoped>
.email-import {
  max-width: 800px;
  margin: 0 auto;
}

/* 邮箱类型选择样式 */
.email-type-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  margin-top: 10px;
}

.email-type-card {
  width: 120px;
  height: 120px;
  border-radius: 10px;
  border: 2px solid #eaeaea;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.email-type-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-color: #d0d0d0;
}

.email-type-card.selected {
  border-color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.05);
}

.email-type-card.selected::after {
  content: '\f00c';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  position: absolute;
  top: 5px;
  right: 5px;
  color: #4CAF50;
  font-size: 14px;
}

.email-type-logo {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.email-type-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.email-type-name {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  color: #333;
}

/* 文件上传样式 */
.file-upload-container {
  margin: 10px 0;
}

.hidden-file-input {
  display: none;
}

.file-upload-area {
  border: 2px dashed #d0d0d0;
  border-radius: 10px;
  padding: 30px 20px;
  text-align: center;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-upload-area:hover {
  border-color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.05);
}

.file-upload-area.has-file {
  border-color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.05);
}

.upload-placeholder {
  color: #666;
}

.upload-placeholder i {
  font-size: 48px;
  color: #999;
  margin-bottom: 15px;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.selected-file {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.selected-file i {
  font-size: 36px;
  color: #4CAF50;
  margin-bottom: 10px;
}

.selected-file p {
  margin: 5px 0;
  color: #333;
  word-break: break-all;
}

.remove-file-btn {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 5px;
  margin-top: 8px;
}

.remove-file-btn:hover {
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 50%;
}

/* 提交按钮样式 */
.submit-button {
  background-color: #4CAF50;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.submit-button:hover {
  background-color: #45a049;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.submit-button i {
  margin-right: 8px;
}

.format-info {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #3498db;
}

.format-info h3 {
  margin-top: 0;
  color: #3498db;
}

.format-info ul {
  padding-left: 20px;
}

.format-info code {
  background-color: #eee;
  padding: 2px 5px;
  border-radius: 3px;
  font-family: monospace;
}

small {
  color: #666;
  display: block;
  margin-top: 5px;
}

.import-stats {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
}

.stat-item {
  margin-bottom: 10px;
  display: flex;
}

.stat-label {
  font-weight: bold;
  width: 120px;
}

.task-actions {
  margin-top: 20px;
  text-align: center;
}

/** 邮箱类型卡片样式 */
.logo-placeholder {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 50%;
}

.logo-placeholder i {
  font-size: 24px;
  color: #999;
}

/* 添加拖拽相关的样式 */
.file-upload-area.drag-over {
  border-color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.1);
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}
</style>