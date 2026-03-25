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
    message.success('交易所账户添加成功，正在连接验证...');
    // Simulate connection
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) => (a.id === newAcc.id ? { ...a, isConnected: true, lastSyncAt: new Date().toISOString() } : a)),
      );
      message.success('账户连接成功！');
    }, 2000);
  };

  const handleSync = (id: string) => {
    message.loading({ content: '同步中...', key: id });
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, lastSyncAt: new Date().toISOString() } : a)),
      );
      message.success({ content: '同步完成', key: id });
    }, 1500);
  };

  const handleRemove = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    message.success('账户已移除');
  };

  const accountColumns = [
    {
      title: '交易所',
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
      title: 'API Key',
      dataIndex: 'apiKey',
      key: 'apiKey',
      render: (v: string) => <Text style={{ color: '#888', fontFamily: 'monospace', fontSize: 12 }}>{v}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'isConnected',
      key: 'isConnected',
      render: (v: boolean) => (
        v
          ? <Badge status="success" text={<Text style={{ color: '#52c41a', fontSize: 12 }}>已连接</Text>} />
          : <Badge status="error" text={<Text style={{ color: '#f5222d', fontSize: 12 }}>未连接</Text>} />
      ),
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (perms: string[]) => (
        <Space>
          {perms.map((p) => (
            <Tag key={p} color={p === 'withdraw' ? 'error' : p === 'trade' ? 'success' : 'blue'} style={{ fontSize: 11 }}>
              {p === 'read' ? '只读' : p === 'trade' ? '交易' : '提现'}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '最后同步',
      dataIndex: 'lastSyncAt',
      key: 'lastSyncAt',
      render: (v?: string) => (
        <Text style={{ color: '#888', fontSize: 12 }}>
          {v ? new Date(v).toLocaleString('zh-CN') : '从未'}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, row: ExchangeAccount) => (
        <Space>
          <Tooltip title="同步账户">
            <Button type="text" size="small" icon={<SyncOutlined style={{ color: '#1677ff' }} />} onClick={() => handleSync(row.id)} />
          </Tooltip>
          <Popconfirm title="确认删除此账户？" onConfirm={() => handleRemove(row.id)} okText="删除" cancelText="取消">
            <Button type="text" size="small" icon={<DeleteOutlined style={{ color: '#f5222d' }} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const orderColumns = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => <Text style={{ color: '#888', fontSize: 11 }}>{new Date(v).toLocaleString('zh-CN')}</Text>,
    },
    {
      title: '交易所',
      dataIndex: 'exchange',
      key: 'exchange',
      render: (v: string) => <Text style={{ color: '#ccc', fontSize: 12 }}>{v.toUpperCase()}</Text>,
    },
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (v: string) => <Text strong style={{ color: '#fff', fontSize: 12 }}>{v}</Text>,
    },
    {
      title: '方向',
      dataIndex: 'side',
      key: 'side',
      render: (v: string) => <Tag color={v === 'buy' ? 'success' : 'error'} style={{ fontSize: 11 }}>{v === 'buy' ? '买入' : '卖出'}</Tag>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (v: string) => <Tag color="blue" style={{ fontSize: 11 }}>{v === 'market' ? '市价' : v === 'limit' ? '限价' : v}</Tag>,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (v?: number) => <Text style={{ color: '#ccc', fontSize: 12 }}>{v ? `$${v.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '市价'}</Text>,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (v: number) => <Text style={{ color: '#ccc', fontSize: 12 }}>{v.toFixed(4)}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => {
        const map: Record<string, [string, string]> = {
          filled: ['success', '已成交'],
          open: ['processing', '待成交'],
          partially_filled: ['warning', '部分成交'],
          cancelled: ['default', '已取消'],
          rejected: ['error', '已拒绝'],
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
            <Title level={4} style={{ color: '#fff', margin: 0 }}>个人中心</Title>
            <Text style={{ color: '#888', fontSize: 12 }}>管理交易所账户与交易记录</Text>
          </div>
        </div>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>已连接交易所</span>}
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
              title={<span style={{ color: '#888', fontSize: 12 }}>历史订单</span>}
              value={orders.length}
              valueStyle={{ color: '#1677ff', fontSize: 22 }}
              prefix={<HistoryOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>已成交订单</span>}
              value={orders.filter((o) => o.status === 'filled').length}
              valueStyle={{ color: '#52c41a', fontSize: 22 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>待成交订单</span>}
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
            label: <span><ApiOutlined />交易所账户</span>,
            children: (
              <Card className="pc-card">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
                    添加交易所
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
            label: <span><HistoryOutlined />订单历史</span>,
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
        title={<span style={{ color: '#fff' }}><ApiOutlined /> 添加交易所账户</span>}
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={() => form.submit()}
        okText="添加并验证"
        cancelText="取消"
        styles={{ body: { background: '#161b22' }, header: { background: '#161b22', borderBottom: '1px solid #1f2937' }, footer: { background: '#161b22', borderTop: '1px solid #1f2937' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddAccount} style={{ marginTop: 16 }}>
          <Form.Item name="exchange" label={<span style={{ color: '#ccc' }}>交易所</span>} rules={[{ required: true }]}>
            <Select placeholder="选择交易所">
              {(['binance', 'okx', 'bybit', 'gate', 'coinbase', 'kraken', 'huobi'] as ExchangeName[]).map((e) => (
                <Option key={e} value={e}>
                  {EXCHANGE_LOGOS[e]} {e.toUpperCase()}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="label" label={<span style={{ color: '#ccc' }}>账户标签</span>} rules={[{ required: true, message: '请输入账户标签' }]}>
            <Input placeholder="如：主账户" />
          </Form.Item>
          <Form.Item name="apiKey" label={<span style={{ color: '#ccc' }}>API Key</span>} rules={[{ required: true, message: '请输入 API Key' }]}>
            <Input placeholder="输入您的 API Key" />
          </Form.Item>
          <Form.Item name="secretKey" label={<span style={{ color: '#ccc' }}>Secret Key</span>} rules={[{ required: true, message: '请输入 Secret Key' }]}>
            <Input.Password placeholder="输入您的 Secret Key" />
          </Form.Item>
          <Form.Item name="passphrase" label={<span style={{ color: '#ccc' }}>Passphrase (可选)</span>}>
            <Input.Password placeholder="OKX 等平台需要填写" />
          </Form.Item>
        </Form>
        <div style={{ background: '#0d1117', border: '1px solid #374151', borderRadius: 6, padding: '10px 14px', marginTop: 8 }}>
          <Text style={{ color: '#888', fontSize: 12 }}>
            🔒 API Key 将使用 AES-256 加密存储，平台仅请求交易和读取权限，不会申请提现权限。
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default PersonalCenter;
