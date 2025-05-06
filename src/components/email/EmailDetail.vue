<template>
  <div class="email-detail">
    <div class="header">
      <div class="header-left">
        <h1>邮件详情</h1>
        <div class="email-id" v-if="email">
          <span class="label">ID:</span>
          <span class="value">{{ email.id || '-' }}</span>
        </div>
      </div>
      <div class="header-right">
        <button @click="goBack" class="back-button">
          <i class="fas fa-arrow-left"></i> 返回邮件列表
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="!email" class="not-found">
      <p>邮件不存在或已被删除</p>
      <button @click="goBack" class="back-button">返回邮件列表</button>
    </div>

    <div v-else class="email-content">
      <!-- 邮件基本信息 -->
      <div class="info-section">
        <h2>基本信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">主题</div>
            <div class="info-value">{{ email.subject || '(无主题)' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">发件人</div>
            <div class="info-value">{{ email.from_name }} &lt;{{ email.from_email }}&gt;</div>
          </div>
          <div class="info-item">
            <div class="info-label">收件时间</div>
            <div class="info-value">{{ formatDate(email.received_datetime) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">状态</div>
            <div class="info-value">
              <span class="status-tag" :class="email.is_read ? 'status-completed' : 'status-pending'">
                {{ email.is_read ? '已读' : '未读' }}
              </span>
            </div>
          </div>
          <div class="info-item" v-if="email.importance">
            <div class="info-label">重要性</div>
            <div class="info-value">{{ getImportanceText(email.importance) }}</div>
          </div>
          <div class="info-item" v-if="email.has_attachments">
            <div class="info-label">附件</div>
            <div class="info-value">
              <span class="attachment-tag">包含附件</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 收件人信息 -->
      <div class="recipients-section">
        <h2>收件人信息</h2>
        <div class="recipients-content">
          <div class="recipient-group">
            <div class="recipient-label">收件人：</div>
            <div class="recipient-list">
              <span v-for="(recipient, index) in email.to_recipients" :key="'to-'+index" class="recipient-item">
                {{ recipient.name || recipient.address }} &lt;{{ recipient.address }}&gt;
              </span>
            </div>
          </div>

          <div v-if="email.cc_recipients && email.cc_recipients.length > 0" class="recipient-group">
            <div class="recipient-label">抄送：</div>
            <div class="recipient-list">
              <span v-for="(recipient, index) in email.cc_recipients" :key="'cc-'+index" class="recipient-item">
                {{ recipient.name || recipient.address }} &lt;{{ recipient.address }}&gt;
              </span>
            </div>
          </div>

          <div v-if="email.bcc_recipients && email.bcc_recipients.length > 0" class="recipient-group">
            <div class="recipient-label">密送：</div>
            <div class="recipient-list">
              <span v-for="(recipient, index) in email.bcc_recipients" :key="'bcc-'+index" class="recipient-item">
                {{ recipient.name || recipient.address }} &lt;{{ recipient.address }}&gt;
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 邮件内容 -->
      <div class="body-section">
        <h2>邮件内容</h2>
        <div class="body-content">
          <p>{{ email.body_preview }}</p>
          <p class="note">注意：此处仅显示邮件预览内容。要查看完整内容，请通过OAuth授权完整访问权限。</p>
        </div>
      </div>

      <!-- 附件信息 -->
      <div v-if="email.has_attachments" class="attachments-section">
        <h2>附件信息</h2>
        <div class="attachments-content">
          <p>邮件包含附件，但由于API限制，目前无法显示附件列表。</p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-section">
        <button @click="toggleReadStatus" class="action-button read-button">
          <i class="fas" :class="email.is_read ? 'fa-envelope' : 'fa-envelope-open'"></i>
          {{ email.is_read ? '标为未读' : '标为已读' }}
        </button>
        <button @click="confirmDelete" class="action-button delete-button">
          <i class="fas fa-trash-alt"></i> 删除邮件
        </button>
        <button v-if="email.has_attachments" class="action-button download-button" disabled>
          <i class="fas fa-download"></i> 下载附件
        </button>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>确认删除</h3>
          <button @click="cancelDelete" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>您确定要删除这封邮件吗？此操作不可撤销。</p>
          <div class="modal-details" v-if="email">
            <div class="detail-item">
              <span>主题:</span> <span>{{ email.subject || '(无主题)' }}</span>
            </div>
            <div class="detail-item">
              <span>发件人:</span> <span>{{ email.from_name }} &lt;{{ email.from_email }}&gt;</span>
            </div>
            <div class="detail-item">
              <span>收件时间:</span> <span>{{ formatDate(email.received_datetime) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="deleteEmail" class="delete-button">
            <i class="fas fa-trash-alt"></i> 确认删除
          </button>
          <button @click="cancelDelete" class="cancel-button">
            <i class="fas fa-times"></i> 取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, computed, onMounted} from 'vue'
import {useStore} from 'vuex'
import {useRouter, useRoute} from 'vue-router'

export default {
  name: 'EmailDetail',

  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const accountId = computed(() => route.params.accountId)
    const emailId = computed(() => route.params.emailId)
    const email = computed(() => store.getters['email/currentEmail'])
    const loading = computed(() => store.getters['email/loading'])
    const error = computed(() => store.getters['email/error'])

    const showDeleteModal = ref(false)

    const fetchEmailDetail = async () => {
      try {
        await store.dispatch('email/fetchEmailDetail', {
          accountId: accountId.value,
          emailId: emailId.value
        })

        // 如果邮件未读，标记为已读
        if (email.value && !email.value.is_read) {
          markAsRead()
        }
      } catch (err) {
        console.error('Error fetching email detail:', err)
      }
    }

    const goBack = () => {
      router.push(`/accounts/${accountId.value}/emails`)
    }

    const toggleReadStatus = async () => {
      if (!email.value) return

      try {
        const newStatus = !email.value.is_read
        await store.dispatch('email/markEmailAsRead', {
          accountId: accountId.value,
          emailId: emailId.value,
          isRead: newStatus
        })
      } catch (err) {
        console.error('Error toggling read status:', err)
      }
    }

    const markAsRead = async () => {
      try {
        await store.dispatch('email/markEmailAsRead', {
          accountId: accountId.value,
          emailId: emailId.value,
          isRead: true
        })
      } catch (err) {
        console.error('Error marking as read:', err)
      }
    }

    const confirmDelete = () => {
      showDeleteModal.value = true
    }

    const cancelDelete = () => {
      showDeleteModal.value = false
    }

    const deleteEmail = async () => {
      try {
        await store.dispatch('email/deleteEmail', {
          accountId: accountId.value,
          emailId: emailId.value
        })
        showDeleteModal.value = false
        goBack()
      } catch (err) {
        console.error('Error deleting email:', err)
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''

      const date = new Date(dateString)
      return date.toLocaleString()
    }

    const getImportanceText = (importance) => {
      const importanceMap = {
        'high': '重要',
        'normal': '普通',
        'low': '低'
      }
      return importanceMap[importance] || importance
    }

    onMounted(fetchEmailDetail)

    return {
      email,
      loading,
      error,
      showDeleteModal,
      goBack,
      toggleReadStatus,
      confirmDelete,
      cancelDelete,
      deleteEmail,
      formatDate,
      getImportanceText
    }
  }
}
</script>

<style scoped>
.email-detail {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header h1 {
  margin: 0;
  color: #4CAF50;
  margin-right: 15px;
}

.email-id {
  background-color: #f5f5f5;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.email-id .label {
  font-weight: bold;
  margin-right: 5px;
  color: #444;
}

.email-id .value {
  font-family: monospace;
  color: #4CAF50;
}

.back-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  text-decoration: none;
  display: inline-block;
}

.back-button:hover {
  background-color: #45a049;
}

.loading,
.error,
.not-found {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.error {
  color: #c74545;
}

.email-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

h2 {
  font-size: 18px;
  color: #4CAF50;
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.info-section,
.recipients-section,
.body-section,
.attachments-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-weight: 600;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.info-value {
  font-size: 16px;
}

.recipient-group {
  margin-bottom: 12px;
  display: flex;
}

.recipient-group:last-child {
  margin-bottom: 0;
}

.recipient-label {
  font-weight: 600;
  min-width: 80px;
  color: #666;
}

.recipient-list {
  flex: 1;
}

.recipient-item {
  display: inline-block;
  background-color: #e8f5e9;
  padding: 5px 10px;
  border-radius: 4px;
  margin-right: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.body-content {
  white-space: pre-line;
  line-height: 1.6;
}

.note {
  color: #666;
  font-style: italic;
  margin-top: 20px;
  background-color: #fffde7;
  padding: 10px;
  border-radius: 4px;
  border-left: 4px solid #ffd600;
}

.actions-section {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.action-button {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-button i {
  font-size: 16px;
}

.read-button {
  background-color: #4CAF50;
  color: white;
}

.read-button:hover {
  background-color: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(76, 175, 80, 0.2);
}

.delete-button {
  background-color: #f44336;
  color: white;
}

.delete-button:hover {
  background-color: #e53935;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(244, 67, 54, 0.2);
}

.download-button {
  background-color: #2196F3;
  color: white;
}

.download-button:hover:not(:disabled) {
  background-color: #1e88e5;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(33, 150, 243, 0.2);
}

.download-button:disabled {
  background-color: #bbdefb;
  cursor: not-allowed;
}

.status-tag {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  min-width: 80px;
}

.status-pending {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-completed {
  background-color: #f6ffed;
  color: #52c41a;
}

.attachment-tag {
  display: inline-block;
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 80%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #f44336;
}

.close-button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #666;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.modal-details {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  margin-top: 15px;
}

.detail-item {
  margin-bottom: .5rem;
}

.detail-item span:first-child {
  font-weight: bold;
  margin-right: 5px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  background-color: #f5f5f5;
  border-top: 1px solid #eee;
}

.modal-actions .delete-button,
.modal-actions .cancel-button {
  padding: 8px 16px;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    margin-top: 15px;
    align-self: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .recipient-group {
    flex-direction: column;
  }

  .recipient-label {
    margin-bottom: 5px;
  }

  .actions-section {
    flex-wrap: wrap;
  }

  .action-button {
    flex: 1;
    min-width: 120px;
  }

  .modal-content {
    width: 95%;
  }
}
</style>