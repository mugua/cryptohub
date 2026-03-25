import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Table, Tag, Button, Modal, Form, Input, Select,
  Spin, Typography, Statistic, Drawer, Tooltip,
  Badge, Space, Popconfirm, message,
} from 'antd';
import {
  PlayCircleOutlined, PauseCircleOutlined, DeleteOutlined,
  BarChartOutlined, PlusOutlined, RobotOutlined, SettingOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import {
  LineChart as _LineChart, Line as _Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, AreaChart, Area, ReferenceLine,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { fetchStrategies, fetchBacktestResult } from '../../services/api';
import type { Strategy, BacktestResult, StrategyType } from '../../types';
import './QuantTrading.css';

const { Title, Text } = Typography;
const { Option } = Select;

const QuantTrading: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [backtestDrawer, setBacktestDrawer] = useState<Strategy | null>(null);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const STATUS_COLOR: Record<string, string> = {
    running: 'success',
    stopped: 'default',
    backtesting: 'processing',
    error: 'error',
  };

  const STATUS_LABEL: Record<string, string> = {
    running: t('trading.statusRunning'),
    stopped: t('trading.statusStopped'),
    backtesting: t('trading.statusBacktesting'),
    error: t('trading.statusError'),
  };

  const STRATEGY_TYPES: { value: StrategyType; label: string; desc: string }[] = [
    { value: 'grid', label: t('trading.grid'), desc: t('trading.gridDesc') },
    { value: 'dca', label: t('trading.dca'), desc: t('trading.dcaDesc') },
    { value: 'momentum', label: t('trading.momentum'), desc: t('trading.momentumDesc') },
    { value: 'mean_reversion', label: t('trading.meanReversion'), desc: t('trading.meanReversionDesc') },
    { value: 'arbitrage', label: t('trading.arbitrage'), desc: t('trading.arbitrageDesc') },
    { value: 'macd_crossover', label: t('trading.macdCrossover'), desc: t('trading.macdCrossoverDesc') },
    { value: 'rsi_reversal', label: t('trading.rsiReversal'), desc: t('trading.rsiReversalDesc') },
    { value: 'bollinger_bands', label: t('trading.bollingerBands'), desc: t('trading.bollingerBandsDesc') },
    { value: 'turtle_trading', label: t('trading.turtleTrading'), desc: t('trading.turtleTradingDesc') },
    { value: 'custom', label: t('trading.custom'), desc: t('trading.customDesc') },
  ];

  useEffect(() => {
    fetchStrategies().then((s) => {
      setStrategies(s);
      setLoading(false);
    });
  }, []);

  const handleToggle = (strategy: Strategy) => {
    setStrategies((prev) =>
      prev.map((s) =>
        s.id === strategy.id
          ? { ...s, status: s.status === 'running' ? 'stopped' : 'running' }
          : s,
      ),
    );
    message.success(strategy.status === 'running' ? t('trading.pausedStrategy', { name: strategy.name }) : t('trading.startedStrategy', { name: strategy.name }));
  };

  const handleDelete = (id: string) => {
    setStrategies((prev) => prev.filter((s) => s.id !== id));
    message.success(t('trading.strategyDeleted'));
  };

  const handleBacktest = async (strategy: Strategy) => {
    setBacktestDrawer(strategy);
    setBacktestLoading(true);
    setBacktestResult(null);
    const result = await fetchBacktestResult(strategy.id);
    setBacktestResult(result);
    setBacktestLoading(false);
  };

  const handleCreateStrategy = (values: Record<string, unknown>) => {
    const newStrategy: Strategy = {
      id: `s${Date.now()}`,
      name: values.name as string,
      type: values.type as StrategyType,
      symbol: values.symbol as string,
      exchange: values.exchange as string,
      status: 'stopped',
      pnl: 0, pnlPct: 0, winRate: 0, totalTrades: 0,
      createdAt: new Date().toISOString(),
      params: {},
    };
    setStrategies((prev) => [newStrategy, ...prev]);
    setCreateOpen(false);
    form.resetFields();
    message.success(t('trading.strategyCreated'));
  };

  const runningCount = strategies.filter((s) => s.status === 'running').length;
  const totalPnl = strategies.reduce((acc, s) => acc + s.pnl, 0);

  const columns = [
    {
      title: t('trading.strategyName'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, row: Strategy) => (
        <div>
          <Text strong style={{ color: '#fff', display: 'block' }}>{name}</Text>
          <Text style={{ color: '#888', fontSize: 11 }}>{row.exchange.toUpperCase()} · {row.symbol}</Text>
        </div>
      ),
    },
    {
      title: t('trading.type'),
      dataIndex: 'type',
      key: 'type',
      render: (tp: StrategyType) => {
        const info = STRATEGY_TYPES.find((s) => s.value === tp);
        return <Tag color="blue" style={{ fontSize: 11 }}>{info?.label ?? tp}</Tag>;
      },
    },
    {
      title: t('trading.status'),
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => <Badge status={STATUS_COLOR[s] as any} text={<Text style={{ color: '#ccc', fontSize: 12 }}>{STATUS_LABEL[s]}</Text>} />,
    },
    {
      title: t('trading.pnl'),
      dataIndex: 'pnl',
      key: 'pnl',
      render: (v: number, row: Strategy) => (
        <div>
          <Text style={{ color: v >= 0 ? '#52c41a' : '#f5222d', fontWeight: 600 }}>
            {v >= 0 ? '+' : ''}${v.toFixed(2)}
          </Text>
          <Text style={{ color: '#888', fontSize: 11, display: 'block' }}>{row.pnlPct.toFixed(2)}%</Text>
        </div>
      ),
    },
    {
      title: t('trading.winRate'),
      dataIndex: 'winRate',
      key: 'winRate',
      render: (v: number) => (
        <Text style={{ color: v >= 50 ? '#52c41a' : '#faad14' }}>{v > 0 ? `${v}%` : '-'}</Text>
      ),
    },
    {
      title: t('trading.tradeCount'),
      dataIndex: 'totalTrades',
      key: 'totalTrades',
      render: (v: number) => <Text style={{ color: '#ccc' }}>{v}</Text>,
    },
    {
      title: t('trading.actions'),
      key: 'actions',
      render: (_: unknown, row: Strategy) => (
        <Space>
          <Tooltip title={row.status === 'running' ? t('trading.pause') : t('trading.start')}>
            <Button
              type="text"
              size="small"
              icon={row.status === 'running' ? <PauseCircleOutlined style={{ color: '#faad14' }} /> : <PlayCircleOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleToggle(row)}
              disabled={row.status === 'backtesting'}
            />
          </Tooltip>
          <Tooltip title={t('trading.backtest')}>
            <Button
              type="text"
              size="small"
              icon={<BarChartOutlined style={{ color: '#1677ff' }} />}
              onClick={() => handleBacktest(row)}
            />
          </Tooltip>
          <Tooltip title={t('trading.config')}>
            <Button
              type="text"
              size="small"
              icon={<SettingOutlined style={{ color: '#888' }} />}
            />
          </Tooltip>
          <Popconfirm
            title={t('trading.confirmDeleteStrategy')}
            onConfirm={() => handleDelete(row.id)}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
          >
            <Button type="text" size="small" icon={<DeleteOutlined style={{ color: '#f5222d' }} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="quant-trading">
      <div className="trading-header">
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          <RobotOutlined /> {t('trading.title')}
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          {t('trading.newStrategy')}
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>{t('trading.runningStrategies')}</span>}
              value={runningCount}
              suffix={`/ ${strategies.length}`}
              valueStyle={{ color: '#52c41a', fontSize: 22 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>{t('trading.totalPnl')}</span>}
              value={totalPnl}
              precision={2}
              prefix="$"
              valueStyle={{ color: totalPnl >= 0 ? '#52c41a' : '#f5222d', fontSize: 22 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>{t('trading.avgWinRate')}</span>}
              value={strategies.filter((s) => s.winRate > 0).reduce((acc, s) => acc + s.winRate, 0) / (strategies.filter((s) => s.winRate > 0).length || 1)}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#1677ff', fontSize: 22 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>{t('trading.totalTrades')}</span>}
              value={strategies.reduce((acc, s) => acc + s.totalTrades, 0)}
              valueStyle={{ color: '#faad14', fontSize: 22 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Strategy Table */}
      <Card className="trading-card">
        <Spin spinning={loading}>
          <Table
            dataSource={strategies}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10, size: 'small' }}
            size="middle"
            className="dark-table"
            scroll={{ x: 800 }}
          />
        </Spin>
      </Card>

      {/* Strategy Library */}
      <Card className="trading-card" style={{ marginTop: 16 }} title={<span style={{ color: '#fff' }}><LineChartOutlined /> {t('trading.strategyLibrary')}</span>}>
        <Row gutter={[12, 12]}>
          {STRATEGY_TYPES.map((st) => (
            <Col key={st.value} xs={24} sm={12} md={8} lg={6}>
              <Card
                className="strategy-lib-card"
                size="small"
                hoverable
                onClick={() => {
                  form.setFieldValue('type', st.value);
                  setCreateOpen(true);
                }}
              >
                <Text strong style={{ color: '#fff', fontSize: 13 }}>{st.label}</Text>
                <Text style={{ color: '#888', fontSize: 11, display: 'block', marginTop: 4 }}>{st.desc}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Create Strategy Modal */}
      <Modal
        title={<span style={{ color: '#fff' }}>{t('trading.createStrategy')}</span>}
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => form.submit()}
        okText={t('trading.createBtn')}
        cancelText={t('common.cancel')}
        styles={{ body: { background: '#161b22' }, header: { background: '#161b22', borderBottom: '1px solid #1f2937' }, footer: { background: '#161b22', borderTop: '1px solid #1f2937' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateStrategy} style={{ marginTop: 16 }}>
          <Form.Item name="name" label={<span style={{ color: '#ccc' }}>{t('trading.strategyNameLabel')}</span>} rules={[{ required: true, message: t('trading.strategyNameRequired') }]}>
            <Input placeholder={t('trading.strategyNamePlaceholder')} />
          </Form.Item>
          <Form.Item name="type" label={<span style={{ color: '#ccc' }}>{t('trading.strategyType')}</span>} rules={[{ required: true }]}>
            <Select placeholder={t('trading.strategyTypePlaceholder')}>
              {STRATEGY_TYPES.map((s) => (
                <Option key={s.value} value={s.value}>{s.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="symbol" label={<span style={{ color: '#ccc' }}>{t('trading.tradingPair')}</span>} rules={[{ required: true }]}>
            <Select placeholder={t('trading.tradingPairPlaceholder')}>
              {['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT'].map((s) => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="exchange" label={<span style={{ color: '#ccc' }}>{t('trading.exchange')}</span>} rules={[{ required: true }]}>
            <Select placeholder={t('trading.exchangePlaceholder')}>
              {['binance', 'okx', 'bybit', 'gate', 'kraken'].map((e) => (
                <Option key={e} value={e}>{e.toUpperCase()}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Backtest Drawer */}
      <Drawer
        title={<span style={{ color: '#fff' }}>{t('trading.backtestTitle', { name: backtestDrawer?.name })}</span>}
        placement="right"
        width={640}
        open={!!backtestDrawer}
        onClose={() => { setBacktestDrawer(null); setBacktestResult(null); }}
        styles={{ body: { background: '#0d1117', padding: 16 }, header: { background: '#161b22', borderBottom: '1px solid #1f2937' } }}
      >
        {backtestLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Spin size="large" tip={t('trading.backtesting')} />
          </div>
        ) : backtestResult ? (
          <>
            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
              {[
                { label: t('trading.totalReturn'), value: `${backtestResult.totalReturn > 0 ? '+' : ''}${backtestResult.totalReturn.toFixed(2)}%`, color: backtestResult.totalReturn >= 0 ? '#52c41a' : '#f5222d' },
                { label: t('trading.annualizedReturn'), value: `${backtestResult.annualizedReturn.toFixed(2)}%`, color: '#1677ff' },
                { label: t('trading.maxDrawdown'), value: `-${backtestResult.maxDrawdown.toFixed(2)}%`, color: '#f5222d' },
                { label: t('trading.sharpeRatio'), value: backtestResult.sharpeRatio.toFixed(2), color: '#faad14' },
                { label: t('trading.winRate'), value: `${backtestResult.winRate.toFixed(1)}%`, color: backtestResult.winRate >= 50 ? '#52c41a' : '#faad14' },
                { label: t('trading.totalTradesLabel'), value: String(backtestResult.totalTrades), color: '#fff' },
              ].map(({ label, value, color }) => (
                <Col span={8} key={label}>
                  <Card style={{ background: '#161b22', border: '1px solid #1f2937' }} size="small">
                    <Text style={{ color: '#888', fontSize: 11, display: 'block' }}>{label}</Text>
                    <Text style={{ color, fontSize: 18, fontWeight: 700 }}>{value}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
            <Card style={{ background: '#161b22', border: '1px solid #1f2937' }}>
              <Text style={{ color: '#ccc', fontSize: 13, display: 'block', marginBottom: 12 }}>{t('trading.equityCurve')}</Text>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={backtestResult.equityCurve}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1677ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#1677ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="time" tick={{ fill: '#555', fontSize: 10 }} interval={29} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#555', fontSize: 10 }} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                  <ReTooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', color: '#fff' }} formatter={(v) => [`$${Number(v).toFixed(2)}`, t('trading.capital')]} />
                  <ReferenceLine y={backtestResult.initialCapital} stroke="#888" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="value" stroke="#1677ff" fill="url(#equityGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </>
        ) : null}
      </Drawer>
    </div>
  );
};

export default QuantTrading;
