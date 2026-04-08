import { createStore } from './index';

export interface CoinData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  icon?: string;
}

interface MarketState {
  coins: CoinData[];
  loading: boolean;
}

export const marketStore = createStore<MarketState>({
  coins: [],
  loading: false,
});

export function setCoins(coins: CoinData[]): void {
  marketStore.setState({ coins });
}

export function setLoading(loading: boolean): void {
  marketStore.setState({ loading });
}
