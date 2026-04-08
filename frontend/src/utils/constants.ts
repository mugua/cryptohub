export const COINS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'BNB', name: 'BNB' },
  { symbol: 'XRP', name: 'XRP' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'DOGE', name: 'Dogecoin' },
  { symbol: 'AVAX', name: 'Avalanche' },
] as const;

export const EXCHANGES = [
  { value: 'binance', label: 'Binance' },
  { value: 'okx', label: 'OKX' },
  { value: 'bybit', label: 'Bybit' },
  { value: 'huobi', label: 'Huobi' },
  { value: 'gate', label: 'Gate.io' },
] as const;

export const ORDER_TYPES = [
  { value: 'market', label: 'Market' },
  { value: 'limit', label: 'Limit' },
] as const;

export const STRATEGY_TYPES = [
  { value: 'grid', label: 'Grid Trading' },
  { value: 'dca', label: 'DCA' },
  { value: 'trend', label: 'Trend Following' },
  { value: 'arbitrage', label: 'Arbitrage' },
] as const;
