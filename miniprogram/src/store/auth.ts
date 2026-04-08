import Taro from '@tarojs/taro';
import { createStore } from './index';

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  token: string;
  isLoggedIn: boolean;
  user: UserInfo | null;
}

const savedToken = Taro.getStorageSync('token') || '';

export const authStore = createStore<AuthState>({
  token: savedToken,
  isLoggedIn: !!savedToken,
  user: null,
});

export function login(token: string, user: UserInfo): void {
  Taro.setStorageSync('token', token);
  authStore.setState({ token, isLoggedIn: true, user });
}

export function logout(): void {
  Taro.removeStorageSync('token');
  authStore.setState({ token: '', isLoggedIn: false, user: null });
}
