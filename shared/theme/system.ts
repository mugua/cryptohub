import type { ThemeConfig } from 'antd';
import { lightTheme } from './light';
import { darkTheme } from './dark';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Detects the OS-level color scheme preference.
 * Returns 'dark' if the user prefers dark mode, otherwise 'light'.
 */
export function detectSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Resolves a ThemeMode to a concrete Ant Design ThemeConfig.
 * When mode is 'system', the OS preference is detected automatically.
 */
export function resolveTheme(mode: ThemeMode): ThemeConfig {
  const resolved = mode === 'system' ? detectSystemTheme() : mode;
  return resolved === 'dark' ? darkTheme : lightTheme;
}

/**
 * Subscribe to OS-level color scheme changes.
 * The provided callback is invoked whenever the preference changes.
 * Returns an unsubscribe function.
 */
export function subscribeToSystemTheme(
  callback: (theme: 'light' | 'dark') => void,
): () => void {
  if (typeof window === 'undefined') return () => {};

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) =>
    callback(e.matches ? 'dark' : 'light');

  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}

export { lightTheme, darkTheme };
