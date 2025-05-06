import api from './http'

const emailService = {
    // 获取邮箱账户类型
    getEmailAccountTypes() {
        return api.get('/emails/account-types/')
    },

    // 获取邮箱账户列表
    getEmailAccounts(params = {}) {
        return api.get('/emails/accounts/', {params})
    },

    // 获取特定邮箱账户详情
    getEmailAccount(accountId) {
        return api.get(`/emails/email-accounts/${accountId}/`)
    },

    // 创建邮箱账户
    createEmailAccount(accountData) {
        return api.post('/emails/accounts/', accountData)
    },

    // 更新邮箱账户
    updateEmailAccount(accountId, accountData) {
        return api.put(`/emails/email-accounts/${accountId}/`, accountData)
    },

    // 删除邮箱账户
    deleteEmailAccount(accountId) {
        return api.delete(`/emails/email-accounts/${accountId}/`)
    },

    // 导入邮箱账户
    importEmailAccounts(formData) {
        return api.post('/emails/import/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    // 查询导入任务状态
    queryTaskStatus(taskId) {
        return api.get('/emails/task-query/', {params: {task_id: taskId}})
    },

    // 获取导入任务列表
    getImportTasks(params = {}) {
        return api.get('/emails/tasks/', {params})
    },
    // 取消任务
    cancelTask(taskId) {
        return api.post('/emails/task-cancel/', {task_id: taskId})
    },

    // 重启任务
    restartTask(taskId) {
        return api.post('/emails/task-restart/', {task_id: taskId})
    },
    // 测试API连接
    testApiConnection(connectionData) {
        return api.post('/emails/test-api-connection/', connectionData)
    },

    // 绑定辅助邮箱
    bindAuxiliaryEmail(formData) {
        return api.post('/emails/bind-auxiliary/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }
}

export default emailService