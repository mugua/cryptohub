import { request } from './client';
import { CoinData } from '../store/market';

export interface TrendData {
  symbol: string;
  score: number;
  signal: string;
  factors: FactorData[];
  summary: string;
  updatedAt: string;
}

export interface FactorData {
  name: string;
  score: number;
  weight: number;
}

export interface ReportData {
  id: string;
  symbol: string;
  score: number;
  signal: string;
  summary: string;
  createdAt: string;
}

export const marketApi = {
  getMarketSummary() {
    return request<CoinData[]>({
      url: '/api/v1/market/summary',
      method: 'GET',
    });
  },

  getTrend(symbol: string) {
    return request<TrendData>({
      url: `/api/v1/market/trend/${symbol}`,
      method: 'GET',
    });
  },

  generateReport(symbol: string) {
    return request<ReportData>({
      url: `/api/v1/market/report/${symbol}`,
      method: 'POST',
    });
  },

  getFactors(symbol: string) {
    return request<FactorData[]>({
      url: `/api/v1/market/factors/${symbol}`,
      method: 'GET',
    });
  },

  getReports(symbol: string) {
    return request<ReportData[]>({
      url: `/api/v1/market/reports/${symbol}`,
      method: 'GET',
    });
  },
};
