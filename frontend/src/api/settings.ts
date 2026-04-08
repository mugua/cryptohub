import client from './client';

export const getProfile = () => client.get('/settings/profile');

export const updateProfile = (data: Record<string, unknown>) =>
  client.put('/settings/profile', data);

export const getFactorSettings = () => client.get('/settings/factors');

export const updateFactorSettings = (data: Record<string, unknown>) =>
  client.put('/settings/factors', data);
