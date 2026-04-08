import React from 'react';
import { Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useMarketStore } from '../../store/useMarketStore';
import type { CoinData } from '../../store/useMarketStore';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/format';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

const MiniSparkline: React.FC<{ data: number[]; up: boolean }> = ({ data, up }) => {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width={80} height={30}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={up ? '#0ECB81' : '#F6465D'}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const MarketSummary: React.FC = () => {
  const { t } = useTranslation();
  const { coins, loading } = useMarketStore();

  const columns: ColumnsType<CoinData> = [
    {
      title: t('dashboard.coin'),
      dataIndex: 'symbol',
      render: (sym: string, rec) => (
        <span>
          <strong style={{ color: '#EAECEF' }}>{sym}</strong>{' '}
          <span style={{ color: '#848E9C', fontSize: 12 }}>{rec.name}</span>
        </span>
      ),
    },
    {
      title: t('dashboard.price'),
      dataIndex: 'price',
      align: 'right',
      render: (v: number) => formatCurrency(v),
    },
    {
      title: t('dashboard.change24h'),
      dataIndex: 'change24h',
      align: 'right',
      render: (v: number) => (
        <Tag color={v >= 0 ? 'green' : 'red'} bordered={false}>
          {formatPercent(v)}
        </Tag>
      ),
      sorter: (a, b) => a.change24h - b.change24h,
    },
    {
      title: t('dashboard.volume'),
      dataIndex: 'volume',
      align: 'right',
      render: (v: number) => `$${formatNumber(v)}`,
    },
    {
      title: t('dashboard.marketCap'),
      dataIndex: 'marketCap',
      align: 'right',
      render: (v: number) => `$${formatNumber(v)}`,
      responsive: ['md'],
    },
    {
      title: t('dashboard.trend'),
      dataIndex: 'sparkline',
      align: 'center',
      render: (data: number[], rec) => (
        <MiniSparkline data={data} up={rec.change24h >= 0} />
      ),
      responsive: ['lg'],
    },
  ];

  return (
    <Card title={t('dashboard.marketSummary')} bordered={false}>
      <Table
        columns={columns}
        dataSource={coins}
        rowKey="symbol"
        loading={loading}
        pagination={false}
        size="small"
      />
    </Card>
  );
};

export default MarketSummary;
