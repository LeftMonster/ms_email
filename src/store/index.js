import { createStore } from 'vuex'
import auth from './modules/auth'
import email from './modules/email'
import microsoft from './modules/microsoft'
import proxy from './modules/proxy'

export default createStore({
  modules: {
    auth,
    email,
    microsoft,
    proxy,
  }
})