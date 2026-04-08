import React from 'react';
import { Card, Table, Tag, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

interface Factor {
  id: string;
  name: string;
  category: string;
  score: number;
  weight: number;
  boost: number;
  contribution: number;
}

const mockFactors: Record<string, Factor[]> = {
  BTC: [
    { id: '1', name: 'RSI', category: 'technical', score: 72, weight: 0.15, boost: 1.2, contribution: 12.96 },
    { id: '2', name: 'MACD', category: 'technical', score: 65, weight: 0.12, boost: 1.0, contribution: 7.8 },
    { id: '3', name: 'MA Cross', category: 'technical', score: 80, weight: 0.1, boost: 1.1, contribution: 8.8 },
    { id: '4', name: 'Volume Profile', category: 'technical', score: 55, weight: 0.08, boost: 1.0, contribution: 4.4 },
    { id: '5', name: 'On-chain Activity', category: 'fundamental', score: 68, weight: 0.1, boost: 1.3, contribution: 8.84 },
    { id: '6', name: 'Network Growth', category: 'fundamental', score: 45, weight: 0.08, boost: 1.0, contribution: 3.6 },
    { id: '7', name: 'Social Sentiment', category: 'sentiment', score: 75, weight: 0.1, boost: 1.1, contribution: 8.25 },
    { id: '8', name: 'Fear & Greed', category: 'sentiment', score: 62, weight: 0.07, boost: 1.0, contribution: 4.34 },
    { id: '9', name: 'DXY Index', category: 'macro', score: -20, weight: 0.1, boost: 0.8, contribution: -1.6 },
    { id: '10', name: 'Fed Rate', category: 'macro', score: -10, weight: 0.1, boost: 0.9, contribution: -0.9 },
  ],
};

const categoryColors: Record<string, string> = {
  technical: 'blue',
  fundamental: 'green',
  sentiment: 'orange',
  macro: 'purple',
};

interface FactorBreakdownProps {
  coin: string;
}

const FactorBreakdown: React.FC<FactorBreakdownProps> = ({ coin }) => {
  const { t } = useTranslation();
  const factors = mockFactors[coin] || mockFactors.BTC;

  const columns: ColumnsType<Factor> = [
    { title: t('market.factorName'), dataIndex: 'name' },
    {
      title: t('market.category'),
      dataIndex: 'category',
      render: (c: string) => (
        <Tag color={categoryColors[c]}>{t(`market.${c}`)}</Tag>
      ),
      filters: [
        { text: t('market.technical'), value: 'technical' },
        { text: t('market.fundamental'), value: 'fundamental' },
        { text: t('market.sentiment'), value: 'sentiment' },
        { text: t('market.macro'), value: 'macro' },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: t('market.score'),
      dataIndex: 'score',
      align: 'right',
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#0ECB81' : '#F6465D' }}>
          {v > 0 ? '+' : ''}{v}
        </span>
      ),
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: t('market.weight'),
      dataIndex: 'weight',
      align: 'right',
      render: (v: number) => `${(v * 100).toFixed(0)}%`,
    },
    {
      title: t('market.boost'),
      dataIndex: 'boost',
      align: 'right',
      render: (v: number) => `×${v.toFixed(1)}`,
    },
    {
      title: t('market.contribution'),
      dataIndex: 'contribution',
      align: 'right',
      render: (v: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          <Progress
            percent={Math.abs(v) * 5}
            size="small"
            showInfo={false}
            strokeColor={v >= 0 ? '#0ECB81' : '#F6465D'}
            style={{ width: 60, margin: 0 }}
          />
          <span style={{ color: v >= 0 ? '#0ECB81' : '#F6465D', minWidth: 50, textAlign: 'right' }}>
            {v > 0 ? '+' : ''}{v.toFixed(2)}
          </span>
        </div>
      ),
      sorter: (a, b) => a.contribution - b.contribution,
    },
  ];

  return (
    <Card title={t('market.factorBreakdown')} bordered={false}>
      <Table
        columns={columns}
        dataSource={factors}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </Card>
  );
};

export default FactorBreakdown;
