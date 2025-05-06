import api from './http'

const proxyService = {
    // 代理池相关API
    getProxyPools(params = {}) {
        return api.get('/proxies/pools/', {params})
    },

    getProxyPool(poolId) {
        return api.get(`/proxies/pools/${poolId}/`)
    },

    createProxyPool(poolData) {
        return api.post('/proxies/pools/', poolData)
    },

    updateProxyPool(poolId, poolData) {
        return api.put(`/proxies/pools/${poolId}/`, poolData)
    },

    deleteProxyPool(poolId) {
        return api.delete(`/proxies/pools/${poolId}/`)
    },

    // 代理相关API
    getProxies(poolId, params = {}) {
        return api.get(`/proxies/pools/${poolId}/proxies/`, {params})
    },

    createProxy(poolId, proxyData) {
        return api.post(`/proxies/pools/${poolId}/proxies/`, proxyData)
    },

    updateProxy(proxyId, proxyData) {
        return api.put(`/proxies/proxies/${proxyId}/`, proxyData)
    },

    deleteProxy(proxyId) {
        return api.delete(`/proxies/proxies/${proxyId}/`)
    },

    // 代理池测试和状态切换
    testProxy(proxyData) {
        return api.post('/proxies/test-proxy/', proxyData)
    },

    testProxyPool(poolId, testData = {}) {
        return api.post(`/proxies/pools/${poolId}/test/`, testData)
    },

    toggleProxyPoolStatus(poolId) {
        return api.post(`/proxies/pools/${poolId}/toggle/`)
    },

    // 代理导入
    importProxies(formData) {
        return api.post('/proxies/import/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    // 代理使用日志
    getProxyUsageLogs(params = {}) {
        return api.get('/proxies/usage-logs/', {params})
    },

    // 个人代理相关API - 新增
    getPersonalProxies(params = {}) {
        return api.get('/proxies/personal/', {params})
    },

    getPersonalProxy(proxyId) {
        return api.get(`/proxies/personal/${proxyId}/`)
    },

    createPersonalProxy(proxyData) {
        return api.post('/proxies/personal/', proxyData)
    },

    updatePersonalProxy(proxyId, proxyData) {
        return api.put(`/proxies/personal/${proxyId}/`, proxyData)
    },

    deletePersonalProxy(proxyId) {
        return api.delete(`/proxies/personal/${proxyId}/`)
    },

    testPersonalProxy(proxyId, testData = {}) {
        return api.post(`/proxies/personal/${proxyId}/test/`, testData)
    },

    togglePersonalProxyStatus(proxyId) {
        return api.post(`/proxies/personal/${proxyId}/toggle/`)
    },

    batchCreatePersonalProxies(batchData) {
        return api.post('/proxies/personal/batch-create/', batchData)
    },

    importPersonalProxies(formData) {
        return api.post('/proxies/personal/import/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }
}

export default proxyService