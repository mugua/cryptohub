import React, { useState } from 'react';
import { Tabs, Table, InputNumber, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

interface CoinFactor {
  id: string;
  name: string;
  category: string;
  weight: number;
  boost: number;
}

const baseCoinFactors: CoinFactor[] = [
  { id: '1', name: 'RSI', category: 'technical', weight: 15, boost: 1.0 },
  { id: '2', name: 'MACD', category: 'technical', weight: 12, boost: 1.0 },
  { id: '3', name: 'Moving Average', category: 'technical', weight: 10, boost: 1.0 },
  { id: '4', name: 'Volume Profile', category: 'technical', weight: 8, boost: 1.0 },
  { id: '5', name: 'On-chain Activity', category: 'fundamental', weight: 10, boost: 1.0 },
  { id: '6', name: 'Social Sentiment', category: 'sentiment', weight: 10, boost: 1.0 },
  { id: '7', name: 'DXY Index', category: 'macro', weight: 10, boost: 1.0 },
];

const coinOverrides: Record<string, Partial<Record<string, { weight: number; boost: number }>>> = {
  BTC: { '1': { weight: 18, boost: 1.2 }, '5': { weight: 12, boost: 1.3 } },
  ETH: { '2': { weight: 14, boost: 1.1 }, '6': { weight: 12, boost: 1.2 } },
  SOL: { '3': { weight: 12, boost: 1.3 } },
};

const CoinFactors: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCoin, setSelectedCoin] = useState('BTC');

  const getFactors = (coin: string): CoinFactor[] => {
    const overrides = coinOverrides[coin] || {};
    return baseCoinFactors.map((f) => {
      const o = overrides[f.id];
      return o ? { ...f, weight: o.weight, boost: o.boost } : f;
    });
  };

  const [factors, setFactors] = useState<CoinFactor[]>(getFactors('BTC'));

  const handleCoinChange = (coin: string) => {
    setSelectedCoin(coin);
    setFactors(getFactors(coin));
  };

  const handleFieldChange = (id: string, field: 'weight' | 'boost', val: number | null) => {
    setFactors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: val ?? 0 } : f)),
    );
  };

  const columns: ColumnsType<CoinFactor> = [
    { title: t('settings.factorName'), dataIndex: 'name' },
    { title: t('settings.category'), dataIndex: 'category' },
    {
      title: t('settings.override'),
      dataIndex: 'weight',
      render: (val: number, record) => (
        <InputNumber
          size="small"
          value={val}
          min={0}
          max={100}
          onChange={(v) => handleFieldChange(record.id, 'weight', v)}
          addonAfter="%"
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: t('settings.boostCoefficient'),
      dataIndex: 'boost',
      render: (val: number, record) => (
        <InputNumber
          size="small"
          value={val}
          min={0}
          max={5}
          step={0.1}
          onChange={(v) => handleFieldChange(record.id, 'boost', v)}
          addonBefore="×"
          style={{ width: 100 }}
        />
      ),
    },
  ];

  return (
    <div>
      <Tabs
        activeKey={selectedCoin}
        onChange={handleCoinChange}
        items={['BTC', 'ETH', 'SOL'].map((coin) => ({
          key: coin,
          label: coin,
        }))}
      />
      <Table
        columns={columns}
        dataSource={factors}
        rowKey="id"
        pagination={false}
        size="small"
      />
      <Button
        type="primary"
        style={{ marginTop: 16 }}
        onClick={() => message.success(t('settings.savedSuccess'))}
      >
        {t('settings.save')}
      </Button>
    </div>
  );
};

export default CoinFactors;
