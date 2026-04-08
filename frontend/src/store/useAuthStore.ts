import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('cryptohub-token'),
  user: JSON.parse(localStorage.getItem('cryptohub-user') || 'null'),
  login: (token, user) => {
    localStorage.setItem('cryptohub-token', token);
    localStorage.setItem('cryptohub-user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('cryptohub-token');
    localStorage.removeItem('cryptohub-user');
    set({ token: null, user: null });
  },
  setUser: (user) => {
    localStorage.setItem('cryptohub-user', JSON.stringify(user));
    set({ user });
  },
}));
