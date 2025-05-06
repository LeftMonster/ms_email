<template>
  <div class="development-page">
    <div class="container">
      <div class="development-content">
        <div class="icon-container">
          <i class="fas fa-tools"></i>
        </div>
        <h1>功能开发中</h1>
        <p>此功能目前正在开发中，暂不可用。我们正在努力完善，请稍后再试！</p>
        <button class="back-button" @click="goBack">
          返回选择
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeatureInDevelopment',
  props: {
    // 可以接收功能名称作为参数，便于显示不同的提示信息
    featureName: {
      type: String,
      default: '此功能'
    }
  },
  setup() {
    const goBack = () => {
      window.history.back();
    };

    return {
      goBack
    };
  }
}
</script>

<style scoped>
.development-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 20px;
}

.container {
  max-width: 600px;
  width: 100%;
}

.development-content {
  background-color: white;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-container {
  font-size: 4rem;
  color: #171a21;
  margin-bottom: 20px;
  animation: spin 3s linear infinite;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  background-color: #f5f5f5;
  border-radius: 50%;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

h1 {
  font-size: 2rem;
  color: #171a21;
  margin-bottom: 15px;
}

p {
  font-size: 1.1rem;
  color: #555;
  max-width: 400px;
  margin-bottom: 30px;
}

.back-button {
  background-color: #171a21;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.back-button:hover {
  background-color: #1b2838;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style>