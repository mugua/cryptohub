import React, { useEffect } from 'react';
import { Row, Col, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useMarketStore } from '../../store/useMarketStore';
import AssetOverview from './AssetOverview';
import MarketSummary from './MarketSummary';
import RecentTrades from './RecentTrades';
import StrategyStatus from './StrategyStatus';
import QuickActions from './QuickActions';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const fetchMarket = useMarketStore((s) => s.fetchMarket);

  useEffect(() => {
    fetchMarket();
  }, [fetchMarket]);

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 20 }}>
        {t('dashboard.title')}
      </Typography.Title>
      <AssetOverview />
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <MarketSummary />
        </Col>
        <Col xs={24} lg={8}>
          <StrategyStatus />
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <RecentTrades />
        </Col>
        <Col xs={24} lg={8}>
          <QuickActions />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
