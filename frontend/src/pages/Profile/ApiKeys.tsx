import React from 'react';
import { Table, Button, Space, Modal, Tag, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

interface ApiKeyRow {
  id: string;
  exchange: string;
  apiKey: string;
  createdAt: string;
  status: string;
}

const mockKeys: ApiKeyRow[] = [
  { id: '1', exchange: 'Binance', apiKey: 'a1b2****...****ef90', createdAt: '2025-01-05', status: 'active' },
  { id: '2', exchange: 'OKX', apiKey: 'x9y8****...****cd12', createdAt: '2025-01-10', status: 'active' },
];

const ApiKeys: React.FC = () => {
  const { t } = useTranslation();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: t('profile.deleteKey'),
      icon: <ExclamationCircleOutlined />,
      content: t('profile.confirmDelete'),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onOk: () => {
        void id;
      },
    });
  };

  const columns: ColumnsType<ApiKeyRow> = [
    { title: t('profile.exchange'), dataIndex: 'exchange' },
    {
      title: t('profile.apiKey'),
      dataIndex: 'apiKey',
      render: (v: string) => (
        <Typography.Text code copyable={{ text: 'hidden' }}>
          {v}
        </Typography.Text>
      ),
    },
    { title: t('profile.date'), dataIndex: 'createdAt' },
    {
      title: t('dashboard.status'),
      dataIndex: 'status',
      render: (s: string) => <Tag color="green">{s}</Tag>,
    },
    {
      title: t('common.action'),
      render: (_, record) => (
        <Button
          size="small"
          icon={<DeleteOutlined />}
          danger
          onClick={() => handleDelete(record.id)}
        />
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />}>
          {t('profile.addKey')}
        </Button>
      </Space>
      <Table columns={columns} dataSource={mockKeys} rowKey="id" pagination={false} size="small" />
    </div>
  );
};

export default ApiKeys;
