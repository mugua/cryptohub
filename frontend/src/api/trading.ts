import client from './client';

export interface OrderRequest {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  amount: number;
  price?: number;
  leverage?: number;
}

export interface StrategyRequest {
  name: string;
  type: string;
  symbol: string;
  params: Record<string, unknown>;
}

export const placeOrder = (data: OrderRequest) =>
  client.post('/trading/orders', data);

export const getOrders = (params?: { status?: string }) =>
  client.get('/trading/orders', { params });

export const cancelOrder = (id: string) =>
  client.delete(`/trading/orders/${id}`);

export const getStrategies = () => client.get('/trading/strategies');

export const createStrategy = (data: StrategyRequest) =>
  client.post('/trading/strategies', data);
