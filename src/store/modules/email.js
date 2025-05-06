import emailService from '@/services/email'

const state = {
    accountTypes: [],
    loadingAccountTypes: false,
    accountTypesError: null
}

const getters = {
    accountTypes: state => state.accountTypes,
    loadingAccountTypes: state => state.loadingAccountTypes,
    accountTypesError: state => state.accountTypesError
}

const actions = {
    // 获取邮箱账户类型
    async fetchAccountTypes({commit}) {
        commit('setLoadingAccountTypes', true)
        commit('clearAccountTypesError')

        try {
            const response = await emailService.getEmailAccountTypes()
            commit('setAccountTypes', response.data.data)
            return response.data.data
        } catch (error) {
            commit('setAccountTypesError', error.message || '获取邮箱类型失败')
            throw error
        } finally {
            commit('setLoadingAccountTypes', false)
        }
    },
    // 取消任务
    async cancelTask({commit}, taskId) {
        try {
            const response = await emailService.cancelTask(taskId)
            return response.data
        } catch (error) {
            console.error('取消任务失败:', error)
            throw error
        }
    },

    // 重启任务
    async restartTask({commit}, taskId) {
        try {
            const response = await emailService.restartTask(taskId)
            return response.data
        } catch (error) {
            console.error('重启任务失败:', error)
            throw error
        }
    }
}

const mutations = {
    setAccountTypes(state, accountTypes) {
        state.accountTypes = accountTypes
    },
    setLoadingAccountTypes(state, isLoading) {
        state.loadingAccountTypes = isLoading
    },
    clearAccountTypesError(state) {
        state.accountTypesError = null
    },
    setAccountTypesError(state, error) {
        state.accountTypesError = error
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}