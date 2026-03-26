import {
  Ticker, Candle, PortfolioSnapshot, AnalysisReport, Strategy,
  BacktestResult, ExchangeAccount, Order, SystemSettings,
  UserProfile, VipPlan, ExchangeApiConfig,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
