<template>
  <div class="mailu-deployment-page">
    <div class="page-header">
      <h1>Mailu 一键部署工具</h1>
      <p>快速生成 Mailu 邮件服务器部署脚本</p>
    </div>

    <div class="deployment-content">
      <div class="deployment-steps">
        <div class="step active">
          <div class="step-number">1</div>
          <div class="step-description">服务器配置</div>
        </div>
        <div class="step-divider"></div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-description">生成脚本</div>
        </div>
      </div>

      <div class="deployment-form">
        <mailu-deployment-script
            @script-generated="onScriptGenerated"
        />
      </div>

      <div v-if="generatedScript" class="script-preview">
        <h3>生成的部署脚本预览</h3>
        <pre><code>{{ generatedScript }}</code></pre>
        <div class="script-actions">
          <button @click="downloadScript" class="btn btn-primary">
            <i class="fas fa-download"></i> 下载脚本
          </button>
          <button @click="copyScript" class="btn btn-secondary">
            <i class="fas fa-copy"></i> 复制脚本
          </button>
        </div>
      </div>
    </div>

    <div class="deployment-help">
      <h3>使用帮助</h3>
      <ul>
        <li>服务器IP：填写目标服务器的公网IP地址</li>
        <li>域名：填写您想用于邮件服务的域名</li>
        <li>域名服务商：选择您的域名解析服务商</li>
        <li>域名Token：填写域名服务商的API Token，用于自动DNS配置</li>
      </ul>
    </div>
  </div>
</template>

<script>
import {ref} from 'vue'
import MailuDeploymentScript from './MailuDeploymentScript.vue'

export default {
  name: 'MailuDeployment',
  components: {
    MailuDeploymentScript
  },
  setup() {
    const generatedScript = ref(null)

    const onScriptGenerated = (script) => {
      generatedScript.value = script
    }

    const downloadScript = () => {
      const blob = new Blob([generatedScript.value], {type: 'text/x-shellscript'})
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `mailu_deploy_${new Date().toISOString().slice(0, 10)}.sh`
      link.click()
    }

    const copyScript = () => {
      navigator.clipboard.writeText(generatedScript.value)
          .then(() => {
            alert('脚本已复制到剪贴板')
          })
          .catch(err => {
            console.error('复制失败', err)
            alert('复制失败')
          })
    }

    return {
      generatedScript,
      onScriptGenerated,
      downloadScript,
      copyScript
    }
  }
}
</script>

<style scoped>
.mailu-deployment-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.deployment-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.5;
}

.step.active {
  opacity: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 10px;
}

.step-divider {
  width: 100px;
  height: 2px;
  background-color: #ddd;
  margin: 0 20px;
}

.deployment-form {
  margin-bottom: 30px;
}

.script-preview {
  background-color: #f4f4f4;
  padding: 20px;
  border-radius: 8px;
}

.script-preview pre {
  max-height: 300px;
  overflow-y: auto;
  background-color: #e9ecef;
  padding: 15px;
  border-radius: 4px;
}

.script-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.deployment-help {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.deployment-help ul {
  list-style-type: disc;
  padding-left: 30px;
}
</style>