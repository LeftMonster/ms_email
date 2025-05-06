<template>
  <div class="deployment-tools-page">
    <div class="page-header">
      <h1>部署工具</h1>
      <p>快速生成各类服务器部署脚本</p>
    </div>

    <div class="tools-grid">
      <div
        v-for="tool in availableTools"
        :key="tool.id"
        class="tool-card"
        @click="selectTool(tool)"
      >
        <div class="tool-icon">
          <i :class="getToolIcon(tool.slug)"></i>
        </div>
        <div class="tool-details">
          <h3>{{ tool.name }}</h3>
          <p>{{ tool.description }}</p>
        </div>
      </div>
    </div>

    <div v-if="selectedTool" class="tool-configuration-modal">
      <div class="modal-content">
        <h2>配置 {{ selectedTool.name }}</h2>

        <!-- Generic configuration form -->
        <form @submit.prevent="generateDeploymentScript">
          <div class="form-group">
            <label>服务器IP</label>
            <input
              type="text"
              v-model="configuration.server_ip"
              placeholder="输入目标服务器IP"
              required
            />
          </div>

          <div class="form-group">
            <label>域名</label>
            <input
              type="text"
              v-model="configuration.domain"
              placeholder="输入服务域名"
            />
          </div>

          <!-- Mailu-specific fields -->
          <template v-if="selectedTool.slug === 'mailu'">
            <div class="form-group">
              <label>域名服务商</label>
              <select v-model="configuration.domain_provider">
                <option value="">选择域名服务商</option>
                <option value="godaddy">GoDaddy</option>
                <option value="namesilo">NameSilo</option>
              </select>
            </div>

            <div class="form-group">
              <label>域名令牌</label>
              <input
                type="text"
                v-model="configuration.domain_token"
                placeholder="输入域名服务商API令牌"
              />
            </div>
          </template>

          <!-- Additional tool-specific configuration fields can be added dynamically -->
          <div v-for="(field, index) in getAdditionalFields()" :key="index" class="form-group">
            <label>{{ field.label }}</label>
            <input
              :type="field.type"
              v-model="configuration[field.name]"
              :placeholder="field.placeholder"
              :required="field.required"
            />
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isLoading"
            >
              {{ isLoading ? '生成中...' : '生成部署脚本' }}
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeModal"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Deployment Configuration History -->
    <div class="deployment-history">
      <h2>部署配置历史</h2>
      <table v-if="deploymentConfigs.length">
        <thead>
          <tr>
            <th>工具</th>
            <th>服务器IP</th>
            <th>域名</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="config in deploymentConfigs" :key="config.id">
            <td>{{ config.tool_name }}</td>
            <td>{{ config.server_ip || '-' }}</td>
            <td>{{ config.domain || '-' }}</td>
            <td>{{ formatDate(config.created_at) }}</td>
            <td>
              <button
                class="btn btn-sm btn-info"
                @click="reloadConfiguration(config)"
              >
                重新部署
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>暂无部署配置</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import deploymentService from '@/services/tools'

export default {
  name: 'DeploymentTools',
  setup() {
    const availableTools = ref([])
    const selectedTool = ref(null)
    const configuration = ref({})
    const isLoading = ref(false)
    const deploymentConfigs = ref([])

    // Fetch available tools and deployment configurations
    onMounted(async () => {
      try {
        const toolsResponse = await deploymentService.getAvailableTools()
        availableTools.value = toolsResponse.data

        const configsResponse = await deploymentService.getDeploymentConfigs()
        deploymentConfigs.value = configsResponse.data
      } catch (error) {
        console.error('Failed to load deployment tools:', error)
      }
    })

    // Tool selection methods
    const selectTool = (tool) => {
      selectedTool.value = tool
      // Reset configuration when selecting a new tool
      configuration.value = { tool_slug: tool.slug }
    }

    const closeModal = () => {
      selectedTool.value = null
      configuration.value = {}
    }

    // Script generation method
    const generateDeploymentScript = async () => {
      if (!selectedTool.value) return

      isLoading.value = true
      try {
        // Prepare configuration data
        const scriptData = {
          tool_slug: selectedTool.value.slug,
          configuration: configuration.value
        }

        // Generate and download script
        const response = await deploymentService.generateDeploymentScript(scriptData)

        // Create a download link
        const blob = new Blob([response.data], { type: 'text/x-shellscript' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${selectedTool.value.slug}_deploy_${Date.now()}.sh`
        link.click()

        // Save configuration
        await deploymentService.saveDeploymentConfig({
          tool_slug: selectedTool.value.slug,
          configuration: configuration.value,
          server_ip: configuration.value.server_ip,
          domain: configuration.value.domain
        })

        // Refresh deployment configs
        const configsResponse = await deploymentService.getDeploymentConfigs()
        deploymentConfigs.value = configsResponse.data

        // Close modal
        closeModal()
      } catch (error) {
        console.error('Failed to generate deployment script:', error)
        // TODO: Add user-friendly error handling
      } finally {
        isLoading.value = false
      }
    }

    // Utility methods
    const getToolIcon = (slug) => {
      const icons = {
        'mailu': 'fas fa-envelope-open-text',
        'web_server': 'fas fa-server',
        'database': 'fas fa-database',
        'monitoring': 'fas fa-chart-line',
        'default': 'fas fa-tools'
      }
      return icons[slug] || icons['default']
    }

    const getAdditionalFields = () => {
      // Dynamically add tool-specific fields
      if (!selectedTool.value) return []

      const toolFields = {
        'mailu': [
          // Additional Mailu-specific fields can be added here
        ],
        'web_server': [
          {
            name: 'server_type',
            label: '服务器类型',
            type: 'select',
            options: ['nginx', 'apache', 'caddy'],
            required: true
          }
        ]
        // Add more tool-specific fields as needed
      }

      return toolFields[selectedTool.value.slug] || []
    }

    // Reload a previous configuration
    const reloadConfiguration = (config) => {
      selectedTool.value = {
        slug: config.tool.slug,
        name: config.tool_name
      }
      configuration.value = {
        ...config.configuration,
        tool_slug: config.tool.slug
      }
    }

    // Date formatting utility
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString()
    }

    return {
      availableTools,
      selectedTool,
      configuration,
      isLoading,
      deploymentConfigs,
      selectTool,
      closeModal,
      generateDeploymentScript,
      getToolIcon,
      getAdditionalFields,
      reloadConfiguration,
      formatDate
    }
  }
}
</script>

<style scoped>
.deployment-tools-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.tool-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tool-card:hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transform: translateY(-5px);
}

.tool-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #007bff;
}

.tool-configuration-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 500px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.deployment-history {
  margin-top: 40px;
}

.deployment-history table {
  width: 100%;
  border-collapse: collapse;
}

.deployment-history th,
.deployment-history td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.8rem;
}
</style>