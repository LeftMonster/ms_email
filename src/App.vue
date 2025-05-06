<template>
  <div class="app">
    <Sidebar v-if="isLoggedIn" />
    <div class="main-content" :class="{ 'with-sidebar': isLoggedIn }">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import Sidebar from './components/common/SideBar.vue'

export default {
  name: 'App',
  components: {
    Sidebar
  },
  setup() {
    const store = useStore()

    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])

    onMounted(() => {
      // 尝试从本地存储恢复身份验证状态
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user'))

      if (token && user) {
        store.commit('auth/SET_TOKEN', token)
        store.commit('auth/SET_USER', user)
      }
    })

    return {
      isLoggedIn
    }
  }
}
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #f5f7fa;
}

.app {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  transition: margin-left 0.3s ease;
  position: relative;
  z-index: 1;
  background-color: #f5f7fa;
}

.main-content.with-sidebar {
  margin-left: 0;
}

@media (min-width: 769px) {
  .main-content.with-sidebar {
    margin-left: 250px;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

button {
  cursor: pointer;
  padding: 10px 16px;
  margin: 5px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

input, select, textarea {
  padding: 10px;
  margin: 5px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

input:focus, select:focus, textarea:focus {
  border-color: #4CAF50;
  outline: none;
}

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.error {
  color: #e74c3c;
  margin: 5px 0;
  padding: 8px;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
}

.success {
  color: #2ecc71;
  margin: 5px 0;
  padding: 8px;
  background-color: rgba(46, 204, 113, 0.1);
  border-radius: 4px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* Form styles */
.form-group {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Progress styles */
.progress-container {
  width: 100%;
  height: 20px;
  background-color: #eee;
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-bar {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 10px;
  transition: width 0.3s ease;
}
</style>