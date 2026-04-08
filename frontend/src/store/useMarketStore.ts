import { create } from 'zustand';

export interface CoinData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  sparkline: number[];
}

interface MarketState {
  coins: CoinData[];
  loading: boolean;
  fetchMarket: () => void;
}

const mockCoins: CoinData[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 104250.32,
    change24h: 2.35,
    volume: 28_500_000_000,
    marketCap: 2_050_000_000_000,
    sparkline: [101200, 101800, 102500, 101900, 103200, 103800, 104250],
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3842.18,
    change24h: -1.24,
    volume: 15_200_000_000,
    marketCap: 462_000_000_000,
    sparkline: [3920, 3880, 3850, 3810, 3790, 3830, 3842],
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    price: 178.45,
    change24h: 5.67,
    volume: 3_800_000_000,
    marketCap: 82_000_000_000,
    sparkline: [165, 168, 172, 170, 175, 177, 178],
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    price: 612.8,
    change24h: 0.89,
    volume: 1_200_000_000,
    marketCap: 94_000_000_000,
    sparkline: [605, 607, 610, 608, 611, 612, 613],
  },
  {
    symbol: 'XRP',
    name: 'XRP',
    price: 2.34,
    change24h: -0.45,
    volume: 2_100_000_000,
    marketCap: 134_000_000_000,
    sparkline: [2.38, 2.36, 2.35, 2.33, 2.32, 2.34, 2.34],
  },
  {
    symbol: 'ADA',
    name: 'Cardano',
    price: 0.72,
    change24h: 3.21,
    volume: 580_000_000,
    marketCap: 25_600_000_000,
    sparkline: [0.68, 0.69, 0.7, 0.69, 0.71, 0.71, 0.72],
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    price: 0.182,
    change24h: -2.15,
    volume: 920_000_000,
    marketCap: 26_800_000_000,
    sparkline: [0.19, 0.188, 0.186, 0.184, 0.183, 0.182, 0.182],
  },
  {
    symbol: 'AVAX',
    name: 'Avalanche',
    price: 38.92,
    change24h: 1.56,
    volume: 450_000_000,
    marketCap: 15_800_000_000,
    sparkline: [37.5, 37.8, 38.1, 38.0, 38.5, 38.7, 38.9],
  },
];

export const useMarketStore = create<MarketState>((set) => ({
  coins: mockCoins,
  loading: false,
  fetchMarket: () => {
    set({ loading: true });
    setTimeout(() => {
      set({ coins: mockCoins, loading: false });
    }, 500);
  },
}));
