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
import { fetchStrategies, fetchBacktestResult } from '../../services/api';
import type { Strategy, BacktestResult, StrategyType } from '../../types';
import './QuantTrading.css';

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_COLOR: Record<string, string> = {
  running: 'success',
  stopped: 'default',
  backtesting: 'processing',
  error: 'error',
};

const STATUS_LABEL: Record<string, string> = {
  running: '运行中',
  stopped: '已停止',
  backtesting: '回测中',
  error: '错误',
};

const STRATEGY_TYPES: { value: StrategyType; label: string; desc: string }[] = [
  { value: 'grid', label: '网格交易', desc: '在价格区间内等间距下单，震荡市场获利' },
  { value: 'dca', label: '定投策略 (DCA)', desc: '按固定时间间隔定额买入，降低持仓均价' },
  { value: 'momentum', label: '动量策略', desc: '跟随强势趋势，追涨杀跌' },
  { value: 'mean_reversion', label: '均值回归', desc: '价格偏离均值时反向操作' },
  { value: 'arbitrage', label: '套利策略', desc: '利用不同交易所或合约间价差套利' },
  { value: 'macd_crossover', label: 'MACD金叉/死叉', desc: 'MACD信号线金叉买入，死叉卖出' },
  { value: 'rsi_reversal', label: 'RSI反转', desc: 'RSI超买超卖区间反转交易' },
  { value: 'bollinger_bands', label: '布林带策略', desc: '价格触及布林带上下轨时交易' },
  { value: 'turtle_trading', label: '海龟交易', desc: '唐奇安通道突破，趋势跟踪经典策略' },
  { value: 'custom', label: '自定义策略', desc: '通过Python代码自定义交易逻辑' },
];

const QuantTrading: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [backtestDrawer, setBacktestDrawer] = useState<Strategy | null>(null);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [form] = Form.useForm();

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
    message.success(strategy.status === 'running' ? `已暂停 ${strategy.name}` : `已启动 ${strategy.name}`);
  };

  const handleDelete = (id: string) => {
    setStrategies((prev) => prev.filter((s) => s.id !== id));
    message.success('策略已删除');
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
    message.success('策略创建成功');
  };

  const runningCount = strategies.filter((s) => s.status === 'running').length;
  const totalPnl = strategies.reduce((acc, s) => acc + s.pnl, 0);

  const columns = [
    {
      title: '策略名称',
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
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (t: StrategyType) => {
        const info = STRATEGY_TYPES.find((s) => s.value === t);
        return <Tag color="blue" style={{ fontSize: 11 }}>{info?.label ?? t}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => <Badge status={STATUS_COLOR[s] as any} text={<Text style={{ color: '#ccc', fontSize: 12 }}>{STATUS_LABEL[s]}</Text>} />,
    },
    {
      title: '总盈亏',
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
      title: '胜率',
      dataIndex: 'winRate',
      key: 'winRate',
      render: (v: number) => (
        <Text style={{ color: v >= 50 ? '#52c41a' : '#faad14' }}>{v > 0 ? `${v}%` : '-'}</Text>
      ),
    },
    {
      title: '交易次数',
      dataIndex: 'totalTrades',
      key: 'totalTrades',
      render: (v: number) => <Text style={{ color: '#ccc' }}>{v}</Text>,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, row: Strategy) => (
        <Space>
          <Tooltip title={row.status === 'running' ? '暂停' : '启动'}>
            <Button
              type="text"
              size="small"
              icon={row.status === 'running' ? <PauseCircleOutlined style={{ color: '#faad14' }} /> : <PlayCircleOutlined style={{ color: '#52c41a' }} />}
              onClick={() => handleToggle(row)}
              disabled={row.status === 'backtesting'}
            />
          </Tooltip>
          <Tooltip title="回测">
            <Button
              type="text"
              size="small"
              icon={<BarChartOutlined style={{ color: '#1677ff' }} />}
              onClick={() => handleBacktest(row)}
            />
          </Tooltip>
          <Tooltip title="配置">
            <Button
              type="text"
              size="small"
              icon={<SettingOutlined style={{ color: '#888' }} />}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除此策略？"
            onConfirm={() => handleDelete(row.id)}
            okText="删除"
            cancelText="取消"
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
          <RobotOutlined /> 量化交易
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          新建策略
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>运行策略</span>}
              value={runningCount}
              suffix={`/ ${strategies.length}`}
              valueStyle={{ color: '#52c41a', fontSize: 22 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>策略总盈亏</span>}
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
              title={<span style={{ color: '#888', fontSize: 12 }}>平均胜率</span>}
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
              title={<span style={{ color: '#888', fontSize: 12 }}>总交易次数</span>}
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
      <Card className="trading-card" style={{ marginTop: 16 }} title={<span style={{ color: '#fff' }}><LineChartOutlined /> 策略库</span>}>
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
        title={<span style={{ color: '#fff' }}>新建量化策略</span>}
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => form.submit()}
        okText="创建策略"
        cancelText="取消"
        styles={{ body: { background: '#161b22' }, header: { background: '#161b22', borderBottom: '1px solid #1f2937' }, footer: { background: '#161b22', borderTop: '1px solid #1f2937' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateStrategy} style={{ marginTop: 16 }}>
          <Form.Item name="name" label={<span style={{ color: '#ccc' }}>策略名称</span>} rules={[{ required: true, message: '请输入策略名称' }]}>
            <Input placeholder="如：BTC 网格策略" />
          </Form.Item>
          <Form.Item name="type" label={<span style={{ color: '#ccc' }}>策略类型</span>} rules={[{ required: true }]}>
            <Select placeholder="选择策略类型">
              {STRATEGY_TYPES.map((s) => (
                <Option key={s.value} value={s.value}>{s.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="symbol" label={<span style={{ color: '#ccc' }}>交易对</span>} rules={[{ required: true }]}>
            <Select placeholder="选择交易对">
              {['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT'].map((s) => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="exchange" label={<span style={{ color: '#ccc' }}>交易所</span>} rules={[{ required: true }]}>
            <Select placeholder="选择交易所">
              {['binance', 'okx', 'bybit', 'gate', 'kraken'].map((e) => (
                <Option key={e} value={e}>{e.toUpperCase()}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Backtest Drawer */}
      <Drawer
        title={<span style={{ color: '#fff' }}>策略回测 — {backtestDrawer?.name}</span>}
        placement="right"
        width={640}
        open={!!backtestDrawer}
        onClose={() => { setBacktestDrawer(null); setBacktestResult(null); }}
        styles={{ body: { background: '#0d1117', padding: 16 }, header: { background: '#161b22', borderBottom: '1px solid #1f2937' } }}
      >
        {backtestLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Spin size="large" tip="正在回测中..." />
          </div>
        ) : backtestResult ? (
          <>
            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
              {[
                { label: '总收益率', value: `${backtestResult.totalReturn > 0 ? '+' : ''}${backtestResult.totalReturn.toFixed(2)}%`, color: backtestResult.totalReturn >= 0 ? '#52c41a' : '#f5222d' },
                { label: '年化收益', value: `${backtestResult.annualizedReturn.toFixed(2)}%`, color: '#1677ff' },
                { label: '最大回撤', value: `-${backtestResult.maxDrawdown.toFixed(2)}%`, color: '#f5222d' },
                { label: '夏普比率', value: backtestResult.sharpeRatio.toFixed(2), color: '#faad14' },
                { label: '胜率', value: `${backtestResult.winRate.toFixed(1)}%`, color: backtestResult.winRate >= 50 ? '#52c41a' : '#faad14' },
                { label: '总交易数', value: String(backtestResult.totalTrades), color: '#fff' },
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
              <Text style={{ color: '#ccc', fontSize: 13, display: 'block', marginBottom: 12 }}>资金曲线</Text>
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
                  <ReTooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', color: '#fff' }} formatter={(v) => [`$${Number(v).toFixed(2)}`, '资金']} />
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
