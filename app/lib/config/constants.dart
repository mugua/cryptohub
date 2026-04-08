class AppConstants {
  AppConstants._();

  // API
  static const String baseUrl = 'https://api.cryptohub.com/v1';
  static const String wsUrl = 'wss://ws.cryptohub.com/v1/stream';

  // Endpoints
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String profileEndpoint = '/auth/profile';
  static const String marketSummaryEndpoint = '/market/summary';
  static const String trendEndpoint = '/market/trend';
  static const String reportEndpoint = '/market/report';
  static const String ordersEndpoint = '/trading/orders';
  static const String strategiesEndpoint = '/trading/strategies';

  // Supported coins
  static const List<String> supportedCoins = [
    'BTC', 'ETH', 'BNB', 'SOL', 'XRP',
    'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC',
    'LINK', 'UNI', 'ATOM', 'LTC', 'FIL',
    'APT', 'ARB', 'OP', 'NEAR', 'SUI',
  ];

  // Coin full names
  static const Map<String, String> coinNames = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'BNB': 'BNB',
    'SOL': 'Solana',
    'XRP': 'XRP',
    'ADA': 'Cardano',
    'DOGE': 'Dogecoin',
    'AVAX': 'Avalanche',
    'DOT': 'Polkadot',
    'MATIC': 'Polygon',
    'LINK': 'Chainlink',
    'UNI': 'Uniswap',
    'ATOM': 'Cosmos',
    'LTC': 'Litecoin',
    'FIL': 'Filecoin',
    'APT': 'Aptos',
    'ARB': 'Arbitrum',
    'OP': 'Optimism',
    'NEAR': 'NEAR Protocol',
    'SUI': 'Sui',
  };

  // Supported exchanges
  static const List<String> supportedExchanges = [
    'Binance',
    'OKX',
    'Bybit',
    'Coinbase',
    'Kraken',
    'Bitget',
    'Gate.io',
    'KuCoin',
  ];

  // Order types
  static const List<String> orderTypes = [
    'Market',
    'Limit',
    'Stop-Limit',
    'Trailing-Stop',
  ];

  // Strategy types
  static const List<String> strategyTypes = [
    'Grid',
    'DCA',
    'Arbitrage',
    'Trend-Following',
    'Mean-Reversion',
  ];

  // Timeframes
  static const List<String> timeframes = [
    '1m', '5m', '15m', '1h', '4h', '1d', '1w',
  ];

  // Leverage options
  static const List<int> leverageOptions = [1, 2, 3, 5, 10, 20, 50, 100];

  // Storage keys
  static const String tokenKey = 'auth_token';
  static const String themeKey = 'theme_mode';
  static const String localeKey = 'locale';
}
