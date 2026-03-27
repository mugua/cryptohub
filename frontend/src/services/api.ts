import {
  Ticker, Candle, PortfolioSnapshot, AnalysisReport, Strategy,
  BacktestResult, ExchangeAccount, Order, SystemSettings,
  UserProfile, VipPlan, ExchangeApiConfig,
  TrendReport, DimensionScore, TrendSignal,
  TrendReportConfig, DimensionConfig,
} from '../types';

// ---------------------------------------------------------------------------
// Mock data generators – replace API base URL with real backend
// ---------------------------------------------------------------------------

const COINS = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX'];

function rnd(min: number, max: number) {
  return +(Math.random() * (max - min) + min).toFixed(4);
}

// ─── Market ─────────────────────────────────────────────────────────────────
export async function fetchTickers(): Promise<Ticker[]> {
  await delay(200);
  const prices: Record<string, number> = {
    BTC: 67420, ETH: 3540, BNB: 582, SOL: 178,
    XRP: 0.62, DOGE: 0.18, ADA: 0.48, AVAX: 41,
  };
  return COINS.map((c) => ({
    symbol: `${c}/USDT`,
    price: prices[c] * (1 + (Math.random() - 0.5) * 0.002),
    change24h: rnd(-500, 800),
    changePct24h: rnd(-3, 5),
    high24h: prices[c] * 1.03,
    low24h: prices[c] * 0.97,
    volume24h: rnd(1e8, 5e9),
    marketCap: prices[c] * rnd(1e7, 2e7),
  }));
}

export async function fetchCandles(
  symbol: string,
  interval = '1h',
  limit = 120,
): Promise<Candle[]> {
  await delay(300);
  const basePrices: Record<string, number> = {
    'BTC/USDT': 67420, 'ETH/USDT': 3540, 'BNB/USDT': 582,
    'SOL/USDT': 178, 'XRP/USDT': 0.62, 'DOGE/USDT': 0.18,
  };
  const base = basePrices[symbol] ?? 100;
  const candles: Candle[] = [];
  let price = base * 0.9;
  const now = Date.now();
  const intervalMs = interval === '1h' ? 3600000 : 86400000;
  for (let i = limit; i >= 0; i--) {
    const open = price;
    const change = (Math.random() - 0.48) * base * 0.015;
    const close = Math.max(open + change, 0.01);
    const high = Math.max(open, close) * (1 + Math.random() * 0.008);
    const low = Math.min(open, close) * (1 - Math.random() * 0.008);
    candles.push({
      time: now - i * intervalMs,
      open: +open.toFixed(4),
      high: +high.toFixed(4),
      low: +low.toFixed(4),
      close: +close.toFixed(4),
      volume: rnd(base * 500, base * 5000),
    });
    price = close;
  }
  return candles;
}

// ─── Portfolio ───────────────────────────────────────────────────────────────
export async function fetchPortfolio(): Promise<PortfolioSnapshot> {
  await delay(250);
  return {
    totalUsdValue: 98420.35,
    dailyPnl: 1248.6,
    dailyPnlPct: 1.28,
    assets: [
      { coin: 'BTC', balance: 1.24, available: 1.0, frozen: 0.24, usdValue: 83641 },
      { coin: 'ETH', balance: 3.5, available: 3.5, frozen: 0, usdValue: 12390 },
      { coin: 'USDT', balance: 2389.35, available: 2389.35, frozen: 0, usdValue: 2389.35 },
    ],
    positions: [
      {
        symbol: 'BTC/USDT',
        side: 'long',
        size: 0.5,
        entryPrice: 64800,
        markPrice: 67420,
        unrealizedPnl: 1310,
        leverage: 5,
      },
      {
        symbol: 'ETH/USDT',
        side: 'long',
        size: 2,
        entryPrice: 3400,
        markPrice: 3540,
        unrealizedPnl: 280,
        leverage: 3,
      },
    ],
  };
}

// ─── Analysis ────────────────────────────────────────────────────────────────
export async function fetchAnalysis(symbol: string): Promise<AnalysisReport> {
  await delay(400);
  const isBTC = symbol.startsWith('BTC');
  return {
    symbol,
    generatedAt: new Date().toISOString(),
    macro: {
      score: 62,
      inflationExpectation: 'moderate (3.2% YoY)',
      dollarIndex: 104.2,
      fearGreedIndex: 68,
      summary: '美联储降息预期增强，美元指数高位承压，宏观流动性趋于宽松，对风险资产整体利好。',
    },
    policy: {
      score: isBTC ? 55 : 40,
      recentEvents: [
        { date: '2026-03-20', country: '美国', title: 'SEC批准多只现货ETF申请', impact: 'positive' },
        { date: '2026-03-18', country: '欧盟', title: 'MiCA法规正式生效', impact: 'neutral' },
        { date: '2026-03-10', country: '中国香港', title: '虚拟资产交易平台监管细则更新', impact: 'neutral' },
      ],
      summary: '全球主要监管机构对加密市场态度趋于明朗，机构合规渠道持续拓展，长期利好市场发展。',
    },
    supplyDemand: {
      score: 72,
      exchangeNetflow: -12450,
      minersNetflow: -3200,
      whaleActivity: 'accumulating',
      summary: '链上数据显示大量比特币从交易所流出，鲸鱼地址持续积累，供给侧压力较低。',
    },
    sentiment: {
      score: 68,
      fearGreedIndex: 68,
      fearGreedLabel: '贪婪',
      twitterBullishPct: 72,
      redditSentiment: '偏多',
      summary: '市场情绪处于贪婪区间，散户FOMO情绪升温，需警惕短期回调风险。',
    },
    technical: {
      trend: 'uptrend',
      supportLevels: isBTC ? [65000, 63000, 60000] : [3400, 3200, 3000],
      resistanceLevels: isBTC ? [68000, 70000, 72000] : [3600, 3800, 4000],
      indicators: [
        { name: 'RSI(14)', value: 62.4, signal: 'neutral' },
        { name: 'MACD', value: '金叉', signal: 'buy' },
        { name: 'MA(20)', value: isBTC ? 65800 : 3480, signal: 'buy' },
        { name: 'MA(50)', value: isBTC ? 63200 : 3320, signal: 'buy' },
        { name: 'Bollinger', value: '中轨以上', signal: 'neutral' },
        { name: 'Stoch RSI', value: 74.2, signal: 'neutral' },
        { name: 'ADX', value: 32.1, signal: 'buy' },
        { name: 'Volume', value: '放量上涨', signal: 'buy' },
      ],
      summary: '价格位于多条均线之上，MACD出现金叉形态，整体技术面偏多，短期目标看向阻力位。',
    },
    summary: isBTC
      ? '综合宏观、政策、链上及技术面分析，BTC当前处于多头趋势中，建议逢低布局，目标看70000。'
      : 'ETH基本面持续向好，Layer2生态繁荣，技术面维持上升趋势，中期目标看4000。',
    signal: 'buy',
  };
}

// ─── Strategies ───────────────────────────────────────────────────────────────
export async function fetchStrategies(): Promise<Strategy[]> {
  await delay(200);
  return [
    {
      id: 's1', name: 'BTC 网格策略', type: 'grid', symbol: 'BTC/USDT',
      exchange: 'binance', status: 'running', pnl: 1248.6, pnlPct: 4.2,
      winRate: 68, totalTrades: 142, createdAt: '2026-01-10T08:00:00Z',
      lastRunAt: new Date().toISOString(), params: { lower: 60000, upper: 70000, grids: 20 },
    },
    {
      id: 's2', name: 'ETH DCA策略', type: 'dca', symbol: 'ETH/USDT',
      exchange: 'okx', status: 'running', pnl: 420.8, pnlPct: 2.8,
      winRate: 72, totalTrades: 36, createdAt: '2026-01-15T10:00:00Z',
      lastRunAt: new Date().toISOString(), params: { amount: 100, interval: '1d' },
    },
    {
      id: 's3', name: 'MACD趋势跟踪', type: 'macd_crossover', symbol: 'BTC/USDT',
      exchange: 'binance', status: 'stopped', pnl: -180.2, pnlPct: -1.2,
      winRate: 45, totalTrades: 28, createdAt: '2026-02-01T09:00:00Z',
      params: { fast: 12, slow: 26, signal: 9 },
    },
    {
      id: 's4', name: 'SOL RSI反转', type: 'rsi_reversal', symbol: 'SOL/USDT',
      exchange: 'bybit', status: 'running', pnl: 312.5, pnlPct: 6.2,
      winRate: 60, totalTrades: 55, createdAt: '2026-02-20T07:00:00Z',
      lastRunAt: new Date().toISOString(), params: { period: 14, oversold: 30, overbought: 70 },
    },
    {
      id: 's5', name: '布林带震荡', type: 'bollinger_bands', symbol: 'ETH/USDT',
      exchange: 'binance', status: 'backtesting', pnl: 0, pnlPct: 0,
      winRate: 0, totalTrades: 0, createdAt: '2026-03-20T12:00:00Z',
      params: { period: 20, stdDev: 2 },
    },
    {
      id: 's6', name: '海龟交易系统', type: 'turtle_trading', symbol: 'BTC/USDT',
      exchange: 'okx', status: 'stopped', pnl: 892.4, pnlPct: 8.9,
      winRate: 38, totalTrades: 18, createdAt: '2025-12-01T00:00:00Z',
      params: { entryPeriod: 20, exitPeriod: 10, atrMultiplier: 2 },
    },
  ];
}

export async function fetchBacktestResult(strategyId: string): Promise<BacktestResult> {
  await delay(600);
  const curve: { time: string; value: number }[] = [];
  let v = 10000;
  for (let i = 0; i < 180; i++) {
    v *= 1 + (Math.random() - 0.46) * 0.02;
    const d = new Date(2025, 9, 1);
    d.setDate(d.getDate() + i);
    curve.push({ time: d.toISOString().split('T')[0], value: +v.toFixed(2) });
  }
  return {
    strategyId,
    startDate: '2025-10-01',
    endDate: '2026-03-25',
    initialCapital: 10000,
    finalCapital: v,
    totalReturn: +((v / 10000 - 1) * 100).toFixed(2),
    annualizedReturn: +((v / 10000 - 1) * 200).toFixed(2),
    maxDrawdown: rnd(8, 22),
    sharpeRatio: rnd(1.2, 2.8),
    winRate: rnd(42, 68),
    totalTrades: Math.floor(rnd(60, 200)),
    profitableTrades: Math.floor(rnd(30, 110)),
    equityCurve: curve,
  };
}

// ─── Exchanges ────────────────────────────────────────────────────────────────
export async function fetchExchangeAccounts(): Promise<ExchangeAccount[]> {
  await delay(200);
  return [
    {
      id: 'e1', exchange: 'binance', label: '主账户 (Binance)',
      apiKey: 'xxxxxx****xxxx', isConnected: true,
      permissions: ['read', 'trade'], createdAt: '2025-11-01T00:00:00Z',
      lastSyncAt: new Date().toISOString(),
    },
    {
      id: 'e2', exchange: 'okx', label: 'OKX 量化账户',
      apiKey: 'yyyyyy****yyyy', isConnected: true,
      permissions: ['read', 'trade', 'withdraw'], createdAt: '2025-12-15T00:00:00Z',
      lastSyncAt: new Date().toISOString(),
    },
    {
      id: 'e3', exchange: 'bybit', label: 'Bybit 合约',
      apiKey: 'zzzzzz****zzzz', isConnected: false,
      permissions: ['read'], createdAt: '2026-01-20T00:00:00Z',
    },
  ];
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export async function fetchOrders(): Promise<Order[]> {
  await delay(200);
  const symbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'];
  const statuses: Order['status'][] = ['filled', 'filled', 'open', 'cancelled', 'partially_filled'];
  return Array.from({ length: 20 }, (_, i) => ({
    id: `ord${i + 1}`,
    exchange: i % 2 === 0 ? 'binance' : 'okx',
    symbol: symbols[i % 3],
    side: i % 2 === 0 ? 'buy' : 'sell',
    type: i % 3 === 0 ? 'limit' : 'market',
    price: i % 3 === 0 ? rnd(60000, 70000) : undefined,
    quantity: rnd(0.01, 0.5),
    filledQuantity: rnd(0, 0.5),
    status: statuses[i % statuses.length],
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - i * 1800000).toISOString(),
  }));
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export async function fetchSettings(): Promise<SystemSettings> {
  await delay(100);
  return {
    language: 'zh_CN',
    theme: 'dark',
    currency: 'USD',
    notifications: {
      email: true,
      emailAddress: 'user@example.com',
      telegram: false,
      pushEnabled: true,
      priceAlerts: true,
      strategyAlerts: true,
      orderAlerts: true,
    },
    risk: {
      maxPositionSizeUsd: 10000,
      maxDailyLossUsd: 2000,
      maxDrawdownPct: 15,
      stopLossPct: 5,
    },
  };
}

// ─── User / Auth ──────────────────────────────────────────────────────────────

const ADMIN_EMAIL = 'admin@cryptohub.io';
const ADMIN_PASSWORD = '123456';

const MOCK_USERS: { email: string; password: string; profile: UserProfile }[] = [
  {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    profile: {
      id: 'u1',
      email: ADMIN_EMAIL,
      nickname: 'CryptoMaster',
      phone: '+86 138****8888',
      role: 'admin',
      isVerified: true,
      createdAt: '2025-10-01T00:00:00Z',
      lastLoginAt: new Date().toISOString(),
      loginMethod: 'email',
    },
  },
];

function getMockUsers() {
  const saved = localStorage.getItem('cryptohub_mock_users');
  if (saved) return JSON.parse(saved) as typeof MOCK_USERS;
  return MOCK_USERS;
}

function saveMockUsers(users: typeof MOCK_USERS) {
  localStorage.setItem('cryptohub_mock_users', JSON.stringify(users));
}

export async function loginByPassword(email: string, password: string): Promise<{ success: boolean; token?: string; user?: UserProfile; message?: string }> {
  await delay(400);
  const users = getMockUsers();
  const found = users.find((u) => u.email === email && u.password === password);
  if (found) {
    found.profile.lastLoginAt = new Date().toISOString();
    return { success: true, token: 'mock-jwt-' + Date.now(), user: found.profile };
  }
  return { success: false, message: 'auth.invalidCredentials' };
}

export async function registerByEmail(email: string, password: string, _code: string): Promise<{ success: boolean; token?: string; user?: UserProfile; message?: string }> {
  await delay(500);
  const users = getMockUsers();
  if (users.find((u) => u.email === email)) {
    return { success: false, message: 'auth.emailExists' };
  }
  const newUser: UserProfile = {
    id: `u${Date.now()}`,
    email,
    nickname: email.split('@')[0],
    role: 'user',
    isVerified: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    loginMethod: 'email',
  };
  users.push({ email, password, profile: newUser });
  saveMockUsers(users);
  return { success: true, token: 'mock-jwt-' + Date.now(), user: newUser };
}

export async function resetPassword(email: string, _code: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
  await delay(400);
  const users = getMockUsers();
  const found = users.find((u) => u.email === email);
  if (!found) {
    return { success: false, message: 'auth.emailNotFound' };
  }
  found.password = newPassword;
  saveMockUsers(users);
  return { success: true };
}

export async function fetchUserProfile(): Promise<UserProfile> {
  await delay(200);
  return {
    id: 'u1',
    email: 'admin@cryptohub.io',
    nickname: 'CryptoMaster',
    phone: '+86 138****8888',
    role: 'admin',
    isVerified: true,
    createdAt: '2025-10-01T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
    loginMethod: 'email',
  };
}

export async function sendVerificationCode(_email: string): Promise<{ success: boolean }> {
  await delay(500);
  return { success: true };
}

export async function verifyCode(_email: string, _code: string): Promise<{ success: boolean; token: string }> {
  await delay(500);
  return { success: true, token: 'mock-jwt-token' };
}

export async function registerUser(_email: string, _code: string, _password: string): Promise<{ success: boolean }> {
  await delay(500);
  return { success: true };
}

export async function loginWithThirdParty(_provider: 'google' | 'github'): Promise<{ success: boolean; redirectUrl: string }> {
  await delay(300);
  return {
    success: true,
    redirectUrl: _provider === 'google'
      ? 'https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=...'
      : 'https://github.com/login/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=...',
  };
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<{ success: boolean }> {
  await delay(300);
  console.log('Profile updated:', profile);
  return { success: true };
}

export async function fetchVipPlans(): Promise<VipPlan[]> {
  await delay(200);
  return [
    {
      level: 'vip1',
      name: 'VIP 1',
      priceUsdt: 29.9,
      duration: '30 days',
      features: ['realTimeData', 'basicIndicators', 'fiveStrategies', 'emailSupport'],
    },
    {
      level: 'vip2',
      name: 'VIP 2',
      priceUsdt: 99.9,
      duration: '30 days',
      features: ['allVip1', 'advancedIndicators', 'twentyStrategies', 'prioritySupport', 'backtesting'],
    },
    {
      level: 'vip3',
      name: 'VIP 3',
      priceUsdt: 299.9,
      duration: '30 days',
      features: ['allVip2', 'unlimitedStrategies', 'apiAccess', 'dedicatedSupport', 'customStrategy'],
    },
  ];
}

// ─── Exchange API Config ──────────────────────────────────────────────────────
export async function fetchExchangeApiConfigs(): Promise<ExchangeApiConfig[]> {
  await delay(200);
  return [
    {
      id: 'cfg1', exchange: 'binance', label: 'Binance Main',
      apiKey: '', secretKey: '', isEnabled: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'cfg2', exchange: 'okx', label: 'OKX Trading',
      apiKey: '', secretKey: '', passphrase: '', isEnabled: false,
      createdAt: '2026-02-01T00:00:00Z',
    },
  ];
}

export async function saveExchangeApiConfig(_config: Partial<ExchangeApiConfig>): Promise<{ success: boolean }> {
  await delay(300);
  return { success: true };
}

// ─── Trend Report ─────────────────────────────────────────────────────────────

const DEFAULT_TREND_CONFIG: TrendReportConfig = {
  dimensions: [
    {
      name: 'macro', baseWeight: 0.20, enabled: true,
      subItems: [
        { name: 'FRED', weight: 0.25, dataSource: 'FRED (美联储经济数据)', dataDescription: '利率、通胀率、CPI、失业率、GDP', apiType: 'REST API', apiEndpoint: 'api.stlouisfed.org/fred', enabled: true },
        { name: 'TradingEconomics', weight: 0.25, dataSource: 'TradingEconomics', dataDescription: '全球宏观经济指标', apiType: 'REST API', apiEndpoint: 'tradingeconomics.com/api', enabled: true },
        { name: 'Quandl/Nasdaq', weight: 0.20, dataSource: 'Quandl/Nasdaq Data Link', dataDescription: '金融经济数据集', apiType: 'REST API', apiEndpoint: 'data.nasdaq.com/api', enabled: true },
        { name: 'WorldBank', weight: 0.15, dataSource: 'World Bank Open Data', dataDescription: '全球经济指标', apiType: 'REST API', apiEndpoint: 'api.worldbank.org/v2', enabled: true },
        { name: 'IMF', weight: 0.15, dataSource: 'IMF Data', dataDescription: '国际货币基金组织数据', apiType: 'REST API', apiEndpoint: 'data.imf.org/api', enabled: true },
      ],
    },
    {
      name: 'policy', baseWeight: 0.25, enabled: true,
      subItems: [
        { name: 'SEC_EDGAR', weight: 0.20, dataSource: 'SEC EDGAR', dataDescription: 'SEC公告、注册文件', apiType: 'REST API', apiEndpoint: 'www.sec.gov/cgi-bin/browse-edgar', enabled: true },
        { name: 'CryptoRegulations', weight: 0.20, dataSource: 'CryptoRegulations.org', dataDescription: '全球加密货币监管状态', apiType: 'REST API', apiEndpoint: '需申请', enabled: true },
        { name: 'CoinDesk', weight: 0.20, dataSource: 'CoinDesk API', dataDescription: '监管新闻、政策动态', apiType: 'REST API', apiEndpoint: 'data-api.coindesk.com', enabled: true },
        { name: 'Cointelegraph', weight: 0.20, dataSource: 'Cointelegraph API', dataDescription: '政策法规新闻', apiType: 'RSS/JSON', apiEndpoint: 'cointelegraph.com/rss', enabled: true },
        { name: 'GovAnnouncements', weight: 0.20, dataSource: '官方政府公报', dataDescription: '美国、中国、欧盟、韩国央行/财政部公告', apiType: 'Scraper', apiEndpoint: '需爬虫 自建RSS解析', enabled: true },
      ],
    },
    {
      name: 'supply_demand', baseWeight: 0.25, enabled: true,
      subItems: [
        { name: 'Glassnode', weight: 0.20, dataSource: 'Glassnode', dataDescription: '链上指标、交易所余额、持仓分布', apiType: 'REST API', apiEndpoint: 'api.glassnode.com', enabled: true },
        { name: 'CryptoQuant', weight: 0.20, dataSource: 'CryptoQuant', dataDescription: '交易所资金流动、矿工数据', apiType: 'REST API', apiEndpoint: 'api.cryptoquant.com', enabled: true },
        { name: 'CoinMetrics', weight: 0.15, dataSource: 'Coin Metrics', dataDescription: '全链数据分析', apiType: 'REST API', apiEndpoint: 'api.coinmetrics.io', enabled: true },
        { name: 'Santiment', weight: 0.15, dataSource: 'Santiment', dataDescription: '社交+链上数据', apiType: 'GraphQL API', apiEndpoint: 'api.santiment.net', enabled: true },
        { name: 'Messari', weight: 0.15, dataSource: 'Messari', dataDescription: '资产指标、交易所数据', apiType: 'REST API', apiEndpoint: 'data.messari.io/api', enabled: true },
        { name: 'BlockchainDotCom', weight: 0.15, dataSource: 'Blockchain.com API', dataDescription: '区块链原始数据', apiType: 'REST API', apiEndpoint: 'api.blockchain.info', enabled: true },
      ],
    },
    {
      name: 'sentiment', baseWeight: 0.15, enabled: true,
      subItems: [
        { name: 'FearGreed', weight: 0.20, dataSource: 'Alternative.me (Fear & Greed Index)', dataDescription: '恐惧贪婪指数', apiType: 'JSON API', apiEndpoint: 'api.alternative.me/fng', enabled: true },
        { name: 'LunarCrush', weight: 0.20, dataSource: 'LunarCrush', dataDescription: '社交媒体情绪、影响力排名', apiType: 'REST API', apiEndpoint: 'lunarcrush.com/api', enabled: true },
        { name: 'SantimentSocial', weight: 0.15, dataSource: 'Santiment', dataDescription: '加权社交情绪', apiType: 'GraphQL API', apiEndpoint: 'api.santiment.net', enabled: true },
        { name: 'TheTIE', weight: 0.15, dataSource: 'The TIE', dataDescription: '机构投资者情绪', apiType: 'REST API', apiEndpoint: 'thetie.io/api', enabled: true },
        { name: 'Twitter', weight: 0.10, dataSource: 'Twitter API v2', dataDescription: '社交推文情感分析', apiType: 'REST API', apiEndpoint: 'api.twitter.com/2', enabled: true },
        { name: 'Reddit', weight: 0.10, dataSource: 'Reddit API', dataDescription: '加密货币板块情绪', apiType: 'REST API', apiEndpoint: 'www.reddit.com/dev/api', enabled: true },
        { name: 'GoogleTrends', weight: 0.10, dataSource: 'Google Trends API', dataDescription: '搜索热度趋势', apiType: 'Scraper', apiEndpoint: 'trends.google.com/trends/explore', enabled: true },
      ],
    },
    {
      name: 'technical', baseWeight: 0.15, enabled: true,
      subItems: [
        { name: 'OKX_Binance', weight: 0.25, dataSource: 'OKX/Binance API', dataDescription: 'K线、交易量、深度图', apiType: 'REST/WebSocket', apiEndpoint: 'api.okx.com;api.binance.com', enabled: true },
        { name: 'CoinGecko', weight: 0.25, dataSource: 'CoinGecko', dataDescription: '价格、市值、历史数据', apiType: 'REST API', apiEndpoint: 'api.coingecko.com', enabled: true },
        { name: 'CoinMarketCap', weight: 0.20, dataSource: 'CoinMarketCap', dataDescription: '市场数据、历史价格', apiType: 'REST API', apiEndpoint: 'pro-api.coinmarketcap.com', enabled: true },
        { name: 'CryptoCompare', weight: 0.15, dataSource: 'CryptoCompare', dataDescription: '多交易所OHLCV数据', apiType: 'REST/WebSocket', apiEndpoint: 'min-api.cryptocompare.com', enabled: true },
        { name: 'TradingView', weight: 0.15, dataSource: 'TradingView (UNOFFICIAL)', dataDescription: '图表数据', apiType: 'Scraper', apiEndpoint: 'pine_fetch() 或爬虫', enabled: true },
      ],
    },
  ],
  boostFactor: 0.8,
};

export function getTrendReportConfig(): TrendReportConfig {
  const saved = localStorage.getItem('cryptohub_trend_config');
  if (saved) {
    return JSON.parse(saved);
  }
  return DEFAULT_TREND_CONFIG;
}

export async function fetchTrendReportConfig(): Promise<TrendReportConfig> {
  await delay(100);
  return getTrendReportConfig();
}

export async function saveTrendReportConfig(config: TrendReportConfig): Promise<{ success: boolean }> {
  await delay(200);
  localStorage.setItem('cryptohub_trend_config', JSON.stringify(config));
  return { success: true };
}

function normaliseScore(raw: number, lo = -100, hi = 100): number {
  const clamped = Math.max(lo, Math.min(hi, raw));
  return +((clamped - lo) / (hi - lo) * 2 - 1).toFixed(4);
}

function severityFromScore(s: number): number {
  return +Math.min(Math.abs(s) / 100, 1).toFixed(4);
}

function computeTrend(dims: DimensionScore[], boostMul: number): { compositeScore: number; signal: TrendSignal } {
  const adjusted = dims.map(d => d.baseWeight * (1 + d.severity * boostMul));
  const total = adjusted.reduce((a, b) => a + b, 0);
  const norm = total === 0 ? dims.map(() => 1 / dims.length) : adjusted.map(w => w / total);
  dims.forEach((d, i) => { d.adjustedWeight = +norm[i].toFixed(4); });
  let composite = dims.reduce((acc, d) => acc + d.rawScore * d.adjustedWeight, 0);
  composite = +Math.max(-1, Math.min(1, composite)).toFixed(4);
  let signal: TrendSignal = 'neutral';
  if (composite >= 0.5) signal = 'strong_bullish';
  else if (composite >= 0.2) signal = 'mild_bullish';
  else if (composite > -0.2) signal = 'neutral';
  else if (composite > -0.5) signal = 'mild_bearish';
  else signal = 'strong_bearish';
  return { compositeScore: composite, signal };
}

export async function fetchTrendReport(symbol: string): Promise<TrendReport> {
  await delay(500);
  const config = getTrendReportConfig();
  const isBTC = symbol.startsWith('BTC');
  const rawMacro = 62;
  const rawPolicy = isBTC ? 55 : 40;
  const rawSupply = 72;
  const rawSentiment = 68;
  const rawTechnical = 65;

  const rawScores: Record<string, number> = {
    macro: rawMacro,
    policy: rawPolicy,
    supply_demand: rawSupply,
    sentiment: rawSentiment,
    technical: rawTechnical,
  };

  const summaries: Record<string, string> = {
    macro: '美联储降息预期增强，宏观流动性趋于宽松，对风险资产整体利好。',
    policy: '全球主要监管机构对加密市场态度趋于明朗，机构合规渠道持续拓展。',
    supply_demand: '链上数据显示大量比特币从交易所流出，鲸鱼地址持续积累。',
    sentiment: '市场情绪处于贪婪区间，散户FOMO情绪升温，需警惕短期回调风险。',
    technical: '价格位于多条均线之上，MACD出现金叉，整体技术面偏多。',
  };

  const dims: DimensionScore[] = config.dimensions
    .filter((d: DimensionConfig) => d.enabled)
    .map((d: DimensionConfig) => ({
      name: d.name,
      rawScore: normaliseScore(rawScores[d.name] ?? 50),
      baseWeight: d.baseWeight,
      adjustedWeight: 0,
      severity: severityFromScore(rawScores[d.name] ?? 50),
      summary: summaries[d.name] ?? '',
    }));

  const { compositeScore, signal } = computeTrend(dims, config.boostFactor);

  return {
    symbol,
    generatedAt: new Date().toISOString(),
    compositeScore,
    signal,
    dimensions: dims,
    summary: `综合宏观、政策、链上、情绪及技术面五大维度加权分析，当前综合趋势得分 ${compositeScore > 0 ? '+' : ''}${compositeScore.toFixed(2)}，建议关注关键支撑阻力位变化。`,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
