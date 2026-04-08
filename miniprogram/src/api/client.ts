import Taro from '@tarojs/taro';
import { authStore } from '../store/auth';

const BASE_URL = 'https://api.cryptohub.example.com';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
  const { token } = authStore.getState();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await Taro.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: headers,
    });

    if (response.statusCode === 401) {
      Taro.removeStorageSync('token');
      Taro.redirectTo({ url: '/pages/login/index' });
      throw new Error('Unauthorized');
    }

    if (response.statusCode >= 400) {
      throw new Error(response.data?.message || 'Request failed');
    }

    const result = response.data as ApiResponse<T>;
    return result.data;
  } catch (error: any) {
    console.error('API request failed:', error);
    throw error;
  }
}
