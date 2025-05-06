<template>
  <div class="proxy-pools-container">
    <div class="header">
      <h1>代理池管理</h1>
      <p class="description">管理您的代理服务器池，用于API请求和邮箱操作</p>
    </div>

    <div class="proxy-tools">
      <div class="tool-card">
        <div class="card-header">
          <i class="fas fa-plus-circle"></i>
          <h2>添加代理池</h2>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label for="poolName">代理池名称：</label>
            <input
                type="text"
                id="poolName"
                v-model="newPool.name"
                placeholder="例如: 美国代理池"
            />
          </div>

          <div class="form-group">
            <label for="poolType">代理类型：</label>
            <select id="poolType" v-model="newPool.proxy_type">
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks4">SOCKS4</option>
              <option value="socks5">SOCKS5</option>
            </select>
          </div>

          <div class="form-group">
            <label for="poolDescription">描述（可选）：</label>
            <textarea
                id="poolDescription"
                v-model="newPool.description"
                rows="3"
                placeholder="代理池的用途、来源等信息"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="proxyList">代理列表：</label>
            <textarea
                id="proxyList"
                v-model="newPool.proxy_list"
                rows="8"
                placeholder="每行一个代理，格式: IP:端口 或 IP:端口:用户名:密码"
            ></textarea>
            <p class="form-hint">例如: 192.168.1.1:8080 或 192.168.1.1:8080:user:pass 或
              user-params:username@host:port</p>
          </div>

          <div class="form-actions">
            <button @click="addProxyPool" :disabled="!isFormValid" class="primary-btn">
              <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
              <span v-else>添加代理池</span>
            </button>
            <button type="button" @click="clearForm" class="secondary-btn">清空</button>
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
            <label for="uploadPoolName">代理池名称：</label>
            <input
                type="text"
                id="uploadPoolName"
                v-model="uploadPool.name"
                placeholder="例如: 欧洲代理池"
            />
          </div>

          <div class="form-group">
            <label for="uploadPoolType">代理类型：</label>
            <select id="uploadPoolType" v-model="uploadPool.proxy_type">
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks4">SOCKS4</option>
              <option value="socks5">SOCKS5</option>
            </select>
          </div>

          <div class="form-group">
            <label for="uploadDescription">描述（可选）：</label>
            <textarea
                id="uploadDescription"
                v-model="uploadPool.description"
                rows="3"
                placeholder="代理池的用途、来源等信息"
            ></textarea>
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
          <label for="testProxy">输入单个代理进行测试：</label>
          <input
              type="text"
              id="testProxy"
              v-model="testProxy"
              placeholder="例如: 192.168.1.1:8080"
          />
        </div>

        <div class="form-group">
          <label for="testType">代理类型：</label>
          <select id="testType" v-model="testType">
            <option value="http">HTTP</option>
            <option value="https">HTTPS</option>
            <option value="socks4">SOCKS4</option>
            <option value="socks5">SOCKS5</option>
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
          <button @click="testProxyConnection" :disabled="!isTestFormValid || isTesting" class="primary-btn">
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
              <p><strong>位置:</strong> {{ testResult.data.location || '未知' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="proxy-pools-list">
      <div class="section-header">
        <h2>我的代理池</h2>
        <div class="section-controls">
          <button @click="refreshProxyPools" class="icon-btn" title="刷新">
            <i :class="isRefreshing ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'"></i>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>加载中...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="refreshProxyPools" class="retry-btn">重试</button>
      </div>

      <div v-else-if="proxyPools.length === 0" class="empty-state">
        <i class="fas fa-database"></i>
        <p>您还没有添加任何代理池</p>
        <p class="suggestion">请使用上方工具添加或上传代理池</p>
      </div>

      <div v-else class="pools-list">
        <div v-for="pool in proxyPools" :key="pool.id" class="pool-card">
          <div class="pool-header">
            <div class="pool-title">
              <h3>{{ pool.name }}</h3>
              <span class="pool-type">{{ getProxyTypeName(pool.proxy_type) }}</span>
            </div>
            <div class="pool-actions">
              <button @click="testPool(pool.id)" class="action-btn test-btn" title="测试代理池">
                <i class="fas fa-vial"></i>
              </button>
              <button @click="openEditModal(pool.id)" class="action-btn edit-btn" title="编辑">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deletePool(pool.id)" class="action-btn delete-btn" title="删除">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>

          <div class="pool-body">
            <div class="pool-stats">
              <div class="stat">
                <h4>总代理数</h4>
                <p>{{ pool.total_proxies }}</p>
              </div>
              <div class="stat">
                <h4>可用代理</h4>
                <p>{{ pool.working_proxies }}</p>
              </div>
              <div class="stat">
                <h4>成功率</h4>
                <p>{{ calculateSuccessRate(pool) }}%</p>
              </div>
              <div class="stat">
                <h4>平均响应时间</h4>
                <p>{{ pool.avg_response_time }}ms</p>
              </div>
            </div>

            <div class="pool-usage">
              <h4>使用状态</h4>
              <div class="usage-badge" :class="pool.is_active ? 'active' : 'inactive'">
                {{ pool.is_active ? '启用中' : '未启用' }}
              </div>
              <button @click="togglePoolStatus(pool.id)" class="toggle-btn">
                {{ pool.is_active ? '禁用' : '启用' }}
              </button>
            </div>

            <div class="pool-details">
              <div v-if="pool.description" class="detail-row description">
                <p>{{ pool.description }}</p>
              </div>
              <div class="detail-row">
                <span class="detail-label">创建时间：</span>
                <span class="detail-value">{{ formatDate(pool.created_at) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">上次更新：</span>
                <span class="detail-value">{{ formatDate(pool.updated_at) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">上次测试：</span>
                <span class="detail-value">{{ formatDate(pool.last_tested) }}</span>
              </div>
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

    <!-- 编辑代理池模态框 -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>编辑代理池</h3>
          <button @click="closeEditModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="editName">代理池名称：</label>
            <input
                type="text"
                id="editName"
                v-model="editPool.name"
                placeholder="例如: 美国代理池"
            />
          </div>

          <div class="form-group">
            <label for="editType">代理类型：</label>
            <select id="editType" v-model="editPool.proxy_type">
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks4">SOCKS4</option>
              <option value="socks5">SOCKS5</option>
            </select>
          </div>

          <div class="form-group">
            <label for="editDescription">描述（可选）：</label>
            <textarea
                id="editDescription"
                v-model="editPool.description"
                rows="3"
                placeholder="代理池的用途、来源等信息"
            ></textarea>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" v-model="editPool.is_active"/>
              启用代理池
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="updatePool" :disabled="!isEditFormValid" class="primary-btn">
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
  name: 'ProxyPools',

  setup() {
    const store = useStore()

    // 状态变量
    const loading = computed(() => store.getters['proxy/loading'])
    const error = computed(() => store.getters['proxy/error'])
    const isRefreshing = ref(false)
    const isSubmitting = ref(false)
    const isUploading = ref(false)
    const isTesting = computed(() => store.getters['proxy/isTesting'])
    const currentPage = ref(1)
    const totalPages = ref(1)
    const proxyPools = computed(() => store.getters['proxy/proxyPools'])
    const testResult = computed(() => store.getters['proxy/testResult'])
    const showEditModal = ref(false)

    // 表单数据
    const newPool = ref({
      name: '',
      proxy_type: 'http',
      description: '',
      proxy_list: ''
    })

    const uploadPool = ref({
      name: '',
      proxy_type: 'http',
      description: '',
      file: null
    })

    const editPool = ref({
      id: null,
      name: '',
      proxy_type: 'http',
      description: '',
      is_active: true
    })

    const testProxy = ref('')
    const testType = ref('http')
    const testUrl = ref('https://api.ipify.org')

    // 计算属性
    const isFormValid = computed(() => {
      return newPool.value.name &&
          newPool.value.proxy_list &&
          isValidProxyList(newPool.value.proxy_list)
    })

    const isUploadValid = computed(() => {
      return uploadPool.value.name &&
          uploadPool.value.file !== null
    })

    const isTestFormValid = computed(() => {
      return testProxy.value && isValidProxy(testProxy.value)
    })

    const isEditFormValid = computed(() => {
      return editPool.value.name
    })

    // 方法
    const fetchProxyPools = async () => {
      try {
        // 真实API调用
        await store.dispatch('proxy/fetchProxyPools', {
          page: currentPage.value,
          // 可以添加其他参数，例如搜索、过滤等
        })

        // 更新总页数（如果后端API返回）
        // 这里假设API会返回总页数，实际应根据API实现调整
        totalPages.value = 1 // 默认为1，应该从API响应获取
      } catch (error) {
        console.error('Error fetching proxy pools:', error)
      }
    }

    const refreshProxyPools = async () => {
      try {
        isRefreshing.value = true
        await fetchProxyPools()
      } catch (error) {
        console.error('Error refreshing proxy pools:', error)
      } finally {
        isRefreshing.value = false
      }
    }

    const changePage = (page) => {
      currentPage.value = page
      fetchProxyPools()
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        uploadPool.value.file = file
      }
    }

    const addProxyPool = async () => {
      if (!isFormValid.value) return

      try {
        isSubmitting.value = true

        // 真实API调用
        await store.dispatch('proxy/createProxyPool', {
          name: newPool.value.name,
          proxy_type: newPool.value.proxy_type,
          description: newPool.value.description,
          proxy_list: newPool.value.proxy_list
        })

        clearForm()
      } catch (error) {
        console.error('Error adding proxy pool:', error)
      } finally {
        isSubmitting.value = false
      }
    }

    const uploadProxyFile = async () => {
      if (!isUploadValid.value) return

      try {
        isUploading.value = true

        // 准备表单数据
        const formData = new FormData()
        formData.append('file', uploadPool.value.file)
        formData.append('name', uploadPool.value.name)
        formData.append('proxy_type', uploadPool.value.proxy_type)
        formData.append('description', uploadPool.value.description || '')

        // 真实API调用
        await store.dispatch('proxy/importProxies', formData)

        // 清空表单
        uploadPool.value.name = ''
        uploadPool.value.proxy_type = 'http'
        uploadPool.value.description = ''
        uploadPool.value.file = null
        document.getElementById('proxyFile').value = ''
      } catch (error) {
        console.error('Error uploading proxy file:', error)
      } finally {
        isUploading.value = false
      }
    }

    const testProxyConnection = async () => {
      if (!isTestFormValid.value) return

      try {
        // 真实API调用
        await store.dispatch('proxy/testProxy', {
          proxy: testProxy.value,
          proxy_type: testType.value,
          test_url: testUrl.value || 'https://api.ipify.org',
          timeout: 10
        })
      } catch (error) {
        console.error('Error testing proxy:', error)
      }
    }

    const testPool = async (poolId) => {
      try {
        // 真实API调用
        await store.dispatch('proxy/testProxyPool', {
          poolId,
          testData: {
            test_url: 'https://api.ipify.org',
            timeout: 10
          }
        })
      } catch (error) {
        console.error('Error testing pool:', error)
      }
    }

    const openEditModal = async (poolId) => {
      try {
        // 获取池详情
        await store.dispatch('proxy/fetchProxyPool', poolId)
        const currentPool = store.getters['proxy/currentProxyPool']

        if (currentPool) {
          // 填充编辑表单
          editPool.value = {
            id: currentPool.id,
            name: currentPool.name,
            proxy_type: currentPool.proxy_type,
            description: currentPool.description || '',
            is_active: currentPool.is_active
          }

          // 显示模态框
          showEditModal.value = true
        }
      } catch (error) {
        console.error('Error getting pool details:', error)
      }
    }

    const updatePool = async () => {
      if (!isEditFormValid.value) return

      try {
        isSubmitting.value = true

        // 真实API调用
        await store.dispatch('proxy/updateProxyPool', {
          poolId: editPool.value.id,
          poolData: {
            name: editPool.value.name,
            proxy_type: editPool.value.proxy_type,
            description: editPool.value.description,
            is_active: editPool.value.is_active
          }
        })

        closeEditModal()
      } catch (error) {
        console.error('Error updating pool:', error)
      } finally {
        isSubmitting.value = false
      }
    }

    const deletePool = async (poolId) => {
      if (confirm('确定要删除此代理池吗？此操作不可撤销，池中的所有代理也将被删除。')) {
        try {
          // 真实API调用
          await store.dispatch('proxy/deleteProxyPool', poolId)
        } catch (error) {
          console.error('Error deleting pool:', error)
        }
      }
    }

    const togglePoolStatus = async (poolId) => {
      try {
        // 真实API调用
        await store.dispatch('proxy/toggleProxyPoolStatus', poolId)
      } catch (error) {
        console.error('Error toggling pool status:', error)
      }
    }

    const clearForm = () => {
      newPool.value = {
        name: '',
        proxy_type: 'http',
        description: '',
        proxy_list: ''
      }
    }

    const closeEditModal = () => {
      showEditModal.value = false
    }

    const formatDate = (dateString) => {
      if (!dateString) return '未知'

      const date = new Date(dateString)
      return date.toLocaleString()
    }

    const calculateSuccessRate = (pool) => {
      if (!pool.total_proxies || pool.total_proxies === 0) return 0
      return Math.round((pool.working_proxies / pool.total_proxies) * 100)
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

    const isValidProxy = (proxy) => {
      // 支持更复杂的代理格式: user-1-1-1-1-1-keep-true:123@pr.roxlabs.cn:4600
      // 和传统的 IP:端口 或 IP:端口:用户名:密码

      if (!proxy || typeof proxy !== 'string') return false;

      // 移除可能存在的空格
      proxy = proxy.trim();

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

    // 初始化
    onMounted(() => {
      fetchProxyPools()
    })

    return {
      // 状态
      loading,
      error,
      isRefreshing,
      isSubmitting,
      isUploading,
      isTesting,
      currentPage,
      totalPages,
      proxyPools,
      testResult,
      showEditModal,

      // 表单数据
      newPool,
      uploadPool,
      editPool,
      testProxy,
      testType,
      testUrl,

      // 计算属性
      isFormValid,
      isUploadValid,
      isTestFormValid,
      isEditFormValid,

      // 方法
      fetchProxyPools,
      refreshProxyPools,
      changePage,
      handleFileUpload,
      addProxyPool,
      uploadProxyFile,
      testProxyConnection,
      testPool,
      openEditModal,
      updatePool,
      deletePool,
      togglePoolStatus,
      clearForm,
      closeEditModal,
      formatDate,
      calculateSuccessRate,
      getProxyTypeName,
      isValidProxy,
      isValidProxyList
    }
  }
}
</script>

<style scoped>
.proxy-pools-container {
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
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.tool-card, .proxy-test-card, .pool-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header, .pool-header, .section-header, .modal-header {
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
.form-group input[type="file"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
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

.primary-btn, .secondary-btn, .retry-btn, .toggle-btn, .page-btn, .action-btn {
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

.primary-btn:hover:not(:disabled) {
  background-color: #005fa3;
}

.secondary-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.primary-btn:disabled, .secondary-btn:disabled {
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

.section-controls {
  display: flex;
  gap: 10px;
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

.pools-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.pool-header {
  justify-content: space-between;
}

.pool-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pool-title h3 {
  margin: 0;
  font-size: 16px;
}

.pool-type {
  font-size: 12px;
  padding: 3px 8px;
  background-color: #e9ecef;
  border-radius: 10px;
  color: #495057;
}

.pool-actions {
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

.pool-body {
  padding: 20px;
}

.pool-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.stat {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  text-align: center;
}

.stat h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #666;
}

.stat p {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.pool-usage {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.pool-usage h4 {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.usage-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.usage-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.usage-badge.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.toggle-btn {
  padding: 5px 10px;
  background-color: #e9ecef;
  color: #495057;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.toggle-btn:hover {
  background-color: #ced4da;
}

.pool-details {
  font-size: 13px;
  color: #666;
}

.detail-row {
  display: flex;
  margin-bottom: 5px;
}

.description {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #eee;
}

.detail-label {
  font-weight: bold;
  margin-right: 5px;
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
@media (max-width: 992px) {
  .proxy-tools {
    grid-template-columns: 1fr;
  }

  .pools-list {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 576px) {
  .pool-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .pool-actions {
    width: 100%;
    justify-content: space-between;
  }

  .pool-stats {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .primary-btn, .secondary-btn {
    width: 100%;
  }
}
</style>