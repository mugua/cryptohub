import React, { useState } from 'react';
import { Select, Typography, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { COINS } from '../../utils/constants';
import TrendReport from './TrendReport';
import FactorBreakdown from './FactorBreakdown';
import MacroIndicators from './MacroIndicators';

const Market: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCoin, setSelectedCoin] = useState('BTC');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('market.title')}
        </Typography.Title>
        <Select
          value={selectedCoin}
          onChange={setSelectedCoin}
          style={{ width: 160 }}
          options={COINS.map((c) => ({ value: c.symbol, label: `${c.symbol} - ${c.name}` }))}
        />
      </div>
      <MacroIndicators />
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={10}>
          <TrendReport coin={selectedCoin} />
        </Col>
        <Col xs={24} md={14}>
          <FactorBreakdown coin={selectedCoin} />
        </Col>
      </Row>
    </div>
  );
};

export default Market;
