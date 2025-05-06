<template>
  <div class="login-page">
    <div class="background">
      <div class="shape-container">
        <div class="red-circle"></div>
        <div class="blue-window"></div>
        <div class="green-circle"></div>
        <div class="purple-arc"></div>
      </div>
    </div>

    <div class="card-container">
      <div class="card">
        <div class="card-content login-content">
          <!-- Microsoft logo 居中 -->
          <div style="text-align: center; margin-bottom: 30px;">
            <!-- Logo placeholder -->
            <svg aria-label="Microsoft" data-testid="microsoftLogo" role="img" width="114" height="24" viewBox="0 0 114 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.2997 5.30006V19.7001H44.7997V8.40006H44.7664L40.2997 19.7001H38.633L34.0664 8.40006H34.033V19.7001H31.733V5.30006H35.333L39.4664 15.9667H39.533L43.8997 5.30006H47.2997ZM49.3664 6.40006C49.3664 6.00006 49.4997 5.66673 49.7997 5.40006C50.0997 5.1334 50.433 5.00006 50.833 5.00006C51.2664 5.00006 51.633 5.1334 51.8997 5.4334C52.1664 5.70006 52.333 6.0334 52.333 6.4334C52.333 6.8334 52.1997 7.16673 51.8997 7.4334C51.5997 7.70006 51.2664 7.8334 50.833 7.8334C50.3997 7.8334 50.0664 7.70006 49.7997 7.4334C49.533 7.10006 49.3664 6.76673 49.3664 6.40006ZM52.0664 9.36673V19.7001H49.633V9.36673H52.0664ZM59.433 17.9334C59.7997 17.9334 60.1997 17.8334 60.633 17.6667C61.0664 17.5001 61.4664 17.2667 61.833 17.0001V19.2667C61.433 19.5001 60.9997 19.6667 60.4997 19.7667C59.9997 19.8667 59.4664 19.9334 58.8664 19.9334C57.333 19.9334 56.0997 19.4667 55.1664 18.5001C54.1997 17.5334 53.733 16.3001 53.733 14.8334C53.733 13.1667 54.233 11.8001 55.1997 10.7334C56.1664 9.66673 57.533 9.1334 59.333 9.1334C59.7997 9.1334 60.233 9.20006 60.6997 9.30006C61.1664 9.4334 61.533 9.56673 61.7997 9.70006V12.0334C61.433 11.7667 61.033 11.5334 60.6664 11.4001C60.2664 11.2334 59.8664 11.1667 59.4664 11.1667C58.4997 11.1667 57.733 11.4667 57.133 12.1001C56.533 12.7334 56.233 13.5667 56.233 14.6334C56.233 15.6667 56.4997 16.5001 57.0664 17.0667C57.6997 17.6334 58.4664 17.9334 59.433 17.9334ZM68.733 9.20006C68.933 9.20006 69.0997 9.20006 69.2664 9.2334C69.433 9.26673 69.5664 9.30006 69.6664 9.3334V11.8001C69.533 11.7001 69.3664 11.6334 69.0997 11.5334C68.8664 11.4334 68.5664 11.4001 68.1997 11.4001C67.5997 11.4001 67.0997 11.6667 66.6997 12.1667C66.2997 12.6667 66.0664 13.4334 66.0664 14.5001V19.7001H63.633V9.36673H66.0664V11.0001H66.0997C66.333 10.4334 66.6664 10.0001 67.0997 9.66673C67.5664 9.36673 68.0997 9.20006 68.733 9.20006ZM69.7997 14.7001C69.7997 13.0001 70.2664 11.6334 71.233 10.6334C72.1997 9.6334 73.533 9.1334 75.2664 9.1334C76.8664 9.1334 78.133 9.60006 79.033 10.5667C79.933 11.5334 80.3997 12.8334 80.3997 14.4667C80.3997 16.1334 79.933 17.4667 78.9664 18.4667C77.9997 19.4667 76.6997 19.9667 75.033 19.9667C73.433 19.9667 72.1664 19.5001 71.233 18.5667C70.2664 17.6001 69.7997 16.3001 69.7997 14.7001ZM72.333 14.6001C72.333 15.6667 72.5664 16.5001 73.0664 17.0667C73.5664 17.6334 74.2664 17.9334 75.1664 17.9334C76.0664 17.9334 76.733 17.6334 77.1997 17.0667C77.6664 16.5001 77.8997 15.6667 77.8997 14.5334C77.8997 13.4334 77.6664 12.6001 77.1664 12.0334C76.6997 11.4667 76.033 11.2001 75.1664 11.2001C74.2664 11.2001 73.5997 11.5001 73.0997 12.1001C72.5664 12.6667 72.333 13.5001 72.333 14.6001ZM83.9997 12.1001C83.9997 12.4334 84.0997 12.7334 84.333 12.9334C84.5664 13.1334 85.033 13.3667 85.7997 13.6667C86.7664 14.0667 87.4664 14.5001 87.833 14.9667C88.233 15.4667 88.433 16.0334 88.433 16.7334C88.433 17.7001 88.0664 18.5001 87.2997 19.0667C86.5664 19.6667 85.533 19.9667 84.2664 19.9667C83.833 19.9667 83.3664 19.9001 82.833 19.8001C82.2997 19.7001 81.8664 19.5667 81.4997 19.4001V17.0001C81.933 17.3001 82.433 17.5667 82.933 17.7334C83.433 17.9001 83.8997 18.0001 84.333 18.0001C84.8664 18.0001 85.2997 17.9334 85.533 17.7667C85.7997 17.6001 85.933 17.3667 85.933 17.0001C85.933 16.6667 85.7997 16.3667 85.533 16.1667C85.2664 15.9334 84.733 15.6667 83.9997 15.3667C83.0997 15.0001 82.4664 14.5667 82.0997 14.1001C81.733 13.6334 81.533 13.0334 81.533 12.3001C81.533 11.3667 81.8997 10.6001 82.633 10.0001C83.3664 9.40006 84.333 9.10006 85.4997 9.10006C85.8664 9.10006 86.2664 9.1334 86.6997 9.2334C87.133 9.30006 87.533 9.4334 87.833 9.5334V11.8334C87.4997 11.6334 87.133 11.4334 86.6997 11.2667C86.2664 11.1001 85.833 11.0334 85.433 11.0334C84.9664 11.0334 84.5997 11.1334 84.3664 11.3001C84.133 11.5334 83.9997 11.7667 83.9997 12.1001ZM89.4664 14.7001C89.4664 13.0001 89.933 11.6334 90.8997 10.6334C91.8664 9.6334 93.1997 9.1334 94.933 9.1334C96.533 9.1334 97.7997 9.60006 98.6997 10.5667C99.5997 11.5334 100.066 12.8334 100.066 14.4667C100.066 16.1334 99.5997 17.4667 98.633 18.4667C97.6664 19.4667 96.3664 19.9667 94.6997 19.9667C93.0997 19.9667 91.833 19.5001 90.8997 18.5667C89.9664 17.6001 89.4664 16.3001 89.4664 14.7001ZM91.9997 14.6001C91.9997 15.6667 92.233 16.5001 92.733 17.0667C93.233 17.6334 93.933 17.9334 94.833 17.9334C95.733 17.9334 96.3997 17.6334 96.8664 17.0667C97.333 16.5001 97.5664 15.6667 97.5664 14.5334C97.5664 13.4334 97.333 12.6001 96.833 12.0334C96.3664 11.4667 95.6997 11.2001 94.833 11.2001C93.933 11.2001 93.2664 11.5001 92.7664 12.1001C92.2664 12.6667 91.9997 13.5001 91.9997 14.6001ZM108.133 11.3667H104.5V19.7001H102.033V11.3667H100.3V9.36673H102.033V7.9334C102.033 6.8334 102.4 5.96673 103.1 5.26673C103.8 4.56673 104.7 4.2334 105.8 4.2334C106.1 4.2334 106.366 4.2334 106.6 4.26673C106.833 4.30007 107.033 4.3334 107.2 4.40007V6.50006C107.133 6.46673 106.966 6.40006 106.766 6.3334C106.566 6.26673 106.333 6.2334 106.066 6.2334C105.566 6.2334 105.166 6.40006 104.9 6.70006C104.633 7.0334 104.5 7.50006 104.5 8.10006V9.3334H108.133V7.00006L110.566 6.26673V9.3334H113.033V11.3334H110.566V16.1667C110.566 16.8001 110.666 17.2667 110.9 17.5001C111.133 17.7667 111.5 17.9001 112 17.9001C112.133 17.9001 112.3 17.8667 112.5 17.8001C112.7 17.7334 112.866 17.6667 113.033 17.5667V19.5667C112.866 19.6667 112.633 19.7334 112.266 19.8001C111.9 19.8667 111.566 19.9001 111.2 19.9001C110.166 19.9001 109.4 19.6334 108.9 19.0667C108.4 18.5334 108.133 17.7001 108.133 16.6001V11.3667Z" fill="#FFFFFF"></path><path d="M13.2383 13.2383H24.5V24.5H13.2383V13.2383Z" fill="#FFB900"></path><path d="M0.5 13.2383H11.7617V24.5H0.5V13.2383Z" fill="#00A4EF"></path><path d="M13.2383 0.5H24.5V11.7617H13.2383V0.5Z" fill="#7FBA00"></path><path d="M0.5 0.5H11.7617V11.7617H0.5V0.5Z" fill="#F25022"></path></svg>
          </div>

          <h1 class="main-title">登录</h1>
          <p class="description" style="margin-bottom: 20px;">使用你的账户登录系统。</p>

          <div class="error" v-if="error">{{ error }}</div>

          <form @submit.prevent="login">
            <!-- 账号输入框 -->
            <div class="input-container">
              <input
                type="email"
                id="email"
                v-model="loginForm.email"
                placeholder="电子邮件"
                class="login-input"
                required
              />
            </div>

            <!-- 密码输入框 -->
            <div class="input-container" style="margin-top: 15px;">
              <input
                type="password"
                id="password"
                v-model="loginForm.password"
                placeholder="密码"
                class="login-input"
                required
              />
            </div>

            <!-- 提交按钮 -->
            <button
              type="submit"
              class="primary-button"
              :class="{ 'loading': loading }"
              :disabled="loading"
            >
              <span class="button-text">{{ loading ? '处理中...' : '登录' }}</span>
              <span class="spinner" v-if="loading">
                <svg class="spinner-svg" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle>
                </svg>
              </span>
            </button>

            <div style="margin-top: 20px; text-align: center;">
              <router-link to="/register" class="green-text">还没有账号？立即注册</router-link>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="footer-container">
      <div>
        <img src="img/xbox_logo_white.svg" alt="Xbox" class="xbox-logo"><br>
      </div>
      <div class="footer-links">
        <a href="#" class="footer-link">帮助</a>
        <a href="#" class="footer-link">使用条款</a>
        <a href="#" class="footer-link">隐私与 Cookie</a>
      </div>
      <div style="margin-top: 8px;">
        如果这不是您的设备，请使用访客模式。<a href="#" class="green-text">了解详细信息</a>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',

  setup() {
    const store = useStore()
    const router = useRouter()

    const loginForm = reactive({
      email: '',
      password: ''
    })

    const loading = ref(false)
    const error = computed(() => store.getters['auth/error'])

    const login = async () => {
      loading.value = true
      try {
        await store.dispatch('auth/login', loginForm)
        router.push('/accounts')
      } catch (err) {
        console.error('Login error:', err)
      } finally {
        loading.value = false
      }
    }

    // onMounted(() => {
    //   // 为背景形状添加动画效果
    //   const handleMouseMove = (e) => {
    //     const shapes = document.querySelectorAll('.red-circle, .blue-window, .green-circle, .purple-arc');
    //     const moveX = (e.clientX - window.innerWidth / 2) / 50;
    //     const moveY = (e.clientY - window.innerHeight / 2) / 50;
    //
    //     shapes.forEach(shape => {
    //       const rect = shape.getBoundingClientRect();
    //       const centerX = rect.left + rect.width / 2;
    //       const centerY = rect.top + rect.height / 2;
    //
    //       const distX = (e.clientX - centerX) / 1000;
    //       const distY = (e.clientY - centerY) / 1000;
    //
    //       // 保存原始的transform属性，过滤掉translate部分
    //       const originalTransform = window.getComputedStyle(shape).transform;
    //       const transformValue = originalTransform === 'none' ? '' : originalTransform.split('translate')[0];
    //
    //       shape.style.transform = `${transformValue} translate(calc(-50% + ${moveX * distX}px), calc(-50% + ${moveY * distY}px))`;
    //     });
    //   };
    //
    //   document.addEventListener('mousemove', handleMouseMove);
    // });

    return {
      loginForm,
      login,
      loading,
      error
    }
  }
}
</script>

<style scoped>
.login-page {
  background-color: #121212;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.background {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px;
}

.shape-container {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.red-circle {
  position: absolute;
  width: 200px;
  height: 200px;
  border: 2px solid transparent;
  border-radius: 50%;
  left: 20%;
  top: 40%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 15px #ff3e30, inset 0 0 15px rgba(255, 62, 48, 0.3);
  background: rgba(255, 62, 48, 0.05);
  animation: float 10s ease-in-out infinite, pulse 4s ease-in-out infinite;
  box-shadow: 0 0 20px currentColor, inset 0 0 20px currentColor;
  opacity: 0.9;
}

.blue-window {
  position: absolute;
  width: 150px;
  height: 180px;
  border: 2px solid transparent;
  left: 30%;
  top: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  box-shadow: 0 0 15px #30c9ff, inset 0 0 15px rgba(48, 201, 255, 0.3);
  background: rgba(48, 201, 255, 0.05);
  display: grid;
  grid-template: 1fr 1fr / 1fr 1fr;
  gap: 4px;
  animation: float 14s ease-in-out infinite reverse, pulse 6s ease-in-out infinite;
  box-shadow: 0 0 20px currentColor, inset 0 0 20px currentColor;
  opacity: 0.9;
}

.blue-window::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background: rgba(48, 201, 255, 0.8);
  top: 50%;
  box-shadow: 0 0 10px #30c9ff;
}

.blue-window::after {
  content: '';
  position: absolute;
  width: 2px;
  height: 100%;
  background: rgba(48, 201, 255, 0.8);
  left: 50%;
  box-shadow: 0 0 10px #30c9ff;
}

.green-circle {
  position: absolute;
  width: 180px;
  height: 180px;
  border: 2px solid transparent;
  border-radius: 50%;
  right: 20%;
  top: 60%;
  transform: translate(50%, -50%);
  box-shadow: 0 0 15px #2eff87, inset 0 0 15px rgba(46, 255, 135, 0.3);
  background: rgba(46, 255, 135, 0.05);
  animation: float 12s ease-in-out infinite 2s, pulse 5s ease-in-out infinite 1s;
  box-shadow: 0 0 20px currentColor, inset 0 0 20px currentColor;
  opacity: 0.9;
}

.purple-arc {
  position: absolute;
  width: 400px;
  height: 400px;
  border: 2px solid transparent;
  border-radius: 50%;
  right: 30%;
  top: 40%;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 100%);
  box-shadow: 0 0 15px #bf30ff, inset 0 0 15px rgba(191, 48, 255, 0.3);
  background: rgba(191, 48, 255, 0.05);
  animation: float 15s ease-in-out infinite 1s, pulse 7s ease-in-out infinite 2s;
  box-shadow: 0 0 20px currentColor, inset 0 0 20px currentColor;
  opacity: 0.9;
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

.card-container {
  position: relative;
  z-index: 10;
  transform: translateY(-30px);
}

.card {
  width: 420px;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  backdrop-filter: blur(10px);
  background-color: rgba(40, 40, 40, 0.95);
}

.login-content {
  padding: 30px;
}

.main-title {
  font-size: 24px;
  margin-bottom: 30px;
  color: #fff;
  text-align: center;
}

.description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  text-align: center;
}

.input-container {
  width: 100%;
  margin-bottom: 10px;
}

.login-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #1c1c1c;
  color: white;
  font-size: 16px;
}

.login-input:focus {
  outline: none;
  border-color: #0f7b0f;
}

.primary-button {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0f7b0f;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 12px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 15px;
  width: 100%;
  transition: background-color 0.3s;
}

.primary-button:hover {
  background-color: #0a6b0a;
}

.primary-button:disabled {
  cursor: not-allowed;
}

.primary-button.loading {
  background-color: #333;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  margin-left: 8px;
}

.spinner-svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner-svg circle {
  stroke-dasharray: 60;
  stroke-dashoffset: 40;
}

.green-text {
  color: rgba(46, 255, 135, 0.8);
  text-decoration: none;
}

.error {
  background-color: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
}

.footer-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: transparent;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  z-index: 10;
}

.footer-links {
  display: flex;
  margin-top: 8px;
}

.footer-link {
  margin: 0 8px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
}

.xbox-logo {
  height: 16px;
  margin-bottom: 8px;
}
</style>