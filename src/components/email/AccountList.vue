<template>
  <div class="account-list">
    <div class="header">
      <h1>邮箱账户管理</h1>
      <router-link to="/accounts/add">
        <button>添加邮箱账户</button>
      </router-link>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="accounts.length === 0" class="empty-state">
      <p>您还没有添加任何邮箱账户</p>
      <router-link to="/accounts/add">
        <button>添加邮箱账户</button>
      </router-link>
    </div>

    <div v-else class="accounts-grid">
      <div v-for="account in accounts" :key="account.id" class="account-card">
        <div class="account-info">
          <h3>{{ account.display_name }}</h3>
          <p>{{ account.email }}</p>
          <p>创建时间: {{ new Date(account.created_at).toLocaleString() }}</p>
        </div>

        <div class="account-actions">
          <router-link :to="`/accounts/${account.id}/emails`">
            <button>查看邮件</button>
          </router-link>
          <button @click="confirmDelete(account)" class="delete-btn">删除账户</button>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <h3>确认删除</h3>
        <p>您确定要删除邮箱账户 "{{ accountToDelete?.email }}" 吗？此操作不可撤销。</p>
        <div class="modal-actions">
          <button @click="deleteAccount" class="delete-btn">删除</button>
          <button @click="cancelDelete">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'AccountList',

  setup() {
    const store = useStore()

    const accounts = computed(() => store.getters['email/accounts'])
    const loading = computed(() => store.getters['email/loading'])
    const error = computed(() => store.getters['email/error'])

    const showDeleteModal = ref(false)
    const accountToDelete = ref(null)

    const fetchAccounts = async () => {
      try {
        await store.dispatch('email/fetchAccounts')
      } catch (err) {
        console.error('Error fetching accounts:', err)
      }
    }

    const confirmDelete = (account) => {
      accountToDelete.value = account
      showDeleteModal.value = true
    }

    const cancelDelete = () => {
      accountToDelete.value = null
      showDeleteModal.value = false
    }

    const deleteAccount = async () => {
      try {
        await store.dispatch('email/deleteAccount', accountToDelete.value.id)
        showDeleteModal.value = false
        accountToDelete.value = null
      } catch (err) {
        console.error('Error deleting account:', err)
      }
    }

    onMounted(fetchAccounts)

    return {
      accounts,
      loading,
      error,
      showDeleteModal,
      accountToDelete,
      confirmDelete,
      cancelDelete,
      deleteAccount
    }
  }
}
</script>

<style scoped>
.account-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.account-card {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
}

.account-info h3 {
  margin-top: 0;
}

.account-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.delete-btn {
  background-color: #f44336;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

/* 模态框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  max-width: 400px;
  width: 100%;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>