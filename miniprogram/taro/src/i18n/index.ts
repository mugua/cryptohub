type LangKey = 'zh-CN' | 'en-US'

const translations: Record<LangKey, Record<string, string>> = {
  'zh-CN': {
    'nav.dashboard': '首页',
    'nav.analysis': '分析',
    'nav.trading': '交易',
    'nav.profile': '我的',
    'nav.settings': '设置',
    'dashboard.total_assets': '总资产',
    'analysis.trend_score': '趋势得分',
    'trading.buy': '买入',
    'trading.sell': '卖出',
  },
  'en-US': {
    'nav.dashboard': 'Dashboard',
    'nav.analysis': 'Analysis',
    'nav.trading': 'Trading',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'dashboard.total_assets': 'Total Assets',
    'analysis.trend_score': 'Trend Score',
    'trading.buy': 'Buy',
    'trading.sell': 'Sell',
  },
}

let currentLang: LangKey = 'en-US'

export function setLang(lang: LangKey) { currentLang = lang }
export function t(key: string): string { return translations[currentLang]?.[key] ?? key }
