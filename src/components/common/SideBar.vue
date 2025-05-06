<template>
  <div class="sidebar-container">
    <div class="sidebar-toggle" @click="toggleSidebar">
      <i class="fas" :class="isOpen ? 'fa-times' : 'fa-bars'"></i>
    </div>

    <div class="sidebar" :class="{ open: isOpen }">
      <div class="brand">
        <h1>邮件助手</h1>
      </div>

      <div class="user-info">
        <div class="avatar">{{ userInitials }}</div>
        <span>{{ user?.email }}</span>
      </div>

      <div class="nav-items">
        <router-link to="/microsoft-accounts" @click="closeSidebarOnMobile">
          <i class="fab fa-microsoft"></i> 邮箱数据
        </router-link>
        <router-link to="/tasks/create" @click="closeSidebarOnMobile">
          <i class="fas fa-plus-circle"></i> 创建任务
        </router-link>
        <router-link to="/import-tasks" @click="closeSidebarOnMobile">
          <i class="fas fa-tasks"></i> 任务列表
        </router-link>
        <router-link to="/deployment-tools" @click="closeSidebarOnMobile">
          <i class="fas fa-tools"></i> 部署工具
        </router-link>

        <!-- 代理管理区域 - 新增 -->
        <div class="sidebar-section">
          <div class="section-title" @click="toggleSection('proxy')">
            <i class="fas fa-network-wired"></i>
            <span>代理管理</span>
            <i :class="['fas', sections.proxy ? 'fa-chevron-down' : 'fa-chevron-right']" class="toggle-icon"></i>
          </div>
          <div class="section-items" v-if="sections.proxy">
            <router-link to="/proxies/pools" class="sidebar-item" @click="closeSidebarOnMobile">
              <i class="fas fa-server"></i>
              <span>代理池</span>
            </router-link>
          </div>
        </div>
      </div>

      <div class="sidebar-footer">
        <button @click="logout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i> 退出
        </button>
      </div>
    </div>

    <!-- Overlay to close sidebar on mobile when clicked outside -->
    <div
        v-if="isOpen"
        class="sidebar-overlay"
        @click="closeSidebarOnMobile"
    ></div>
  </div>
</template>

<script>
import {computed, ref} from "vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";

export default {
  name: "SideBar",

  setup() {
    const store = useStore();
    const router = useRouter();
    const isOpen = ref(window.innerWidth > 768); // Default open on desktop

    // 侧边栏折叠区域状态 - 新增
    const sections = ref({
      proxy: true, // 默认展开代理区域
    });

    const user = computed(() => store.getters["auth/currentUser"]);

    const userInitials = computed(() => {
      if (!user.value) return "?";

      const email = user.value.email || "";
      if (email) {
        return email.charAt(0).toUpperCase();
      }

      return "?";
    });

    const toggleSidebar = () => {
      isOpen.value = !isOpen.value;
      // 在移动模式下，控制body的overflow以防止背景滚动
      if (window.innerWidth <= 768) {
        document.body.style.overflow = isOpen.value ? "hidden" : "";
      }
    };

    // 切换侧边栏区域折叠状态 - 新增
    const toggleSection = (section) => {
      sections.value[section] = !sections.value[section];
    };

    const closeSidebarOnMobile = () => {
      if (window.innerWidth <= 768 && isOpen.value) {
        isOpen.value = false;
        document.body.style.overflow = "";
      }
    };

    const logout = () => {
      store.dispatch("auth/logout");
      router.push("/login");
    };

    return {
      isOpen,
      user,
      userInitials,
      toggleSidebar,
      closeSidebarOnMobile,
      logout,
      sections, // 新增
      toggleSection, // 新增
    };
  },
};
</script>

<style scoped>
/* 样式保持不变 */
.sidebar-container {
  position: relative;
  height: 100%;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 250px;
  background-color: #2c3e50;
  color: white;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.sidebar-toggle {
  position: fixed;
  top: 10px;
  left: 10px;
  width: 40px;
  height: 40px;
  background-color: #2c3e50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
}

.brand {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand h1 {
  margin: 0;
  font-size: 1.5rem;
}

.user-info {
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-weight: bold;
}

.nav-items {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-items a {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: white;
  text-decoration: none;
  transition: background-color 0.2s;
}

.nav-items a i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.nav-items a:hover,
.nav-items a.router-link-active {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn i {
  margin-right: 10px;
}

/* .logout-btn: */

.logout-btn:hover {
  background-color: #c0392b;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
}

.sidebar-overlay.visible {
  display: block;
}

/* Nav section styles for grouping menu items */
.nav-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  padding: 0 20px 10px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 可折叠侧边栏区域样式 - 新增 */
.sidebar-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-section .section-title {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sidebar-section .section-title:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.sidebar-section .section-title i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.sidebar-section .section-title span {
  flex: 1;
}

.sidebar-section .toggle-icon {
  font-size: 12px;
}

.sidebar-section .section-items {
  padding-left: 20px;
}

.sidebar-section .sidebar-item {
  padding: 10px 20px 10px 30px;
}

/* Responsive styles */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}

@media (min-width: 769px) {
  .sidebar-toggle {
    display: none;
  }

  .main-content {
    margin-left: 250px;
  }
}
</style>