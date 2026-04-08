import { request } from './client';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };
}

export const authApi = {
  login(params: LoginParams) {
    return request<LoginResponse>({
      url: '/api/v1/auth/login',
      method: 'POST',
      data: params,
    });
  },

  register(params: RegisterParams) {
    return request<LoginResponse>({
      url: '/api/v1/auth/register',
      method: 'POST',
      data: params,
    });
  },

  getProfile() {
    return request<LoginResponse['user']>({
      url: '/api/v1/auth/profile',
      method: 'GET',
    });
  },
};
