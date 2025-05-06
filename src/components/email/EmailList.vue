<template>
  <div class="email-list">
    <div class="header">
      <h1>邮件列表</h1>
      <div class="filters">
        <select v-model="selectedFolder" @change="loadEmails">
          <option value="">所有文件夹</option>
          <option v-for="folder in folders" :key="folder.id" :value="folder.folder_id">
            {{ folder.name }}
          </option>
        </select>

        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索邮件..."
          @input="handleSearchInput"
        />
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="emails.length === 0" class="empty-state">
      <p>没有找到邮件</p>
    </div>

    <div v-else class="emails-container">
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

    <div class="back-link">
      <router-link to="/accounts">返回邮箱账户列表</router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { debounce } from 'lodash'

export default {
  name: 'EmailList',

  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const accountId = computed(() => route.params.accountId)
    const emails = computed(() => store.getters['email/emails'])
    const folders = computed(() => store.getters['email/folders'])
    const loading = computed(() => store.getters['email/loading'])
    const error = computed(() => store.getters['email/error'])

    const selectedFolder = ref('')
    const searchQuery = ref('')

    const loadFolders = async () => {
      try {
        await store.dispatch('email/fetchFolders', accountId.value)
      } catch (err) {
        console.error('Error loading folders:', err)
      }
    }

    const loadEmails = async () => {
      const params = {}

      if (searchQuery.value) {
        params.search = searchQuery.value
      }

      try {
        await store.dispatch('email/fetchEmails', {
          accountId: accountId.value,
          folderId: selectedFolder.value || null,
          params
        })
      } catch (err) {
        console.error('Error loading emails:', err)
      }
    }

    const viewEmail = (email) => {
      router.push(`/accounts/${accountId.value}/emails/${email.id}`)
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''

      const date = new Date(dateString)
      const now = new Date()

      // 如果是今天的邮件，只显示时间
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      // 如果是本年的邮件，显示月和日
      if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      }

      // 其他情况显示完整日期
      return date.toLocaleDateString()
    }

    // 防抖处理搜索输入
    const handleSearchInput = debounce(() => {
      loadEmails()
    }, 500)

    onMounted(() => {
      loadFolders()
      loadEmails()
    })

    // 监听路由参数变化
    watch(() => route.params.accountId, (newId, oldId) => {
      if (newId !== oldId) {
        loadFolders()
        loadEmails()
      }
    })

    return {
      emails,
      folders,
      loading,
      error,
      selectedFolder,
      searchQuery,
      viewEmail,
      loadEmails,
      handleSearchInput,
      formatDate
    }
  }
}
</script>

<style scoped>
.email-list {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.filters select, .filters input {
  flex: 1;
}

.emails-container {
  border: 1px solid #ddd;
  border-radius: 5px;
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

.back-link {
  margin-top: 20px;
}

.back-link a {
  color: #0078d4;
  text-decoration: none;
}

.back-link a:hover {
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #666;
}
</style>