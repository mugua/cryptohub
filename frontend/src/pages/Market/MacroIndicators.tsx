import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { useTranslation } from 'react-i18next';

const indicators = [
  { key: 'fearGreedIndex', value: 72, suffix: '/ 100', color: '#0ECB81' },
  { key: 'dominance', value: 54.2, suffix: '%', color: '#F0B90B' },
  { key: 'totalMarketCap', value: 3.42, suffix: 'T', prefix: '$', color: '#1890FF' },
  { key: 'volume24h', value: 128.5, suffix: 'B', prefix: '$', color: '#722ED1' },
];

const MacroIndicators: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card title={t('market.macroIndicators')} bordered={false}>
      <Row gutter={[16, 16]}>
        {indicators.map((ind) => (
          <Col xs={12} sm={6} key={ind.key}>
            <Statistic
              title={
                <span style={{ color: '#848E9C', fontSize: 13 }}>
                  {t(`market.${ind.key}`)}
                </span>
              }
              value={ind.value}
              suffix={ind.suffix}
              prefix={ind.prefix}
              valueStyle={{ color: ind.color, fontSize: 20, fontWeight: 600 }}
            />
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default MacroIndicators;
