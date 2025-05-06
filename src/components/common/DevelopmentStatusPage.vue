<template>
  <div class="development-status-page">
    <div class="status-container">
      <div class="status-icon">
        <i class="fas fa-tools"></i>
      </div>
      <h1>{{ title || '功能开发中' }}</h1>
      <p>{{ message || '此功能目前正在开发中，暂不可用。我们正在努力完善，请稍后再试！' }}</p>

      <div v-if="showFeaturePreview" class="feature-preview">
        <h2>即将推出的功能</h2>
        <div class="features-list">
          <div v-for="(feature, index) in upcomingFeatures" :key="index" class="feature-item">
            <div class="feature-icon">
              <i :class="feature.icon"></i>
            </div>
            <div class="feature-details">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
              <div v-if="feature.progress" class="feature-progress">
                <div class="progress-bar">
                  <div class="progress" :style="{ width: feature.progress + '%' }"></div>
                </div>
                <span>{{ feature.progress }}% 完成</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button class="primary-button" @click="goBack">
          <i class="fas fa-arrow-left"></i> 返回
        </button>
        <button class="secondary-button" @click="goHome">
          <i class="fas fa-home"></i> 返回首页
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {useRouter} from 'vue-router';

export default {
  name: 'DevelopmentStatusPage',

  props: {
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    showFeaturePreview: {
      type: Boolean,
      default: true
    },
    upcomingFeatures: {
      type: Array,
      default: () => [
        {
          title: '高级批量处理',
          icon: 'fas fa-layer-group',
          description: '支持大批量数据处理，优化流程并提高处理效率',
          progress: 65
        },
        {
          title: '自动化任务调度',
          icon: 'fas fa-calendar-alt',
          description: '支持设置复杂的自动化任务调度，让您的工作更加轻松',
          progress: 40
        },
        {
          title: '数据分析与报表',
          icon: 'fas fa-chart-bar',
          description: '提供详细的数据分析和报表功能，帮助您做出更明智的决策',
          progress: 25
        }
      ]
    }
  },

  setup(props) {
    const router = useRouter();

    const goBack = () => {
      router.back();
    };

    const goHome = () => {
      router.push('/');
    };

    return {
      goBack,
      goHome
    };
  }
}
</script>

<style scoped>
.development-status-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 20px;
}

.status-container {
  max-width: 800px;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.status-icon {
  font-size: 5rem;
  color: #171a21;
  margin-bottom: 20px;
  animation: spin 5s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.status-container h1 {
  font-size: 2.5rem;
  color: #171a21;
  margin-bottom: 20px;
}

.status-container p {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.feature-preview {
  margin-top: 40px;
  margin-bottom: 40px;
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 10px;
  text-align: left;
}

.feature-preview h2 {
  font-size: 1.8rem;
  color: #171a21;
  margin-bottom: 20px;
  text-align: center;
}

.features-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.feature-item {
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2rem;
  color: #171a21;
  margin-right: 20px;
  min-width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-details {
  flex: 1;
}

.feature-details h3 {
  font-size: 1.3rem;
  color: #171a21;
  margin-bottom: 10px;
}

.feature-details p {
  font-size: 1rem;
  color: #555;
  margin-bottom: 10px;
}

.feature-progress {
  margin-top: 15px;
}

.progress-bar {
  height: 10px;
  background-color: #eee;
  border-radius: 5px;
  margin-bottom: 5px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(to right, #66c0f4, #1b2838);
  border-radius: 5px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.primary-button,
.secondary-button {
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.primary-button {
  background-color: #171a21;
  color: white;
}

.primary-button:hover {
  background-color: #1b2838;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.secondary-button {
  background-color: #f5f5f5;
  color: #333;
}

.secondary-button:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

@media (min-width: 768px) {
  .features-list {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
}

@media (max-width: 767px) {
  .status-container {
    padding: 25px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .status-icon {
    font-size: 4rem;
  }

  .status-container h1 {
    font-size: 2rem;
  }
}
</style>