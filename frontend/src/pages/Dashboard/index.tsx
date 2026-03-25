import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Statistic, Table, Tag, Spin, Progress, Typography,
} from 'antd';
import {
  ArrowUpOutlined, ArrowDownOutlined, DollarOutlined,
  RiseOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { fetchPortfolio, fetchTickers, fetchCandles } from '../../services/api';
import type { PortfolioSnapshot, Ticker, Candle } from '../../types';
import './Dashboard.css';

const { Title, Text } = Typography;

const PIE_COLORS = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

const Dashboard: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(null);
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [btcCandles, setBtcCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchPortfolio(),
      fetchTickers(),
      fetchCandles('BTC/USDT', '1h', 48),
    ]).then(([p, t, c]) => {
      setPortfolio(p);
      setTickers(t);
      setBtcCandles(c);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" tip="加载数据中..." />
      </div>
    );
  }

  const equityData = btcCandles.map((c, i) => ({
    time: i,
    price: c.close,
    label: new Date(c.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  }));

  const pieData = portfolio?.assets.map((a) => ({
    name: a.coin,
    value: a.usdValue,
  })) ?? [];

  const tickerColumns = [
    {
      title: '交易对',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (s: string) => <Text strong style={{ color: '#fff' }}>{s}</Text>,
    },
    {
      title: '最新价',
      dataIndex: 'price',
      key: 'price',
      render: (p: number) => <Text style={{ color: '#fff' }}>${p.toLocaleString('en-US', { maximumFractionDigits: 4 })}</Text>,
    },
    {
      title: '24h涨跌',
      dataIndex: 'changePct24h',
      key: 'changePct24h',
      render: (v: number) => (
        <Tag color={v >= 0 ? 'success' : 'error'} icon={v >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}>
          {v >= 0 ? '+' : ''}{v.toFixed(2)}%
        </Tag>
      ),
    },
    {
      title: '24h成交量',
      dataIndex: 'volume24h',
      key: 'volume24h',
      render: (v: number) => <Text style={{ color: '#888' }}>${(v / 1e6).toFixed(1)}M</Text>,
    },
  ];

  const positionColumns = [
    { title: '合约', dataIndex: 'symbol', key: 'symbol', render: (s: string) => <Text strong style={{ color: '#fff' }}>{s}</Text> },
    {
      title: '方向',
      dataIndex: 'side',
      key: 'side',
      render: (s: string) => <Tag color={s === 'long' ? 'success' : 'error'}>{s === 'long' ? '做多' : '做空'}</Tag>,
    },
    { title: '数量', dataIndex: 'size', key: 'size', render: (v: number) => <Text style={{ color: '#fff' }}>{v}</Text> },
    { title: '开仓价', dataIndex: 'entryPrice', key: 'entryPrice', render: (v: number) => <Text style={{ color: '#888' }}>${v.toLocaleString()}</Text> },
    { title: '标记价', dataIndex: 'markPrice', key: 'markPrice', render: (v: number) => <Text style={{ color: '#fff' }}>${v.toLocaleString()}</Text> },
    {
      title: '未实现盈亏',
      dataIndex: 'unrealizedPnl',
      key: 'unrealizedPnl',
      render: (v: number) => (
        <Text style={{ color: v >= 0 ? '#52c41a' : '#f5222d' }}>
          {v >= 0 ? '+' : ''}${v.toFixed(2)}
        </Text>
      ),
    },
    { title: '杠杆', dataIndex: 'leverage', key: 'leverage', render: (v: number) => <Tag color="blue">{v}x</Tag> },
  ];

  return (
    <div className="dashboard">
      <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>
        <DollarOutlined /> 资产总览
      </Title>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title={<span style={{ color: '#888' }}>总资产 (USDT)</span>}
              value={portfolio?.totalUsdValue}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
            <Progress percent={100} showInfo={false} strokeColor="#1677ff" size="small" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title={<span style={{ color: '#888' }}>今日盈亏</span>}
              value={portfolio?.dailyPnl}
              precision={2}
              prefix={portfolio && portfolio.dailyPnl >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="$"
              valueStyle={{ color: portfolio && portfolio.dailyPnl >= 0 ? '#52c41a' : '#f5222d', fontSize: 24 }}
            />
            <Text style={{ color: portfolio && portfolio.dailyPnl >= 0 ? '#52c41a' : '#f5222d', fontSize: 12 }}>
              {portfolio?.dailyPnlPct.toFixed(2)}% 较昨日
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title={<span style={{ color: '#888' }}>运行策略</span>}
              value={3}
              prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
              suffix="个"
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
            <Text style={{ color: '#888', fontSize: 12 }}>共 6 个策略</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title={<span style={{ color: '#888' }}>持仓盈亏</span>}
              value={1590}
              precision={2}
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              suffix="$"
              valueStyle={{ color: '#52c41a', fontSize: 24 }}
            />
            <Text style={{ color: '#52c41a', fontSize: 12 }}>+2.1% 未实现</Text>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card
            className="chart-card"
            title={<span style={{ color: '#fff' }}>BTC/USDT 价格走势 (48H)</span>}
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="btcGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1677ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1677ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 11 }} interval={7} />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: '#666', fontSize: 11 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', color: '#fff' }}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, 'BTC价格']}
                />
                <Area type="monotone" dataKey="price" stroke="#1677ff" fill="url(#btcGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            className="chart-card"
            title={<span style={{ color: '#fff' }}>资产分布</span>}
          >
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={{ stroke: '#666' }}>
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', color: '#fff' }}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, '估值']}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Market Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card className="chart-card" title={<span style={{ color: '#fff' }}>市场行情</span>}>
            <Table
              dataSource={tickers}
              columns={tickerColumns}
              rowKey="symbol"
              pagination={false}
              size="small"
              className="dark-table"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="chart-card" title={<span style={{ color: '#fff' }}>当前持仓</span>}>
            <Table
              dataSource={portfolio?.positions}
              columns={positionColumns}
              rowKey="symbol"
              pagination={false}
              size="small"
              className="dark-table"
              scroll={{ x: 500 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
