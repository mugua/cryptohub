import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh_CN.json';
import enUS from './locales/en_US.json';

const savedLanguage = localStorage.getItem('language') || 'zh_CN';

i18n.use(initReactI18next).init({
  resources: {
    zh_CN: { translation: zhCN },
    en_US: { translation: enUS },
  },
  lng: savedLanguage,
  fallbackLng: 'zh_CN',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
