import client from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; username: string };
}

export const login = (data: LoginRequest) =>
  client.post<AuthResponse>('/auth/login', data);

export const register = (data: RegisterRequest) =>
  client.post<AuthResponse>('/auth/register', data);

export const refreshToken = () =>
  client.post<{ token: string }>('/auth/refresh');
