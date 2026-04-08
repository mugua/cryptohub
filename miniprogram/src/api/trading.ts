import { request } from './client';

export interface OrderParams {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  price?: number;
  amount: number;
  leverage?: number;
}

export interface OrderData {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  price: number;
  amount: number;
  status: 'open' | 'filled' | 'canceled';
  createdAt: string;
}

export interface StrategyData {
  id: string;
  name: string;
  status: 'running' | 'stopped';
  pnl: number;
  createdAt: string;
}

export interface DashboardData {
  totalAssets: number;
  pnl: number;
  strategyCount: number;
  openOrderCount: number;
}

export const tradingApi = {
  placeOrder(params: OrderParams) {
    return request<OrderData>({
      url: '/api/v1/trading/orders',
      method: 'POST',
      data: params,
    });
  },

  getOrders() {
    return request<OrderData[]>({
      url: '/api/v1/trading/orders',
      method: 'GET',
    });
  },

  cancelOrder(orderId: string) {
    return request<void>({
      url: `/api/v1/trading/orders/${orderId}`,
      method: 'DELETE',
    });
  },

  getStrategies() {
    return request<StrategyData[]>({
      url: '/api/v1/trading/strategies',
      method: 'GET',
    });
  },

  getDashboard() {
    return request<DashboardData>({
      url: '/api/v1/trading/dashboard',
      method: 'GET',
    });
  },
};
