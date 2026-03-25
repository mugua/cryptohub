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
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();

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
        <Spin size="large" tip={t('common.loading')} />
      </div>
    );
  }

  const locale = i18n.language === 'en_US' ? 'en-US' : 'zh-CN';

  const equityData = btcCandles.map((c, i) => ({
    time: i,
    price: c.close,
    label: new Date(c.time).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
  }));

  const pieData = portfolio?.assets.map((a) => ({
    name: a.coin,
    value: a.usdValue,
  })) ?? [];

  const tickerColumns = [
    {
      title: t('dashboard.tradingPair'),
      dataIndex: 'symbol',
      key: 'symbol',
      render: (s: string) => <Text strong style={{ color: '#fff' }}>{s}</Text>,
    },
    {
      title: t('dashboard.latestPrice'),
      dataIndex: 'price',
      key: 'price',
      render: (p: number) => <Text style={{ color: '#fff' }}>${p.toLocaleString('en-US', { maximumFractionDigits: 4 })}</Text>,
    },
    {
      title: t('dashboard.change24h'),
      dataIndex: 'changePct24h',
      key: 'changePct24h',
      render: (v: number) => (
        <Tag color={v >= 0 ? 'success' : 'error'} icon={v >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}>
          {v >= 0 ? '+' : ''}{v.toFixed(2)}%
        </Tag>
      ),
    },
    {
      title: t('dashboard.volume24h'),
      dataIndex: 'volume24h',
      key: 'volume24h',
      render: (v: number) => <Text style={{ color: '#888' }}>${(v / 1e6).toFixed(1)}M</Text>,
    },
  ];

  const positionColumns = [
    { title: t('dashboard.contract'), dataIndex: 'symbol', key: 'symbol', render: (s: string) => <Text strong style={{ color: '#fff' }}>{s}</Text> },
    {
      title: t('dashboard.direction'),
      dataIndex: 'side',
      key: 'side',
      render: (s: string) => <Tag color={s === 'long' ? 'success' : 'error'}>{s === 'long' ? t('dashboard.long') : t('dashboard.short')}</Tag>,
    },
    { title: t('dashboard.quantity'), dataIndex: 'size', key: 'size', render: (v: number) => <Text style={{ color: '#fff' }}>{v}</Text> },
    { title: t('dashboard.entryPrice'), dataIndex: 'entryPrice', key: 'entryPrice', render: (v: number) => <Text style={{ color: '#888' }}>${v.toLocaleString()}</Text> },
    { title: t('dashboard.markPrice'), dataIndex: 'markPrice', key: 'markPrice', render: (v: number) => <Text style={{ color: '#fff' }}>${v.toLocaleString()}</Text> },
    {
      title: t('dashboard.unrealizedPnl'),
      dataIndex: 'unrealizedPnl',
      key: 'unrealizedPnl',
      render: (v: number) => (
        <Text style={{ color: v >= 0 ? '#52c41a' : '#f5222d' }}>
          {v >= 0 ? '+' : ''}${v.toFixed(2)}
        </Text>
      ),
    },
    { title: t('dashboard.leverage'), dataIndex: 'leverage', key: 'leverage', render: (v: number) => <Tag color="blue">{v}x</Tag> },
  ];

  return (
    <div className="dashboard">
      <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>
        <DollarOutlined /> {t('dashboard.title')}
      </Title>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title={<span style={{ color: '#888' }}>{t('dashboard.totalAssets')}</span>}
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
              title={<span style={{ color: '#888' }}>{t('dashboard.dailyPnl')}</span>}
              value={portfolio?.dailyPnl}
              precision={2}
              prefix={portfolio && portfolio.dailyPnl >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="$"
              valueStyle={{ color: portfolio && portfolio.dailyPnl >= 0 ? '#52c41a' : '#f5222d', fontSize: 24 }}
            />
            <Text style={{ color: portfolio && portfolio.dailyPnl >= 0 ? '#52c41a' : '#f5222d', fontSize: 12 }}>
              {portfolio?.dailyPnlPct.toFixed(2)}% {t('dashboard.comparedYesterday')}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title={<span style={{ color: '#888' }}>{t('dashboard.runningStrategies')}</span>}
              value={3}
              prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
              suffix={t('dashboard.strategySuffix')}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
            <Text style={{ color: '#888', fontSize: 12 }}>{t('dashboard.totalStrategies', { count: 6 })}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title={<span style={{ color: '#888' }}>{t('dashboard.positionPnl')}</span>}
              value={1590}
              precision={2}
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              suffix="$"
              valueStyle={{ color: '#52c41a', fontSize: 24 }}
            />
            <Text style={{ color: '#52c41a', fontSize: 12 }}>+2.1% {t('dashboard.unrealized')}</Text>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card
            className="chart-card"
            title={<span style={{ color: '#fff' }}>{t('dashboard.btcPriceTrend')}</span>}
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
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, t('dashboard.btcPrice')]}
                />
                <Area type="monotone" dataKey="price" stroke="#1677ff" fill="url(#btcGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            className="chart-card"
            title={<span style={{ color: '#fff' }}>{t('dashboard.assetDistribution')}</span>}
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
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, t('dashboard.valuation')]}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Market Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card className="chart-card" title={<span style={{ color: '#fff' }}>{t('dashboard.marketInfo')}</span>}>
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
          <Card className="chart-card" title={<span style={{ color: '#fff' }}>{t('dashboard.currentPositions')}</span>}>
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
