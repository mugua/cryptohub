import React from 'react';
import { Card, Tag, Row, Col, Badge } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { formatPercent } from '../../utils/format';

const mockStrategies = [
  { id: '1', name: 'BTC Grid Trading', type: 'grid', coin: 'BTC', status: 'running', profit: 5.32, runtime: '3d 12h' },
  { id: '2', name: 'ETH DCA', type: 'dca', coin: 'ETH', status: 'running', profit: 2.15, runtime: '7d 4h' },
  { id: '3', name: 'SOL Trend', type: 'trend', coin: 'SOL', status: 'running', profit: -1.24, runtime: '1d 8h' },
  { id: '4', name: 'BNB Arbitrage', type: 'arbitrage', coin: 'BNB', status: 'stopped', profit: 0.85, runtime: '0d 0h' },
];

const StrategyStatus: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card title={t('dashboard.strategyStatus')} bordered={false}>
      <Row gutter={[12, 12]}>
        {mockStrategies.map((s) => (
          <Col xs={24} sm={12} key={s.id}>
            <Card
              size="small"
              bordered
              style={{ borderColor: '#2B3139' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <RobotOutlined style={{ color: '#F0B90B', marginRight: 8 }} />
                  <strong>{s.name}</strong>
                </div>
                <Badge
                  status={s.status === 'running' ? 'processing' : 'default'}
                  text={
                    <Tag color={s.status === 'running' ? 'green' : 'default'}>
                      {t(`dashboard.${s.status}`)}
                    </Tag>
                  }
                />
              </div>
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', color: '#848E9C', fontSize: 13 }}>
                <span>{s.coin} · {s.type}</span>
                <span style={{ color: s.profit >= 0 ? '#0ECB81' : '#F6465D' }}>
                  {formatPercent(s.profit)}
                </span>
              </div>
              <div style={{ marginTop: 4, color: '#848E9C', fontSize: 12 }}>
                {t('dashboard.runtime')}: {s.runtime}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default StrategyStatus;
