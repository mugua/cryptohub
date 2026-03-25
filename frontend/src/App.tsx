import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import MarketAnalysis from './pages/MarketAnalysis';
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

function App() {
  const { i18n } = useTranslation();

  return (
    <ConfigProvider locale={antdLocales[i18n.language] || zhCN} theme={darkTheme}>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/market" element={<MarketAnalysis />} />
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

export default App;
