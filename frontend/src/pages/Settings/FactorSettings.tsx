import React, { useState } from 'react';
import { Table, InputNumber, Switch, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

interface Factor {
  id: string;
  name: string;
  category: string;
  weight: number;
  active: boolean;
}

const initialFactors: Factor[] = [
  { id: '1', name: 'RSI', category: 'technical', weight: 15, active: true },
  { id: '2', name: 'MACD', category: 'technical', weight: 12, active: true },
  { id: '3', name: 'Moving Average', category: 'technical', weight: 10, active: true },
  { id: '4', name: 'Volume Profile', category: 'technical', weight: 8, active: true },
  { id: '5', name: 'Bollinger Bands', category: 'technical', weight: 7, active: false },
  { id: '6', name: 'On-chain Activity', category: 'fundamental', weight: 10, active: true },
  { id: '7', name: 'Network Growth', category: 'fundamental', weight: 8, active: true },
  { id: '8', name: 'Social Sentiment', category: 'sentiment', weight: 10, active: true },
  { id: '9', name: 'Fear & Greed', category: 'sentiment', weight: 7, active: true },
  { id: '10', name: 'DXY Index', category: 'macro', weight: 10, active: true },
  { id: '11', name: 'Fed Rate', category: 'macro', weight: 10, active: true },
];

const FactorSettings: React.FC = () => {
  const { t } = useTranslation();
  const [factors, setFactors] = useState<Factor[]>(initialFactors);

  const handleWeightChange = (id: string, val: number | null) => {
    setFactors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, weight: val ?? 0 } : f)),
    );
  };

  const handleActiveChange = (id: string, val: boolean) => {
    setFactors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, active: val } : f)),
    );
  };

  const columns: ColumnsType<Factor> = [
    { title: t('settings.factorName'), dataIndex: 'name' },
    { title: t('settings.category'), dataIndex: 'category' },
    {
      title: t('settings.weight'),
      dataIndex: 'weight',
      render: (val: number, record) => (
        <InputNumber
          size="small"
          value={val}
          min={0}
          max={100}
          onChange={(v) => handleWeightChange(record.id, v)}
          addonAfter="%"
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: t('settings.active'),
      dataIndex: 'active',
      render: (val: boolean, record) => (
        <Switch
          checked={val}
          onChange={(v) => handleActiveChange(record.id, v)}
          size="small"
        />
      ),
    },
  ];

  return (
    <div>
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

export default FactorSettings;
