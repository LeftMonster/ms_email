<template>
  <div class="email-tools">
    <div class="card">
      <h1>邮箱工具</h1>
      <p>您可以使用以下工具来管理和优化您的邮箱账户</p>

      <!-- 选项卡导航 -->
      <div class="tabs">
        <div
          class="tab"
          :class="{ 'active': activeTab === 'microsoft' }"
          @click="setActiveTab('microsoft')"
        >
          <i class="fab fa-microsoft"></i> 微软邮箱
        </div>
        <div
          class="tab"
          :class="{ 'active': activeTab === 'other' }"
          @click="setActiveTab('other')"
        >
          <i class="fas fa-envelope"></i> 其他邮箱
        </div>
      </div>

      <!-- 微软邮箱工具面板 -->
      <div v-if="activeTab === 'microsoft'" class="tab-content">
        <div class="error-message" v-if="error">{{ error }}</div>
        <div class="success-message" v-if="successMessage">{{ successMessage }}</div>

        <div class="tools-section">
          <h2>微软邮箱工具</h2>

          <!-- 微软邮箱选择 -->
          <div class="form-group">
            <label>选择邮箱账户</label>
            <div class="account-select">
              <select v-model="selectedAccount" :disabled="loading">
                <option value="">请选择邮箱账户</option>
                <option
                  v-for="account in microsoftAccounts"
                  :key="account.uid"
                  :value="account.uid"
                  :disabled="account.status !== 'available'"
                >
                  {{ account.email }} ({{ getStatusText(account.status) }})
                </option>
              </select>
              <button @click="loadAccounts" :disabled="loading" class="refresh-btn">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              </button>
            </div>
            <small>只有状态为"可用"的账户才能执行操作</small>
          </div>

          <!-- 一键跳过七天 -->
          <div class="tool-card">
            <div class="tool-header">
              <h3><i class="fas fa-forward"></i> 一键跳过七天</h3>
            </div>
            <div class="tool-body">
              <p>此功能可以让您的微软账户跳过七天的安全检查期，立即解除限制。</p>
              <div class="tool-action">
                <button
                  @click="skipSevenDays"
                  :disabled="!selectedAccount || loading || skipLoading"
                  class="action-button"
                >
                  <i class="fas" :class="skipLoading ? 'fa-spinner fa-spin' : 'fa-play'"></i>
                  {{ skipLoading ? '处理中...' : '执行操作' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 验证辅助邮箱 -->
          <div class="tool-card">
            <div class="tool-header">
              <h3><i class="fas fa-envelope-open-text"></i> 验证辅助邮箱</h3>
            </div>
            <div class="tool-body">
              <p>此功能可以帮助您验证绑定的辅助邮箱，提高账户安全性。</p>
              <div class="form-group">
                <label>辅助邮箱</label>
                <input
                  type="email"
                  v-model="auxiliaryEmail"
                  placeholder="请输入辅助邮箱地址"
                  :disabled="verifyLoading"
                />
              </div>
              <div class="tool-action">
                <button
                  @click="verifyAuxiliaryEmail"
                  :disabled="!selectedAccount || !isValidEmail(auxiliaryEmail) || loading || verifyLoading"
                  class="action-button"
                >
                  <i class="fas" :class="verifyLoading ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                  {{ verifyLoading ? '验证中...' : '验证邮箱' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 其他邮箱工具面板 (未来扩展) -->
      <div v-if="activeTab === 'other'" class="tab-content">
        <div class="tools-section">
          <h2>其他邮箱工具</h2>
          <div class="coming-soon">
            <i class="fas fa-tools fa-3x"></i>
            <p>更多邮箱类型的工具正在开发中，敬请期待...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作结果详情模态框 -->
    <div v-if="showResultModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h2>操作结果</h2>
          <button @click="closeResultModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-content">
          <div v-if="operationSuccess" class="operation-success">
            <i class="fas fa-check-circle fa-3x"></i>
            <h3>操作成功!</h3>
            <p>{{ resultMessage }}</p>
          </div>
          <div v-else class="operation-failure">
            <i class="fas fa-times-circle fa-3x"></i>
            <h3>操作失败!</h3>
            <p>{{ resultMessage }}</p>
          </div>
          <div v-if="operationDetails" class="operation-details">
            <h4>详细信息:</h4>
            <div class="details-content">
              <pre>{{ operationDetails }}</pre>
            </div>
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
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import api from '../../services/http'

export default {
  name: 'EmailTools',

  setup() {
    const store = useStore()

    // 状态管理
    const activeTab = ref('microsoft')
    const loading = ref(false)
    const error = ref(null)
    const successMessage = ref(null)
    const microsoftAccounts = ref([])
    const selectedAccount = ref('')
    const auxiliaryEmail = ref('')

    // 特定操作状态
    const skipLoading = ref(false)
    const verifyLoading = ref(false)

    // 结果模态框
    const showResultModal = ref(false)
    const operationSuccess = ref(false)
    const resultMessage = ref('')
    const operationDetails = ref('')

    // 设置活动选项卡
    const setActiveTab = (tab) => {
      activeTab.value = tab
      clearMessages()
    }

    // 清除提示消息
    const clearMessages = () => {
      error.value = null
      successMessage.value = null
    }

    // 加载微软邮箱账户
    const loadAccounts = async () => {
      loading.value = true
      clearMessages()

      try {
        const response = await api.get('/emails/microsoft-accounts/', {
          params: { page_size: 100 }  // 获取更多账户
        })

        if (response.data.success) {
          microsoftAccounts.value = response.data.data || []
        } else {
          error.value = response.data.message || '加载邮箱账户失败'
        }
      } catch (err) {
        console.error('Error loading Microsoft accounts:', err)
        error.value = err.response?.data?.message || '加载邮箱账户失败'
      } finally {
        loading.value = false
      }
    }

    // 执行跳过七天操作
    const skipSevenDays = async () => {
      if (!selectedAccount.value) {
        error.value = '请先选择邮箱账户'
        return
      }

      skipLoading.value = true
      clearMessages()

      try {
        const response = await api.post(`/emails/microsoft-tools/skip-days/`, {
          account_id: selectedAccount.value
        })

        if (response.data.success) {
          successMessage.value = '成功触发跳过七天操作'

          // 显示结果模态框
          operationSuccess.value = true
          resultMessage.value = '您的微软账户已成功跳过七天的安全检查期。'
          operationDetails.value = JSON.stringify(response.data.data, null, 2)
          showResultModal.value = true

          // 重新加载账户列表以更新状态
          await loadAccounts()
        } else {
          error.value = response.data.message || '跳过七天操作失败'

          // 显示失败结果
          operationSuccess.value = false
          resultMessage.value = '无法完成跳过七天操作，请稍后重试。'
          operationDetails.value = JSON.stringify(response.data.error || response.data.message, null, 2)
          showResultModal.value = true
        }
      } catch (err) {
        console.error('Error skipping seven days:', err)
        error.value = err.response?.data?.message || '执行操作失败'

        // 显示错误结果
        operationSuccess.value = false
        resultMessage.value = '执行跳过七天操作时发生错误。'
        operationDetails.value = err.message
        showResultModal.value = true
      } finally {
        skipLoading.value = false
      }
    }

    // 验证辅助邮箱
    const verifyAuxiliaryEmail = async () => {
      if (!selectedAccount.value) {
        error.value = '请先选择邮箱账户'
        return
      }

      if (!isValidEmail(auxiliaryEmail.value)) {
        error.value = '请输入有效的辅助邮箱地址'
        return
      }

      verifyLoading.value = true
      clearMessages()

      try {
        const response = await api.post(`/emails/microsoft-tools/verify-auxiliary/`, {
          account_id: selectedAccount.value,
          auxiliary_email: auxiliaryEmail.value
        })

        if (response.data.success) {
          successMessage.value = '辅助邮箱验证请求已发送'

          // 显示结果模态框
          operationSuccess.value = true
          resultMessage.value = '验证请求已发送到辅助邮箱，请查收并按照指引完成验证。'
          operationDetails.value = JSON.stringify(response.data.data, null, 2)
          showResultModal.value = true
        } else {
          error.value = response.data.message || '辅助邮箱验证失败'

          // 显示失败结果
          operationSuccess.value = false
          resultMessage.value = '无法发送辅助邮箱验证请求。'
          operationDetails.value = JSON.stringify(response.data.error || response.data.message, null, 2)
          showResultModal.value = true
        }
      } catch (err) {
        console.error('Error verifying auxiliary email:', err)
        error.value = err.response?.data?.message || '验证辅助邮箱失败'

        // 显示错误结果
        operationSuccess.value = false
        resultMessage.value = '验证辅助邮箱时发生错误。'
        operationDetails.value = err.message
        showResultModal.value = true
      } finally {
        verifyLoading.value = false
      }
    }

    // 关闭结果模态框
    const closeResultModal = () => {
      showResultModal.value = false
    }

    // 验证邮箱格式
    const isValidEmail = (email) => {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'available': '可用',
        'locked': '锁定',
        'banned': '封禁',
        'expired': '过期',
        'recovery': '待恢复(手机号)',
        'under_review': '审核中'
      }
      return statusMap[status] || status
    }

    // 组件挂载时加载邮箱账户
    onMounted(() => {
      loadAccounts()
    })

    return {
      activeTab,
      loading,
      error,
      successMessage,
      microsoftAccounts,
      selectedAccount,
      auxiliaryEmail,
      skipLoading,
      verifyLoading,
      showResultModal,
      operationSuccess,
      resultMessage,
      operationDetails,
      setActiveTab,
      loadAccounts,
      skipSevenDays,
      verifyAuxiliaryEmail,
      closeResultModal,
      getStatusText,
      isValidEmail,
      clearMessages
    }
  }
}
</script>

<style scoped>
.email-tools {
  max-width: 900px;
  margin: 0 auto;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
}

.tab {
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  font-weight: 500;
  color: #666;
}

.tab:hover {
  background-color: #f5f5f5;
  color: #333;
}

.tab.active {
  border-bottom-color: #4CAF50;
  color: #4CAF50;
  font-weight: 600;
}

.tab-content {
  padding: 10px 0;
}

.tools-section {
  margin-bottom: 30px;
}

.tools-section h2 {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  color: #333;
}

.account-select {
  display: flex;
  gap: 10px;
}

.account-select select {
  flex: 1;
}

.refresh-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #333;
}

.refresh-btn:hover {
  background-color: #e0e0e0;
}

.tool-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
  margin-bottom: 20px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.tool-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tool-header {
  padding: 15px 20px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #eee;
}

.tool-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
}

.tool-body {
  padding: 20px;
}

.tool-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.action-button {
  background-color: #4CAF50;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #999;
  text-align: center;
}

.coming-soon i {
  margin-bottom: 20px;
  opacity: 0.5;
}

.coming-soon p {
  font-size: 18px;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 12px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-content {
  padding: 25px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  text-align: right;
}

.operation-success,
.operation-failure {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
}

.operation-success i {
  color: #4CAF50;
  margin-bottom: 15px;
}

.operation-failure i {
  color: #f44336;
  margin-bottom: 15px;
}

.operation-details {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.details-content {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

.details-content pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 13px;
}

@media (max-width: 768px) {
  .tabs {
    flex-direction: column;
    border-bottom: none;
  }

  .tab {
    border-bottom: 1px solid #ddd;
    border-left: 3px solid transparent;
  }

  .tab.active {
    border-left-color: #4CAF50;
    border-bottom-color: #ddd;
  }

  .account-select {
    flex-direction: column;
  }
}
</style>