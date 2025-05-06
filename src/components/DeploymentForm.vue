<template>
    <div class="deployment-form">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>新服务器部署</span>
        </div>
        <el-form :model="form" :rules="rules" ref="form" label-width="120px" size="small">
          <!-- 服务器配置 -->
          <el-form-item label="目标服务器" prop="server_id">
            <el-select v-model="form.server_id" placeholder="请选择服务器" style="width: 100%">
              <el-option
                v-for="server in serverOptions"
                :key="server.id"
                :label="server.name + ' (' + server.host + ')'"
                :value="server.id">
              </el-option>
            </el-select>
          </el-form-item>
          
          <!-- 数据库配置选择 -->
          <el-form-item label="数据库配置">
            <el-radio-group v-model="form.use_existing_config" @change="onConfigTypeChange">
              <el-radio :label="true">使用已有配置</el-radio>
              <el-radio :label="false">使用新配置</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <!-- 已有配置选择 -->
          <template v-if="form.use_existing_config">
            <el-form-item label="已有配置" prop="db_config_id">
              <el-select v-model="form.db_config_id" placeholder="请选择数据库配置" style="width: 100%">
                <el-option
                  v-for="config in dbConfigOptions"
                  :key="config.id"
                  :label="config.name + ' (' + config.host + '/' + config.db_name + ')'"
                  :value="config.id">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
          
          <!-- 新配置表单 -->
          <template v-else>
            <el-form-item label="数据库主机" prop="db_host">
              <el-input v-model="form.db_host" placeholder="请输入数据库主机地址"></el-input>
            </el-form-item>
            
            <el-form-item label="数据库端口" prop="db_port">
              <el-input-number v-model="form.db_port" :min="1" :max="65535" style="width: 100%"></el-input-number>
            </el-form-item>
            
            <el-form-item label="数据库用户名" prop="db_username">
              <el-input v-model="form.db_username" placeholder="请输入数据库用户名"></el-input>
            </el-form-item>
            
            <el-form-item label="数据库密码" prop="db_password">
              <el-input v-model="form.db_password" type="password" placeholder="请输入数据库密码"></el-input>
            </el-form-item>
            
            <el-form-item label="数据库名称" prop="db_name">
              <el-input v-model="form.db_name" placeholder="请输入数据库名称"></el-input>
            </el-form-item>
            
            <el-form-item>
              <el-checkbox v-model="form.save_db_config">保存为新配置</el-checkbox>
            </el-form-item>
            
            <el-form-item label="配置名称" prop="db_config_name" v-if="form.save_db_config">
              <el-input v-model="form.db_config_name" placeholder="请输入配置名称"></el-input>
            </el-form-item>
          </template>
          
          <!-- 按钮 -->
          <el-form-item>
            <el-button type="primary" @click="submitForm" :loading="loading">开始部署</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      
      <!-- 部署进度对话框 -->
      <el-dialog
        title="部署进度"
        :visible.sync="dialogVisible"
        width="70%"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="taskCompleted">
        <div v-if="currentTask">
          <el-steps :active="stepActive" finish-status="success">
            <el-step title="任务创建"></el-step>
            <el-step title="环境准备"></el-step>
            <el-step title="文件下载"></el-step>
            <el-step title="配置设置"></el-step>
            <el-step title="服务启动"></el-step>
          </el-steps>
          
          <el-divider></el-divider>
          
          <div class="task-info">
            <p><strong>任务ID:</strong> {{ currentTask.task_id }}</p>
            <p><strong>状态:</strong> 
              <el-tag :type="getStatusType(currentTask.status)">
                {{ currentTask.status_display }}
              </el-tag>
            </p>
            <p><strong>开始时间:</strong> {{ formatTime(currentTask.started_at) }}</p>
            <p v-if="currentTask.finished_at"><strong>完成时间:</strong> {{ formatTime(currentTask.finished_at) }}</p>
          </div>
          
          <el-divider></el-divider>
          
          <div class="log-container">
            <h3>部署日志:</h3>
            <el-button size="mini" @click="refreshLog" :loading="loadingLog">刷新日志</el-button>
            <pre class="log-content" v-if="logContent">{{ logContent }}</pre>
            <div v-else class="log-placeholder">
              <el-skeleton :rows="10" animated />
            </div>
          </div>
        </div>
        
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false" v-if="taskCompleted">关闭</el-button>
          <el-button type="danger" @click="cancelTask" :loading="cancelingTask" 
                   v-if="!taskCompleted && currentTask && ['pending', 'running'].includes(currentTask.status)">
            取消部署
          </el-button>
        </span>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import { mapGetters } from 'vuex'
  import moment from 'moment'
  
  export default {
    name: 'DeploymentForm',
    data() {
      return {
        form: {
          server_id: null,
          use_existing_config: true,
          db_config_id: null,
          db_host: '',
          db_port: 3306,
          db_username: '',
          db_password: '',
          db_name: '',
          save_db_config: false,
          db_config_name: ''
        },
        rules: {
          server_id: [
            { required: true, message: '请选择服务器', trigger: 'change' }
          ],
          db_config_id: [
            { required: true, message: '请选择数据库配置', trigger: 'change' }
          ],
          db_host: [
            { required: true, message: '请输入数据库主机地址', trigger: 'blur' }
          ],
          db_username: [
            { required: true, message: '请输入数据库用户名', trigger: 'blur' }
          ],
          db_password: [
            { required: true, message: '请输入数据库密码', trigger: 'blur' }
          ],
          db_name: [
            { required: true, message: '请输入数据库名称', trigger: 'blur' }
          ],
          db_config_name: [
            { required: true, message: '请输入配置名称', trigger: 'blur' }
          ]
        },
        loading: false,
        dialogVisible: false,
        currentTask: null,
        logContent: '',
        loadingLog: false,
        cancelingTask: false,
        logTimer: null,
        taskTimer: null
      }
    },
    computed: {
      ...mapGetters({
        serverOptions: 'server/getServerList',
        dbConfigOptions: 'dbconfig/getDbConfigList'
      }),
      stepActive() {
        // 根据日志内容或状态推断当前步骤
        if (!this.currentTask) return 0
        
        if (this.currentTask.status === 'failed') {
          return Math.max(1, this.getStepFromLog())
        }
        
        if (this.currentTask.status === 'success') {
          return 5
        }
        
        return this.getStepFromLog()
      },
      taskCompleted() {
        return this.currentTask && ['success', 'failed', 'canceled'].includes(this.currentTask.status)
      }
    },
    created() {
      // 加载服务器和数据库配置列表
      this.$store.dispatch('server/getServers')
      this.$store.dispatch('dbconfig/getDbConfigs')
    },
    methods: {
      onConfigTypeChange() {
        this.$refs.form.clearValidate()
      },
      submitForm() {
        this.$refs.form.validate(valid => {
          if (!valid) return false
          
          this.loading = true
          
          // 构建请求数据
          const requestData = {
            server_id: this.form.server_id,
            use_existing_config: this.form.use_existing_config
          }
          
          if (this.form.use_existing_config) {
            requestData.db_config_id = this.form.db_config_id
          } else {
            requestData.db_host = this.form.db_host
            requestData.db_port = this.form.db_port
            requestData.db_username = this.form.db_username
            requestData.db_password = this.form.db_password
            requestData.db_name = this.form.db_name
            
            if (this.form.save_db_config) {
              requestData.save_db_config = true
              requestData.db_config_name = this.form.db_config_name
            }
          }
          
          // 发送请求
          this.$http.post('/api/deployment/tasks/deploy/', requestData)
            .then(response => {
              this.loading = false
              
              // 显示部署进度对话框
              this.dialogVisible = true
              
              // 获取任务详情
              this.getTaskByTaskId(response.data.task_id)
            })
            .catch(error => {
              this.loading = false
              this.$message.error('创建部署任务失败: ' + (error.response?.data?.message || error.message || '未知错误'))
            })
        })
      },
      resetForm() {
        this.$refs.form.resetFields()
        this.form.use_existing_config = true
        this.form.save_db_config = false
      },
      getTaskByTaskId(taskId) {
        this.$http.get('/api/deployment/tasks/', { params: { task_id: taskId } })
          .then(response => {
            if (response.data.results && response.data.results.length > 0) {
              this.currentTask = response.data.results[0]
              
              // 获取日志
              this.refreshLog()
              
              // 如果任务未完成，启动定时器定期刷新
              this.startTimers()
            } else {
              this.$message.error('未找到任务: ' + taskId)
            }
          })
          .catch(error => {
            this.$message.error('获取任务失败: ' + (error.response?.data?.message || error.message || '未知错误'))
          })
      },
      refreshLog() {
        if (!this.currentTask || !this.currentTask.id) return
        
        this.loadingLog = true
        
        this.$http.get(`/api/deployment/tasks/${this.currentTask.id}/log/`)
          .then(response => {
            this.loadingLog = false
            this.logContent = response.data.log || '暂无日志'
          })
          .catch(error => {
            this.loadingLog = false
            if (error.response && error.response.status === 404) {
              this.logContent = '日志文件尚未生成，请稍后刷新...'
            } else {
              this.logContent = '获取日志失败: ' + (error.response?.data?.error || error.message || '未知错误')
            }
          })
      },
      refreshTask() {
        if (!this.currentTask || !this.currentTask.id) return
        
        this.$http.get(`/api/deployment/tasks/${this.currentTask.id}/`)
          .then(response => {
            this.currentTask = response.data
            
            // 如果任务已完成，停止定时器
            if (this.taskCompleted) {
              this.stopTimers()
            }
          })
          .catch(error => {
            console.error('刷新任务失败:', error)
          })
      },
      startTimers() {
        // 清除现有定时器
        this.stopTimers()
        
        // 启动新定时器
        this.logTimer = setInterval(this.refreshLog, 5000)  // 每5秒刷新一次日志
        this.taskTimer = setInterval(this.refreshTask, 3000)  // 每3秒刷新一次任务状态
      },
      stopTimers() {
        if (this.logTimer) {
          clearInterval(this.logTimer)
          this.logTimer = null
        }
        
        if (this.taskTimer) {
          clearInterval(this.taskTimer)
          this.taskTimer = null
        }
      },
      cancelTask() {
        if (!this.currentTask || !this.currentTask.id) return
        
        this.cancelingTask = true
        
        this.$http.post(`/api/deployment/tasks/${this.currentTask.id}/cancel/`)
          .then(response => {
            this.cancelingTask = false
            this.$message.success('任务已取消')
            this.refreshTask()
          })
          .catch(error => {
            this.cancelingTask = false
            this.$message.error('取消任务失败: ' + (error.response?.data?.error || error.message || '未知错误'))
          })
      },
      getStatusType(status) {
        const typeMap = {
          'pending': 'info',
          'running': 'warning',
          'success': 'success',
          'failed': 'danger',
          'canceled': 'info'
        }
        return typeMap[status] || 'info'
      },
      formatTime(timeString) {
        if (!timeString) return ''
        return moment(timeString).format('YYYY-MM-DD HH:mm:ss')
      },
      getStepFromLog() {
        if (!this.logContent) return 1
        
        if (this.logContent.includes('部署完成')) {
          return 5
        } else if (this.logContent.includes('启动服务')) {
          return 4
        } else if (this.logContent.includes('配置文件已创建')) {
          return 3
        } else if (this.logContent.includes('成功下载')) {
          return 2
        } else {
          return 1
        }
      }
    },
    beforeDestroy() {
      // 清除定时器
      this.stopTimers()
    }
  }
  </script>
  
  <style scoped>
  .deployment-form {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .log-container {
    margin-top: 20px;
  }
  
  .log-content {
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 10px;
    height: 300px;
    overflow-y: auto;
    font-family: monospace;
    white-space: pre-wrap;
    font-size: 12px;
  }
  
  .log-placeholder {
    height: 300px;
    overflow-y: hidden;
    padding: 10px;
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
  }
  
  .task-info {
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
  }
  </style>