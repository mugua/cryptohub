import React from 'react';
import { Dropdown } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { MenuProps } from 'antd';

const LanguageSwitch: React.FC = () => {
  const { i18n } = useTranslation();

  const items: MenuProps['items'] = [
    {
      key: 'zh-CN',
      label: '中文',
      onClick: () => {
        i18n.changeLanguage('zh-CN');
        localStorage.setItem('cryptohub-lang', 'zh-CN');
      },
    },
    {
      key: 'en-US',
      label: 'English',
      onClick: () => {
        i18n.changeLanguage('en-US');
        localStorage.setItem('cryptohub-lang', 'en-US');
      },
    },
  ];

  return (
    <Dropdown menu={{ items, selectedKeys: [i18n.language] }}>
      <GlobalOutlined style={{ fontSize: 18, cursor: 'pointer', color: '#848E9C' }} />
    </Dropdown>
  );
};

export default LanguageSwitch;
