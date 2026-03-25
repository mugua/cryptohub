import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Select, Spin, Tag, Typography, Progress, Table,
  Tabs, Statistic, Alert,
} from 'antd';
import {
  LineChartOutlined, GlobalOutlined, SafetyCertificateOutlined,
  TeamOutlined, ThunderboltOutlined, ExperimentOutlined,
} from '@ant-design/icons';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { fetchAnalysis, fetchCandles } from '../../services/api';
import type { AnalysisReport, Candle } from '../../types';
import './MarketAnalysis.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const SIGNAL_COLOR: Record<string, string> = {
  strong_buy: '#00c853',
  buy: '#52c41a',
  neutral: '#faad14',
  sell: '#f5222d',
  strong_sell: '#cf1322',
};

const SIGNAL_LABEL: Record<string, string> = {
  strong_buy: '强烈买入',
  buy: '建议买入',
  neutral: '中性观望',
  sell: '建议卖出',
  strong_sell: '强烈卖出',
};

const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT'];

const MarketAnalysis: React.FC = () => {
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchAnalysis(symbol),
      fetchCandles(symbol, '1d', 90),
    ]).then(([r, c]) => {
      setReport(r);
      setCandles(c);
      setLoading(false);
    });
  }, [symbol]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" tip="正在生成分析报告..." />
      </div>
    );
  }

  const chartData = candles.map((c) => ({
    date: new Date(c.time).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    close: c.close,
    volume: c.volume,
  }));

  const radarData = report
    ? [
        { subject: '宏观经济', A: Math.max(0, report.macro.score) },
        { subject: '政策法规', A: Math.max(0, report.policy.score) },
        { subject: '供需分析', A: Math.max(0, report.supplyDemand.score) },
        { subject: '市场情绪', A: Math.max(0, report.sentiment.score) },
        { subject: '技术面', A: report.technical.trend === 'uptrend' ? 75 : report.technical.trend === 'downtrend' ? 25 : 50 },
      ]
    : [];

  const policyColumns = [
    { title: '日期', dataIndex: 'date', key: 'date', width: 110, render: (v: string) => <Text style={{ color: '#888', fontSize: 12 }}>{v}</Text> },
    { title: '国家/地区', dataIndex: 'country', key: 'country', width: 100, render: (v: string) => <Text style={{ color: '#ccc', fontSize: 12 }}>{v}</Text> },
    { title: '事件', dataIndex: 'title', key: 'title', render: (v: string) => <Text style={{ color: '#fff', fontSize: 12 }}>{v}</Text> },
    {
      title: '影响',
      dataIndex: 'impact',
      key: 'impact',
      width: 80,
      render: (v: string) => (
        <Tag color={v === 'positive' ? 'success' : v === 'negative' ? 'error' : 'default'} style={{ fontSize: 11 }}>
          {v === 'positive' ? '利好' : v === 'negative' ? '利空' : '中性'}
        </Tag>
      ),
    },
  ];

  const indicatorColumns = [
    { title: '指标', dataIndex: 'name', key: 'name', render: (v: string) => <Text style={{ color: '#ccc' }}>{v}</Text> },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      render: (v: number | string) => (
        <Text style={{ color: '#fff' }}>{typeof v === 'number' ? v.toFixed(2) : v}</Text>
      ),
    },
    {
      title: '信号',
      dataIndex: 'signal',
      key: 'signal',
      render: (v: string) => (
        <Tag color={v === 'buy' ? 'success' : v === 'sell' ? 'error' : 'default'}>
          {v === 'buy' ? '买入' : v === 'sell' ? '卖出' : '中性'}
        </Tag>
      ),
    },
  ];

  const ScoreCard: React.FC<{ title: string; score: number; icon: React.ReactNode; summary: string }> = ({
    title, score, icon, summary,
  }) => (
    <Card className="analysis-card" size="small">
      <div className="score-header">
        {icon}
        <Text style={{ color: '#ccc', marginLeft: 8 }}>{title}</Text>
        <span style={{ marginLeft: 'auto', color: score >= 60 ? '#52c41a' : score >= 40 ? '#faad14' : '#f5222d', fontWeight: 700, fontSize: 20 }}>
          {score}
        </span>
      </div>
      <Progress
        percent={score}
        strokeColor={score >= 60 ? '#52c41a' : score >= 40 ? '#faad14' : '#f5222d'}
        trailColor="#1f2937"
        showInfo={false}
        size="small"
        style={{ margin: '8px 0' }}
      />
      <Text style={{ color: '#888', fontSize: 12 }}>{summary}</Text>
    </Card>
  );

  return (
    <div className="market-analysis">
      {/* Header */}
      <div className="analysis-header">
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          <LineChartOutlined /> 市场深度分析
        </Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Select value={symbol} onChange={setSymbol} style={{ width: 160 }} size="middle">
            {SYMBOLS.map((s) => (
              <Option key={s} value={s}>{s}</Option>
            ))}
          </Select>
          {report && (
            <Tag
              color={SIGNAL_COLOR[report.signal]}
              style={{ fontSize: 14, padding: '4px 12px', borderRadius: 6 }}
            >
              {SIGNAL_LABEL[report.signal]}
            </Tag>
          )}
        </div>
      </div>

      {/* Summary Alert */}
      {report && (
        <Alert
          message={<Text style={{ color: '#fff' }}><strong>综合研判：</strong>{report.summary}</Text>}
          type="info"
          showIcon
          style={{ background: '#0d2137', border: '1px solid #1677ff', marginBottom: 16, borderRadius: 8 }}
        />
      )}

      <Row gutter={[16, 16]}>
        {/* Price Chart */}
        <Col xs={24} xl={16}>
          <Card className="analysis-card" title={<span style={{ color: '#fff' }}>{symbol} 价格走势 (90天)</span>}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1677ff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#1677ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 11 }} interval={14} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#555', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', color: '#fff' }} formatter={(v) => [`$${Number(v).toLocaleString()}`, '价格']} />
                <Area type="monotone" dataKey="close" stroke="#1677ff" fill="url(#priceGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Radar Chart */}
        <Col xs={24} xl={8}>
          <Card className="analysis-card" title={<span style={{ color: '#fff' }}>综合评分雷达图</span>}>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#1f2937" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 11 }} />
                <Radar name="评分" dataKey="A" stroke="#1677ff" fill="#1677ff" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Analysis Tabs */}
      <Card className="analysis-card" style={{ marginTop: 16 }}>
        <Tabs
          defaultActiveKey="macro"
          items={[
            {
              key: 'macro',
              label: <span><GlobalOutlined />宏观经济</span>,
              children: report && (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <ScoreCard
                      title="宏观经济评分"
                      score={report.macro.score}
                      icon={<GlobalOutlined style={{ color: '#1677ff' }} />}
                      summary={report.macro.summary}
                    />
                  </Col>
                  <Col xs={24} md={16}>
                    <Row gutter={[12, 12]}>
                      <Col span={8}>
                        <Statistic
                          title={<span style={{ color: '#888', fontSize: 12 }}>恐慌贪婪指数</span>}
                          value={report.macro.fearGreedIndex}
                          suffix="/100"
                          valueStyle={{ color: report.macro.fearGreedIndex >= 60 ? '#f5222d' : '#52c41a', fontSize: 22 }}
                        />
                        <Text style={{ color: '#888', fontSize: 11 }}>
                          {report.macro.fearGreedIndex >= 75 ? '极度贪婪' : report.macro.fearGreedIndex >= 55 ? '贪婪' : report.macro.fearGreedIndex >= 45 ? '中性' : '恐慌'}
                        </Text>
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title={<span style={{ color: '#888', fontSize: 12 }}>美元指数 (DXY)</span>}
                          value={report.macro.dollarIndex}
                          valueStyle={{ color: '#fff', fontSize: 22 }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title={<span style={{ color: '#888', fontSize: 12 }}>通胀预期</span>}
                          value={report.macro.inflationExpectation}
                          valueStyle={{ color: '#faad14', fontSize: 16 }}
                        />
                      </Col>
                    </Row>
                    <Paragraph style={{ color: '#aaa', marginTop: 16, fontSize: 13, lineHeight: '1.8' }}>
                      {report.macro.summary}
                    </Paragraph>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'policy',
              label: <span><SafetyCertificateOutlined />政策法规</span>,
              children: report && (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <ScoreCard
                      title="政策法规评分"
                      score={report.policy.score}
                      icon={<SafetyCertificateOutlined style={{ color: '#faad14' }} />}
                      summary={report.policy.summary}
                    />
                  </Col>
                  <Col xs={24} md={16}>
                    <Text style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 8 }}>近期政策事件</Text>
                    <Table
                      dataSource={report.policy.recentEvents}
                      columns={policyColumns}
                      pagination={false}
                      size="small"
                      className="dark-table"
                      rowKey="title"
                    />
                  </Col>
                </Row>
              ),
            },
            {
              key: 'supply',
              label: <span><TeamOutlined />供需分析</span>,
              children: report && (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <ScoreCard
                      title="供需分析评分"
                      score={report.supplyDemand.score}
                      icon={<TeamOutlined style={{ color: '#52c41a' }} />}
                      summary={report.supplyDemand.summary}
                    />
                  </Col>
                  <Col xs={24} md={16}>
                    <Row gutter={[12, 12]}>
                      <Col span={12}>
                        <Statistic
                          title={<span style={{ color: '#888', fontSize: 12 }}>交易所净流量 (BTC)</span>}
                          value={report.supplyDemand.exchangeNetflow}
                          valueStyle={{ color: report.supplyDemand.exchangeNetflow < 0 ? '#52c41a' : '#f5222d', fontSize: 20 }}
                        />
                        <Text style={{ color: '#888', fontSize: 11 }}>
                          {report.supplyDemand.exchangeNetflow < 0 ? '净流出 (看涨)' : '净流入 (看跌)'}
                        </Text>
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title={<span style={{ color: '#888', fontSize: 12 }}>矿工净流量</span>}
                          value={report.supplyDemand.minersNetflow}
                          valueStyle={{ color: '#fff', fontSize: 20 }}
                        />
                      </Col>
                      <Col span={24} style={{ marginTop: 8 }}>
                        <Text style={{ color: '#888', fontSize: 12 }}>鲸鱼动向：</Text>
                        <Tag color={report.supplyDemand.whaleActivity === 'accumulating' ? 'success' : report.supplyDemand.whaleActivity === 'distributing' ? 'error' : 'default'}>
                          {report.supplyDemand.whaleActivity === 'accumulating' ? '积累中' : report.supplyDemand.whaleActivity === 'distributing' ? '分发中' : '中性'}
                        </Tag>
                      </Col>
                    </Row>
                    <Paragraph style={{ color: '#aaa', marginTop: 12, fontSize: 13, lineHeight: '1.8' }}>
                      {report.supplyDemand.summary}
                    </Paragraph>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'sentiment',
              label: <span><TeamOutlined />市场情绪</span>,
              children: report && (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <ScoreCard
                      title="市场情绪评分"
                      score={report.sentiment.score}
                      icon={<ThunderboltOutlined style={{ color: '#f5222d' }} />}
                      summary={report.sentiment.summary}
                    />
                  </Col>
                  <Col xs={24} md={16}>
                    <Row gutter={[12, 12]}>
                      <Col span={8}>
                        <Statistic
                          title={<span style={{ color: '#888', fontSize: 12 }}>恐慌贪婪</span>}
                          value={report.sentiment.fearGreedIndex}
                          suffix="/100"
                          valueStyle={{ color: '#f5222d', fontSize: 22 }}
                        />
                        <Tag color="error">{report.sentiment.fearGreedLabel}</Tag>
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title={<span style={{ color: '#888', fontSize: 12 }}>Twitter看多率</span>}
                          value={report.sentiment.twitterBullishPct}
                          suffix="%"
                          valueStyle={{ color: '#52c41a', fontSize: 22 }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title={<span style={{ color: '#888', fontSize: 12 }}>Reddit情绪</span>}
                          value={report.sentiment.redditSentiment}
                          valueStyle={{ color: '#1677ff', fontSize: 18 }}
                        />
                      </Col>
                    </Row>
                    <Paragraph style={{ color: '#aaa', marginTop: 12, fontSize: 13, lineHeight: '1.8' }}>
                      {report.sentiment.summary}
                    </Paragraph>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'technical',
              label: <span><ExperimentOutlined />技术分析</span>,
              children: report && (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card className="inner-card" size="small" title={<span style={{ color: '#ccc' }}>技术指标</span>}>
                      <Table
                        dataSource={report.technical.indicators}
                        columns={indicatorColumns}
                        pagination={false}
                        size="small"
                        className="dark-table"
                        rowKey="name"
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card className="inner-card" size="small" title={<span style={{ color: '#ccc' }}>关键价位</span>}>
                      <div style={{ marginBottom: 12 }}>
                        <Text style={{ color: '#52c41a', fontSize: 13, display: 'block', marginBottom: 6 }}>支撑位</Text>
                        {report.technical.supportLevels.map((l, i) => (
                          <Tag key={i} color="success" style={{ marginBottom: 4 }}>S{i + 1}: ${l.toLocaleString()}</Tag>
                        ))}
                      </div>
                      <div>
                        <Text style={{ color: '#f5222d', fontSize: 13, display: 'block', marginBottom: 6 }}>阻力位</Text>
                        {report.technical.resistanceLevels.map((l, i) => (
                          <Tag key={i} color="error" style={{ marginBottom: 4 }}>R{i + 1}: ${l.toLocaleString()}</Tag>
                        ))}
                      </div>
                      <div style={{ marginTop: 16 }}>
                        <Text style={{ color: '#888', fontSize: 12 }}>趋势判断：</Text>
                        <Tag color={report.technical.trend === 'uptrend' ? 'success' : report.technical.trend === 'downtrend' ? 'error' : 'default'} style={{ marginLeft: 8 }}>
                          {report.technical.trend === 'uptrend' ? '上升趋势' : report.technical.trend === 'downtrend' ? '下降趋势' : '横盘整理'}
                        </Tag>
                      </div>
                      <Paragraph style={{ color: '#aaa', marginTop: 12, fontSize: 13, lineHeight: '1.8' }}>
                        {report.technical.summary}
                      </Paragraph>
                    </Card>
                  </Col>
                </Row>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default MarketAnalysis;
