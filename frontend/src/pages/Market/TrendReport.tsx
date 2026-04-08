import React from 'react';
import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import TrendGauge from '../../components/Charts/TrendGauge';

interface TrendReportProps {
  coin: string;
}

const signalMap: Record<string, { key: string; min: number; max: number }> = {
  strongBull: { key: 'signalStrong', min: 50, max: 100 },
  moderateBull: { key: 'signalModerate', min: 20, max: 50 },
  neutral: { key: 'signalNeutral', min: -20, max: 20 },
  moderateBear: { key: 'signalWeakBear', min: -50, max: -20 },
  strongBear: { key: 'signalStrongBear', min: -100, max: -50 },
};

const getSignal = (score: number) => {
  for (const [, v] of Object.entries(signalMap)) {
    if (score >= v.min && score <= v.max) return v.key;
  }
  return 'signalNeutral';
};

const mockScores: Record<string, number> = {
  BTC: 62,
  ETH: 35,
  SOL: 78,
  BNB: 12,
  XRP: -15,
  ADA: -42,
  DOGE: -68,
  AVAX: 45,
};

const TrendReport: React.FC<TrendReportProps> = ({ coin }) => {
  const { t } = useTranslation();
  const score = mockScores[coin] ?? 0;
  const signal = getSignal(score);

  return (
    <Card title={t('market.trendReport')} bordered={false}>
      <div style={{ textAlign: 'center' }}>
        <TrendGauge score={score} size={240} />
        <Typography.Title level={4} style={{ marginTop: 16 }}>
          {t(`market.${signal}`)}
        </Typography.Title>
        <Typography.Text type="secondary">
          {t('market.summary')}: {coin} {t(`market.${signal}`).toLowerCase()},
          {t('market.trendScore')}: {score > 0 ? '+' : ''}{score}/100
        </Typography.Text>
        <br />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {t('market.lastUpdated')}: 2025-01-15 14:30:00
        </Typography.Text>
      </div>
    </Card>
  );
};

export default TrendReport;
