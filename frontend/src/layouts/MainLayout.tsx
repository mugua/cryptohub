import React, { useState } from 'react';
import { Layout, Menu, Avatar, Badge, Dropdown, Space, Tag } from 'antd';
import {
  DashboardOutlined,
  LineChartOutlined,
  RobotOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

  const menuItems: MenuProps['items'] = [
    { key: '/', icon: <DashboardOutlined />, label: t('menu.dashboard') },
    { key: '/market', icon: <LineChartOutlined />, label: t('menu.marketAnalysis') },
    { key: '/trading', icon: <RobotOutlined />, label: t('menu.quantTrading') },
    { key: '/profile', icon: <UserOutlined />, label: t('menu.personalCenter') },
    { key: '/settings', icon: <SettingOutlined />, label: t('menu.systemSettings') },
  ];

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
        theme="dark"
        width={220}
        style={{ background: '#0d1117' }}
      >
        <div className="logo">
          {!collapsed ? (
            <span className="logo-text">
              <span className="logo-icon">₿</span> CryptoHub
            </span>
          ) : (
            <span className="logo-icon">₿</span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: '#0d1117', borderRight: 'none' }}
        />
      </Sider>

      <Layout>
        <Header className="main-header">
          <div className="header-left">
            <Tag color="#00c853" style={{ fontSize: 12 }}>{t('header.systemRunning')}</Tag>
            <span style={{ color: '#888', fontSize: 13 }}>BTC: $67,420</span>
            <span style={{ color: '#00c853', fontSize: 13 }}>▲ +1.28%</span>
          </div>
          <div className="header-right">
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: 18, color: '#ccc', cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} size={32} />
                <span style={{ color: '#ccc', fontSize: 13 }}>Admin</span>
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
