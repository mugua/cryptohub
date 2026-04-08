import React from 'react';
import { Card, Table, Tag, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { formatPercent } from '../../utils/format';

interface Strategy {
  id: string;
  name: string;
  type: string;
  coin: string;
  status: 'running' | 'stopped';
  profit: number;
  createdAt: string;
}

const mockStrategies: Strategy[] = [
  { id: '1', name: 'BTC Grid 1', type: 'grid', coin: 'BTC', status: 'running', profit: 5.32, createdAt: '2025-01-10' },
  { id: '2', name: 'ETH DCA Weekly', type: 'dca', coin: 'ETH', status: 'running', profit: 2.15, createdAt: '2025-01-08' },
  { id: '3', name: 'SOL Trend Follow', type: 'trend', coin: 'SOL', status: 'stopped', profit: -1.24, createdAt: '2025-01-12' },
  { id: '4', name: 'BNB Arb', type: 'arbitrage', coin: 'BNB', status: 'running', profit: 0.85, createdAt: '2025-01-05' },
];

const StrategyList: React.FC = () => {
  const { t } = useTranslation();

  const columns: ColumnsType<Strategy> = [
    { title: t('dashboard.strategyName'), dataIndex: 'name' },
    {
      title: t('trading.strategyType'),
      dataIndex: 'type',
      render: (v: string) => <Tag>{v.toUpperCase()}</Tag>,
    },
    { title: t('dashboard.coin'), dataIndex: 'coin' },
    {
      title: t('dashboard.status'),
      dataIndex: 'status',
      render: (s: string) => (
        <Tag color={s === 'running' ? 'green' : 'default'}>
          {t(`dashboard.${s}`)}
        </Tag>
      ),
    },
    {
      title: t('dashboard.profit'),
      dataIndex: 'profit',
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#0ECB81' : '#F6465D' }}>
          {formatPercent(v)}
        </span>
      ),
    },
    {
      title: t('common.action'),
      render: (_, record) => (
        <Space>
          {record.status === 'running' ? (
            <Button size="small" icon={<PauseCircleOutlined />} />
          ) : (
            <Button size="small" icon={<PlayCircleOutlined />} type="primary" />
          )}
          <Button size="small" icon={<DeleteOutlined />} danger />
        </Space>
      ),
    },
  ];

  return (
    <Card title={t('trading.strategies')} bordered={false}>
      <Table
        columns={columns}
        dataSource={mockStrategies}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </Card>
  );
};

export default StrategyList;
