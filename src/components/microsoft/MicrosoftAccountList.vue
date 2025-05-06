<template>
  <div class="microsoft-account-list">
    <div class="header">
      <h1>邮箱数据管理</h1>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else>
      <!-- 修改账户过滤和搜索部分 -->
      <div class="filters">
        <div class="search-box">
          <input
              type="text"
              v-model="searchQuery"
              placeholder="搜索邮箱..."
              @input="handleSearchInput"
          />
        </div>
        <select v-model="accountTypeFilter" @change="fetchAccounts">
          <option value="">所有邮箱类型</option>
          <option v-for="type in emailAccountTypes" :key="type.code" :value="type.code">
            {{ type.name }}
          </option>
        </select>
        <select v-model="statusFilter" @change="fetchAccounts">
          <option value="">所有状态</option>
          <option value="available">可用</option>
          <option value="locked">锁定</option>
          <option value="banned">封禁</option>
          <option value="expired">过期</option>
          <option value="recovery">待恢复(手机号)</option>
          <option value="under_review">审核中</option>
        </select>
      </div>

      <!-- 如果正在搜索或筛选，显示当前条件 -->
      <div v-if="searchQuery || statusFilter || accountTypeFilter" class="filter-status">
        <span v-if="searchQuery">搜索: "{{ searchQuery }}" </span>
        <span v-if="statusFilter">状态: {{ getStatusText(statusFilter) }}</span>
        <span v-if="accountTypeFilter">类型: {{ getAccountTypeName(accountTypeFilter) }}</span>
        <button @click="clearFilters" class="clear-btn">清除筛选</button>
      </div>

      <!-- 修改空结果时的显示 -->
      <div v-if="accounts.length === 0" class="empty-result">
        <p v-if="searchQuery || statusFilter || accountTypeFilter">没有找到符合条件的邮箱账户</p>
        <p v-else>暂无邮箱账户</p>
      </div>

      <!-- 账户列表，只有在有数据时才显示 -->
      <div v-if="accounts.length > 0" class="accounts-table">
        <table>
          <thead>
          <tr>
            <th>邮箱地址</th>
            <th>邮箱类型</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>最后更新</th>
            <th>操作</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="account in accounts" :key="account.uid">
            <td>{{ account.email }}</td>
            <td>
                <span class="account-type-badge"
                      :style="{ backgroundColor: getAccountTypeColor(account.account_type) }">
                  {{ getAccountTypeName(account.account_type) }}
                </span>
            </td>
            <td>
                <span class="status-badge" :class="getStatusClass(account.status)">
                  {{ getStatusText(account.status) }}
                </span>
            </td>
            <td>{{ formatDate(account.created_at) }}</td>
            <td>{{ formatDate(account.updated_at) }}</td>
            <td>
              <router-link :to="`/microsoft-accounts/${account.uid}/emails`">
                <button class="view-btn">查看邮件</button>
              </router-link>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 只有在有数据时才显示分页 -->
      <div v-if="accounts.length > 0" class="pagination">
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
  </div>
</template>

<script>
import {ref, onMounted, computed} from 'vue'
import {useStore} from 'vuex'
import {debounce} from 'lodash'

export default {
  name: 'MicrosoftAccountList',

  setup() {
    const store = useStore()

    const accounts = computed(() => store.getters['microsoft/accounts'])
    const totalAccounts = computed(() => store.getters['microsoft/totalAccounts'])
    const loading = computed(() => store.getters['microsoft/loading'])
    const error = computed(() => store.getters['microsoft/error'])
    const emailAccountTypes = computed(() => store.getters['email/accountTypes'])

    const currentPage = ref(1)
    const pageSize = ref(10)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const accountTypeFilter = ref('')

    const totalPages = computed(() => Math.ceil(totalAccounts.value / pageSize.value) || 1)

    const fetchAccounts = async () => {
      try {
        // 构建查询参数
        const params = {
          page: currentPage.value,
          page_size: pageSize.value
        }

        if (searchQuery.value) {
          params.search = searchQuery.value
        }

        if (statusFilter.value) {
          params.status = statusFilter.value
        }

        if (accountTypeFilter.value) {
          params.account_type = accountTypeFilter.value
        }

        // 通过Vuex获取账户列表
        await store.dispatch('microsoft/fetchAccounts', params)
      } catch (err) {
        console.error('Error fetching email accounts:', err)
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

    // 处理分页
    const changePage = (page) => {
      currentPage.value = page
      fetchAccounts()
    }

    // 处理搜索，使用防抖
    const handleSearchInput = debounce(() => {
      currentPage.value = 1 // 重置为第一页
      fetchAccounts()
    }, 500)

    // 清除所有筛选条件
    const clearFilters = () => {
      searchQuery.value = ''
      statusFilter.value = ''
      accountTypeFilter.value = ''
      currentPage.value = 1
      fetchAccounts()
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    }

    // 获取状态对应的CSS类
    const getStatusClass = (status) => {
      const statusMap = {
        'available': 'status-available',
        'locked': 'status-locked',
        'banned': 'status-banned',
        'recovery': 'status-recovery',
        'expired': 'status-expired',
        'under_review': 'status-review'
      }
      return statusMap[status] || ''
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'available': '可用',
        'recovery': '待恢复(手机号)',
        'locked': '锁定',
        'banned': '封禁',
        'expired': '过期',
        'under_review': '审核中'
      }
      return statusMap[status] || status
    }

    // 获取邮箱类型名称
    const getAccountTypeName = (typeCode) => {
      if (!typeCode) return '未知'
      const typeMap = {
        'outlook': '微软邮箱',
        'gmail': 'Gmail邮箱',
        'qq': 'QQ邮箱',
        '163': '网易邮箱',
        'icloud': 'iCloud邮箱'
      }
      return typeMap[typeCode] || typeCode || '未知类型'
      // const type = emailAccountTypes.value.find(t => t.code === typeCode)
      // return type ? type.name : typeCode
    }

    // 获取邮箱类型颜色
    const getAccountTypeColor = (typeCode) => {
      const colorMap = {
        'outlook': '#0078D4',
        'gmail': '#DB4437',
        'qq': '#12B7F5',
        '163': '#D33C30',
        'icloud': '#999999'
      }
      return colorMap[typeCode] || '#666666'
    }

    onMounted(() => {
      // 清除可能存在的错误状态
      store.dispatch('microsoft/clearError')
      // 加载邮箱类型
      loadEmailAccountTypes()
      // 加载账户
      fetchAccounts()
    })

    return {
      accounts,
      loading,
      error,
      currentPage,
      totalPages,
      searchQuery,
      statusFilter,
      accountTypeFilter,
      emailAccountTypes,
      fetchAccounts,
      changePage,
      handleSearchInput,
      clearFilters,
      formatDate,
      getStatusClass,
      getStatusText,
      getAccountTypeName,
      getAccountTypeColor
    }
  }
}
</script>

<style scoped>
.microsoft-account-list {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  width: 100%;
}

/* 修改搜索框样式，确保可见 */
.search-box {
  flex: 1;
  min-width: 200px; /* 确保最小宽度 */
}

.search-box input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box; /* 确保padding不会增加元素宽度 */
}

select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  min-width: 120px;
}

/* 筛选状态显示 */
.filter-status {
  margin-bottom: 15px;
  padding: 8px 15px;
  background-color: #f0f7ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.filter-status span {
  margin-right: 10px;
}

.clear-btn {
  margin-left: 10px;
  padding: 4px 8px;
  background-color: #e9ecef;
  border: none;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
}

.clear-btn:hover {
  background-color: #dde2e6;
}

/* 空结果样式 */
.empty-result {
  text-align: center;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin: 20px 0;
  color: #666;
}

.accounts-table {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

table th, table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

table th {
  background-color: #f9f9f9;
  font-weight: bold;
}

.status-badge, .account-type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.account-type-badge {
  color: white;
}

.status-available {
  background-color: #e6f7e6;
  color: #2ecc71;
}

.status-locked {
  background-color: #fff4e5;
  color: #f39c12;
}

.status-banned {
  background-color: #ffe5e5;
  color: #e74c3c;
}

.status-recovery {
  background-color: #f8d7da;
  color: #721c24;
}

.status-expired {
  background-color: #f9f9f9;
  color: #95a5a6;
}

.status-review {
  background-color: #e5f4ff;
  color: #3498db;
}

.view-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.view-btn:hover {
  background-color: #2980b9;
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

/* 加载和错误状态样式 */
.loading, .error {
  text-align: center;
  padding: 20px;
  margin: 20px 0;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.error {
  color: #e74c3c;
  background-color: #ffe5e5;
}
</style>