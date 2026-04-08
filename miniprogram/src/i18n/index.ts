import Taro from '@tarojs/taro';
import zhCN from './zh-CN';
import enUS from './en-US';

type LangKey = keyof typeof zhCN;

const locales: Record<string, Record<string, string>> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

let currentLocale = 'zh-CN';

export function getLocale(): string {
  try {
    const systemInfo = Taro.getSystemInfoSync();
    const lang = systemInfo.language || 'zh-CN';
    if (lang.startsWith('en')) {
      currentLocale = 'en-US';
    } else {
      currentLocale = 'zh-CN';
    }
  } catch {
    currentLocale = 'zh-CN';
  }
  return currentLocale;
}

export function setLocale(locale: string): void {
  if (locales[locale]) {
    currentLocale = locale;
    Taro.setStorageSync('locale', locale);
  }
}

export function t(key: string): string {
  const stored = Taro.getStorageSync('locale');
  const lang = stored || currentLocale;
  const messages = locales[lang] || locales['zh-CN'];
  return messages[key] || key;
}

getLocale();
