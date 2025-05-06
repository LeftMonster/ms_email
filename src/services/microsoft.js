import api from './http'

const microsoftService = {
  // 微软邮箱账户相关
  getAccounts(params = {}) {
  return api.get('/emails/microsoft-accounts/', { params })
},

  getAccount(accountId) {
  return api.get(`/emails/microsoft-accounts/${accountId}/`)
},

  // 邮箱文件夹相关
  getFolders(accountId) {
    return api.get(`/emails/microsoft-accounts/${accountId}/folders/`)
  },

  // 邮件相关
  getEmails(accountId, params = {}) {
    return api.get(`/emails/microsoft-accounts/${accountId}/emails/`, { params })
  },

  getEmailDetail(accountId, emailId) {
    return api.get(`/emails/microsoft-accounts/${accountId}/emails/${emailId}/`)
  },

  markEmailAsRead(accountId, emailId, isRead) {
    return api.patch(`/emails/microsoft-accounts/${accountId}/emails/${emailId}/`, {
      is_read: isRead
    })
  },

  getAttachments(accountId, emailId) {
    return api.get(`/emails/microsoft-accounts/${accountId}/emails/${emailId}/attachments/`)
  },

  downloadAttachment(accountId, emailId, attachmentId) {
    return api.get(`/emails/microsoft-accounts/${accountId}/emails/${emailId}/attachments/${attachmentId}/download/`, {
      responseType: 'blob'
    })
  }
}

export default microsoftService