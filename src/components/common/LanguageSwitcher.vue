<template>
  <div class="language-switcher">
    <button
      class="language-btn"
      :class="{ 'active': currentLocale === 'zh' }"
      @click="changeLanguage('zh')"
    >
      中文
    </button>
    <button
      class="language-btn"
      :class="{ 'active': currentLocale === 'en' }"
      @click="changeLanguage('en')"
    >
      English
    </button>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'LanguageSwitcher',

  setup() {
    const i18n = useI18n()

    const currentLocale = computed(() => i18n.locale.value)

    const changeLanguage = (lang) => {
      i18n.locale.value = lang
      localStorage.setItem('locale', lang)
      console.log('Language changed to:', lang) // 调试用
    }

    return {
      currentLocale,
      changeLanguage
    }
  }
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
}

.language-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 10px;
  margin: 0 5px;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s;
}

.language-btn.active {
  opacity: 1;
  font-weight: bold;
  background-color: #f0f0f0;
}

.language-btn:hover {
  opacity: 1;
}
</style>