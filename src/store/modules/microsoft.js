import microsoftService from '../../services/microsoft'

const state = {
    accounts: [],
    totalAccounts: 0,
    account: null,
    folders: [],
    emails: [],
    totalEmails: 0,
    currentEmail: null,
    loading: false,
    error: null
}

const getters = {
    accounts: state => state.accounts,
    totalAccounts: state => state.totalAccounts,
    account: state => state.account,
    folders: state => state.folders,
    emails: state => state.emails,
    totalEmails: state => state.totalEmails,
    currentEmail: state => state.currentEmail,
    loading: state => state.loading,
    error: state => state.error
}

const actions = {
    // 微软邮箱账户相关
    async fetchAccounts({ commit }, params = {}) {
        commit('SET_LOADING', true)
        try {
            const response = await microsoftService.getAccounts(params)

            // 处理返回的数据
            const accounts = response.data.data || []
            commit('SET_ACCOUNTS', accounts)

            // 从分页元数据中获取总数量
            if (response.data.pagination) {
                commit('SET_TOTAL_ACCOUNTS', response.data.pagination.total)
            } else {
                // 如果没有分页元数据，则使用数组长度
                commit('SET_TOTAL_ACCOUNTS', accounts.length)
            }

            return response.data.data
        } catch (error) {
            commit('SET_ERROR', '获取微软邮箱账户列表失败')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async fetchAccount({ commit }, accountId) {
        commit('SET_LOADING', true)
        try {
            const response = await microsoftService.getAccount(accountId)
            commit('SET_ACCOUNT', response.data.data)
            return response.data.data
        } catch (error) {
            commit('SET_ERROR', '获取微软邮箱账户详情失败')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 邮箱文件夹相关
    async fetchFolders({ commit }, accountId) {
        commit('SET_LOADING', true)
        try {
            const response = await microsoftService.getFolders(accountId)
            commit('SET_FOLDERS', response.data.data)
            return response.data.data
        } catch (error) {
            commit('SET_ERROR', '获取文件夹列表失败')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    // 邮件相关
    async fetchEmails({ commit }, { accountId, params = {} }) {
        commit('SET_LOADING', true)
        try {
            const response = await microsoftService.getEmails(accountId, params)
            commit('SET_EMAILS', response.data.data.results || [])
            commit('SET_TOTAL_EMAILS', response.data.data.count || 0)
            return response.data.data
        } catch (error) {
            commit('SET_ERROR', '获取邮件列表失败')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async fetchEmailDetail({ commit }, { accountId, emailId }) {
        commit('SET_LOADING', true)
        try {
            const response = await microsoftService.getEmailDetail(accountId, emailId)
            commit('SET_CURRENT_EMAIL', response.data.data)
            return response.data.data
        } catch (error) {
            commit('SET_ERROR', '获取邮件详情失败')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    async markEmailAsRead({ commit }, { accountId, emailId, isRead }) {
        commit('SET_LOADING', true)
        try {
            await microsoftService.markEmailAsRead(accountId, emailId, isRead)
            commit('UPDATE_EMAIL', { id: emailId, is_read: isRead })
        } catch (error) {
            commit('SET_ERROR', '更新邮件状态失败')
            throw error
        } finally {
            commit('SET_LOADING', false)
        }
    },

    clearError({ commit }) {
        commit('CLEAR_ERROR')
    }

}

const mutations = {
    SET_LOADING(state, loading) {
        state.loading = loading
    },

    SET_ERROR(state, error) {
        state.error = error
    },

    SET_ACCOUNTS(state, accounts) {
        state.accounts = accounts
    },

    SET_TOTAL_ACCOUNTS(state, count) {
        state.totalAccounts = count
    },

    SET_ACCOUNT(state, account) {
        state.account = account
    },

    SET_FOLDERS(state, folders) {
        state.folders = folders
    },

    SET_EMAILS(state, emails) {
        state.emails = emails
    },

    SET_TOTAL_EMAILS(state, count) {
        state.totalEmails = count
    },

    SET_CURRENT_EMAIL(state, email) {
        state.currentEmail = email
    },

    UPDATE_EMAIL(state, updatedEmail) {
        state.emails = state.emails.map(email =>
            email.id === updatedEmail.id ? {...email, ...updatedEmail } : email
        )

        if (state.currentEmail && state.currentEmail.id === updatedEmail.id) {
            state.currentEmail = {...state.currentEmail, ...updatedEmail }
        }
    },

    CLEAR_ERROR(state) {
        state.error = null
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}