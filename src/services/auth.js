import api from './http'

const authService = {
  login(credentials) {
    return api.post('/accounts/login/', credentials)
  },

  register(userData) {
    return api.post('/accounts/register/', userData)
  },

  logout() {
    return api.post('/accounts/logout/')
  },

  getUserInfo() {
    return api.get('/accounts/user/')
  },

  updateUserInfo(userData) {
    return api.put('/accounts/user/update/', userData)
  },

  changePassword(passwordData) {
    return api.post('/accounts/user/change-password/', passwordData)
  },

  requestVerificationCode(verificationType) {
    return api.post('/accounts/verification/request/', { verification_type: verificationType })
  },

  verifyCode(verificationData) {
    return api.post('/accounts/verification/verify/', verificationData)
  },

  resetPassword(resetData) {
    return api.post('/accounts/reset-password/', resetData)
  },

  forgotPassword(email) {
    return api.post('/accounts/forgot-password/', { email })
  },

  resetPasswordWithCode(resetData) {
    return api.post('/accounts/reset-password-with-code/', resetData)
  }
}

export default authService