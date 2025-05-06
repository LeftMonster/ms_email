import { createI18n } from 'vue-i18n';
import en from './locales/en';
import zh from './locales/zh';

const messages = {
  en,
  zh
};

// 浏览器语言检测 - 默认为中文
const defaultLocale = localStorage.getItem('locale') ||
  (navigator.language && navigator.language.includes('zh') ? 'zh' : 'en');

const i18n = createI18n({
  legacy: false, // 使用Vue 3的组合API模式
  locale: defaultLocale,
  fallbackLocale: 'zh',
  messages,
  globalInjection: true, // 确保添加这一行，将$t注入所有组件
  warnHtmlMessage: false // 可选：禁用HTML消息警告
});

export default i18n;