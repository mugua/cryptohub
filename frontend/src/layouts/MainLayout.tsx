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
import type { MenuProps } from 'antd';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/market', icon: <LineChartOutlined />, label: '市场分析' },
  { key: '/trading', icon: <RobotOutlined />, label: '量化交易' },
  { key: '/profile', icon: <UserOutlined />, label: '个人中心' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
];

const userMenu: MenuProps['items'] = [
  { key: 'profile', icon: <UserOutlined />, label: '个人资料' },
  { key: 'security', icon: <SafetyOutlined />, label: '安全设置' },
  { type: 'divider' },
  { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
            <Tag color="#00c853" style={{ fontSize: 12 }}>系统运行中</Tag>
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
