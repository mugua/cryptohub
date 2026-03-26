import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, useTheme } from './ThemeContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import MarketAnalysis from './pages/MarketAnalysis';
import TrendReport from './pages/TrendReport';
import QuantTrading from './pages/QuantTrading';
import PersonalCenter from './pages/PersonalCenter';
import Settings from './pages/Settings';

const antdLocales: Record<string, typeof zhCN> = {
  zh_CN: zhCN,
  en_US: enUS,
};

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#1677ff',
    colorBgBase: '#0d1117',
    colorBgContainer: '#161b22',
    colorBorder: '#1f2937',
    borderRadius: 6,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif",
  },
};

const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 6,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif",
  },
};

function AppInner() {
  const { i18n } = useTranslation();
  const { themeMode } = useTheme();

  return (
    <ConfigProvider
      locale={antdLocales[i18n.language] || zhCN}
      theme={themeMode === 'dark' ? darkTheme : lightTheme}
    >
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/market" element={<MarketAnalysis />} />
            <Route path="/trend" element={<TrendReport />} />
            <Route path="/trading" element={<QuantTrading />} />
            <Route path="/profile" element={<PersonalCenter />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

export default App;
