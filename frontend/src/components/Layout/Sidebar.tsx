import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import {
  DashboardOutlined,
  LineChartOutlined,
  SwapOutlined,
  UserOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Logo from '../Common/Logo';

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const items = [
    { key: '/', icon: <DashboardOutlined />, label: t('nav.dashboard') },
    { key: '/market', icon: <LineChartOutlined />, label: t('nav.market') },
    { key: '/trading', icon: <SwapOutlined />, label: t('nav.trading') },
    { key: '/profile', icon: <UserOutlined />, label: t('nav.profile') },
    { key: '/settings', icon: <SettingOutlined />, label: t('nav.settings') },
  ];

  const selectedKey = items
    .filter((i) => i.key !== '/')
    .find((i) => location.pathname.startsWith(i.key))?.key ?? '/';

  return (
    <>
      <Logo collapsed={collapsed} />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={items}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: 0 }}
      />
    </>
  );
};

export default Sidebar;
