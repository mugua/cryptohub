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
import { useTranslation } from 'react-i18next';
import { fetchAnalysis, fetchCandles } from '../../services/api';
import type { AnalysisReport, Candle } from '../../types';
import './MarketAnalysis.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT'];

const MarketAnalysis: React.FC = () => {
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  const SIGNAL_COLOR: Record<string, string> = {
    strong_buy: '#00c853',
    buy: '#52c41a',
    neutral: '#faad14',
    sell: '#f5222d',
    strong_sell: '#cf1322',
  };

  const SIGNAL_LABEL: Record<string, string> = {
    strong_buy: t('market.strongBuy'),
    buy: t('market.recommendBuy'),
    neutral: t('market.neutralWatch'),
    sell: t('market.recommendSell'),
    strong_sell: t('market.strongSell'),
  };

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
        <Spin size="large" tip={t('market.generatingReport')} />
      </div>
    );
  }

  const locale = i18n.language === 'en_US' ? 'en-US' : 'zh-CN';

  const chartData = candles.map((c) => ({
    date: new Date(c.time).toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
    close: c.close,
    volume: c.volume,
  }));

  const radarData = report
    ? [
        { subject: t('market.macro'), A: Math.max(0, report.macro.score) },
        { subject: t('market.policy'), A: Math.max(0, report.policy.score) },
        { subject: t('market.supplyDemand'), A: Math.max(0, report.supplyDemand.score) },
        { subject: t('market.sentiment'), A: Math.max(0, report.sentiment.score) },
        { subject: t('market.technical'), A: report.technical.trend === 'uptrend' ? 75 : report.technical.trend === 'downtrend' ? 25 : 50 },
      ]
    : [];

  const policyColumns = [
    { title: t('market.date'), dataIndex: 'date', key: 'date', width: 110, render: (v: string) => <Text style={{ color: '#888', fontSize: 12 }}>{v}</Text> },
    { title: t('market.countryRegion'), dataIndex: 'country', key: 'country', width: 100, render: (v: string) => <Text style={{ color: '#ccc', fontSize: 12 }}>{v}</Text> },
    { title: t('market.event'), dataIndex: 'title', key: 'title', render: (v: string) => <Text style={{ color: '#fff', fontSize: 12 }}>{v}</Text> },
    {
      title: t('market.impact'),
      dataIndex: 'impact',
      key: 'impact',
      width: 80,
      render: (v: string) => (
        <Tag color={v === 'positive' ? 'success' : v === 'negative' ? 'error' : 'default'} style={{ fontSize: 11 }}>
          {v === 'positive' ? t('market.positive') : v === 'negative' ? t('market.negative') : t('market.neutral')}
        </Tag>
      ),
    },
  ];

  const indicatorColumns = [
    { title: t('market.indicator'), dataIndex: 'name', key: 'name', render: (v: string) => <Text style={{ color: '#ccc' }}>{v}</Text> },
    {
      title: t('market.value'),
      dataIndex: 'value',
      key: 'value',
      render: (v: number | string) => (
        <Text style={{ color: '#fff' }}>{typeof v === 'number' ? v.toFixed(2) : v}</Text>
      ),
    },
    {
      title: t('market.signal'),
      dataIndex: 'signal',
      key: 'signal',
      render: (v: string) => (
        <Tag color={v === 'buy' ? 'success' : v === 'sell' ? 'error' : 'default'}>
          {v === 'buy' ? t('market.buy') : v === 'sell' ? t('market.sell') : t('market.neutral')}
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
          <LineChartOutlined /> {t('market.deepAnalysis')}
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
          message={<Text style={{ color: '#fff' }}><strong>{t('market.comprehensiveJudgment')}</strong>{report.summary}</Text>}
          type="info"
          showIcon
          style={{ background: '#0d2137', border: '1px solid #1677ff', marginBottom: 16, borderRadius: 8 }}
        />
      )}

      <Row gutter={[16, 16]}>
        {/* Price Chart */}
        <Col xs={24} xl={16}>
          <Card className="analysis-card" title={<span style={{ color: '#fff' }}>{symbol} {t('market.priceTrend90d')}</span>}>
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
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', color: '#fff' }} formatter={(v) => [`$${Number(v).toLocaleString()}`, t('common.price')]} />
                <Area type="monotone" dataKey="close" stroke="#1677ff" fill="url(#priceGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Radar Chart */}
        <Col xs={24} xl={8}>
          <Card className="analysis-card" title={<span style={{ color: '#fff' }}>{t('market.radarChart')}</span>}>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#1f2937" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 11 }} />
                <Radar name={t('market.score')} dataKey="A" stroke="#1677ff" fill="#1677ff" fillOpacity={0.35} />
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
              label: <span><GlobalOutlined />{t('market.macro')}</span>,
              children: report && (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <ScoreCard
                      title={t('market.macroScore')}
                      score={report.macro.score}
                      icon={<GlobalOutlined style={{ color: '#1677ff' }} />}
                      summary={report.macro.summary}
                    />
                  </Col>
                  <Col xs={24} md={16}>
                    <Row gutter={[12, 12]}>
                      <Col span={8}>
                        <Statistic
                          title={<span style={{ color: '#888', fontSize: 12 }}>{t('market.fearGreedIndex')}</span>}
                          value={report.macro.fearGreedIndex}
                          suffix="/100"
                          valueStyle={{ color: report.macro.fearGreedIndex >= 60 ? '#f5222d' : '#52c41a', fontSize: 22 }}
                        />
                        <Text style={{ color: '#888', fontSize: 11 }}>
                          {report.macro.fearGreedIndex >= 75 ? t('market.extremeGreed') : report.macro.fearGreedIndex >= 55 ? t('market.greed') : report.macro.fearGreedIndex >= 45 ? t('market.neutral') : t('market.fear')}
                        </Text>
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title={<span style={{ color: '#888', fontSize: 12 }}>{t('market.dollarIndex')}</span>}
                          value={report.macro.dollarIndex}
                          valueStyle={{ color: '#fff', fontSize: 22 }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title={<span style={{ color: '#888', fontSize: 12 }}>{t('market.inflationExpectation')}</span>}
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
              label: <span><SafetyCertificateOutlined />{t('market.policy')}</span>,
              children: report && (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <ScoreCard
                      title={t('market.policyScore')}
                      score={report.policy.score}
                      icon={<SafetyCertificateOutlined style={{ color: '#faad14' }} />}
                      summary={report.policy.summary}
                    />
                  </Col>
                  <Col xs={24} md={16}>
                    <Text style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 8 }}>{t('market.recentPolicyEvents')}</Text>
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
              label: <span><TeamOutlined />{t('market.supplyDemand')}</span>,
              children: report && (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <ScoreCard
                      title={t('market.supplyDemandScore')}
                      score={report.supplyDemand.score}
                      icon={<TeamOutlined style={{ color: '#52c41a' }} />}
                      summary={report.supplyDemand.summary}
                    />
                  </Col>
                  <Col xs={24} md={16}>
                    <Row gutter={[12, 12]}>
                      <Col span={12}>
                        <Statistic
                          title={<span style={{ color: '#888', fontSize: 12 }}>{t('market.exchangeNetflow')}</span>}
                          value={report.supplyDemand.exchangeNetflow}
                          valueStyle={{ color: report.supplyDemand.exchangeNetflow < 0 ? '#52c41a' : '#f5222d', fontSize: 20 }}
                        />
                        <Text style={{ color: '#888', fontSize: 11 }}>
                          {report.supplyDemand.exchangeNetflow < 0 ? t('market.netOutflowBullish') : t('market.netInflowBearish')}
                        </Text>
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title={<span style={{ color: '#888', fontSize: 12 }}>{t('market.minersNetflow')}</span>}
                          value={report.supplyDemand.minersNetflow}
                          valueStyle={{ color: '#fff', fontSize: 20 }}
                        />
                      </Col>
                      <Col span={24} style={{ marginTop: 8 }}>
                        <Text style={{ color: '#888', fontSize: 12 }}>{t('market.whaleActivity')}</Text>
                        <Tag color={report.supplyDemand.whaleActivity === 'accumulating' ? 'success' : report.supplyDemand.whaleActivity === 'distributing' ? 'error' : 'default'}>
                          {report.supplyDemand.whaleActivity === 'accumulating' ? t('market.accumulating') : report.supplyDemand.whaleActivity === 'distributing' ? t('market.distributing') : t('market.neutral')}
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
              label: <span><TeamOutlined />{t('market.sentiment')}</span>,
              children: report && (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <ScoreCard
                      title={t('market.sentimentScore')}
                      score={report.sentiment.score}
                      icon={<ThunderboltOutlined style={{ color: '#f5222d' }} />}
                      summary={report.sentiment.summary}
                    />
                  </Col>
                  <Col xs={24} md={16}>
                    <Row gutter={[12, 12]}>
                      <Col span={8}>
                        <Statistic
                          title={<span style={{ color: '#888', fontSize: 12 }}>{t('market.fearGreed')}</span>}
                          value={report.sentiment.fearGreedIndex}
                          suffix="/100"
                          valueStyle={{ color: '#f5222d', fontSize: 22 }}
                        />
                        <Tag color="error">{report.sentiment.fearGreedLabel}</Tag>
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title={<span style={{ color: '#888', fontSize: 12 }}>{t('market.twitterBullish')}</span>}
                          value={report.sentiment.twitterBullishPct}
                          suffix="%"
                          valueStyle={{ color: '#52c41a', fontSize: 22 }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title={<span style={{ color: '#888', fontSize: 12 }}>{t('market.redditSentiment')}</span>}
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
              label: <span><ExperimentOutlined />{t('market.technical')}</span>,
              children: report && (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card className="inner-card" size="small" title={<span style={{ color: '#ccc' }}>{t('market.technicalIndicators')}</span>}>
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
                    <Card className="inner-card" size="small" title={<span style={{ color: '#ccc' }}>{t('market.keyLevels')}</span>}>
                      <div style={{ marginBottom: 12 }}>
                        <Text style={{ color: '#52c41a', fontSize: 13, display: 'block', marginBottom: 6 }}>{t('market.supportLevels')}</Text>
                        {report.technical.supportLevels.map((l, i) => (
                          <Tag key={i} color="success" style={{ marginBottom: 4 }}>S{i + 1}: ${l.toLocaleString()}</Tag>
                        ))}
                      </div>
                      <div>
                        <Text style={{ color: '#f5222d', fontSize: 13, display: 'block', marginBottom: 6 }}>{t('market.resistanceLevels')}</Text>
                        {report.technical.resistanceLevels.map((l, i) => (
                          <Tag key={i} color="error" style={{ marginBottom: 4 }}>R{i + 1}: ${l.toLocaleString()}</Tag>
                        ))}
                      </div>
                      <div style={{ marginTop: 16 }}>
                        <Text style={{ color: '#888', fontSize: 12 }}>{t('market.trendJudgment')}</Text>
                        <Tag color={report.technical.trend === 'uptrend' ? 'success' : report.technical.trend === 'downtrend' ? 'error' : 'default'} style={{ marginLeft: 8 }}>
                          {report.technical.trend === 'uptrend' ? t('market.uptrend') : report.technical.trend === 'downtrend' ? t('market.downtrend') : t('market.sideways')}
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
