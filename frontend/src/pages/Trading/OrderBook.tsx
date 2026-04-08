import React from 'react';
import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const mockAsks = [
  { price: 104320, amount: 0.82, total: 85542.4 },
  { price: 104310, amount: 1.24, total: 129344.4 },
  { price: 104300, amount: 0.56, total: 58408.0 },
  { price: 104290, amount: 2.10, total: 219009.0 },
  { price: 104280, amount: 0.93, total: 96980.4 },
];

const mockBids = [
  { price: 104250, amount: 1.45, total: 151162.5 },
  { price: 104240, amount: 0.78, total: 81307.2 },
  { price: 104230, amount: 2.30, total: 239729.0 },
  { price: 104220, amount: 0.62, total: 64616.4 },
  { price: 104210, amount: 1.88, total: 195914.8 },
];

const maxTotal = Math.max(
  ...mockAsks.map((a) => a.total),
  ...mockBids.map((b) => b.total),
);

const OrderBook: React.FC = () => {
  const { t } = useTranslation();

  const renderRow = (
    row: { price: number; amount: number; total: number },
    type: 'ask' | 'bid',
  ) => {
    const pct = (row.total / maxTotal) * 100;
    const color = type === 'ask' ? '#F6465D' : '#0ECB81';
    return (
      <div
        key={`${type}-${row.price}`}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '2px 0',
          fontSize: 13,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: `${pct}%`,
            background: `${color}15`,
          }}
        />
        <span style={{ color, zIndex: 1 }}>{row.price.toFixed(2)}</span>
        <span style={{ zIndex: 1 }}>{row.amount.toFixed(4)}</span>
        <span style={{ color: '#848E9C', zIndex: 1 }}>
          {row.total.toFixed(2)}
        </span>
      </div>
    );
  };

  return (
    <Card title={t('trading.orderBook')} bordered={false} size="small">
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#848E9C', fontSize: 12, marginBottom: 4 }}>
        <span>{t('trading.price')}</span>
        <span>{t('trading.amount')}</span>
        <span>{t('trading.total')}</span>
      </div>
      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
        {t('trading.asks')}
      </Typography.Text>
      {[...mockAsks].reverse().map((row) => renderRow(row, 'ask'))}
      <div
        style={{
          textAlign: 'center',
          padding: '8px 0',
          fontSize: 18,
          fontWeight: 700,
          color: '#0ECB81',
        }}
      >
        104,250.00
      </div>
      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
        {t('trading.bids')}
      </Typography.Text>
      {mockBids.map((row) => renderRow(row, 'bid'))}
    </Card>
  );
};

export default OrderBook;
