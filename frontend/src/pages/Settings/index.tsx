import React from 'react';
import { Typography, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import FactorSettings from './FactorSettings';
import CoinFactors from './CoinFactors';

const Settings: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 20 }}>
        {t('settings.title')}
      </Typography.Title>
      <Tabs
        items={[
          {
            key: 'factors',
            label: t('settings.factorSettings'),
            children: <FactorSettings />,
          },
          {
            key: 'coinFactors',
            label: t('settings.coinFactors'),
            children: <CoinFactors />,
          },
        ]}
      />
    </div>
  );
};

export default Settings;
