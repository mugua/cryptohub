import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Table, Tag, Button, Modal, Form, Input, Select,
  Typography, Statistic, Space, Popconfirm, message, Tooltip, Badge,
  Tabs, Avatar,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, SyncOutlined, CheckCircleOutlined,
  ApiOutlined, UserOutlined,
  WalletOutlined, HistoryOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fetchExchangeAccounts, fetchOrders } from '../../services/api';
import type { ExchangeAccount, Order, ExchangeName } from '../../types';
import './PersonalCenter.css';

const { Title, Text } = Typography;
const { Option } = Select;

const EXCHANGE_LOGOS: Record<ExchangeName, string> = {
  binance: '🟡',
  okx: '⚫',
  bybit: '🟠',
  coinbase: '🔵',
  kraken: '🟣',
  gate: '🟢',
  huobi: '🔴',
};

const PersonalCenter: React.FC = () => {
  const [accounts, setAccounts] = useState<ExchangeAccount[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    Promise.all([fetchExchangeAccounts(), fetchOrders()]).then(([a, o]) => {
      setAccounts(a);
      setOrders(o);
      setLoading(false);
    });
  }, []);

  const handleAddAccount = (values: Record<string, string>) => {
    const newAcc: ExchangeAccount = {
      id: `e${Date.now()}`,
      exchange: values.exchange as ExchangeName,
      label: values.label,
      apiKey: `${values.apiKey.slice(0, 6)}****${values.apiKey.slice(-4)}`,
      isConnected: false,
      permissions: ['read'],
      createdAt: new Date().toISOString(),
    };
    setAccounts((prev) => [...prev, newAcc]);
    setAddOpen(false);
    form.resetFields();
    message.success(t('profile.accountAdded'));
    // Simulate connection
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) => (a.id === newAcc.id ? { ...a, isConnected: true, lastSyncAt: new Date().toISOString() } : a)),
      );
      message.success(t('profile.accountConnected'));
    }, 2000);
  };

  const handleSync = (id: string) => {
    message.loading({ content: t('profile.syncing'), key: id });
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, lastSyncAt: new Date().toISOString() } : a)),
      );
      message.success({ content: t('profile.syncComplete'), key: id });
    }, 1500);
  };

  const handleRemove = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    message.success(t('profile.accountRemoved'));
  };

  const locale = i18n.language === 'en_US' ? 'en-US' : 'zh-CN';

  const accountColumns = [
    {
      title: t('profile.exchange'),
      key: 'exchange',
      render: (row: ExchangeAccount) => (
        <Space>
          <span style={{ fontSize: 20 }}>{EXCHANGE_LOGOS[row.exchange]}</span>
          <div>
            <Text strong style={{ color: '#fff', display: 'block' }}>{row.label}</Text>
            <Text style={{ color: '#888', fontSize: 11 }}>{row.exchange.toUpperCase()}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: t('profile.apiKey'),
      dataIndex: 'apiKey',
      key: 'apiKey',
      render: (v: string) => <Text style={{ color: '#888', fontFamily: 'monospace', fontSize: 12 }}>{v}</Text>,
    },
    {
      title: t('profile.status'),
      dataIndex: 'isConnected',
      key: 'isConnected',
      render: (v: boolean) => (
        v
          ? <Badge status="success" text={<Text style={{ color: '#52c41a', fontSize: 12 }}>{t('profile.connected')}</Text>} />
          : <Badge status="error" text={<Text style={{ color: '#f5222d', fontSize: 12 }}>{t('profile.disconnected')}</Text>} />
      ),
    },
    {
      title: t('profile.permissions'),
      dataIndex: 'permissions',
      key: 'permissions',
      render: (perms: string[]) => (
        <Space>
          {perms.map((p) => (
            <Tag key={p} color={p === 'withdraw' ? 'error' : p === 'trade' ? 'success' : 'blue'} style={{ fontSize: 11 }}>
              {p === 'read' ? t('profile.readOnly') : p === 'trade' ? t('profile.trade') : t('profile.withdraw')}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t('profile.lastSync'),
      dataIndex: 'lastSyncAt',
      key: 'lastSyncAt',
      render: (v?: string) => (
        <Text style={{ color: '#888', fontSize: 12 }}>
          {v ? new Date(v).toLocaleString(locale) : t('common.never')}
        </Text>
      ),
    },
    {
      title: t('profile.actions'),
      key: 'actions',
      render: (_: unknown, row: ExchangeAccount) => (
        <Space>
          <Tooltip title={t('profile.syncAccount')}>
            <Button type="text" size="small" icon={<SyncOutlined style={{ color: '#1677ff' }} />} onClick={() => handleSync(row.id)} />
          </Tooltip>
          <Popconfirm title={t('profile.confirmDeleteAccount')} onConfirm={() => handleRemove(row.id)} okText={t('common.delete')} cancelText={t('common.cancel')}>
            <Button type="text" size="small" icon={<DeleteOutlined style={{ color: '#f5222d' }} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const orderColumns = [
    {
      title: t('profile.time'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => <Text style={{ color: '#888', fontSize: 11 }}>{new Date(v).toLocaleString(locale)}</Text>,
    },
    {
      title: t('profile.exchange'),
      dataIndex: 'exchange',
      key: 'exchange',
      render: (v: string) => <Text style={{ color: '#ccc', fontSize: 12 }}>{v.toUpperCase()}</Text>,
    },
    {
      title: t('profile.tradingPair'),
      dataIndex: 'symbol',
      key: 'symbol',
      render: (v: string) => <Text strong style={{ color: '#fff', fontSize: 12 }}>{v}</Text>,
    },
    {
      title: t('profile.direction'),
      dataIndex: 'side',
      key: 'side',
      render: (v: string) => <Tag color={v === 'buy' ? 'success' : 'error'} style={{ fontSize: 11 }}>{v === 'buy' ? t('profile.buy') : t('profile.sell')}</Tag>,
    },
    {
      title: t('profile.orderType'),
      dataIndex: 'type',
      key: 'type',
      render: (v: string) => <Tag color="blue" style={{ fontSize: 11 }}>{v === 'market' ? t('profile.market') : v === 'limit' ? t('profile.limit') : v}</Tag>,
    },
    {
      title: t('profile.price'),
      dataIndex: 'price',
      key: 'price',
      render: (v?: number) => <Text style={{ color: '#ccc', fontSize: 12 }}>{v ? `$${v.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : t('profile.marketPrice')}</Text>,
    },
    {
      title: t('profile.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (v: number) => <Text style={{ color: '#ccc', fontSize: 12 }}>{v.toFixed(4)}</Text>,
    },
    {
      title: t('profile.status'),
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => {
        const map: Record<string, [string, string]> = {
          filled: ['success', t('profile.filled')],
          open: ['processing', t('profile.open')],
          partially_filled: ['warning', t('profile.partiallyFilled')],
          cancelled: ['default', t('profile.cancelled')],
          rejected: ['error', t('profile.rejected')],
        };
        const [color, label] = map[v] ?? ['default', v];
        return <Badge status={color as any} text={<Text style={{ fontSize: 11, color: '#ccc' }}>{label}</Text>} />;
      },
    },
  ];

  const connectedCount = accounts.filter((a) => a.isConnected).length;

  return (
    <div className="personal-center">
      <div className="pc-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar size={56} style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
          <div>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>{t('profile.title')}</Title>
            <Text style={{ color: '#888', fontSize: 12 }}>{t('profile.subtitle')}</Text>
          </div>
        </div>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>{t('profile.connectedExchanges')}</span>}
              value={connectedCount}
              suffix={`/ ${accounts.length}`}
              valueStyle={{ color: '#52c41a', fontSize: 22 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>{t('profile.historicalOrders')}</span>}
              value={orders.length}
              valueStyle={{ color: '#1677ff', fontSize: 22 }}
              prefix={<HistoryOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>{t('profile.filledOrders')}</span>}
              value={orders.filter((o) => o.status === 'filled').length}
              valueStyle={{ color: '#52c41a', fontSize: 22 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>{t('profile.pendingOrders')}</span>}
              value={orders.filter((o) => o.status === 'open').length}
              valueStyle={{ color: '#faad14', fontSize: 22 }}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="accounts"
        items={[
          {
            key: 'accounts',
            label: <span><ApiOutlined />{t('profile.exchangeAccounts')}</span>,
            children: (
              <Card className="pc-card">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
                    {t('profile.addExchange')}
                  </Button>
                </div>
                <Table
                  dataSource={accounts}
                  columns={accountColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                  size="middle"
                  className="dark-table"
                  scroll={{ x: 700 }}
                />
              </Card>
            ),
          },
          {
            key: 'orders',
            label: <span><HistoryOutlined />{t('profile.orderHistory')}</span>,
            children: (
              <Card className="pc-card">
                <Table
                  dataSource={orders}
                  columns={orderColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10, size: 'small' }}
                  size="small"
                  className="dark-table"
                  scroll={{ x: 800 }}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Add Exchange Modal */}
      <Modal
        title={<span style={{ color: '#fff' }}><ApiOutlined /> {t('profile.addExchangeAccount')}</span>}
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={() => form.submit()}
        okText={t('profile.addAndVerify')}
        cancelText={t('common.cancel')}
        styles={{ body: { background: '#161b22' }, header: { background: '#161b22', borderBottom: '1px solid #1f2937' }, footer: { background: '#161b22', borderTop: '1px solid #1f2937' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddAccount} style={{ marginTop: 16 }}>
          <Form.Item name="exchange" label={<span style={{ color: '#ccc' }}>{t('profile.exchange')}</span>} rules={[{ required: true }]}>
            <Select placeholder={t('profile.selectExchange')}>
              {(['binance', 'okx', 'bybit', 'gate', 'coinbase', 'kraken', 'huobi'] as ExchangeName[]).map((e) => (
                <Option key={e} value={e}>
                  {EXCHANGE_LOGOS[e]} {e.toUpperCase()}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="label" label={<span style={{ color: '#ccc' }}>{t('profile.accountLabel')}</span>} rules={[{ required: true, message: t('profile.accountLabelRequired') }]}>
            <Input placeholder={t('profile.accountLabelPlaceholder')} />
          </Form.Item>
          <Form.Item name="apiKey" label={<span style={{ color: '#ccc' }}>{t('profile.apiKey')}</span>} rules={[{ required: true, message: t('profile.apiKeyRequired') }]}>
            <Input placeholder={t('profile.apiKeyPlaceholder')} />
          </Form.Item>
          <Form.Item name="secretKey" label={<span style={{ color: '#ccc' }}>{t('profile.secretKey')}</span>} rules={[{ required: true, message: t('profile.secretKeyRequired') }]}>
            <Input.Password placeholder={t('profile.secretKeyPlaceholder')} />
          </Form.Item>
          <Form.Item name="passphrase" label={<span style={{ color: '#ccc' }}>{t('profile.passphrase')}</span>}>
            <Input.Password placeholder={t('profile.passphrasePlaceholder')} />
          </Form.Item>
        </Form>
        <div style={{ background: '#0d1117', border: '1px solid #374151', borderRadius: 6, padding: '10px 14px', marginTop: 8 }}>
          <Text style={{ color: '#888', fontSize: 12 }}>
            {t('profile.securityNotice')}
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default PersonalCenter;
