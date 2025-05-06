<template>
  <div class="personal-proxies-container">
    <div class="header">
      <h1>个人代理管理</h1>
      <p class="description">管理您的个人代理服务器，用于API请求和邮箱操作</p>
    </div>

    <div class="proxy-tools">
      <div class="tool-card">
        <div class="card-header">
          <i class="fas fa-plus-circle"></i>
          <h2>添加代理</h2>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="proxyName">代理名称：</label>
            <input
                type="text"
                id="proxyName"
                v-model="newProxy.name"
                placeholder="例如: 美国代理1"
            />
          </div>

          <div class="form-group">
            <label for="proxyHost">主机地址：</label>
            <input
                type="text"
                id="proxyHost"
                v-model="newProxy.host"
                placeholder="例如: 192.168.1.1"
            />
          </div>

          <div class="form-group">
            <label for="proxyPort">端口：</label>
            <input
                type="number"
                id="proxyPort"
                v-model.number="newProxy.port"
                placeholder="例如: 8080"
                min="1"
                max="65535"
            />
          </div>

          <div class="form-group">
            <label for="proxyType">代理类型：</label>
            <select id="proxyType" v-model="newProxy.proxy_type">
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks4">SOCKS4</option>
              <option value="socks5">SOCKS5</option>
            </select>
          </div>

          <div class="form-group">
            <label for="proxyUsername">用户名（可选）：</label>
            <input
                type="text"
                id="proxyUsername"
                v-model="newProxy.username"
                placeholder="认证用户名"
            />
          </div>

          <div class="form-group">
            <label for="proxyPassword">密码（可选）：</label>
            <input
                type="password"
                id="proxyPassword"
                v-model="newProxy.password"
                placeholder="认证密码"
            />
          </div>

          <div class="form-group">
            <label for="proxyNotes">备注（可选）：</label>
            <textarea
                id="proxyNotes"
                v-model="newProxy.notes"
                rows="3"
                placeholder="代理的用途、来源等信息"
            ></textarea>
          </div>

          <div class="form-actions">
            <button @click="addPersonalProxy" :disabled="!isFormValid" class="primary-btn">
              <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
              <span v-else>添加代理</span>
            </button>
            <button type="button" @click="clearForm" class="secondary-btn">清空</button>
          </div>
        </div>
      </div>

      <div class="tool-card">
        <div class="card-header">
          <i class="fas fa-file-import"></i>
          <h2>批量添加</h2>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="batchType">代理类型：</label>
            <select id="batchType" v-model="batchImport.type">
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks4">SOCKS4</option>
              <option value="socks5">SOCKS5</option>
            </select>
          </div>

          <div class="form-group">
            <label for="batchList">代理列表：</label>
            <textarea
                id="batchList"
                v-model="batchImport.list"
                rows="8"
                placeholder="每行一个代理，格式: IP:端口 或 IP:端口:用户名:密码"
            ></textarea>
            <p class="form-hint">例如: 192.168.1.1:8080 或 192.168.1.1:8080:user:pass 或 user-params:username@host:port</p>
          </div>

          <div class="form-actions">
            <button @click="batchAddProxies" :disabled="!isBatchFormValid" class="primary-btn">
              <i v-if="isBatchSubmitting" class="fas fa-spinner fa-spin"></i>
              <span v-else>批量添加</span>
            </button>
            <button type="button" @click="clearBatchForm" class="secondary-btn">清空</button>
          </div>
        </div>
      </div>

      <div class="tool-card">
        <div class="card-header">
          <i class="fas fa-cloud-upload-alt"></i>
          <h2>上传代理文件</h2>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="uploadType">代理类型：</label>
            <select id="uploadType" v-model="uploadProxy.type">
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks4">SOCKS4</option>
              <option value="socks5">SOCKS5</option>
            </select>
          </div>

          <div class="form-group">
            <label for="proxyFile">代理文件：</label>
            <input
                type="file"
                id="proxyFile"
                @change="handleFileUpload"
                accept=".txt, .csv"
            />
            <p class="form-hint">支持.txt或.csv文件，每行一个代理</p>
          </div>

          <div class="form-actions">
            <button @click="uploadProxyFile" :disabled="!isUploadValid" class="primary-btn">
              <i v-if="isUploading" class="fas fa-spinner fa-spin"></i>
              <span v-else>上传文件</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="proxy-test-card">
      <div class="card-header">
        <i class="fas fa-vial"></i>
        <h2>测试代理</h2>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label for="testProxy">选择代理进行测试：</label>
          <select
              id="testProxy"
              v-model="selectedTestProxy"
              :disabled="proxies.length === 0 || isTesting"
          >
            <option value="">-- 选择代理 --</option>
            <option v-for="proxy in proxies" :key="proxy.id" :value="proxy.id">
              {{ proxy.name }} ({{ proxy.host }}:{{ proxy.port }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="testUrl">测试URL：</label>
          <input
              type="text"
              id="testUrl"
              v-model="testUrl"
              placeholder="例如: https://api.ipify.org"
          />
        </div>

        <div class="form-actions">
          <button @click="testSelectedProxy" :disabled="!selectedTestProxy || isTesting" class="primary-btn">
            <i v-if="isTesting" class="fas fa-spinner fa-spin"></i>
            <span v-else>测试代理</span>
          </button>
        </div>

        <div v-if="testResult" class="test-result" :class="testResult.success ? 'success' : 'error'">
          <div class="result-icon">
            <i :class="testResult.success ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
          </div>
          <div class="result-content">
            <h3>{{ testResult.success ? '测试成功' : '测试失败' }}</h3>
            <p>{{ testResult.message }}</p>
            <div v-if="testResult.success && testResult.data" class="result-details">
              <p><strong>IP地址:</strong> {{ testResult.data.ip }}</p>
              <p><strong>响应时间:</strong> {{ testResult.data.response_time }}ms</p>
              <p><strong>位置:</strong> {{ testResult.data.location }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="proxies-list-section">
      <div class="section-header">
        <h2>我的代理</h2>
        <div class="section-filter">
          <div class="filter-group">
            <label>状态：</label>
            <select v-model="filter.status">
              <option value="">全部</option>
              <option value="active">活跃</option>
              <option value="inactive">不活跃</option>
              <option value="testing">测试中</option>
              <option value="failed">失败</option>
            </select>
          </div>
          <div class="filter-group">
            <label>类型：</label>
            <select v-model="filter.type">
              <option value="">全部</option>
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks4">SOCKS4</option>
              <option value="socks5">SOCKS5</option>
            </select>
          </div>
          <div class="filter-group">
            <input
                type="text"
                v-model="filter.search"
                placeholder="搜索代理名称或IP..."
                class="search-input"
            />
          </div>
          <button @click="refreshProxies" class="icon-btn" title="刷新">
            <i :class="isRefreshing ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'"></i>
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>加载中...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="refreshProxies" class="retry-btn">重试</button>
      </div>

      <div v-else-if="proxies.length === 0" class="empty-state">
        <i class="fas fa-database"></i>
        <p>您还没有添加任何个人代理</p>
        <p class="suggestion">请使用上方表单添加或导入代理</p>
      </div>

      <div v-else class="proxies-list">
        <div v-for="proxy in filteredProxies" :key="proxy.id" class="proxy-card">
          <div class="proxy-header">
            <div class="proxy-title">
              <h3>{{ proxy.name }}</h3>
              <div class="proxy-badges">
                <span class="proxy-type-badge">{{ getProxyTypeName(proxy.proxy_type) }}</span>
                <span class="proxy-status-badge" :class="proxy.status">
                  {{ getStatusName(proxy.status) }}
                </span>
                <span class="proxy-active-badge" :class="proxy.is_active ? 'active' : 'inactive'">
                  {{ proxy.is_active ? '已启用' : '已禁用' }}
                </span>
              </div>
            </div>
            <div class="proxy-actions">
              <button @click="testProxy(proxy.id)" class="action-btn test-btn" title="测试代理">
                <i class="fas fa-vial"></i>
              </button>
              <button @click="editProxy(proxy.id)" class="action-btn edit-btn" title="编辑">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteProxy(proxy.id)" class="action-btn delete-btn" title="删除">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>

          <div class="proxy-body">
            <div class="proxy-info">
              <div class="info-item">
                <span class="info-label">地址:</span>
                <span class="info-value">{{ proxy.host }}:{{ proxy.port }}</span>
              </div>
              <div v-if="proxy.username" class="info-item">
                <span class="info-label">认证:</span>
                <span class="info-value">{{ proxy.username }}:******</span>
              </div>
              <div class="info-item">
                <span class="info-label">位置:</span>
                <span class="info-value">{{ proxy.location || '未知' }}</span>
              </div>
              <div v-if="proxy.response_time" class="info-item">
                <span class="info-label">响应时间:</span>
                <span class="info-value">{{ proxy.response_time }}ms</span>
              </div>
              <div v-if="proxy.last_checked" class="info-item">
                <span class="info-label">上次检查:</span>
                <span class="info-value">{{ formatDate(proxy.last_checked) }}</span>
              </div>
            </div>

            <div class="proxy-actions-container">
              <button
                  @click="toggleProxyStatus(proxy.id)"
                  class="toggle-btn"
                  :class="proxy.is_active ? 'btn-danger' : 'btn-success'"
              >
                {{ proxy.is_active ? '禁用' : '启用' }}
              </button>
            </div>

            <div v-if="proxy.notes" class="proxy-notes">
              <p><strong>备注:</strong> {{ proxy.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button
            :disabled="currentPage <= 1"
            @click="changePage(currentPage - 1)"
            class="page-btn"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button
            :disabled="currentPage >= totalPages"
            @click="changePage(currentPage + 1)"
            class="page-btn"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- 编辑代理模态框 -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>编辑代理</h3>
          <button @click="closeEditModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="editName">代理名称：</label>
            <input
                type="text"
                id="editName"
                v-model="editProxy.name"
                placeholder="例如: 美国代理1"
            />
          </div>

          <div class="form-group">
            <label for="editHost">主机地址：</label>
            <input
                type="text"
                id="editHost"
                v-model="editProxy.host"
                placeholder="例如: 192.168.1.1"
            />
          </div>

          <div class="form-group">
            <label for="editPort">端口：</label>
            <input
                type="number"
                id="editPort"
                v-model.number="editProxy.port"
                placeholder="例如: 8080"
                min="1"
                max="65535"
            />
          </div>

          <div class="form-group">
            <label for="editType">代理类型：</label>
            <select id="editType" v-model="editProxy.proxy_type">
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks4">SOCKS4</option>
              <option value="socks5">SOCKS5</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editUsername">用户名（可选）：</label>
            <input
                type="text"
                id="editUsername"
                v-model="editProxy.username"
                placeholder="认证用户名"
            />
          </div>

          <div class="form-group">
            <label for="editPassword">密码（可选）：</label>
            <input
                type="password"
                id="editPassword"
                v-model="editProxy.password"
                placeholder="认证密码"
            />
          </div>

          <div class="form-group">
            <label for="editNotes">备注（可选）：</label>
            <textarea
                id="editNotes"
                v-model="editProxy.notes"
                rows="3"
                placeholder="代理的用途、来源等信息"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="updateProxy" :disabled="!isEditFormValid" class="primary-btn">
            <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
            <span v-else>保存更改</span>
          </button>
          <button @click="closeEditModal" class="secondary-btn">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, computed, onMounted, watch} from 'vue'
import {useStore} from 'vuex'

export default {
  name: 'PersonalProxies',

  setup() {
    const store = useStore()

    // 状态变量
    const isLoading = computed(() => store.getters['proxy/loading'])
    const error = computed(() => store.getters['proxy/error'])
    const isRefreshing = ref(false)
    const isSubmitting = ref(false)
    const isBatchSubmitting = ref(false)
    const isUploading = ref(false)
    const isTesting = computed(() => store.getters['proxy/isTesting'])
    const currentPage = ref(1)
    const totalPages = ref(1)
    const proxies = computed(() => store.getters['proxy/personalProxies'])
    const testResult = computed(() => store.getters['proxy/testResult'])
    const showEditModal = ref(false)

    // 分页和过滤
    const itemsPerPage = 12
    const filter = ref({
      search: '',
      status: '',
      type: ''
    })

    // 表单数据
    const newProxy = ref({
      name: '',
      host: '',
      port: null,
      proxy_type: 'http',
      username: '',
      password: '',
      notes: '',
      is_active: true
    })

    const batchImport = ref({
      type: 'http',
      list: ''
    })

    const uploadProxy = ref({
      type: 'http',
      file: null
    })

    const editProxyData = ref({
      id: null,
      name: '',
      host: '',
      port: null,
      proxy_type: 'http',
      username: '',
      password: '',
      notes: '',
      is_active: true
    })

    const selectedTestProxy = ref('')
    const testUrl = ref('https://api.ipify.org')

    // 计算属性
    const isFormValid = computed(() => {
      return newProxy.value.name &&
          newProxy.value.host &&
          newProxy.value.port &&
          newProxy.value.port >= 1 &&
          newProxy.value.port <= 65535
    })

    const isEditFormValid = computed(() => {
      return editProxyData.value.name &&
          editProxyData.value.host &&
          editProxyData.value.port &&
          editProxyData.value.port >= 1 &&
          editProxyData.value.port <= 65535
    })

    const isBatchFormValid = computed(() => {
      return batchImport.value.list &&
          isValidProxyList(batchImport.value.list)
    })

    const isUploadValid = computed(() => {
      return uploadProxy.value.file !== null
    })

    const filteredProxies = computed(() => {
      let result = [...proxies.value]

      // 应用过滤
      if (filter.value.search) {
        const search = filter.value.search.toLowerCase()
        result = result.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.host.toLowerCase().includes(search)
        )
      }

      if (filter.value.status) {
        result = result.filter(p => p.status === filter.value.status)
      }

      if (filter.value.type) {
        result = result.filter(p => p.proxy_type === filter.value.type)
      }

      // 分页
      // const startIndex = (currentPage.value - 1) * itemsPerPage
      // const endIndex = startIndex + itemsPerPage
      // totalPages.value = Math.ceil(result.length / itemsPerPage)
      // return result.slice(startIndex, endIndex)

      return result
    })

    // 方法
    const fetchProxies = async () => {
      try {
        await store.dispatch('proxy/fetchPersonalProxies')
      } catch (err) {
        console.error('Error fetching personal proxies:', err)
      }
    }

    const refreshProxies = async () => {
      try {
        isRefreshing.value = true
        await fetchProxies()
      } finally {
        isRefreshing.value = false
      }
    }

    const changePage = (page) => {
      currentPage.value = page
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        uploadProxy.value.file = file
      }
    }

    const addPersonalProxy = async () => {
      if (!isFormValid.value) return

      try {
        isSubmitting.value = true
        await store.dispatch('proxy/createPersonalProxy', {
          name: newProxy.value.name,
          host: newProxy.value.host,
          port: newProxy.value.port,
          proxy_type: newProxy.value.proxy_type,
          username: newProxy.value.username || null,
          password: newProxy.value.password || null,
          notes: newProxy.value.notes || null,
          is_active: true
        })

        clearForm()
      } catch (err) {
        console.error('Error adding personal proxy:', err)
      } finally {
        isSubmitting.value = false
      }
    }

    const batchAddProxies = async () => {
      if (!isBatchFormValid.value) return

      try {
        isBatchSubmitting.value = true

        await store.dispatch('proxy/batchCreatePersonalProxies', {
          proxy_list: batchImport.value.list,
          proxy_type: batchImport.value.type
        })

        clearBatchForm()
      } catch (err) {
        console.error('Error batch adding proxies:', err)
      } finally {
        isBatchSubmitting.value = false
      }
    }

    const uploadProxyFile = async () => {
      if (!isUploadValid.value) return

      try {
        isUploading.value = true

        const formData = new FormData()
        formData.append('file', uploadProxy.value.file)
        formData.append('proxy_type', uploadProxy.value.type)

        await store.dispatch('proxy/importPersonalProxies', formData)

        // 重置表单
        uploadProxy.value.file = null
        document.getElementById('proxyFile').value = ''
      } catch (err) {
        console.error('Error uploading proxy file:', err)
      } finally {
        isUploading.value = false
      }
    }

    const testProxy = async (proxyId) => {
      try {
        await store.dispatch('proxy/testPersonalProxy', {
          proxyId,
          testData: {
            test_url: testUrl.value || 'https://api.ipify.org'
          }
        })
      } catch (err) {
        console.error('Error testing proxy:', err)
      }
    }

    const testSelectedProxy = () => {
      if (selectedTestProxy.value) {
        testProxy(selectedTestProxy.value)
      }
    }

    const editProxy = async (proxyId) => {
      try {
        await store.dispatch('proxy/fetchPersonalProxy', proxyId)
        const currentProxy = store.getters['proxy/currentPersonalProxy']

        if (currentProxy) {
          // 填充编辑表单
          editProxy.value = {
            id: currentProxy.id,
            name: currentProxy.name,
            host: currentProxy.host,
            port: currentProxy.port,
            proxy_type: currentProxy.proxy_type,
            username: currentProxy.username || '',
            password: '', // 不传递密码
            notes: currentProxy.notes || '',
            is_active: currentProxy.is_active
          }

          // 显示模态框
          showEditModal.value = true
        }
      } catch (err) {
        console.error('Error fetching proxy details for edit:', err)
      }
    }

    const updateProxy = async () => {
      if (!isEditFormValid.value) return

      try {
        isSubmitting.value = true

        // 准备更新数据
        const proxyData = {
          name: editProxy.value.name,
          host: editProxy.value.host,
          port: editProxy.value.port,
          proxy_type: editProxy.value.proxy_type,
          username: editProxy.value.username || null,
          notes: editProxy.value.notes || null,
          is_active: editProxy.value.is_active
        }

        // 只有当用户输入了密码时才更新密码
        if (editProxy.value.password) {
          proxyData.password = editProxy.value.password
        }

        await store.dispatch('proxy/updatePersonalProxy', {
          proxyId: editProxy.value.id,
          proxyData
        })

        // 关闭模态框
        closeEditModal()
      } catch (err) {
        console.error('Error updating proxy:', err)
      } finally {
        isSubmitting.value = false
      }
    }

    const deleteProxy = async (proxyId) => {
      if (confirm('确定要删除此代理吗？此操作不可撤销。')) {
        try {
          await store.dispatch('proxy/deletePersonalProxy', proxyId)
        } catch (err) {
          console.error('Error deleting proxy:', err)
        }
      }
    }

    const toggleProxyStatus = async (proxyId) => {
      try {
        await store.dispatch('proxy/togglePersonalProxyStatus', proxyId)
      } catch (err) {
        console.error('Error toggling proxy status:', err)
      }
    }

    const clearForm = () => {
      newProxy.value = {
        name: '',
        host: '',
        port: null,
        proxy_type: 'http',
        username: '',
        password: '',
        notes: '',
        is_active: true
      }
    }

    const clearBatchForm = () => {
      batchImport.value = {
        type: 'http',
        list: ''
      }
    }

    const closeEditModal = () => {
      showEditModal.value = false

      // 清除编辑表单
      editProxy.value = {
        id: null,
        name: '',
        host: '',
        port: null,
        proxy_type: 'http',
        username: '',
        password: '',
        notes: '',
        is_active: true
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return '未知'

      const date = new Date(dateString)
      return date.toLocaleString()
    }

    const getProxyTypeName = (type) => {
      const typeMap = {
        'http': 'HTTP',
        'https': 'HTTPS',
        'socks4': 'SOCKS4',
        'socks5': 'SOCKS5'
      }
      return typeMap[type] || type
    }

    const getStatusName = (status) => {
      const statusMap = {
        'active': '活跃',
        'inactive': '不活跃',
        'testing': '测试中',
        'failed': '失败'
      }
      return statusMap[status] || status
    }

    const isValidProxy = (proxy) => {
      // 支持更复杂的代理格式: user-sherlock1-sessid-pP8nnpp1-sesstime-1-keep-true:acchde1@pr.roxlabs.cn:4600
      // 和传统的 IP:端口 或 IP:端口:用户名:密码

      // 尝试检测是否是扩展格式 (包含@符号)
      if (proxy.includes('@')) {
        // 格式: 前缀:用户名@主机:端口
        const parts = proxy.split('@');
        if (parts.length !== 2) return false;

        // 检查主机部分是否有效 (主机:端口)
        const hostParts = parts[1].split(':');
        return hostParts.length >= 2;
      }

      // 传统格式检查: IP:端口 或 IP:端口:用户名:密码
      const parts = proxy.split(':');

      // 至少要有IP和端口两部分
      if (parts.length < 2) return false;

      // 检查IP地址格式是否合法，放宽检查标准，允许域名
      const ipOrHost = parts[0];
      const isValidIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(ipOrHost);
      const isValidDomain = /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(ipOrHost);

      return isValidIp || isValidDomain;
    };

    const isValidProxyList = (list) => {
      const lines = list.trim().split('\n')
      return lines.length > 0 && lines.every(line => isValidProxy(line.trim()))
    }

    // 监听过滤器变化，重置页码
    watch(filter, () => {
      currentPage.value = 1
    }, {deep: true})

    // 初始化
    onMounted(() => {
      fetchProxies()
    })

    return {
      // 状态
      isLoading,
      error,
      isRefreshing,
      isSubmitting,
      isBatchSubmitting,
      isUploading,
      isTesting,
      currentPage,
      totalPages,
      proxies,
      testResult,
      showEditModal,

      // 分页和过滤
      filter,
      filteredProxies,

      // 表单数据
      newProxy,
      batchImport,
      uploadProxy,
      editProxy,
      selectedTestProxy,
      testUrl,

      // 计算属性
      isFormValid,
      isEditFormValid,
      isBatchFormValid,
      isUploadValid,

      // 方法
      fetchProxies,
      refreshProxies,
      changePage,
      handleFileUpload,
      addPersonalProxy,
      batchAddProxies,
      uploadProxyFile,
      testProxy,
      testSelectedProxy,
      editProxy,
      updateProxy,
      deleteProxy,
      toggleProxyStatus,
      clearForm,
      clearBatchForm,
      closeEditModal,
      formatDate,
      getProxyTypeName,
      getStatusName
    }
  }
}
</script>

<style scoped>
.personal-proxies-container {
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

.proxy-tools {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.tool-card, .proxy-test-card, .proxy-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header, .proxy-header, .section-header, .modal-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
}

.card-header h2, .section-header h2, .modal-header h3 {
  margin: 0;
  font-size: 18px;
  margin-left: 10px;
}

.modal-header h3 {
  margin-left: 0;
}

.card-header i {
  font-size: 20px;
  color: #0078d7;
}

.card-body, .modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="password"],
.form-group input[type="file"],
.form-group select,
.form-group textarea,
.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-input {
  width: 200px;
}

.form-group textarea {
  font-family: 'Courier New', monospace;
}

.form-hint {
  margin-top: 5px;
  color: #666;
  font-size: 12px;
}

.form-actions, .modal-footer {
  display: flex;
  gap: 10px;
}

.primary-btn, .secondary-btn, .retry-btn, .toggle-btn, .page-btn, .action-btn, .btn-success, .btn-danger {
  padding: 10px 15px;
  border-radius: 4px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.primary-btn {
  background-color: #0078d7;
  color: white;
}

.secondary-btn {
  background-color: #f0f0f0;
  color: #333;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.primary-btn:hover:not(:disabled), .btn-success:hover:not(:disabled), .btn-danger:hover:not(:disabled) {
  filter: brightness(90%);
}

.secondary-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.primary-btn:disabled, .secondary-btn:disabled, .btn-success:disabled, .btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.proxy-test-card {
  margin-bottom: 30px;
}

.test-result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.test-result.success {
  background-color: #d4edda;
  color: #155724;
}

.test-result.error {
  background-color: #f8d7da;
  color: #721c24;
}

.result-icon i {
  font-size: 24px;
}

.result-content h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.result-details {
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
}

.section-header {
  justify-content: space-between;
  background-color: transparent;
  padding: 10px 0;
  margin-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.section-filter {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 5px;
}

.filter-group label {
  font-size: 14px;
  color: #666;
}

.filter-group select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #0078d7;
  cursor: pointer;
  padding: 5px;
}

.icon-btn:hover {
  color: #005fa3;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 40px 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 20px;
}

.loading-state i, .error-state i, .empty-state i {
  font-size: 40px;
  margin-bottom: 15px;
  color: #888;
}

.error-state i {
  color: #dc3545;
}

.retry-btn {
  background-color: #6c757d;
  color: white;
  margin-top: 10px;
}

.retry-btn:hover {
  background-color: #5a6268;
}

.suggestion {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
}

.proxies-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.proxy-header {
  justify-content: space-between;
}

.proxy-title {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.proxy-title h3 {
  margin: 0;
  font-size: 16px;
}

.proxy-badges {
  display: flex;
  gap: 8px;
}

.proxy-type-badge, .proxy-status-badge, .proxy-active-badge {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 10px;
}

.proxy-type-badge {
  background-color: #e9ecef;
  color: #495057;
}

.proxy-status-badge {
  color: white;
}

.proxy-status-badge.active {
  background-color: #28a745;
}

.proxy-status-badge.inactive {
  background-color: #6c757d;
}

.proxy-status-badge.testing {
  background-color: #007bff;
}

.proxy-status-badge.failed {
  background-color: #dc3545;
}

.proxy-active-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.proxy-active-badge.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.proxy-actions {
  display: flex;
  gap: 5px;
}

.action-btn {
  padding: 5px;
  border-radius: 4px;
  background: none;
  color: #6c757d;
  border: none;
}

.test-btn:hover {
  color: #0078d7;
}

.edit-btn:hover {
  color: #28a745;
}

.delete-btn:hover {
  color: #dc3545;
}

.proxy-body {
  padding: 20px;
}

.proxy-info {
  margin-bottom: 15px;
}

.info-item {
  margin-bottom: 8px;
  font-size: 14px;
}

.info-label {
  font-weight: bold;
  color: #666;
  margin-right: 5px;
}

.proxy-actions-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.toggle-btn {
  font-size: 13px;
  padding: 6px 12px;
}

.proxy-notes {
  font-size: 13px;
  color: #666;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.page-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #ced4da;
}

.page-btn:hover:not(:disabled) {
  background-color: #e9ecef;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #6c757d;
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
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  justify-content: space-between;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  justify-content: flex-end;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .proxy-tools {
    grid-template-columns: 1fr;
  }

  .proxies-list {
    grid-template-columns: 1fr;
  }

  .section-filter {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .filter-group, .search-input {
    width: 100%;
  }
}
</style>