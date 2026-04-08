import React, { useState } from 'react';
import { Row, Col, Typography, Button, Tabs } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import PriceChart from '../../components/Charts/PriceChart';
import OrderForm from './OrderForm';
import OrderBook from './OrderBook';
import StrategyList from './StrategyList';
import BacktestPanel from './BacktestPanel';

const mockPriceData = Array.from({ length: 48 }, (_, i) => ({
  time: `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
  price: 103000 + Math.random() * 2000 + i * 20,
}));

const Trading: React.FC = () => {
  const { t } = useTranslation();
  const [backtestOpen, setBacktestOpen] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('trading.title')}
        </Typography.Title>
        <Button
          icon={<ExperimentOutlined />}
          onClick={() => setBacktestOpen(true)}
        >
          {t('trading.backtest')}
        </Button>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <PriceChart data={mockPriceData} height={400} />
        </Col>
        <Col xs={24} lg={10}>
          <OrderForm />
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <OrderBook />
        </Col>
        <Col xs={24} md={16}>
          <Tabs
            items={[
              {
                key: 'strategies',
                label: t('trading.strategies'),
                children: <StrategyList />,
              },
              {
                key: 'open',
                label: t('trading.openOrders'),
                children: <StrategyList />,
              },
              {
                key: 'history',
                label: t('trading.orderHistory'),
                children: <StrategyList />,
              },
            ]}
          />
        </Col>
      </Row>
      <BacktestPanel open={backtestOpen} onClose={() => setBacktestOpen(false)} />
    </div>
  );
};

export default Trading;
