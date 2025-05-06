import authService from '../../services/auth'

const state = {
  token: null,
  user: null,
  error: null
}

const getters = {
  isLoggedIn: state => !!state.token,
  currentUser: state => state.user,
  error: state => state.error
}

const actions = {
  async login({ commit }, credentials) {
    try {
      const response = await authService.login(credentials)
      const { token, user } = response.data

      // 保存到本地存储
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      commit('SET_TOKEN', token)
      commit('SET_USER', user)
      commit('SET_ERROR', null)

      return response
    } catch (error) {
      const message = error.response?.data?.detail || '登录失败，请检查您的凭据'
      commit('SET_ERROR', message)
      throw error
    }
  },

  async register({ commit }, userData) {
    try {
      const response = await authService.register(userData)
      const { token, user } = response.data

      // 保存到本地存储
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      commit('SET_TOKEN', token)
      commit('SET_USER', user)
      commit('SET_ERROR', null)

      return response
    } catch (error) {
      const message = error.response?.data?.detail || '注册失败，请检查您的信息'
      commit('SET_ERROR', message)
      throw error
    }
  },

  async getUserInfo({ commit }) {
    try {
      const response = await authService.getUserInfo()
      commit('SET_USER', response.data)
      return response
    } catch (error) {
      commit('SET_ERROR', '获取用户信息失败')
      throw error
    }
  },

  logout({ commit }) {
    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // 清除状态
    commit('SET_TOKEN', null)
    commit('SET_USER', null)
    commit('SET_ERROR', null)
  }
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
  },

  SET_USER(state, user) {
    state.user = user
  },

  SET_ERROR(state, error) {
    state.error = error
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}