import http from './http'

const deploymentService = {
  /**
   * Fetch available deployment tools
   * @returns {Promise} - Promise resolving to list of tools
   */
  getAvailableTools() {
    return http.get('/tools/tools/')
  },

  /**
   * Generate deployment script
   * @param {Object} data - Deployment configuration data
   * @returns {Promise} - Promise resolving to the generated script
   */
  generateDeploymentScript(data) {
    return http.post('/tools/generate-script/', data, {
      responseType: 'blob' // Important for downloading the script
    })
  },

  /**
   * Save deployment configuration
   * @param {Object} data - Deployment configuration data
   * @returns {Promise} - Promise resolving to the saved configuration
   */
  saveDeploymentConfig(data) {
    return http.post('/tools/configs/', data)
  },

  /**
   * Fetch user's deployment configurations
   * @returns {Promise} - Promise resolving to list of configurations
   */
  getDeploymentConfigs() {
    return http.get('/tools/configs/')
  }
}

export default deploymentService