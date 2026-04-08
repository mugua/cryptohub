import client from './client';

export const getOverview = () => client.get('/dashboard/overview');

export const getMarketSummary = () => client.get('/dashboard/market-summary');

export const getRecentTrades = () => client.get('/dashboard/recent-trades');

export const getStrategyStatus = () => client.get('/dashboard/strategy-status');
