import router from '../router'

/**
 * API错误处理服务
 * 处理常见API错误，如权限错误、订阅限制等
 */
const errorHandler = {
  /**
   * 处理API错误响应
   * @param {Object} error - Axios错误对象
   * @param {Object} vue - Vue实例，用于显示通知
   * @returns {boolean} 如果错误已被处理，则返回true
   */
  handleApiError(error, vue) {
    // 检查是否有响应
    if (!error.response) {
      // 网络错误
      if (vue.$notify) {
        vue.$notify({
          title: '网络错误',
          message: '无法连接到服务器，请检查您的网络连接',
          type: 'error'
        });
      } else {
        alert('网络错误: 无法连接到服务器，请检查您的网络连接');
      }
      return true;
    }

    const { status, data } = error.response;

    // 处理认证错误
    if (status === 401) {
      // 清除本地登录状态
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // 显示消息
      if (vue.$notify) {
        vue.$notify({
          title: '登录已过期',
          message: '您的登录已过期，请重新登录',
          type: 'warning'
        });
      } else {
        alert('登录已过期，请重新登录');
      }

      // 重定向到登录页面
      router.push('/login');
      return true;
    }

    // 处理权限错误
    if (status === 403) {
      // 检查是否是订阅权限错误
      if (data && data.data && data.data.required_feature) {
        const requiredFeature = data.data.required_feature;
        const availablePlans = data.data.available_plans || [];

        // 重定向到权限错误页面
        router.push({
          name: 'AccessDenied',
          params: {
            requiredFeature,
            availablePlans,
            message: data.message || '您的订阅计划不包含此功能'
          }
        });
        return true;
      } else {
        // 其他权限错误
        if (vue.$notify) {
          vue.$notify({
            title: '权限错误',
            message: data.message || '您没有权限执行此操作',
            type: 'error'
          });
        } else {
          alert('权限错误: ' + (data.message || '您没有权限执行此操作'));
        }
        return true;
      }
    }

    // 处理表单验证错误
    if (status === 400 && data.errors) {
      const errorMessages = Object.values(data.errors).flat();
      errorMessages.forEach(message => {
        if (vue.$notify) {
          vue.$notify({
            title: '表单错误',
            message,
            type: 'error'
          });
        } else {
          alert('表单错误: ' + message);
        }
      });
      return true;
    }

    // 处理服务器错误
    if (status >= 500) {
      if (vue.$notify) {
        vue.$notify({
          title: '服务器错误',
          message: '服务器出现问题，请稍后再试',
          type: 'error'
        });
      } else {
        alert('服务器错误: 服务器出现问题，请稍后再试');
      }
      return true;
    }

    // 如果没有处理，返回false
    return false;
  },

  /**
   * 处理对特定API端点的访问拒绝
   * @param {string} feature - 被拒绝访问的功能代码
   * @param {Vue} vue - Vue实例
   */
  handleFeatureAccessDenied(feature, vue) {
    // 获取功能信息
    const featureInfo = {
      'email_access': {
        name: 'Email功能',
        description: '包括邮箱导入、管理和使用等功能'
      },
      'twitch_access': {
        name: 'Twitch宝盒功能',
        description: '包括Twitch账号管理、服务器部署等功能'
      }
    }[feature] || { name: '高级功能', description: '需要订阅才能访问的功能' };

    // 显示消息
    if (vue.$notify) {
      vue.$notify({
        title: '访问受限',
        message: `您需要订阅包含 ${featureInfo.name} 的计划才能访问此功能`,
        type: 'warning',
        duration: 5000
      });
    } else {
      alert(`访问受限: 您需要订阅包含 ${featureInfo.name} 的计划才能访问此功能`);
    }

    // 跳转到订阅页面
    router.push('/subscription-plans');
  }
};

export default errorHandler;