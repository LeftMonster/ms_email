<template>
  <div class="add-account">
    <div class="card">
      <h1>添加邮箱账户</h1>

      <div v-if="loading && !accountTypes.length" class="loading">加载中...</div>

      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else>
        <!-- 选择邮箱类型 -->
        <div class="email-type-selection" v-if="!selectedType">
          <h2>选择邮箱类型</h2>
          <p>请选择您要添加的邮箱账户类型：</p>

          <div class="email-types-grid">
            <div v-for="type in accountTypes"
                 :key="type.id"
                 class="email-type-card"
                 @click="selectEmailType(type)">
              <div class="email-type-icon">
                <i :class="getEmailTypeIcon(type.code)"></i>
              </div>
              <div class="email-type-name">{{ type.name }}</div>
            </div>
          </div>

          <div class="back-link">
            <router-link to="/accounts">返回邮箱账户列表</router-link>
          </div>
        </div>

        <!-- Microsoft 邮箱配置 -->
        <div v-else-if="selectedType.code === 'microsoft'" class="email-type-config">
          <div class="config-header">
            <button class="back-btn" @click="resetSelection">
              <i class="fas fa-arrow-left"></i> 返回
            </button>
            <h2>添加 {{ selectedType.name }}</h2>
          </div>

          <div class="config-content">
            <p>要添加微软邮箱账户，您需要授权我们访问您的邮箱。</p>

            <div v-if="!authCode">
              <button @click="initiateMicrosoftOAuth" class="primary-btn">
                <i class="fab fa-microsoft"></i> 使用微软账户登录
              </button>
            </div>

            <div v-else>
              <p class="success">已获取授权码，正在添加您的邮箱账户...</p>
            </div>
          </div>
        </div>

        <!-- Gmail 邮箱配置 -->
        <div v-else-if="selectedType.code === 'gmail'" class="email-type-config">
          <div class="config-header">
            <button class="back-btn" @click="resetSelection">
              <i class="fas fa-arrow-left"></i> 返回
            </button>
            <h2>添加 {{ selectedType.name }}</h2>
          </div>

          <div class="config-content">
            <p>要添加Gmail账户，您需要授权我们访问您的邮箱。</p>

            <div v-if="!gmailAuthCode">
              <button @click="initiateGmailOAuth" class="gmail-btn">
                <i class="fab fa-google"></i> 使用Google账户登录
              </button>
            </div>

            <div v-else>
              <p class="success">已获取授权码，正在添加您的邮箱账户...</p>
            </div>
          </div>
        </div>

        <!-- 通用账户密码配置 -->
        <div v-else class="email-type-config">
          <div class="config-header">
            <button class="back-btn" @click="resetSelection">
              <i class="fas fa-arrow-left"></i> 返回
            </button>
            <h2>添加 {{ selectedType.name }}</h2>
          </div>

          <div class="config-content">
            <form @submit.prevent="submitGenericAccount">
              <div class="form-group">
                <label for="email" class="form-label">邮箱地址</label>
                <input
                  type="email"
                  id="email"
                  v-model="genericForm.email"
                  required
                  placeholder="请输入邮箱地址"
                />
              </div>

              <div class="form-group">
                <label for="displayName" class="form-label">显示名称</label>
                <input
                  type="text"
                  id="displayName"
                  v-model="genericForm.displayName"
                  required
                  placeholder="请输入显示名称"
                />
              </div>

              <div class="form-group">
                <label for="password" class="form-label">密码</label>
                <input
                  type="password"
                  id="password"
                  v-model="genericForm.password"
                  required
                  placeholder="请输入邮箱密码"
                />
              </div>

              <div class="form-group">
                <label for="server" class="form-label">服务器地址</label>
                <input
                  type="text"
                  id="server"
                  v-model="genericForm.server"
                  placeholder="例如: mail.example.com"
                />
              </div>

              <div class="form-group">
                <label for="port" class="form-label">端口</label>
                <input
                  type="number"
                  id="port"
                  v-model="genericForm.port"
                  placeholder="例如: 993"
                />
              </div>

              <div class="form-actions">
                <button type="submit" :disabled="submitLoading">
                  {{ submitLoading ? '添加中...' : '添加账户' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import api from '../../services/http'

export default {
  name: 'AddAccount',

  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const loading = ref(false)
    const submitLoading = ref(false)
    const error = ref(null)
    const accountTypes = ref([])
    const selectedType = ref(null)
    const authCode = ref('')
    const gmailAuthCode = ref('')

    // 通用邮箱表单
    const genericForm = ref({
      email: '',
      displayName: '',
      password: '',
      server: '',
      port: ''
    })

    // 加载邮箱类型
    const loadAccountTypes = async () => {
      loading.value = true
      error.value = null

      try {
        const response = await api.get('/emails/account-types/')
        accountTypes.value = response.data.data || []
      } catch (err) {
        console.error('Error loading account types:', err)
        error.value = '加载邮箱类型失败'
      } finally {
        loading.value = false
      }
    }

    // 选择邮箱类型
    const selectEmailType = (type) => {
      selectedType.value = type
    }

    // 重置选择
    const resetSelection = () => {
      selectedType.value = null
      authCode.value = ''
      gmailAuthCode.value = ''
      error.value = null
    }

    // 获取邮箱类型图标
    const getEmailTypeIcon = (typeCode) => {
      const iconMap = {
        'microsoft': 'fab fa-microsoft',
        'gmail': 'fab fa-google',
        'imap': 'fas fa-envelope',
        'pop3': 'fas fa-inbox',
        'exchange': 'fas fa-server'
      }

      return iconMap[typeCode] || 'fas fa-envelope'
    }

    // Microsoft OAuth
    const msConfig = {
      clientId: process.env.VUE_APP_MS_CLIENT_ID || 'your-microsoft-client-id',
      redirectUri: window.location.origin + '/accounts/add',
      scope: 'offline_access https://outlook.office.com/mail.read',
      authority: 'https://login.microsoftonline.com/common'
    }

    const initiateMicrosoftOAuth = () => {
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${msConfig.clientId}&response_type=code&redirect_uri=${encodeURIComponent(msConfig.redirectUri)}&scope=${encodeURIComponent(msConfig.scope)}&response_mode=query`

      // 打开新窗口进行授权
      window.location.href = authUrl
    }

    // Gmail OAuth
    const gmailConfig = {
      clientId: process.env.VUE_APP_GMAIL_CLIENT_ID || 'your-gmail-client-id',
      redirectUri: window.location.origin + '/accounts/add',
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
    }

    const initiateGmailOAuth = () => {
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${gmailConfig.clientId}&redirect_uri=${encodeURIComponent(gmailConfig.redirectUri)}&response_type=code&scope=${encodeURIComponent(gmailConfig.scope)}&access_type=offline&prompt=consent`

      // 打开新窗口进行授权
      window.location.href = authUrl
    }

    // 添加Microsoft账户
    const addMicrosoftAccount = async (code) => {
      submitLoading.value = true
      error.value = null

      try {
        await store.dispatch('email/addAccount', code)
        router.push('/accounts')
      } catch (err) {
        console.error('Error adding Microsoft account:', err)
        error.value = '添加Microsoft邮箱账户失败'
      } finally {
        submitLoading.value = false
      }
    }

    // 添加Gmail账户
    const addGmailAccount = async (code) => {
      submitLoading.value = true
      error.value = null

      try {
        // 这里应调用添加Gmail账户的API
        const response = await api.post('/emails/accounts/gmail/', {
          authorization_code: code
        })

        if (response.data.success) {
          router.push('/accounts')
        } else {
          error.value = response.data.message || '添加Gmail邮箱账户失败'
        }
      } catch (err) {
        console.error('Error adding Gmail account:', err)
        error.value = err.response?.data?.message || '添加Gmail邮箱账户失败'
      } finally {
        submitLoading.value = false
      }
    }

    // 提交通用邮箱账户
    const submitGenericAccount = async () => {
      submitLoading.value = true
      error.value = null

      try {
        // 这里应调用添加通用邮箱账户的API
        const accountData = {
          account_type: selectedType.value.id,
          email: genericForm.value.email,
          display_name: genericForm.value.displayName,
          password: genericForm.value.password,
          server: genericForm.value.server,
          port: genericForm.value.port
        }

        const response = await api.post('/emails/accounts/generic/', accountData)

        if (response.data.success) {
          router.push('/accounts')
        } else {
          error.value = response.data.message || '添加邮箱账户失败'
        }
      } catch (err) {
        console.error('Error adding generic account:', err)
        error.value = err.response?.data?.message || '添加邮箱账户失败'
      } finally {
        submitLoading.value = false
      }
    }

    // 检查URL参数中是否有授权码
    onMounted(() => {
      loadAccountTypes()

      if (route.query.code) {
        // 根据存在的type参数确定是哪种OAuth回调
        if (route.query.type === 'gmail') {
          // Gmail OAuth回调
          gmailAuthCode.value = route.query.code
          // 从localStorage恢复选中的账户类型
          const savedType = localStorage.getItem('selectedEmailType')
          if (savedType) {
            try {
              selectedType.value = JSON.parse(savedType)
              addGmailAccount(gmailAuthCode.value)
            } catch (e) {
              console.error('Error parsing saved email type:', e)
            }
          }
        } else {
          // 默认假设是Microsoft OAuth回调
          authCode.value = route.query.code
          // 从localStorage恢复选中的账户类型
          const savedType = localStorage.getItem('selectedEmailType')
          if (savedType) {
            try {
              selectedType.value = JSON.parse(savedType)
              addMicrosoftAccount(authCode.value)
            } catch (e) {
              console.error('Error parsing saved email type:', e)
            }
          }
        }
      }
    })

    // 在选择邮箱类型时保存到localStorage
    watch(selectedType, (newValue) => {
      if (newValue) {
        localStorage.setItem('selectedEmailType', JSON.stringify(newValue))
      } else {
        localStorage.removeItem('selectedEmailType')
      }
    })

    return {
      loading,
      submitLoading,
      error,
      accountTypes,
      selectedType,
      authCode,
      gmailAuthCode,
      genericForm,
      loadAccountTypes,
      selectEmailType,
      resetSelection,
      getEmailTypeIcon,
      initiateMicrosoftOAuth,
      initiateGmailOAuth,
      submitGenericAccount
    }
  }
}
</script>

<style scoped>
.add-account {
  max-width: 800px;
  margin: 0 auto;
}

.email-type-selection {
  text-align: center;
}

.email-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.email-type-card {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.email-type-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-color: #4CAF50;
}

.email-type-icon {
  font-size: 40px;
  margin-bottom: 15px;
  color: #4CAF50;
}

.email-type-name {
  font-weight: bold;
}

.config-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  padding: 5px;
  margin-right: 15px;
}

.back-btn:hover {
  color: #4CAF50;
}

.config-content {
  max-width: 500px;
  margin: 0 auto;
}

.primary-btn {
  background-color: #0078d4;
  color: white;
  padding: 10px 20px;
  margin-top: 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.primary-btn:hover {
  background-color: #106ebe;
}

.gmail-btn {
  background-color: #db4437;
  color: white;
  padding: 10px 20px;
  margin-top: 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.gmail-btn:hover {
  background-color: #c5221f;
}

.back-link {
  margin-top: 30px;
}

.back-link a {
  color: #4CAF50;
  text-decoration: none;
}

.back-link a:hover {
  text-decoration: underline;
}
</style>