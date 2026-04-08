import React from 'react';
import { Layout, Input, Dropdown, Space, Avatar } from 'antd';
import { SearchOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../Common/ThemeToggle';
import LanguageSwitch from '../Common/LanguageSwitch';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';

const AppHeader: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('nav.profile' as const),
      onClick: () => navigate('/profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('nav.logout'),
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Layout.Header
      style={{
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #2B3139',
        height: 56,
        lineHeight: '56px',
      }}
    >
      <Input
        prefix={<SearchOutlined style={{ color: '#848E9C' }} />}
        placeholder={t('nav.search')}
        style={{ width: 280, background: '#2B3139', border: 'none' }}
        allowClear
      />
      <Space size={20} align="center">
        <ThemeToggle />
        <LanguageSwitch />
        <Dropdown menu={{ items: menuItems }}>
          <Space style={{ cursor: 'pointer' }}>
            <Avatar size={28} icon={<UserOutlined />} style={{ background: '#F0B90B' }} />
            <span style={{ color: '#EAECEF', fontSize: 14 }}>
              {user?.username || 'Demo'}
            </span>
          </Space>
        </Dropdown>
      </Space>
    </Layout.Header>
  );
};

export default AppHeader;
