import proxyService from '@/services/proxy'

const state = {
    proxyPools: [],
    currentProxyPool: null,
    proxies: [],
    usageLogs: [],
    loading: false,
    error: null,
    testResult: null,
    isTesting: false,
    // 个人代理状态
    personalProxies: [],
    currentPersonalProxy: null
}

const getters = {
    proxyPools: state => state.proxyPools,
    currentProxyPool: state => state.currentProxyPool,
    proxies: state => state.proxies,
    usageLogs: state => state.usageLogs,
    loading: state => state.loading,
    error: state => state.error,
    testResult: state => state.testResult,
    isTesting: state => state.isTesting,
    // 个人代理 getters
    personalProxies: state => state.personalProxies,
    currentPersonalProxy: state => state.currentPersonalProxy
}

const actions = {
    // 代理池相关操作
    async fetchProxyPools({commit}, params) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.getProxyPools(params)
            if (response.data.success) {
                commit('setProxyPools', response.data.data)
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '获取代理池列表失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    async fetchProxyPool({commit}, poolId) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.getProxyPool(poolId)
            if (response.data.success) {
                commit('setCurrentProxyPool', response.data.data)
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '获取代理池详情失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    async createProxyPool({commit}, poolData) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.createProxyPool(poolData)
            if (response.data.success) {
                // 添加新池到列表
                commit('addProxyPool', response.data.data)
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '创建代理池失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    async updateProxyPool({commit}, {poolId, poolData}) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.updateProxyPool(poolId, poolData)
            if (response.data.success) {
                commit('updateProxyPoolInList', response.data.data)
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '更新代理池失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    async deleteProxyPool({commit}, poolId) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.deleteProxyPool(poolId)
            if (response.data.success) {
                commit('removeProxyPool', poolId)
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '删除代理池失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    // 代理相关操作
    async fetchProxies({commit}, {poolId, params}) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.getProxies(poolId, params)
            if (response.data.success) {
                commit('setProxies', response.data.data)
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '获取代理列表失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    async addProxy({commit}, {poolId, proxyData}) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.createProxy(poolId, proxyData)
            if (response.data.success) {
                commit('addProxy', response.data.data)
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '添加代理失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    async updateProxy({commit}, {proxyId, proxyData}) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.updateProxy(proxyId, proxyData)
            if (response.data.success) {
                commit('updateProxyInList', response.data.data)
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '更新代理失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    async deleteProxy({commit}, proxyId) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.deleteProxy(proxyId)
            if (response.data.success) {
                commit('removeProxy', proxyId)
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '删除代理失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    // 测试相关操作
    async testProxy({commit}, proxyData) {
        commit('setIsTesting', true)
        commit('clearTestResult')
        commit('clearError')

        try {
            const response = await proxyService.testProxy(proxyData)
            commit('setTestResult', response.data.data)
            return response.data
        } catch (error) {
            commit('setError', error.message || '测试代理失败')
            throw error
        } finally {
            commit('setIsTesting', false)
        }
    },

    async testProxyPool({commit, dispatch}, {poolId, testData}) {
        commit('setIsTesting', true)
        commit('clearTestResult')
        commit('clearError')

        try {
            const response = await proxyService.testProxyPool(poolId, testData)
            if (response.data.success) {
                // 更新池统计信息
                await dispatch('fetchProxyPool', poolId)
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '测试代理池失败')
            throw error
        } finally {
            commit('setIsTesting', false)
        }
    },

    async toggleProxyPoolStatus({commit, dispatch}, poolId) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.toggleProxyPoolStatus(poolId)
            if (response.data.success) {
                // 更新池信息
                await dispatch('fetchProxyPool', poolId)
                // 更新池列表
                await dispatch('fetchProxyPools')
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '更改代理池状态失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    // 代理导入
    async importProxies({commit, dispatch}, formData) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.importProxies(formData)
            if (response.data.success) {
                // 刷新池列表
                await dispatch('fetchProxyPools')
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '导入代理失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    // 日志相关操作
    async fetchProxyUsageLogs({commit}, params) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.getProxyUsageLogs(params)
            if (response.data.success) {
                commit('setUsageLogs', response.data.data)
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '获取代理使用日志失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    // 个人代理相关操作
    async fetchPersonalProxies({commit}, params) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.getPersonalProxies(params)
            if (response.data.success) {
                commit('setPersonalProxies', response.data.data)
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '获取个人代理列表失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    async fetchPersonalProxy({commit}, proxyId) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.getPersonalProxy(proxyId)
            if (response.data.success) {
                commit('setCurrentPersonalProxy', response.data.data)
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '获取个人代理详情失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    async createPersonalProxy({commit}, proxyData) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.createPersonalProxy(proxyData)
            if (response.data.success) {
                commit('addPersonalProxy', response.data.data)
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '创建个人代理失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    async updatePersonalProxy({commit}, {proxyId, proxyData}) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.updatePersonalProxy(proxyId, proxyData)
            if (response.data.success) {
                commit('updatePersonalProxyInList', response.data.data)
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '更新个人代理失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    async deletePersonalProxy({commit}, proxyId) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.deletePersonalProxy(proxyId)
            if (response.data.success) {
                commit('removePersonalProxy', proxyId)
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '删除个人代理失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    async testPersonalProxy({commit, dispatch}, {proxyId, testData}) {
        commit('setIsTesting', true)
        commit('clearTestResult')
        commit('clearError')

        try {
            const response = await proxyService.testPersonalProxy(proxyId, testData)
            commit('setTestResult', response.data.data)

            if (response.data.success) {
                // 刷新代理详情以更新状态
                await dispatch('fetchPersonalProxy', proxyId)
                // 刷新代理列表
                await dispatch('fetchPersonalProxies')
            }

            return response.data
        } catch (error) {
            commit('setError', error.message || '测试个人代理失败')
            throw error
        } finally {
            commit('setIsTesting', false)
        }
    },

    async togglePersonalProxyStatus({commit, dispatch}, proxyId) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.togglePersonalProxyStatus(proxyId)
            if (response.data.success) {
                // 更新代理信息
                await dispatch('fetchPersonalProxy', proxyId)
                // 更新代理列表
                await dispatch('fetchPersonalProxies')
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '更改个人代理状态失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    async batchCreatePersonalProxies({commit, dispatch}, batchData) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.batchCreatePersonalProxies(batchData)
            if (response.data.success) {
                // 刷新代理列表
                await dispatch('fetchPersonalProxies')
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '批量创建个人代理失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    async importPersonalProxies({commit, dispatch}, formData) {
        commit('setLoading', true)
        commit('clearError')

        try {
            const response = await proxyService.importPersonalProxies(formData)
            if (response.data.success) {
                // 刷新代理列表
                await dispatch('fetchPersonalProxies')
            } else {
                commit('setError', response.data.message)
            }
            return response.data
        } catch (error) {
            commit('setError', error.message || '导入个人代理失败')
            throw error
        } finally {
            commit('setLoading', false)
        }
    },

    // 清除错误
    clearError({commit}) {
        commit('clearError')
    }
}

const mutations = {
    // 加载状态
    setLoading(state, isLoading) {
        state.loading = isLoading
    },

    // 错误处理
    setError(state, error) {
        state.error = error
    },

    clearError(state) {
        state.error = null
    },

    // 代理池
    setProxyPools(state, pools) {
        state.proxyPools = pools
    },

    setCurrentProxyPool(state, pool) {
        state.currentProxyPool = pool
    },

    addProxyPool(state, pool) {
        state.proxyPools.unshift(pool)
    },

    updateProxyPoolInList(state, updatedPool) {
        const index = state.proxyPools.findIndex(p => p.id === updatedPool.id)
        if (index !== -1) {
            state.proxyPools.splice(index, 1, updatedPool)
        }

        // 如果当前正在查看的池就是更新的池，也更新当前池
        if (state.currentProxyPool && state.currentProxyPool.id === updatedPool.id) {
            state.currentProxyPool = updatedPool
        }
    },

    removeProxyPool(state, poolId) {
        state.proxyPools = state.proxyPools.filter(p => p.id !== poolId)

        // 如果当前正在查看的池被删除，清空当前池
        if (state.currentProxyPool && state.currentProxyPool.id === poolId) {
            state.currentProxyPool = null
        }
    },

    // 代理
    setProxies(state, proxies) {
        state.proxies = proxies
    },

    addProxy(state, proxy) {
        state.proxies.unshift(proxy)

        // 更新当前池的代理总数
        if (state.currentProxyPool && state.currentProxyPool.id === proxy.pool) {
            state.currentProxyPool.total_proxies += 1
        }
    },

    updateProxyInList(state, updatedProxy) {
        const index = state.proxies.findIndex(p => p.id === updatedProxy.id)
        if (index !== -1) {
            state.proxies.splice(index, 1, updatedProxy)
        }
    },

    removeProxy(state, proxyId) {
        const proxy = state.proxies.find(p => p.id === proxyId)
        state.proxies = state.proxies.filter(p => p.id !== proxyId)

        // 更新当前池的代理总数
        if (proxy && state.currentProxyPool && state.currentProxyPool.id === proxy.pool) {
            state.currentProxyPool.total_proxies -= 1
            if (state.currentProxyPool.total_proxies < 0) {
                state.currentProxyPool.total_proxies = 0
            }
        }
    },

    // 测试相关
    setTestResult(state, result) {
        state.testResult = result
    },

    clearTestResult(state) {
        state.testResult = null
    },

    setIsTesting(state, isTesting) {
        state.isTesting = isTesting
    },

    // 日志
    setUsageLogs(state, logs) {
        state.usageLogs = logs
    },

    // 个人代理相关 - 确保这部分存在
    setPersonalProxies(state, proxies) {
        state.personalProxies = proxies
    },

    setCurrentPersonalProxy(state, proxy) {
        state.currentPersonalProxy = proxy
    },

    addPersonalProxy(state, proxy) {
        state.personalProxies.unshift(proxy)
    },

    updatePersonalProxyInList(state, updatedProxy) {
        const index = state.personalProxies.findIndex(p => p.id === updatedProxy.id)
        if (index !== -1) {
            state.personalProxies.splice(index, 1, updatedProxy)
        }

        // 如果当前正在查看的代理就是更新的代理，也更新当前代理
        if (state.currentPersonalProxy && state.currentPersonalProxy.id === updatedProxy.id) {
            state.currentPersonalProxy = updatedProxy
        }
    },

    removePersonalProxy(state, proxyId) {
        state.personalProxies = state.personalProxies.filter(p => p.id !== proxyId)

        // 如果当前正在查看的代理被删除，清空当前代理
        if (state.currentPersonalProxy && state.currentPersonalProxy.id === proxyId) {
            state.currentPersonalProxy = null
        }
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}