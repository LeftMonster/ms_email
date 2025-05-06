<template>
  <div class="task-creation">
    <div class="card">
      <h1>任务创建</h1>
      <p>您可以创建不同类型的任务来管理您的邮箱账户。</p>

      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="successMessage" class="success">{{ successMessage }}</div>

      <!-- 任务类型选择 -->
      <div class="form-group">
        <label class="form-label">选择任务类型</label>
        <div class="task-type-selector">
          <div
              class="task-type-card"
              :class="{ 'selected': selectedTaskType === 'import' }"
              @click="selectTaskType('import')"
          >
            <i class="fas fa-file-import fa-2x"></i>
            <div class="task-type-name">邮箱导入</div>
            <div class="task-type-desc">批量导入邮箱账户</div>
          </div>

          <div
              class="task-type-card"
              :class="{ 'selected': selectedTaskType === 'bind-auxiliary' }"
              @click="selectTaskType('bind-auxiliary')"
          >
            <i class="fas fa-envelope-open-text fa-2x"></i>
            <div class="task-type-name">绑定辅助邮箱</div>
            <div class="task-type-desc">批量为账户绑定辅助邮箱</div>
          </div>
        </div>
      </div>

      <form @submit.prevent="submitTask">
        <!-- 邮箱类型选择部分 -->
        <div class="form-group">
          <label class="form-label">选择邮箱类型</label>

          <div class="email-type-container">
            <div
                v-for="type in accountTypes"
                :key="type.id"
                class="email-type-card"
                :class="{ 'selected': selectedType === type.id }"
                @click="selectedType = type.id"
            >
              <div class="email-type-logo">
                <img v-if="type.logo_path" :src='type.logo_path' :alt="type.name"/>
                <div v-else class="logo-placeholder">
                  <i class="fas fa-envelope"></i>
                </div>
              </div>
              <div class="email-type-name">{{ type.name }}</div>
            </div>
          </div>

          <small>不同邮箱类型的凭据格式可能不同，请确保您的文件符合要求。</small>
        </div>

        <!-- API 配置 (仅绑定辅助邮箱任务显示) -->
        <!--        // TaskCreation.vue 中的 API 配置部分-->
        <div v-if="selectedTaskType === 'bind-auxiliary'" class="form-group api-config-section">
          <h3>
            API 配置信息
            <span v-if="apiTestSuccess && wasConfigLoaded" class="config-loaded-hint">
      <i class="fas fa-info-circle"></i> 已加载保存的配置
    </span>
          </h3>
          <p>请提供您自己的API信息，用于绑定辅助邮箱操作</p>

          <!-- 添加清除按钮 -->
          <div v-if="apiTestSuccess" class="clear-config">
            <button type="button" class="clear-config-btn" @click="clearSavedConfig">
              <i class="fas fa-trash-alt"></i> 清除保存的配置
            </button>
          </div>

          <div class="form-group">
            <label class="form-label">连接方式</label>
            <div class="radio-group">
              <label>
                <input type="radio" v-model="apiConfig.connectionType" value="http"> HTTP API
              </label>
              <label>
                <input type="radio" v-model="apiConfig.connectionType" value="imap"> IMAP 服务器
              </label>
            </div>
          </div>

          <!-- HTTP API 配置 -->
          <div v-if="apiConfig.connectionType === 'http'">
            <div class="form-group">
              <label class="form-label">API 地址</label>
              <input
                  type="text"
                  v-model="apiConfig.url"
                  placeholder="例如: https://example.com/api/bind-auxiliary"
                  required
              />
            </div>

            <div class="form-group">
              <label class="form-label">请求方式</label>
              <div class="radio-group">
                <label>
                  <input type="radio" v-model="apiConfig.method" value="GET"> GET
                </label>
                <label>
                  <input type="radio" v-model="apiConfig.method" value="POST"> POST
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">辅助邮箱配置</label>
              <div class="param-config">
                <div class="param-row">
                  <div class="param-name-field">
                    <label>参数名</label>
                    <input
                        type="text"
                        v-model="apiConfig.emailParamName"
                        placeholder="邮箱参数名 (例如: email)"
                        required
                    />
                  </div>
                  <div class="param-value-field">
                    <label>测试值</label>
                    <input
                        type="text"
                        v-model="apiConfig.emailValue"
                        placeholder="测试用邮箱地址"
                        required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">辅助邮箱密码配置</label>
              <div class="param-config">
                <div class="param-row">
                  <div class="param-name-field">
                    <label>参数名</label>
                    <input
                        type="text"
                        v-model="apiConfig.passwordParamName"
                        placeholder="密码参数名 (例如: password)"
                        required
                    />
                  </div>
                  <div class="param-value-field">
                    <label>测试值</label>
                    <input
                        type="text"
                        v-model="apiConfig.passwordValue"
                        placeholder="测试用密码/令牌"
                        required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">API 头部信息 (可选)</label>
              <textarea
                  v-model="apiConfig.headers"
                  placeholder="请按照 key:value 格式，每行一个"
                  rows="3"
              ></textarea>
              <small>例如: Authorization: Bearer token123</small>
            </div>
          </div>

          <!-- IMAP 服务器配置 -->
          <div v-if="apiConfig.connectionType === 'imap'">
            <div class="form-group">
              <label class="form-label">IMAP 服务器地址</label>
              <input
                  type="text"
                  v-model="apiConfig.imapHost"
                  placeholder="例如: imap.example.com"
                  required
              />
            </div>

            <div class="form-group">
              <label class="form-label">IMAP 端口</label>
              <input
                  type="number"
                  v-model="apiConfig.imapPort"
                  placeholder="例如: 993"
                  required
              />
            </div>

            <div class="form-group">
              <label class="form-label">使用 SSL</label>
              <div class="radio-group">
                <label>
                  <input type="radio" v-model="apiConfig.imapSsl" :value="true"> 是
                </label>
                <label>
                  <input type="radio" v-model="apiConfig.imapSsl" :value="false"> 否
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">测试用户信息</label>
              <div class="param-config">
                <div class="param-row">
                  <input
                      type="text"
                      v-model="apiConfig.imapEmailValue"
                      placeholder="测试用辅助邮箱地址"
                      required
                  />
                  <span class="param-desc">用户名/邮箱</span>
                </div>

                <div class="param-row">
                  <input
                      type="text"
                      v-model="apiConfig.imapPasswordValue"
                      placeholder="测试用密码/令牌"
                      required
                  />
                  <span class="param-desc">密码/令牌</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions api-test">
            <button
                type="button"
                @click="testApiConnection"
                :disabled="!isApiConfigValid || apiTesting"
                class="test-button"
            >
              <i class="fas" :class="apiTesting ? 'fa-spinner fa-spin' : 'fa-vial'"></i>
              {{ apiTesting ? '测试中...' : '测试连接' }}
            </button>

            <div v-if="apiTestResult" :class="['api-test-result', apiTestSuccess ? 'success' : 'error']">
              <i class="fas" :class="apiTestSuccess ? 'fa-check-circle' : 'fa-times-circle'"></i>
              {{ apiTestResult }}
            </div>
          </div>
        </div>

        <!-- 文件上传区域 -->
        <div class="form-group">
          <label class="form-label">
            {{ selectedTaskType === 'import' ? '上传凭据文件' : '上传账户信息文件' }}
          </label>

          <div class="file-upload-container">
            <div
                class="file-upload-area"
                :class="{'has-file': selectedFileName, 'drag-over': isDragging}"
                @click="triggerFileInput"
                @dragover.prevent="onDragOver"
                @dragleave.prevent="onDragLeave"
                @drop.prevent="onFileDrop"
            >
              <div v-if="!selectedFileName" class="upload-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>点击上传文件或拖拽文件到此处</p>
                <p class="upload-hint">支持 .txt, .csv 格式</p>
              </div>
              <div v-else class="selected-file">
                <i class="fas fa-file-alt"></i>
                <p>{{ selectedFileName }}</p>
                <button class="remove-file-btn" @click.stop="removeFile">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <input
                type="file"
                ref="fileInput"
                accept=".txt,.csv"
                @change="handleFileChange"
                class="hidden-file-input"
            />
          </div>

          <small v-if="selectedTaskType === 'import'">文件应为文本格式，每行包含一个邮箱账户的信息（如：email----password 或
            email,token）</small>
          <small
              v-else>文件应为文本格式，每行包含一个邮箱账户和要绑定的辅助邮箱（如：email,password,auxiliary_email）</small>
        </div>

        <!-- 格式信息 -->
        <div class="format-info" v-if="selectedTaskType === 'import'">
          <h3>支持的导入格式：</h3>
          <ul>
            <li><code>email@example.com----password</code></li>
            <li><code>email@example.com,password</code></li>
            <li><code>email@example.com;password</code></li>
            <li><code>email@example.com:password</code></li>
            <li><code>email@example.com|password</code></li>
            <li><code>email@example.com password</code> (空格分隔)</li>
          </ul>
          <p>其中 password 也可以是 token，取决于邮箱类型的验证方式。</p>
        </div>

        <div class="format-info" v-else-if="selectedTaskType === 'bind-auxiliary'">
          <h3>支持的绑定辅助邮箱格式：</h3>
          <ul>
            <li><code>email@example.com----password----auxiliary@example.com----auxiliary_token</code></li>
            <li><code>email@example.com,password,auxiliary@example.com,auxiliary_token</code></li>
            <li><code>email@example.com;password;auxiliary@example.com;auxiliary_token</code></li>
            <li><code>email@example.com:password:auxiliary@example.com:auxiliary_token</code></li>
            <li><code>email@example.com|password|auxiliary@example.com|auxiliary_token</code></li>
            <li><code>email@example.com password auxiliary@example.com auxiliary_token</code> (空格分隔)</li>
          </ul>
          <p>每行数据需要包含四个字段：原邮箱账户、原邮箱密码、辅助邮箱地址和辅助邮箱的密码或授权码。</p>
        </div>

        <div class="form-actions">
          <button
              type="submit"
              :disabled="!isFormValid || loading"
              class="submit-button"
          >
            <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
            {{ loading ? '提交中...' : '提交任务' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 任务结果模态框 -->
    <div v-if="showResultModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h2>任务已提交</h2>
        </div>

        <div class="modal-content">
          <p>您的{{ taskTypeText }}任务已成功提交，系统正在处理中。</p>

          <div class="import-stats">
            <div class="stat-item">
              <span class="stat-label">有效记录数：</span>
              <span class="stat-value">{{ importResult.valid_count || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">无效记录数：</span>
              <span class="stat-value">{{ importResult.invalid_count || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">任务ID：</span>
              <span class="stat-value">{{ importResult.task_id || 'N/A' }}</span>
            </div>
          </div>

          <div class="task-actions">
            <router-link :to="`/import-tasks?highlight=${importResult.task_id}`">
              <button>查看任务进度</button>
            </router-link>
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
import {ref, computed, onMounted, watch} from 'vue'
import {useStore} from 'vuex'
import {useRouter} from 'vue-router'
import api from '../../services/http'

export default {
  name: 'TaskCreation',

  setup() {
    const store = useStore()
    const router = useRouter()

    const loading = ref(false)
    const error = ref(null)
    const successMessage = ref(null)
    const selectedFile = ref(null)
    const selectedFileName = ref('')
    const selectedType = ref('')
    const fileInput = ref(null)
    const showResultModal = ref(false)
    const importResult = ref({})

    // 添加一个标志表示配置是否从 localStorage 加载的
    const wasConfigLoaded = ref(false);

    // 新增：任务类型选择
    const selectedTaskType = ref('import')

    // 初始化 API 配置
    const apiConfig = ref({
      connectionType: 'http',
      // HTTP 配置
      url: '',
      method: 'POST',
      emailParamName: 'email',
      emailValue: '',
      passwordParamName: 'password',
      passwordValue: '',
      headers: '',
      // IMAP 配置
      imapHost: '',
      imapPort: 993,
      imapSsl: true,
      imapEmailValue: '',
      imapPasswordValue: ''
    });

    // API 测试相关
    const apiTesting = ref(false)
    const apiTestResult = ref('')
    const apiTestSuccess = ref(false)

    // 账户类型数据
    const accountTypes = ref([])

    // 任务类型文本
    const taskTypeText = computed(() => {
      return selectedTaskType.value === 'import' ? '邮箱导入' : '绑定辅助邮箱';
    })

// 表单验证
    const isApiConfigValid = computed(() => {
      if (selectedTaskType.value !== 'bind-auxiliary') return true;

      if (apiConfig.value.connectionType === 'http') {
        return (
            apiConfig.value.url &&
            apiConfig.value.emailParamName &&
            apiConfig.value.emailValue &&
            apiConfig.value.passwordParamName &&
            apiConfig.value.passwordValue
        );
      } else if (apiConfig.value.connectionType === 'imap') {
        return (
            apiConfig.value.imapHost &&
            apiConfig.value.imapPort &&
            apiConfig.value.imapEmailValue &&
            apiConfig.value.imapPasswordValue
        );
      }

      return false;
    });


    const isFormValid = computed(() => {
      const baseValid = selectedType.value && selectedFile.value;

      if (selectedTaskType.value === 'bind-auxiliary') {
        return baseValid && isApiConfigValid.value && apiTestSuccess.value;
      }

      return baseValid;
    })

    // 选择任务类型
    const selectTaskType = (type) => {
      selectedTaskType.value = type;
      error.value = null;
      successMessage.value = null;
      apiTestResult.value = '';
      apiTestSuccess.value = false;
    }

    // 加载邮箱账户类型
    const loadAccountTypes = async () => {
      try {
        loading.value = true
        const response = await api.get('/emails/account-types/')
        if (response.data.success) {
          accountTypes.value = response.data.data || []
        } else {
          error.value = response.data.message || '加载邮箱类型失败'
        }
      } catch (err) {
        console.error('Error loading account types:', err)
        error.value = '加载邮箱类型失败，请刷新页面重试'
      } finally {
        loading.value = false
      }
    }

    // 清除保存的配置
    const clearSavedConfig = () => {
      try {
        localStorage.removeItem('api_config');
        localStorage.removeItem('api_test_success');

        // 重置配置
        apiConfig.value = {
          connectionType: 'http',
          // HTTP 配置
          url: '',
          method: 'POST',
          emailParamName: 'email',
          emailValue: '',
          passwordParamName: 'password',
          passwordValue: '',
          headers: '',
          // IMAP 配置
          imapHost: '',
          imapPort: 993,
          imapSsl: true,
          imapEmailValue: '',
          imapPasswordValue: ''
        };

        apiTestSuccess.value = false;
        apiTestResult.value = '';
        wasConfigLoaded.value = false;

        successMessage.value = '保存的配置已清除';
        setTimeout(() => {
          successMessage.value = null;
        }, 3000);
      } catch (err) {
        console.error('Error clearing saved config:', err);
        error.value = '清除保存的配置失败';
      }
    };

    // 从 localStorage 加载 API 配置
// 修改 loadSavedApiConfig 方法以设置 wasConfigLoaded 标志
    const loadSavedApiConfig = () => {
      try {
        const savedConfig = localStorage.getItem('api_config');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          apiConfig.value = {...apiConfig.value, ...parsedConfig};

          // 如果有保存成功的测试结果，也恢复它
          if (localStorage.getItem('api_test_success') === 'true') {
            apiTestSuccess.value = true;
            apiTestResult.value = '已加载保存的配置信息，连接测试有效。';
            wasConfigLoaded.value = true; // 设置标志
          }
        }
      } catch (err) {
        console.error('Error loading saved API config:', err);
      }
    };
// 保存 API 配置到 localStorage
    const saveApiConfig = () => {
      try {
        localStorage.setItem('api_config', JSON.stringify(apiConfig.value));
        localStorage.setItem('api_test_success', apiTestSuccess.value.toString());
      } catch (err) {
        console.error('Error saving API config:', err);
      }
    };

    // 测试 API 连接
    // 修改 testApiConnection 方法，在测试成功后保存配置
    const testApiConnection = async () => {
      if (!isApiConfigValid.value) {
        error.value = '请完善连接配置信息';
        return;
      }

      apiTesting.value = true;
      apiTestResult.value = '';
      apiTestSuccess.value = false;

      try {
        // 构建测试请求数据
        const testData = {
          connectionType: apiConfig.value.connectionType
        };

        if (apiConfig.value.connectionType === 'http') {
          // HTTP API 测试
          testData.url = apiConfig.value.url;
          testData.method = apiConfig.value.method;
          testData.params = {};

          // 使用用户指定的参数名和测试值
          testData.params[apiConfig.value.emailParamName] = apiConfig.value.emailValue;
          testData.params[apiConfig.value.passwordParamName] = apiConfig.value.passwordValue;

          // 添加自定义头
          const headers = {};
          if (apiConfig.value.headers) {
            apiConfig.value.headers.split('\n').forEach(line => {
              const [key, value] = line.split(':').map(item => item.trim());
              if (key && value) {
                headers[key] = value;
              }
            });
            testData.headers = headers;
          }
        } else {
          // IMAP 测试
          testData.imapHost = apiConfig.value.imapHost;
          testData.imapPort = apiConfig.value.imapPort;
          testData.imapSsl = apiConfig.value.imapSsl;
          // 测试账号信息是用户提供的测试值
          testData.email = apiConfig.value.imapEmailValue;
          testData.password = apiConfig.value.imapPasswordValue;
        }

        // 发送测试请求
        const response = await api.post('/emails/test-api-connection/', testData);

        if (response.data.success) {
          apiTestSuccess.value = true;
          apiTestResult.value = '连接测试成功！配置有效。';

          // 测试成功后保存配置到 localStorage
          saveApiConfig();
        } else {
          apiTestResult.value = `连接测试失败: ${response.data.message}`;
        }
      } catch (err) {
        console.error('API test error:', err);
        apiTestResult.value = `连接测试失败: ${err.response?.data?.message || err.message}`;
      } finally {
        apiTesting.value = false;
      }
    };
    // 触发文件选择
    const triggerFileInput = () => {
      fileInput.value.click()
    }

    // 移除已选择的文件
    const removeFile = () => {
      selectedFile.value = null
      selectedFileName.value = ''
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    // 处理文件选择
    const handleFileChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB限制
          error.value = '文件过大，请上传小于10MB的文件'
          fileInput.value.value = ''
          selectedFile.value = null
          selectedFileName.value = ''
          return
        }

        selectedFile.value = file
        selectedFileName.value = file.name
        error.value = null
      } else {
        selectedFile.value = null
        selectedFileName.value = ''
      }
    }

    // 提交任务
    const submitTask = async () => {
      if (!selectedType.value) {
        error.value = '请选择邮箱类型'
        return
      }

      if (!selectedFile.value) {
        error.value = '请选择要上传的文件'
        return
      }

      if (selectedTaskType.value === 'bind-auxiliary' && !apiTestSuccess.value) {
        error.value = '请先测试并确认API连接有效'
        return
      }

      error.value = null
      loading.value = true

      try {
        const formData = new FormData()
        formData.append('file', selectedFile.value)
        formData.append('account_type', selectedType.value)
        formData.append('task_type', selectedTaskType.value)

        // 如果是绑定辅助邮箱任务，添加API配置
        if (selectedTaskType.value === 'bind-auxiliary') {
          formData.append('api_config', JSON.stringify(apiConfig.value))
        }

        // 根据任务类型选择不同的API端点
        const endpoint = selectedTaskType.value === 'import'
            ? '/emails/import/'
            : '/emails/bind-auxiliary/';

        // 调用API提交任务
        const response = await api.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        if (response.data.success) {
          successMessage.value = `${taskTypeText.value}任务已提交，正在处理中`
          importResult.value = response.data.data
          showResultModal.value = true

          // 重置表单
          selectedFile.value = null
          selectedFileName.value = ''
          if (fileInput.value) {
            fileInput.value.value = ''
          }
        } else {
          error.value = response.data.message || '提交任务失败'
        }
      } catch (err) {
        console.error('Error submitting task:', err)
        error.value = err.response?.data?.message || '提交任务失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }

    // 关闭结果模态框
    const closeResultModal = () => {
      showResultModal.value = false
    }

    // 文件拖拽相关状态和方法
    const isDragging = ref(false);

    // 当文件拖到上传区域上方时
    const onDragOver = () => {
      isDragging.value = true;
    };

    // 当文件离开上传区域时
    const onDragLeave = () => {
      isDragging.value = false;
    };

    // 当文件被拖放到上传区域时
    const onFileDrop = (event) => {
      isDragging.value = false;
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];

        // 检查文件类型
        const validExtensions = ['.txt', '.csv'];
        const fileName = file.name.toLowerCase();
        const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));

        if (!isValidFile) {
          error.value = '请上传.txt或.csv格式的文件';
          return;
        }

        // 检查文件大小
        if (file.size > 10 * 1024 * 1024) { // 10MB限制
          error.value = '文件过大，请上传小于10MB的文件';
          return;
        }

        selectedFile.value = file;
        selectedFileName.value = file.name;
        error.value = null;
      }
    };

    onMounted(() => {
      loadAccountTypes();
      loadSavedApiConfig();
    })

    return {
      loading,
      error,
      successMessage,
      selectedFile,
      selectedFileName,
      selectedType,
      accountTypes,
      fileInput,
      showResultModal,
      importResult,
      handleFileChange,
      triggerFileInput,
      removeFile,
      submitTask,
      closeResultModal,
      isDragging,
      onDragOver,
      onDragLeave,
      onFileDrop,
      // 新增
      selectedTaskType,
      apiConfig,
      apiTesting,
      apiTestResult,
      apiTestSuccess,
      selectTaskType,
      taskTypeText,
      isApiConfigValid,
      isFormValid,
      testApiConnection,
      wasConfigLoaded,
      clearSavedConfig
    }
  }
}
</script>

<style scoped>
.task-creation {
  max-width: 800px;
  margin: 0 auto;
}

/* 任务类型选择样式 */
.task-type-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.task-type-card {
  flex: 1;
  min-width: 200px;
  border: 2px solid #eaeaea;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.task-type-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.task-type-card.selected {
  border-color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.05);
}

.task-type-card i {
  margin-bottom: 15px;
  color: #4CAF50;
}

.task-type-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.task-type-desc {
  font-size: 14px;
  color: #666;
  text-align: center;
}

/* API 配置样式 */
.api-config-section {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 25px;
  border-left: 4px solid #3498db;
}

.api-config-section h3 {
  margin-top: 0;
  color: #3498db;
  margin-bottom: 10px;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-group input {
  margin-right: 8px;
  width: auto;
}

.param-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.param-row {
  display: flex;
  align-items: center;
}

.param-row input {
  flex: 1;
}

.param-desc {
  width: 120px;
  padding-left: 10px;
  color: #666;
  font-size: 14px;
}

.api-test {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.test-button {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.test-button:hover:not(:disabled) {
  background-color: #2980b9;
}

.test-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.api-test-result {
  margin-top: 15px;
  padding: 10px 15px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.api-test-result.success {
  background-color: #d4edda;
  color: #155724;
}

.api-test-result.error {
  background-color: #f8d7da;
  color: #721c24;
}

/* 邮箱类型选择样式 */
.email-type-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
  margin-top: 10px;
}

.email-type-card {
  width: 120px;
  height: 120px;
  border-radius: 10px;
  border: 2px solid #eaeaea;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.email-type-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-color: #d0d0d0;
}

.email-type-card.selected {
  border-color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.05);
}

.email-type-card.selected::after {
  content: '\f00c';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  position: absolute;
  top: 5px;
  right: 5px;
  color: #4CAF50;
  font-size: 14px;
}

.email-type-logo {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.email-type-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.email-type-name {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  color: #333;
}

/* 文件上传样式 */
.file-upload-container {
  margin: 10px 0;
}

.hidden-file-input {
  display: none;
}

.file-upload-area {
  border: 2px dashed #d0d0d0;
  border-radius: 10px;
  padding: 30px 20px;
  text-align: center;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-upload-area:hover {
  border-color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.05);
}

.file-upload-area.has-file {
  border-color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.05);
}

.file-upload-area.drag-over {
  border-color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.1);
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.upload-placeholder {
  color: #666;
}

.upload-placeholder i {
  font-size: 48px;
  color: #999;
  margin-bottom: 15px;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.selected-file {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.selected-file i {
  font-size: 36px;
  color: #4CAF50;
  margin-bottom: 10px;
}

.selected-file p {
  margin: 5px 0;
  color: #333;
  word-break: break-all;
}

.remove-file-btn {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 5px;
  margin-top: 8px;
}

.remove-file-btn:hover {
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 50%;
}

/* 提交按钮样式 */
.submit-button {
  background-color: #4CAF50;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.submit-button:hover {
  background-color: #45a049;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.submit-button i {
  margin-right: 8px;
}

.format-info {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #3498db;
}

.format-info h3 {
  margin-top: 0;
  color: #3498db;
}

.format-info ul {
  padding-left: 20px;
}

.format-info code {
  background-color: #eee;
  padding: 2px 5px;
  border-radius: 3px;
  font-family: monospace;
}

small {
  color: #666;
  display: block;
  margin-top: 5px;
}

.import-stats {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
}

.stat-item {
  margin-bottom: 10px;
  display: flex;
}

.stat-label {
  font-weight: bold;
  width: 120px;
}

.task-actions {
  margin-top: 20px;
  text-align: center;
}

/** 邮箱类型卡片样式 */
.logo-placeholder {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 50%;
}

.logo-placeholder i {
  font-size: 24px;
  color: #999;
}

/* 添加响应式样式 */
@media (max-width: 768px) {
  .task-type-selector {
    flex-direction: column;
  }

  .param-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .param-desc {
    padding-left: 0;
    padding-top: 5px;
  }

  .radio-group {
    flex-direction: column;
    gap: 10px;
  }
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
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 参数配置行样式 */
.param-config {
  margin-top: 10px;
}

.param-row {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.param-name-field, .param-value-field {
  flex: 1;
}

.param-name-field label, .param-value-field label {
  display: block;
  margin-bottom: 5px;
  font-size: 13px;
  color: #666;
}

.param-desc {
  display: block;
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

/* 媒体查询 */
@media (max-width: 768px) {
  .param-row {
    flex-direction: column;
    gap: 8px;
  }
}

.config-loaded-hint {
  font-size: 14px;
  font-weight: normal;
  color: #3498db;
  margin-left: 10px;
}

.clear-config {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}

.clear-config-btn {
  background-color: #f8f9fa;
  color: #dc3545;
  border: 1px solid #dc3545;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-config-btn:hover {
  background-color: #dc3545;
  color: white;
}

.clear-config-btn i {
  margin-right: 5px;
}

</style>