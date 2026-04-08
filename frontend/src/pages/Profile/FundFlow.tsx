import React from 'react';
import { Table, Tag, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/format';

const { RangePicker } = DatePicker;

interface FlowRecord {
  id: string;
  date: string;
  type: string;
  coin: string;
  amount: number;
  balance: number;
  description: string;
}

const mockFlows: FlowRecord[] = [
  { id: '1', date: '2025-01-15 14:00', type: 'deposit', coin: 'USDT', amount: 10000, balance: 60000, description: '充值' },
  { id: '2', date: '2025-01-14 10:30', type: 'commission', coin: 'USDT', amount: -12.5, balance: 50000, description: '交易手续费' },
  { id: '3', date: '2025-01-13 08:15', type: 'transfer', coin: 'BTC', amount: 0.05, balance: 0.15, description: '资金划转' },
  { id: '4', date: '2025-01-12 16:45', type: 'withdraw', coin: 'USDT', amount: -5000, balance: 50012.5, description: '提现' },
];

const typeColors: Record<string, string> = {
  deposit: 'green',
  withdraw: 'red',
  transfer: 'blue',
  commission: 'orange',
};

const FundFlow: React.FC = () => {
  const { t } = useTranslation();

  const columns: ColumnsType<FlowRecord> = [
    { title: t('profile.date'), dataIndex: 'date', width: 160 },
    {
      title: t('profile.flowType'),
      dataIndex: 'type',
      render: (v: string) => (
        <Tag color={typeColors[v]}>{t(`profile.${v}`)}</Tag>
      ),
    },
    { title: t('dashboard.coin'), dataIndex: 'coin' },
    {
      title: t('dashboard.amount'),
      dataIndex: 'amount',
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#0ECB81' : '#F6465D' }}>
          {v > 0 ? '+' : ''}{v}
        </span>
      ),
    },
    {
      title: t('profile.balance'),
      dataIndex: 'balance',
      render: (v: number) => formatCurrency(v),
    },
    { title: t('profile.description'), dataIndex: 'description' },
  ];

  return (
    <div>
      <RangePicker style={{ marginBottom: 16 }} />
      <Table columns={columns} dataSource={mockFlows} rowKey="id" pagination={false} size="small" />
    </div>
  );
};

export default FundFlow;
