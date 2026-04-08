import React from 'react';
import { Segmented } from 'antd';
import { useThemeStore } from '../../store/useThemeStore';
import { useTranslation } from 'react-i18next';

const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useThemeStore();
  const { t } = useTranslation();

  return (
    <Segmented
      size="small"
      value={mode}
      onChange={(val) => setMode(val as 'dark' | 'light' | 'auto')}
      options={[
        { value: 'light', label: '☀️' },
        { value: 'dark', label: '🌙' },
        { value: 'auto', label: t('common.autoMode') },
      ]}
    />
  );
};

export default ThemeToggle;
