<template>
  <div class="access-denied-container">
    <div class="card">
      <div class="card-header bg-warning">
        <h4 class="m-0"><i class="fas fa-exclamation-triangle mr-2"></i>访问受限</h4>
      </div>
      <div class="card-body text-center">
        <div class="mb-4">
          <i class="fas fa-lock access-denied-icon"></i>
        </div>
        <h5 class="mb-3">{{ title || '您需要订阅才能访问此功能' }}</h5>
        <p class="mb-4">{{ message || '您当前的订阅计划不包含此功能。请升级您的订阅以解锁更多功能!' }}</p>
        <div v-if="requiredFeature" class="mb-4">
          <div class="badge badge-info p-2 mb-2">
            <i class="fas" :class="getFeatureIcon(requiredFeature)"></i>
            {{ getFeatureName(requiredFeature) }}
          </div>
          <p class="text-muted small">此功能需要上述访问权限</p>
        </div>
        <div v-if="availablePlans && availablePlans.length > 0" class="mb-4">
          <p class="text-success">以下计划包含所需功能:</p>
          <div class="d-flex justify-content-center flex-wrap">
            <span v-for="plan in availablePlans" :key="plan" class="badge badge-success m-1 p-2">
              {{ plan }}
            </span>
          </div>
        </div>
        <div class="mt-4">
          <router-link to="/subscription-plans" class="btn btn-primary mr-2">
            <i class="fas fa-crown mr-1"></i> 升级订阅
          </router-link>
          <button @click="goBack" class="btn btn-secondary">
            <i class="fas fa-arrow-left mr-1"></i> 返回
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccessDenied',
  props: {
    title: {
      type: String,
      required: false
    },
    message: {
      type: String,
      required: false
    },
    requiredFeature: {
      type: String,
      required: false
    },
    availablePlans: {
      type: Array,
      required: false
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    getFeatureIcon(feature) {
      const icons = {
        'email_access': 'fa-envelope',
        'twitch_access': 'fa-gamepad',
        'steam_access': 'Steam任务',
        default: 'fa-lock'
      };
      return icons[feature] || icons.default;
    },
    getFeatureName(feature) {
      const names = {
        'email_access': 'Email功能',
        'twitch_access': 'Twitch宝盒功能',
        'steam_access': 'Steam任务',
        default: '高级功能'
      };
      return names[feature] || names.default;
    }
  }
}
</script>

<style scoped>
.access-denied-container {
  max-width: 600px;
  margin: 40px auto;
}

.access-denied-icon {
  font-size: 3rem;
  color: #dc3545;
  margin-bottom: 1rem;
}
</style>