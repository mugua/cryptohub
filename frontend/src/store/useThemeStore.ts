import { create } from 'zustand';

type ThemeMode = 'dark' | 'light' | 'auto';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  effectiveTheme: () => 'dark' | 'light';
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: (localStorage.getItem('cryptohub-theme') as ThemeMode) || 'dark',
  setMode: (mode) => {
    localStorage.setItem('cryptohub-theme', mode);
    set({ mode });
  },
  effectiveTheme: () => {
    const { mode } = get();
    if (mode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return mode;
  },
}));
