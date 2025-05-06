<template>
  <div class="microsoft-email-list">
    <div class="header">
      <!-- 返回按钮部分 -->
      <div class="back-button">
        <router-link to="/microsoft-accounts" class="back-link">
          <button class="back-btn"><span>&larr;</span> 返回账户列表</button>
        </router-link>
      </div>
      <h1 class="account-title">
        {{ accountEmail }} 的邮件列表
        <span v-if="account && account.account_type" class="account-type">
          ({{ getAccountTypeName(account.account_type) }})
        </span>
      </h1>
    </div>

    <!-- 修改这里: 添加初始加载状态 -->
    <div v-if="initialLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载邮箱数据，请稍候...</p>
    </div>

    <!-- 其他loading状态用于后续操作的加载 -->
    <div v-else-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载邮件，请稍候...</p>
    </div>

    <div v-else-if="error" class="error-state">{{ error }}</div>

    <div v-else-if="emails.length === 0" class="empty-state">
      <p>该账户没有可显示的邮件或邮件正在加载中</p>
    </div>

    <div v-else>
      <!-- 过滤和搜索部分 -->
      <div class="filter-controls">
        <div class="search-box">
          <input
              type="text"
              v-model="searchQuery"
              placeholder="搜索邮件..."
              @input="handleSearchInput"
              class="search-input"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-search-btn">×</button>
        </div>
        <div class="folder-select">
          <select v-model="folderFilter" @change="fetchEmails" class="folder-dropdown">
            <option value="">所有文件夹</option>
            <option v-for="folder in folders" :key="folder.id" :value="folder.id">
              {{ folder.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- 邮件列表 -->
      <div class="emails-container">
        <div v-for="email in emails" :key="email.id"
             class="email-item"
             :class="{ 'unread': !email.is_read }"
             @click="viewEmail(email)">
          <div class="email-sender">
            <span>{{ email.from_name || email.from_email }}</span>
            <span class="email-date">{{ formatDate(email.received_datetime) }}</span>
          </div>
          <div class="email-subject">{{ email.subject }}</div>
          <div class="email-preview">{{ email.body_preview }}</div>
        </div>
      </div>

      <!-- 分页控件 -->
      <div class="pagination">
        <button
            :disabled="currentPage <= 1"
            @click="changePage(currentPage - 1)"
        >
          上一页
        </button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button
            :disabled="currentPage >= totalPages"
            @click="changePage(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 邮件详情模态框 -->
    <div v-if="showEmailModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ emailDetailLoading ? '加载中...' : currentEmail.subject }}</h2>
          <button @click="closeEmailModal" class="close-btn">&times;</button>
        </div>

        <!-- 添加邮件详情加载状态 -->
        <div v-if="emailDetailLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>正在加载邮件内容，请稍候...</p>
        </div>

        <div v-else class="modal-content">
          <!-- 邮件内容部分不变 -->
          <div class="email-meta">
            <!-- 发件人 -->
            <div class="email-sender">
              <strong>发件人：</strong>
              {{ currentEmail.from_name || '未知' }} &lt;{{ currentEmail.from_email || '无地址' }}&gt;
            </div>

            <!-- 时间 -->
            <div class="email-date">
              <strong>日期：</strong> {{ formatDate(currentEmail.received_datetime) }}
            </div>

            <!-- 收件人 -->
            <div class="email-recipients" v-if="currentEmail.to_recipients">
              <strong>收件人：</strong>
              <span v-if="!currentEmail.to_recipients.length">无收件人</span>
              <template v-else>
                <span v-for="(recipient, index) in currentEmail.to_recipients" :key="'to-'+index">
                  {{ recipient.name || recipient.address || '未知' }}
                  &lt;{{
                    recipient.address || '无地址'
                  }}&gt;{{ index < currentEmail.to_recipients.length - 1 ? '; ' : '' }}
                </span>
              </template>
            </div>

            <!-- 抄送人 -->
            <div class="email-cc" v-if="currentEmail.cc_recipients && currentEmail.cc_recipients.length">
              <strong>抄送：</strong>
              <template>
                <span v-for="(recipient, index) in currentEmail.cc_recipients" :key="'cc-'+index">
                  {{ recipient.name || recipient.address || '未知' }}
                  &lt;{{
                    recipient.address || '无地址'
                  }}&gt;{{ index < currentEmail.cc_recipients.length - 1 ? '; ' : '' }}
                </span>
              </template>
            </div>
          </div>

          <!-- 邮件正文 -->
          <div class="email-body">
            <!-- 如果有HTML内容则显示，否则显示纯文本预览 -->
            <div v-if="currentEmail.body_content" v-html="currentEmail.body_content"></div>
            <p v-else>{{ currentEmail.body_preview || '无内容' }}</p>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeEmailModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, onMounted, computed, watch} from 'vue'
import {useStore} from 'vuex'
import {useRoute, useRouter} from 'vue-router'
import {debounce} from 'lodash'

export default {
  name: 'MicrosoftEmailList',

  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const accountId = computed(() => route.params.accountId)

    // 添加初始加载状态
    const initialLoading = ref(true)
    const emails = computed(() => store.getters['microsoft/emails'])
    const totalEmails = computed(() => store.getters['microsoft/totalEmails'])
    const loading = computed(() => store.getters['microsoft/loading'])
    const error = computed(() => store.getters['microsoft/error'])
    const account = computed(() => store.getters['microsoft/account'])
    const emailAccountTypes = computed(() => store.getters['email/accountTypes'])

    const accountEmail = computed(() => account.value?.email || '')
    const currentPage = ref(1)
    const pageSize = ref(20)
    const searchQuery = ref('')
    const folderFilter = ref('')

    // 邮件详情模态框
    const showEmailModal = ref(false)
    const currentEmail = ref({})
    const emailDetailLoading = ref(false)

    const totalPages = computed(() => Math.ceil(totalEmails.value / pageSize.value) || 1)

    // 监听route变化，当账户ID改变时，重置数据并重新加载
    watch(() => route.params.accountId, (newId, oldId) => {
      if (newId !== oldId) {
        resetData()
        initializeData()
      }
    })

    // 获取邮箱类型名称
    const getAccountTypeName = (typeCode) => {
      if (!typeCode) return '未知'
      const type = emailAccountTypes.value.find(t => t.code === typeCode)
      return type ? type.name : typeCode
    }

    // 重置所有数据
    const resetData = () => {
      // 清除store中的数据
      store.commit('microsoft/SET_EMAILS', [])
      store.commit('microsoft/SET_CURRENT_EMAIL', null)
      store.commit('microsoft/SET_ERROR', null)

      // 重置本地数据
      currentPage.value = 1
      searchQuery.value = ''
      folderFilter.value = ''
      showEmailModal.value = false
      currentEmail.value = {}
    }

    // 初始化页面数据
    const initializeData = async () => {
      try {
        initialLoading.value = true

        // 清除可能存在的错误状态
        store.dispatch('microsoft/clearError')

        // 加载邮箱类型数据
        await loadEmailAccountTypes()

        // 获取账户信息
        await fetchAccountInfo()

        // 获取邮件列表
        await fetchEmails()
      } catch (err) {
        console.error('Error initializing data:', err)
      } finally {
        initialLoading.value = false
      }
    }

    // 加载邮箱类型数据
    const loadEmailAccountTypes = async () => {
      try {
        await store.dispatch('email/fetchAccountTypes')
      } catch (err) {
        console.error('Error fetching email account types:', err)
      }
    }

    // 获取账户信息
    const fetchAccountInfo = async () => {
      try {
        await store.dispatch('microsoft/fetchAccount', accountId.value)
      } catch (err) {
        console.error('Error fetching account info:', err)
      }
    }

    // 静态文件夹列表
    const folders = ref([
      {id: 'inbox', name: '收件箱'},
      {id: 'junk', name: '垃圾邮件'}
    ]);

    // 获取邮件列表
    const fetchEmails = async () => {
      try {
        // 构建查询参数
        const params = {
          page: currentPage.value,
          page_size: pageSize.value
        }

        if (searchQuery.value) {
          params.search = searchQuery.value
        }

        if (folderFilter.value) {
          params.folder_id = folderFilter.value
        }

        // 通过Vuex获取邮件列表
        await store.dispatch('microsoft/fetchEmails', {
          accountId: accountId.value,
          params
        })
      } catch (err) {
        console.error('Error fetching emails:', err)
      }
    }

    // 处理分页
    const changePage = (page) => {
      currentPage.value = page
      fetchEmails()
    }

    // 清除搜索
    const clearSearch = () => {
      searchQuery.value = ''
      fetchEmails()
    }

    // 处理搜索，使用防抖
    const handleSearchInput = debounce(() => {
      currentPage.value = 1 // 重置为第一页
      fetchEmails()
    }, 500)

    // 查看邮件详情
    const viewEmail = async (email) => {
      try {
        // 显示模态框并设置加载状态
        showEmailModal.value = true;
        emailDetailLoading.value = true;

        // 重置当前邮件，避免显示缓存内容
        currentEmail.value = {};

        // 获取邮件详情
        await store.dispatch('microsoft/fetchEmailDetail', {
          accountId: accountId.value,
          emailId: email.id
        });

        // 获取详情后更新数据
        currentEmail.value = store.getters['microsoft/currentEmail'];

        // TODO 未读标记
        // // 如果邮件未读，标记为已读
        // if (email && !email.is_read) {
        //   store.dispatch('microsoft/markEmailAsRead', {
        //     accountId: accountId.value,
        //     emailId: email.id,
        //     isRead: true
        //   });
        // }
      } catch (err) {
        console.error('Error fetching email detail:', err);
      } finally {
        // 无论成功失败都结束加载状态
        emailDetailLoading.value = false;
      }
    }

    // 关闭邮件详情模态框
    const closeEmailModal = () => {
      showEmailModal.value = false;
      // 清空当前邮件数据，避免下次打开时显示
      currentEmail.value = {};
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''

      const date = new Date(dateString)
      const now = new Date()

      // 如果是今天的邮件，只显示时间
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
      }

      // 如果是本年的邮件，显示月和日
      if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString([], {month: 'short', day: 'numeric'})
      }

      // 其他情况显示完整日期
      return date.toLocaleDateString()
    }

    onMounted(() => {
      initializeData()
    })

    return {
      accountId,
      accountEmail,
      account,
      emails,
      folders,
      loading,
      initialLoading,
      error,
      currentPage,
      totalPages,
      searchQuery,
      folderFilter,
      showEmailModal,
      currentEmail,
      emailDetailLoading,
      getAccountTypeName,
      fetchEmails,
      changePage,
      clearSearch,
      handleSearchInput,
      viewEmail,
      closeEmailModal,
      formatDate
    }
  }
}
</script>

<style scoped>
/* 添加加载动画样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-height: 200px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 限制邮件列表容器宽度 */
.microsoft-email-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 限制邮件项内容宽度 */
.email-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  overflow: hidden;
}

/* 限制主题和预览的宽度 */
.email-subject {
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.email-preview {
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* 限制发件人和日期区域宽度 */
.email-sender {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-weight: bold;
  overflow: hidden;
}

.email-date {
  color: #666;
  font-weight: normal;
  white-space: nowrap;
  margin-left: 10px;
  flex-shrink: 0;
}

.microsoft-email-list {
  padding: 20px;
}

.header {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

/* 改进返回按钮样式 */
.back-button {
  margin-bottom: 12px;
}

.back-link {
  text-decoration: none; /* 移除下划线 */
}

.back-button button {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.back-btn {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  color: #333; /* 确保文字颜色为深色 */
  padding: 8px 15px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: normal;
}

.back-btn span {
  margin-right: 6px;
  font-size: 16px;
}

.back-btn:hover {
  background-color: #e0e0e0;
}

/* 修改账户标题样式，适应邮箱类型显示 */
.account-title {
  font-size: 1.6rem;
  margin: 0;
  color: #333;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

/* 过滤控件样式改进 */
.filter-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  width: 100%;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 35px 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.clear-search-btn:hover {
  background-color: #f0f0f0;
  color: #666;
}

.folder-select {
  width: 180px;
}

.folder-dropdown {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23444'%3E%3Cpath d='M4 6h8l-4 5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  cursor: pointer;
}

.folder-dropdown:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* 加载和错误状态样式改进 */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 20px 0;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-state {
  color: #e74c3c;
  background-color: #ffe5e5;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 20px 0;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filters input, .filters select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filters input {
  flex: 1;
}

.emails-container {
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 20px;
}

.email-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.email-item:last-child {
  border-bottom: none;
}

.email-item:hover {
  background-color: #f9f9f9;
}

.email-item.unread {
  background-color: #f0f7ff;
}

.email-sender {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-weight: bold;
}

.email-date {
  color: #666;
  font-weight: normal;
}

.email-subject {
  margin-bottom: 5px;
}

.email-preview {
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.pagination button {
  padding: 6px 12px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:hover:not(:disabled) {
  background-color: #eee;
}

.pagination button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.email-meta {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 15px;
}

.email-meta div {
  margin-bottom: 5px;
}

.email-body {
  line-height: 1.6;
}

.modal-footer {
  padding: 15px;
  border-top: 1px solid #eee;
  text-align: right;
}

/* 添加邮箱类型标签的样式 */
.account-type {
  font-size: 0.8rem;
  font-weight: normal;
  color: #666;
  margin-left: 8px;
  padding: 2px 8px;
  background-color: #f0f0f0;
  border-radius: 10px;
  display: inline-block;
  vertical-align: middle;
}
</style>