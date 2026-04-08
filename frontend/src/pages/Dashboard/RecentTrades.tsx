import React from 'react';
import { Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/format';

interface Trade {
  id: string;
  time: string;
  pair: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  status: 'filled' | 'pending' | 'cancelled';
}

const mockTrades: Trade[] = [
  { id: '1', time: '2025-01-15 14:32:05', pair: 'BTC/USDT', side: 'buy', price: 104120, amount: 0.05, status: 'filled' },
  { id: '2', time: '2025-01-15 14:28:12', pair: 'ETH/USDT', side: 'sell', price: 3850, amount: 1.2, status: 'filled' },
  { id: '3', time: '2025-01-15 14:15:48', pair: 'SOL/USDT', side: 'buy', price: 176.8, amount: 15, status: 'filled' },
  { id: '4', time: '2025-01-15 13:55:22', pair: 'BTC/USDT', side: 'sell', price: 103980, amount: 0.03, status: 'pending' },
  { id: '5', time: '2025-01-15 13:42:10', pair: 'BNB/USDT', side: 'buy', price: 610.5, amount: 2, status: 'filled' },
];

const RecentTrades: React.FC = () => {
  const { t } = useTranslation();

  const columns: ColumnsType<Trade> = [
    { title: t('dashboard.time'), dataIndex: 'time', width: 170 },
    { title: t('dashboard.pair'), dataIndex: 'pair' },
    {
      title: t('dashboard.side'),
      dataIndex: 'side',
      render: (s: string) => (
        <Tag color={s === 'buy' ? 'green' : 'red'} bordered={false}>
          {t(`dashboard.${s}`)}
        </Tag>
      ),
    },
    {
      title: t('dashboard.price'),
      dataIndex: 'price',
      align: 'right',
      render: (v: number) => formatCurrency(v),
    },
    {
      title: t('dashboard.amount'),
      dataIndex: 'amount',
      align: 'right',
    },
    {
      title: t('dashboard.status'),
      dataIndex: 'status',
      render: (s: string) => {
        const colorMap: Record<string, string> = { filled: 'green', pending: 'orange', cancelled: 'default' };
        return <Tag color={colorMap[s]}>{t(`dashboard.${s}`)}</Tag>;
      },
    },
  ];

  return (
    <Card title={t('dashboard.recentTrades')} bordered={false}>
      <Table
        columns={columns}
        dataSource={mockTrades}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </Card>
  );
};

export default RecentTrades;
