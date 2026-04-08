export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/market/index',
    'pages/market-detail/index',
    'pages/trading/index',
    'pages/profile/index',
    'pages/login/index',
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#0B0E11',
    navigationBarTitleText: 'CryptoHub',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0B0E11',
  },
  tabBar: {
    color: '#848E9C',
    selectedColor: '#F0B90B',
    backgroundColor: '#0B0E11',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
      },
      {
        pagePath: 'pages/market/index',
        text: '市场',
      },
      {
        pagePath: 'pages/trading/index',
        text: '交易',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
      },
    ],
  },
});
