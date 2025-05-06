<template>
  <div class="import-tasks">
    <div class="card">
      <div class="header">
        <h1>邮件任务列表</h1>
        <router-link to="/tasks/create">
          <button>创建新任务</button>
        </router-link>
      </div>

      <div class="filters">
        <input
            type="text"
            v-model="searchQuery"
            placeholder="搜索任务ID..."
            @input="handleSearchInput"
        />

        <select v-model="typeFilter">
          <option value="">所有邮箱类型</option>
          <option v-for="type in accountTypes"
                  :key="type.id"
                  :value="type.id">
            {{ type.name }}
          </option>
        </select>

        <select v-model="taskTypeFilter">
          <option value="">所有任务类型</option>
          <option value="import">邮箱导入</option>
          <option value="bind-auxiliary">绑定辅助邮箱</option>
        </select>

        <select v-model="statusFilter">
          <option value="">所有状态</option>
          <option value="pending">等待处理</option>
          <option value="processing">处理中</option>
          <option value="completed">已完成</option>
          <option value="failed">失败</option>
        </select>

        <button @click="applyFilters">
          <i class="fas fa-search"></i> 查询
        </button>
      </div>

      <div v-if="loading && !tasks.length" class="loading">加载中...</div>

      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else-if="!tasks.length" class="empty-state">
        <p>您还没有创建任何任务</p>
        <router-link to="/tasks/create">
          <button>创建任务</button>
        </router-link>
      </div>

      <div v-else>
        <table class="task-table">
          <thead>
          <tr>
            <th>ID</th>
            <th>任务类型</th>
            <th>邮箱类型</th>
            <th>创建时间</th>
            <th>状态</th>
            <th>进度</th>
            <th>成功/总数</th>
            <th>操作</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="task in filteredTasks"
              :key="task.id"
              :class="{ 'highlight': highlightedTaskId === task.id }">
            <td class="id-text">{{ truncateId(task.id) }}</td>
            <td>{{ getTaskTypeText(task.task_type) }}</td>
            <td>{{ task.account_type_name }}</td>
            <td>{{ formatDate(task.created_at) }}</td>
            <td>
                <span class="status-tag" :class="'status-' + task.status">
                  {{ getStatusText(task.status) }}
                </span>
            </td>
            <td>
              <div class="progress-bar">
                <div class="progress" :style="{ width: task.progress + '%' }"></div>
                <span>{{ task.progress }}%</span>
              </div>
            </td>
            <td>
              <span class="account-stats">
                <span class="success-count">{{ task.successful_accounts || 0 }}</span> /
                <span class="total-count">{{ task.total_accounts || 0 }}</span>
              </span>
            </td>
            <td>
              <button @click="viewTaskDetails(task)" class="view-button">
                <i class="fas fa-eye"></i> 查看
              </button>
              <button
                  v-if="canCancelTask(task)"
                  @click="cancelTask(task.id)"
                  class="cancel-button">
                <i class="fas fa-times"></i> 取消
              </button>
              <button
                  v-if="canRestartTask(task)"
                  @click="restartTask(task.id)"
                  class="restart-button">
                <i class="fas fa-redo"></i> 重启
              </button>
            </td>
          </tr>
          </tbody>
        </table>

        <div class="pagination">
          <button
              :disabled="currentPage <= 1"
              @click="changePage(currentPage - 1)"
              class="pagination-button">
            上一页
          </button>

          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>

          <button
              :disabled="currentPage >= totalPages"
              @click="changePage(currentPage + 1)"
              class="pagination-button">
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 任务详情弹窗 -->
    <div v-if="selectedTask" class="task-details-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>任务详情</h3>
          <button class="close-btn" @click="selectedTask = null">&times;</button>
        </div>

        <div class="modal-body">
          <!-- 基本信息部分 -->
          <div class="detail-section">
            <h4>基本信息</h4>
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label">ID:</span>
                <span class="detail-value id-text">{{ selectedTask.id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">任务类型:</span>
                <span class="detail-value">{{ getTaskTypeText(selectedTask.task_type) }}</span>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label">邮箱类型:</span>
                <span class="detail-value">{{ selectedTask.account_type_name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">状态:</span>
                <span class="detail-value">
                  <span class="status-tag" :class="'status-' + selectedTask.status">
                    {{ getStatusText(selectedTask.status) }}
                  </span>
                </span>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label">创建时间:</span>
                <span class="detail-value">{{ formatDate(selectedTask.created_at) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">更新时间:</span>
                <span class="detail-value">{{ formatDate(selectedTask.updated_at) }}</span>
              </div>
            </div>

            <div class="detail-item full-width">
              <span class="detail-label">进度:</span>
              <div class="detail-value">
                <div class="progress-bar">
                  <div class="progress" :style="{ width: selectedTask.progress + '%' }"></div>
                  <span>{{ selectedTask.progress }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 执行详情 -->
          <div class="detail-section">
            <h4>执行详情</h4>
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label">总账户数:</span>
                <span class="detail-value">{{ selectedTask.total_accounts || 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">成功数:</span>
                <span class="detail-value success-text">{{ selectedTask.successful_accounts || 0 }}</span>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label">失败数:</span>
                <span class="detail-value error-text">{{ selectedTask.failed_accounts || 0 }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">成功率:</span>
                <span class="detail-value">{{ calculateSuccessRate(selectedTask) }}%</span>
              </div>
            </div>

            <!-- Job ID 信息 -->
            <div class="detail-item full-width" v-if="selectedTask.job_id">
              <span class="detail-label">Job ID:</span>
              <span class="detail-value id-text">{{ selectedTask.job_id }}</span>
            </div>
          </div>

          <!-- 错误信息部分 -->
          <div v-if="selectedTask.error_message" class="detail-section">
            <h4>错误信息</h4>
            <div class="detail-error">
              {{ selectedTask.error_message }}
            </div>
          </div>

          <!-- 结果数据部分 -->
          <div v-if="selectedTask.result_data && hasTaskResults(selectedTask)" class="detail-section">
            <h4>处理结果详情</h4>

            <!-- 结果表格 -->
            <table v-if="getProcessedAccounts(selectedTask).length > 0" class="results-table">
              <thead>
              <tr>
                <th>邮箱</th>
                <th>状态</th>
                <th>信息</th>
                <th>时间</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(account, index) in getProcessedAccounts(selectedTask)" :key="index">
                <td>{{ account.email || '未知' }}</td>
                <td>
                    <span class="status-tag" :class="account.success ? 'status-completed' : 'status-failed'">
                      {{ account.success ? '成功' : '失败' }}
                    </span>
                </td>
                <td>{{ account.message || '-' }}</td>
                <td>{{ formatDate(account.timestamp || selectedTask.updated_at) }}</td>
              </tr>
              </tbody>
            </table>

            <!-- 如果没有明细数据，但有结果数据，显示完整JSON -->
            <div v-else class="detail-json">
              <pre>{{ formatDetails(selectedTask.result_data) }}</pre>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="detail-actions">
            <button
                v-if="canCancelTask(selectedTask)"
                @click="cancelTask(selectedTask.id)"
                class="cancel-button">
              <i class="fas fa-times"></i> 取消任务
            </button>
            <button
                v-if="canRestartTask(selectedTask)"
                @click="restartTask(selectedTask.id)"
                class="restart-button">
              <i class="fas fa-redo"></i> 重启任务
            </button>
            <button
                v-if="selectedTask.status === 'completed'"
                @click="downloadTaskResults(selectedTask)"
                class="download-button"
                :disabled="downloading[selectedTask.id]">
              <i class="fas fa-download"></i> {{ downloading[selectedTask.id] ? '下载中...' : '下载任务结果' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import {ref, computed, onMounted, onUnmounted, watch, reactive} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useStore} from 'vuex'
import {debounce} from 'lodash'
import api from '../../services/http'

export default {
  name: 'ImportTasksList',

  setup() {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()

    const tasks = ref([])
    const accountTypes = ref([])
    const loading = ref(true)
    const error = ref(null)
    const statusFilter = ref('')
    const typeFilter = ref('')
    const taskTypeFilter = ref('')  // 新增：任务类型过滤
    const searchQuery = ref('')
    const currentPage = ref(1)
    const totalPages = ref(1)
    const refreshingTasks = ref({})
    const perPage = ref(10) // 每页显示的任务数
    const selectedTask = ref(null)
    const downloading = reactive({})

    // 获取高亮的任务ID（从URL参数）
    const highlightedTaskId = computed(() => route.query.highlight || null)

    // 根据筛选条件过滤任务
    const filteredTasks = computed(() => {
      let result = [...tasks.value]

      if (searchQuery.value) {
        result = result.filter(task =>
            task.id.includes(searchQuery.value) ||
            (task.job_id && task.job_id.includes(searchQuery.value))
        )
      }

      if (statusFilter.value) {
        result = result.filter(task => task.status === statusFilter.value)
      }

      if (typeFilter.value) {
        result = result.filter(task => task.account_type === typeFilter.value)
      }

      // 添加任务类型过滤
      if (taskTypeFilter.value) {
        result = result.filter(task => task.task_type === taskTypeFilter.value)
      }

      return result
    })

    // 获取任务类型文本
    const getTaskTypeText = (type) => {
      const typeMap = {
        'import': '邮箱导入',
        'bind-auxiliary': '绑定辅助邮箱'
      }
      return typeMap[type] || type || '未知类型'
    }

    // 计算成功率
    const calculateSuccessRate = (task) => {
      if (!task.total_accounts || task.total_accounts === 0) return 0;
      return Math.round((task.successful_accounts / task.total_accounts) * 100);
    }

    // 从结果数据中获取已处理的账号列表
    const getProcessedAccounts = (task) => {
      if (!task.result_data) return [];
      if (task.result_data.processed_accounts && Array.isArray(task.result_data.processed_accounts)) {
        return task.result_data.processed_accounts;
      }
      if (task.result_data.details && task.result_data.details.processed_accounts) {
        return task.result_data.details.processed_accounts;
      }
      return [];
    }

    // 检查任务是否有结果数据
    const hasTaskResults = (task) => {
      if (!task.result_data) return false;
      return (
          Object.keys(task.result_data).length > 0 ||
          (task.result_data.processed_accounts && task.result_data.processed_accounts.length > 0) ||
          (task.result_data.details && task.result_data.details.processed_accounts &&
              task.result_data.details.processed_accounts.length > 0)
      );
    }

    // 判断任务是否可以取消
    const canCancelTask = (task) => {
      return ['pending', 'processing', 'started', 'queued'].includes(task.status)
    }

    // 判断任务是否可以重启
    const canRestartTask = (task) => {
      return ['failed', 'error'].includes(task.status)
    }

    // 加载账户类型
    const loadAccountTypes = async () => {
      try {
        const response = await api.get('/emails/account-types/')
        accountTypes.value = response.data.data || []
      } catch (err) {
        console.error('Error loading account types:', err)
      }
    }

    // 加载任务列表
    const loadTasks = async (page = 1) => {
      loading.value = true
      error.value = null

      try {
        // 构建请求参数
        const params = {
          page,
          page_size: perPage.value
        }

        // 添加筛选条件
        if (statusFilter.value) {
          params.status = statusFilter.value
        }

        if (typeFilter.value) {
          params.account_type = typeFilter.value
        }

        if (taskTypeFilter.value) {
          params.task_type = taskTypeFilter.value
        }

        if (searchQuery.value) {
          params.search = searchQuery.value
        }

        const response = await api.get('/emails/tasks/', {params})

        if (response.data.success) {
          // 直接使用 response.data.data 作为任务列表
          tasks.value = response.data.data || []
          currentPage.value = page

          // 根据返回的数据量判断是否还有下一页
          // 如果返回的数据少于请求的数量，说明没有更多数据了
          const hasMoreData = tasks.value.length === perPage.value
          totalPages.value = hasMoreData ? currentPage.value + 1 : currentPage.value

          // 如果当前页没有数据但不是第一页，尝试加载前一页
          if (tasks.value.length === 0 && currentPage.value > 1) {
            return loadTasks(currentPage.value - 1)
          }

          // 如果有高亮的任务ID，并且该任务不在当前页面，尝试在所有页面中查找
          if (highlightedTaskId.value && !tasks.value.some(t => t.id === highlightedTaskId.value)) {
            // 这里可以添加全局搜索逻辑，暂时忽略
          }

          // 启动对未完成任务的自动刷新
          setupAutoRefresh()
        } else {
          error.value = response.data.message || '获取任务列表失败'
        }
      } catch (err) {
        console.error('Error loading tasks:', err)
        error.value = err.response?.data?.message || '获取任务列表失败'
      } finally {
        loading.value = false
      }
    }

    // 刷新单个任务状态
    const refreshTask = async (task) => {
      if (refreshingTasks.value[task.id]) return

      refreshingTasks.value[task.id] = true

      try {
        const response = await api.get(`/emails/task-query/`, {
          params: {task_id: task.job_id}
        })

        if (response.data.success) {
          const taskData = response.data.data

          // 更新任务状态
          const taskIndex = tasks.value.findIndex(t => t.id === task.id)
          if (taskIndex !== -1) {
            tasks.value[taskIndex] = {
              ...tasks.value[taskIndex],
              status: taskData.status || tasks.value[taskIndex].status,
              progress: taskData.progress || tasks.value[taskIndex].progress,
              successful_accounts: taskData.successful_accounts || tasks.value[taskIndex].successful_accounts,
              failed_accounts: taskData.failed_accounts || tasks.value[taskIndex].failed_accounts,
              error_message: taskData.error || tasks.value[taskIndex].error_message,
              result_data: taskData.result_data || tasks.value[taskIndex].result_data
            }
          }

          // 如果当前正在查看此任务的详情，也更新详情信息
          if (selectedTask.value && selectedTask.value.id === task.id) {
            selectedTask.value = {
              ...selectedTask.value,
              status: taskData.status || selectedTask.value.status,
              progress: taskData.progress || selectedTask.value.progress,
              successful_accounts: taskData.successful_accounts || selectedTask.value.successful_accounts,
              failed_accounts: taskData.failed_accounts || selectedTask.value.failed_accounts,
              error_message: taskData.error || selectedTask.value.error_message,
              result_data: taskData.result_data || selectedTask.value.result_data
            }
          }
        }
      } catch (err) {
        console.error('Error refreshing task:', err)
      } finally {
        refreshingTasks.value[task.id] = false
      }
    }

    // 查看任务详情
    const viewTaskDetails = (task) => {
      selectedTask.value = {...task}

      // 如果任务正在处理中，立即刷新一次状态
      if (['pending', 'processing', 'started', 'queued'].includes(task.status)) {
        refreshTask(task)
      }
    }

    // 取消任务
    const cancelTask = async (taskId) => {
      try {
        const response = await store.dispatch('email/cancelTask', taskId);

        if (response.success) {
          // 刷新任务列表
          loadTasks(currentPage.value);

          // 如果当前正在查看此任务的详情，关闭详情弹窗
          if (selectedTask.value && selectedTask.value.id === taskId) {
            selectedTask.value = null;
          }

          // 可选：显示成功消息
          alert('任务已成功取消');
        } else {
          alert(response.message || '取消任务失败');
        }
      } catch (err) {
        console.error('取消任务失败:', err);
        alert(err.response?.data?.message || '取消任务失败');
      }
    };

    // 重启任务
    const restartTask = async (taskId) => {
      try {
        const response = await store.dispatch('email/restartTask', taskId);

        if (response.success) {
          // 刷新任务列表
          loadTasks(currentPage.value);

          // 如果当前正在查看此任务的详情，关闭详情弹窗
          if (selectedTask.value && selectedTask.value.id === taskId) {
            selectedTask.value = null;
          }

          // 可选：显示成功消息
          alert('任务已成功重启');
        } else {
          alert(response.message || '重启任务失败');
        }
      } catch (err) {
        console.error('重启任务失败:', err);
        alert(err.response?.data?.message || '重启任务失败');
      }
    };

    // 应用筛选条件
    const applyFilters = () => {
      // 重置到第一页
      router.push({
        query: {
          ...route.query,
          page: 1,
          status: statusFilter.value || undefined,
          type: typeFilter.value || undefined,
          task_type: taskTypeFilter.value || undefined,
          search: searchQuery.value || undefined
        }
      })
      loadTasks(1)
    }

    // 防抖处理搜索输入
    const handleSearchInput = debounce(() => {
      applyFilters()
    }, 500)

    // 切换页码
    const changePage = (page) => {
      if (page < 1 || page > totalPages.value || page === currentPage.value) return

      // 更新URL中的页码参数
      router.push({
        query: {
          ...route.query,
          page
        }
      })

      loadTasks(page)
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''

      const date = new Date(dateString)
      return date.toLocaleString()
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'pending': '等待处理',
        'queued': '排队中',
        'processing': '处理中',
        'completed': '已完成',
        'failed': '失败',
        'unknown': '未知',
        'started': '运行中',
        'error': '错误'
      }

      return statusMap[status] || status
    }

    // 截断ID，使其更短
    const truncateId = (id) => {
      if (!id) return '';
      if (id.length <= 8) return id;
      return id.substring(0, 8) + '...';
    }

    // 格式化详情
    const formatDetails = (details) => {
      if (!details) return "";

      if (typeof details === "string") {
        try {
          // 尝试解析JSON字符串
          const parsed = JSON.parse(details);
          return JSON.stringify(parsed, null, 2);
        } catch (e) {
          // 如果不是有效的JSON，直接返回原始字符串
          return details;
        }
      }

      // 如果是对象，格式化为JSON字符串
      return JSON.stringify(details, null, 2);
    }

    // 下载任务结果
    const downloadTaskResults = async (task) => {
      if (downloading[task.id]) return;

      downloading[task.id] = true;

      try {
        // 这里假设你有一个下载任务结果的API
        const response = await api.get(`/emails/task-download/`, {
          params: {task_id: task.id}
        });

        if (response.data.success) {
          // 假设API返回下载URL
          const downloadUrl = response.data.data;

          // 创建一个隐藏的 a 标签来触发下载
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `task-result-${task.id}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          throw new Error(response.data?.message || '获取下载链接失败');
        }
      } catch (err) {
        console.error('下载任务结果失败', err);
        alert('下载任务结果失败: ' + (err.response?.data?.message || err.message));
      } finally {
        downloading[task.id] = false;
      }
    }

    // 设置自动刷新 - 每3秒刷新一次处理中的任务
    let refreshInterval = null

    const setupAutoRefresh = () => {
      clearInterval(refreshInterval)

      refreshInterval = setInterval(() => {
        const unfinishedTasks = tasks.value.filter(
            task => task.status === 'pending' || task.status === 'processing' || task.status === 'started' || task.status === 'queued'
        )

        if (unfinishedTasks.length === 0) {
          // 如果没有未完成的任务，停止轮询
          clearInterval(refreshInterval)
          refreshInterval = null
          return
        }

        // 刷新每个未完成任务的状态
        unfinishedTasks.forEach(task => refreshTask(task))
      }, 3000) // 3秒
    }

    // 监听路由参数变化
    watch(() => route.query, (newQuery) => {
      if (newQuery.status && newQuery.status !== statusFilter.value) {
        statusFilter.value = newQuery.status
      }

      if (newQuery.type && newQuery.type !== typeFilter.value) {
        typeFilter.value = newQuery.type
      }

      if (newQuery.task_type && newQuery.task_type !== taskTypeFilter.value) {
        taskTypeFilter.value = newQuery.task_type
      }

      if (newQuery.search && newQuery.search !== searchQuery.value) {
        searchQuery.value = newQuery.search
      }

      if (newQuery.page) {
        const page = parseInt(newQuery.page)
        if (!isNaN(page) && page > 0 && page !== currentPage.value) {
          loadTasks(page)
        }
      }
    }, {deep: true})

    // 初始化
    onMounted(() => {
      // 从URL参数恢复筛选状态和页码
      if (route.query.status) {
        statusFilter.value = route.query.status
      }

      if (route.query.type) {
        typeFilter.value = route.query.type
      }

      if (route.query.task_type) {
        taskTypeFilter.value = route.query.task_type
      }

      if (route.query.search) {
        searchQuery.value = route.query.search
      }

      if (route.query.page) {
        const page = parseInt(route.query.page)
        if (!isNaN(page) && page > 0) {
          currentPage.value = page
        }
      }

      loadAccountTypes()
      loadTasks(currentPage.value)
    })

    // 组件卸载时清除定时器
    onUnmounted(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    })

    return {
      tasks,
      accountTypes,
      loading,
      error,
      statusFilter,
      typeFilter,
      taskTypeFilter,
      searchQuery,
      currentPage,
      totalPages,
      refreshingTasks,
      filteredTasks,
      highlightedTaskId,
      selectedTask,
      downloading,
      refreshTask,
      changePage,
      formatDate,
      getStatusText,
      getTaskTypeText,
      truncateId,
      applyFilters,
      handleSearchInput,
      viewTaskDetails,
      downloadTaskResults,
      canCancelTask,
      canRestartTask,
      cancelTask,
      restartTask,
      formatDetails,
      calculateSuccessRate,
      getProcessedAccounts,
      hasTaskResults
    }
  }
}

</script>

<style scoped>
.import-tasks {
  max-width: 1000px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  color: #4CAF50;
}

.header button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.header button:hover {
  background-color: #45a049;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  align-items: center;
  flex-wrap: wrap;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filters input,
.filters select {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
  min-width: 120px;
  flex: 1;
}

.filters input:focus,
.filters select:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.filters button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.filters button:hover {
  background-color: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(76, 175, 80, 0.2);
}

.filters button:active {
  transform: translateY(0);
  box-shadow: none;
}

.task-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 25px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.task-table th,
.task-table td {
  padding: 12px 15px;
  border: none;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.task-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #444;
  white-space: nowrap;
}

.task-table tr:last-child td {
  border-bottom: none;
}

.task-table tr:nth-child(even) {
  background-color: #fafafa;
}

.task-table tr:hover {
  background-color: #f0f8f4;
}

.task-table tr.highlight {
  background-color: rgba(76, 175, 80, 0.1);
  border-left: 3px solid #4CAF50;
}

.task-table td:last-child {
  text-align: center;
  white-space: nowrap;
}

.view-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 5px;
}

.view-button:hover {
  background-color: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(76, 175, 80, 0.2);
}

.view-button:active {
  transform: translateY(0);
  box-shadow: none;
}

.cancel-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 5px;
}

.cancel-button:hover {
  background-color: #e53935;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(244, 67, 54, 0.2);
}

.restart-button {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.restart-button:hover {
  background-color: #1e88e5;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(33, 150, 243, 0.2);
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #f1f1f1;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress {
  height: 100%;
  background: linear-gradient(to right, #4CAF50, #8BC34A);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-bar span {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;
  line-height: 20px;
  color: #fff;
  font-weight: 500;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}

.empty-state, .no-results {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 15px;
  align-items: center;
  margin-top: 30px;
}

.pagination-button {
  background-color: #fff;
  color: #4CAF50;
  border: 1px solid #4CAF50;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
}

.pagination-button:hover:not(:disabled) {
  background-color: #4CAF50;
  color: white;
}

.pagination-button:disabled {
  background-color: #f5f5f5;
  color: #999;
  border-color: #ddd;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* 任务详情弹窗 */
.task-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  width: 80%;
  max-width: 700px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
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
  color: #4CAF50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #555;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 25px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
}

.detail-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #4CAF50;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
  font-size: 16px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.detail-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.detail-row .detail-item {
  flex: 1;
}

.detail-label {
  width: 90px;
  font-weight: 600;
  color: #666;
}

.detail-value {
  flex: 1;
}

.full-width {
  width: 100%;
  margin-bottom: 15px;
}

.detail-error {
  color: #f44336;
  background-color: rgba(244, 67, 54, 0.1);
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
}

.detail-logs {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 15px;
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 10px;
}

.detail-json {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.detail-json pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 12px;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.detail-actions button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 5px;
}

.detail-actions .cancel-button,
.detail-actions .restart-button,
.detail-actions .download-button {
  min-width: 130px;
  justify-content: center;
  padding: 10px 16px;
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

.success-text {
  color: #4CAF50;
  font-weight: 500;
}

.error-text {
  color: #f44336;
  font-weight: 500;
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

.status-processing, .status-started, .status-queued {
  background-color: #fff7e6;
  color: #fa8c16;
}

.status-completed {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-failed, .status-error {
  background-color: #fff2f0;
  color: #f5222d;
}

.id-text {
  font-family: monospace;
  background-color: #f8f9fa;
  padding: 2px 5px;
  border-radius: 3px;
}

.account-stats {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
}

.success-count {
  color: #4CAF50;
}

.total-count {
  color: #666;
}

.results-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 15px;
  border-radius: 4px;
  overflow: hidden;
}

.results-table th,
.results-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.results-table th {
  background-color: #f5f5f5;
  font-weight: 600;
  color: #444;
}

.results-table tr:last-child td {
  border-bottom: none;
}

.results-table tr:hover {
  background-color: #f9f9f9;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .task-table {
    font-size: 14px;
  }

  .pagination-button {
    min-width: auto;
    padding: 6px 12px;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-label {
    width: 100%;
    margin-bottom: 5px;
  }

  .detail-actions {
    flex-direction: column;
  }

  .detail-actions button {
    width: 100%;
  }

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
}
</style>