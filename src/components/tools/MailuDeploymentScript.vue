<template>
  <div class="mailu-deployment-container">
    <h2>{{ $t('mailu.title') }}</h2>
    <form @submit.prevent="generateScript">
      <div class="form-group">
        <label>{{ $t('mailu.server_ip') }}</label>
        <input
          type="text"
          v-model="form.server_ip"
          :placeholder="$t('mailu.server_ip_placeholder')"
          required
        />
      </div>

      <div class="form-group">
        <label>{{ $t('mailu.domain') }}</label>
        <input
          type="text"
          v-model="form.domain"
          :placeholder="$t('mailu.domain_placeholder')"
          required
        />
      </div>

      <div class="form-group">
        <label>{{ $t('mailu.domain_provider') }}</label>
        <select
          v-model="form.domain_provider"
          required
        >
          <option value="">{{ $t('mailu.select_provider') }}</option>
          <option value="godaddy">GoDaddy</option>
          <option value="namesilo">NameSilo</option>
        </select>
      </div>

      <div class="form-group">
        <label>{{ $t('mailu.domain_token') }}</label>
        <input
          type="text"
          v-model="form.domain_token"
          :placeholder="$t('mailu.domain_token_placeholder')"
          required
        />
      </div>

      <div class="form-actions">
        <button
          type="submit"
          :disabled="isLoading"
          class="btn btn-primary"
        >
          {{ isLoading ? $t('mailu.generating') : $t('mailu.generate_script') }}
        </button>
      </div>
    </form>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import deploymentService from '@/services/tools'

export default {
  name: 'MailuDeploymentScript',
  setup() {
    const form = ref({
      server_ip: '',
      domain: '',
      domain_provider: '',
      domain_token: ''
    })

    const isLoading = ref(false)
    const error = ref(null)

    const generateScript = async () => {
      // Reset previous states
      isLoading.value = true
      error.value = null

      try {
        // Call the deployment service to generate script
        const response = await deploymentService.generateMailuScript(form.value)

        // Create a download link for the script
        const blob = new Blob([response.data], { type: 'text/x-shellscript' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `mailu_deploy_${form.value.domain}.sh`
        link.click()
      } catch (err) {
        // Handle any errors during script generation
        error.value = err.response?.data?.error || 'Failed to generate script'
      } finally {
        isLoading.value = false
      }
    }

    return {
      form,
      isLoading,
      error,
      generateScript
    }
  }
}
</script>

<style scoped>
.mailu-deployment-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
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
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  margin-top: 20px;
}

.btn-primary {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-top: 15px;
  text-align: center;
}
</style>