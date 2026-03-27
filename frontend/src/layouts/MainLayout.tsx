import React, { useState } from 'react';
import { Layout, Menu, Avatar, Badge, Dropdown, Space, Tag } from 'antd';
import {
  DashboardOutlined,
  LineChartOutlined,
  FundOutlined,
  RobotOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import type { MenuProps } from 'antd';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { themeMode } = useTheme();
  const { user, logout } = useAuth();

  const isDark = themeMode === 'dark';

  const menuItems: MenuProps['items'] = [
    { key: '/', icon: <DashboardOutlined />, label: t('menu.dashboard') },
    { key: '/market', icon: <LineChartOutlined />, label: t('menu.marketAnalysis') },
    { key: '/trend', icon: <FundOutlined />, label: t('menu.trendReport') },
    { key: '/trading', icon: <RobotOutlined />, label: t('menu.quantTrading') },
    { key: '/profile', icon: <UserOutlined />, label: t('menu.personalCenter') },
    { key: '/settings', icon: <SettingOutlined />, label: t('menu.systemSettings') },
  ];

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'profile') navigate('/profile');
    else if (key === 'security') navigate('/settings');
    else if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  const userMenu: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: t('header.profile') },
    { key: 'security', icon: <SafetyOutlined />, label: t('header.securitySettings') },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: t('header.logout'), danger: true },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme={isDark ? 'dark' : 'light'}
        width={220}
        style={{ background: isDark ? '#0d1117' : '#fff' }}
      >
        <div className="logo">
          {!collapsed ? (
            <span className="logo-text" style={{ color: isDark ? '#fff' : '#333' }}>
              <span className="logo-icon">₿</span> CryptoHub
            </span>
          ) : (
            <span className="logo-icon">₿</span>
          )}
        </div>
        <Menu
          theme={isDark ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: isDark ? '#0d1117' : '#fff', borderRight: 'none' }}
        />
      </Sider>

      <Layout>
        <Header className="main-header" style={{ background: isDark ? '#0d1117' : '#fff', borderBottom: isDark ? '1px solid #1f2937' : '1px solid #e0e0e0' }}>
          <div className="header-left">
            <Tag color="#00c853" style={{ fontSize: 12 }}>{t('header.systemRunning')}</Tag>
            <span style={{ color: isDark ? '#888' : '#666', fontSize: 13 }}>BTC: $67,420</span>
            <span style={{ color: '#00c853', fontSize: 13 }}>▲ +1.28%</span>
          </div>
          <div className="header-right">
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: 18, color: isDark ? '#ccc' : '#666', cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: userMenu, onClick: handleUserMenuClick }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} size={32} />
                <span style={{ color: isDark ? '#ccc' : '#333', fontSize: 13 }}>{user?.nickname || user?.email || 'User'}</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content className="main-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
