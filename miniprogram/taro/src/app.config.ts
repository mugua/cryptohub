export default defineAppConfig({
  pages: [
    'pages/dashboard/index',
    'pages/analysis/index',
    'pages/trading/index',
    'pages/profile/index',
    'pages/settings/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1E293B',
    navigationBarTitleText: 'CryptoHub',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#3B82F6',
    backgroundColor: '#1E293B',
    list: [
      { pagePath: 'pages/dashboard/index', text: '首页' },
      { pagePath: 'pages/analysis/index', text: '分析' },
      { pagePath: 'pages/trading/index', text: '交易' },
      { pagePath: 'pages/profile/index', text: '我的' },
      { pagePath: 'pages/settings/index', text: '设置' },
    ],
  },
})
