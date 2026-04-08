import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  WalletOutlined,
  RiseOutlined,
  RobotOutlined,
  OrderedListOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatPercent } from '../../utils/format';

const stats = [
  {
    key: 'totalAssets',
    value: 125680.42,
    icon: <WalletOutlined />,
    color: '#F0B90B',
    formatter: (v: number) => formatCurrency(v),
  },
  {
    key: 'pnl24h',
    value: 3.52,
    icon: <RiseOutlined />,
    color: '#0ECB81',
    formatter: (v: number) => formatPercent(v),
  },
  {
    key: 'runningStrategies',
    value: 4,
    icon: <RobotOutlined />,
    color: '#1890FF',
    formatter: (v: number) => String(v),
  },
  {
    key: 'activeOrders',
    value: 7,
    icon: <OrderedListOutlined />,
    color: '#722ED1',
    formatter: (v: number) => String(v),
  },
];

const AssetOverview: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Row gutter={[16, 16]}>
      {stats.map((s) => (
        <Col xs={12} sm={12} md={6} key={s.key}>
          <Card className="stat-card" bordered={false}>
            <Statistic
              title={
                <span style={{ color: '#848E9C' }}>
                  {t(`dashboard.${s.key}`)}
                </span>
              }
              value={s.value}
              formatter={() => (
                <span style={{ color: s.color, fontSize: 24, fontWeight: 600 }}>
                  {s.formatter(s.value)}
                </span>
              )}
              prefix={React.cloneElement(s.icon, {
                style: { color: s.color, fontSize: 20 },
              })}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default AssetOverview;
