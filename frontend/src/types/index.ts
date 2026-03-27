// ─── Market & Asset Types ────────────────────────────────────────────────────
export interface Ticker {
  symbol: string;
  price: number;
  change24h: number;
  changePct24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap?: number;
}

export interface Candle {
  time: number;   // unix ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBook {
  bids: [number, number][]; // [price, qty]
  asks: [number, number][];
  timestamp: number;
}

// ─── Portfolio / Account ─────────────────────────────────────────────────────
export interface Asset {
  coin: string;
  balance: number;
  available: number;
  frozen: number;
  usdValue: number;
}

export interface Position {
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  leverage: number;
}

export interface PortfolioSnapshot {
  totalUsdValue: number;
  dailyPnl: number;
  dailyPnlPct: number;
  assets: Asset[];
  positions: Position[];
}

// ─── Analysis ────────────────────────────────────────────────────────────────
export interface AnalysisReport {
  symbol: string;
  generatedAt: string;
  macro: MacroAnalysis;
  policy: PolicyAnalysis;
  supplyDemand: SupplyDemandAnalysis;
  sentiment: SentimentAnalysis;
  technical: TechnicalAnalysis;
  summary: string;
  signal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
}

// ─── Trend Report ────────────────────────────────────────────────────────────
export type TrendSignal =
  | 'strong_bullish'
  | 'mild_bullish'
  | 'neutral'
  | 'mild_bearish'
  | 'strong_bearish';

export interface DimensionScore {
  name: string;
  rawScore: number;       // -1 to 1
  baseWeight: number;     // 0 to 1
  adjustedWeight: number; // 0 to 1
  severity: number;       // 0 to 1
  summary: string;
}

export interface TrendReport {
  symbol: string;
  generatedAt: string;
  compositeScore: number; // -1 to 1
  signal: TrendSignal;
  dimensions: DimensionScore[];
  summary: string;
}

export interface MacroAnalysis {
  score: number; // -100 to 100
  inflationExpectation: string;
  dollarIndex: number;
  fearGreedIndex: number;
  summary: string;
}

export interface PolicyAnalysis {
  score: number;
  recentEvents: PolicyEvent[];
  summary: string;
}

export interface PolicyEvent {
  date: string;
  country: string;
  title: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface SupplyDemandAnalysis {
  score: number;
  exchangeNetflow: number; // negative = coins leaving exchanges (bullish)
  minersNetflow: number;
  whaleActivity: 'accumulating' | 'distributing' | 'neutral';
  summary: string;
}

export interface SentimentAnalysis {
  score: number;
  fearGreedIndex: number;
  fearGreedLabel: string;
  twitterBullishPct: number;
  redditSentiment: string;
  summary: string;
}

export interface TechnicalAnalysis {
  trend: 'uptrend' | 'downtrend' | 'sideways';
  supportLevels: number[];
  resistanceLevels: number[];
  indicators: TechnicalIndicator[];
  summary: string;
}

export interface TechnicalIndicator {
  name: string;
  value: number | string;
  signal: 'buy' | 'sell' | 'neutral';
}

// ─── Strategy ────────────────────────────────────────────────────────────────
export type StrategyStatus = 'running' | 'stopped' | 'backtesting' | 'error';

export interface Strategy {
  id: string;
  name: string;
  type: StrategyType;
  symbol: string;
  exchange: string;
  status: StrategyStatus;
  pnl: number;
  pnlPct: number;
  winRate: number;
  totalTrades: number;
  params: Record<string, unknown>;
  createdAt: string;
  lastRunAt?: string;
}

export type StrategyType =
  | 'grid'
  | 'dca'
  | 'momentum'
  | 'mean_reversion'
  | 'arbitrage'
  | 'macd_crossover'
  | 'rsi_reversal'
  | 'bollinger_bands'
  | 'turtle_trading'
  | 'custom';

export interface BacktestResult {
  strategyId: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
  profitableTrades: number;
  equityCurve: { time: string; value: number }[];
}

// ─── Exchange / API Key ───────────────────────────────────────────────────────
export type ExchangeName = 'binance' | 'okx' | 'bybit' | 'coinbase' | 'kraken' | 'gate' | 'huobi';

export interface ExchangeAccount {
  id: string;
  exchange: ExchangeName;
  label: string;
  apiKey: string;
  isConnected: boolean;
  permissions: string[];
  createdAt: string;
  lastSyncAt?: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop_limit' | 'trailing_stop';
export type OrderStatus = 'open' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected';

export interface Order {
  id: string;
  exchange: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price?: number;
  quantity: number;
  filledQuantity: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── User / Auth Types ───────────────────────────────────────────────────────
export type UserRole = 'user' | 'vip1' | 'vip2' | 'vip3' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  loginMethod: 'email' | 'google' | 'github';
}

export interface VipPlan {
  level: UserRole;
  name: string;
  priceUsdt: number;
  duration: string;
  features: string[];
}

export interface ExchangeApiConfig {
  id: string;
  exchange: ExchangeName;
  label: string;
  apiKey: string;
  secretKey: string;
  passphrase?: string;
  isEnabled: boolean;
  createdAt: string;
}

// ─── Trend Report Config ──────────────────────────────────────────────────────
export interface SubItemConfig {
  name: string;
  weight: number;         // 0 to 1 within its parent dimension
  dataSource: string;     // e.g. "FRED", "Glassnode"
  dataDescription: string;
  apiType: string;        // e.g. "REST API", "GraphQL API", "WebSocket", "RSS/JSON", "Scraper"
  apiEndpoint: string;    // e.g. "api.stlouisfed.org/fred"
  enabled: boolean;
}

export interface DimensionConfig {
  name: string;
  baseWeight: number;
  enabled: boolean;
  subItems?: SubItemConfig[];
  /** Per-coin quantitative factors, keyed by normalised coin symbol (e.g. "BTC", "ETH"). */
  coinSpecificItems?: Record<string, SubItemConfig[]>;
}

export interface TrendReportConfig {
  dimensions: DimensionConfig[];
  boostFactor: number;
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export interface SystemSettings {
  language: 'zh_CN' | 'en_US';
  theme: 'dark' | 'light';
  currency: 'USD' | 'CNY' | 'EUR';
  notifications: NotificationSettings;
  risk: RiskSettings;
}

export interface NotificationSettings {
  email: boolean;
  emailAddress?: string;
  telegram: boolean;
  telegramToken?: string;
  pushEnabled: boolean;
  priceAlerts: boolean;
  strategyAlerts: boolean;
  orderAlerts: boolean;
}

export interface RiskSettings {
  maxPositionSizeUsd: number;
  maxDailyLossUsd: number;
  maxDrawdownPct: number;
  stopLossPct: number;
}
