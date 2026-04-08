import client from './client';

export const getTrend = (coin: string) =>
  client.get(`/analysis/trend/${coin}`);

export const generateReport = (coin: string) =>
  client.post(`/analysis/report/${coin}`);

export const getFactors = (coin: string) =>
  client.get(`/analysis/factors/${coin}`);

export const updateFactor = (id: string, data: { weight: number; active: boolean }) =>
  client.put(`/analysis/factors/${id}`, data);

export const getReports = (coin: string) =>
  client.get(`/analysis/reports/${coin}`);
