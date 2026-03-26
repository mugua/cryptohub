import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'dark',
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    () => (localStorage.getItem('themeMode') as ThemeMode) || 'dark',
  );

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    document.body.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
