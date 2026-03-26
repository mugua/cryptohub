import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Select, Spin, Typography, Tag, Table, Progress, Alert,
} from 'antd';
import {
  FundOutlined, RadarChartOutlined,
} from '@ant-design/icons';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { fetchTrendReport } from '../../services/api';
import type { TrendReport as TrendReportData, TrendSignal } from '../../types';
import './TrendReport.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT'];

const SIGNAL_CONFIG: Record<TrendSignal, { color: string; tagColor: string }> = {
  strong_bullish: { color: '#52c41a', tagColor: 'success' },
  mild_bullish:   { color: '#73d13d', tagColor: 'lime' },
  neutral:        { color: '#faad14', tagColor: 'warning' },
  mild_bearish:   { color: '#ff7a45', tagColor: 'orange' },
  strong_bearish: { color: '#f5222d', tagColor: 'error' },
};

const DIM_ICONS: Record<string, string> = {
  macro: '🏦',
  policy: '📜',
  supply_demand: '⛓',
  sentiment: '💬',
  technical: '📈',
};

function signalLabel(signal: TrendSignal, t: (k: string) => string): string {
  const map: Record<TrendSignal, string> = {
    strong_bullish: t('trend.strongBullish'),
    mild_bullish: t('trend.mildBullish'),
    neutral: t('trend.neutral'),
    mild_bearish: t('trend.mildBearish'),
    strong_bearish: t('trend.strongBearish'),
  };
  return map[signal] ?? signal;
}

function scoreColor(score: number): string {
  if (score >= 0.5) return '#52c41a';
  if (score >= 0.2) return '#73d13d';
  if (score > -0.2) return '#faad14';
  if (score > -0.5) return '#ff7a45';
  return '#f5222d';
}

const TrendReport: React.FC = () => {
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [report, setReport] = useState<TrendReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    fetchTrendReport(symbol).then((r) => {
      setReport(r);
      setLoading(false);
    });
  }, [symbol]);

  if (loading || !report) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" tip={t('trend.generating')} />
      </div>
    );
  }

  const cfg = SIGNAL_CONFIG[report.signal];

  // Radar chart data – map raw_score from [-1,1] to [0,100] for display
  const radarData = report.dimensions.map((d) => ({
    dimension: t(`trend.${d.name}`),
    score: Math.round((d.rawScore + 1) * 50), // [0,100]
    fullMark: 100,
  }));

  // Table columns for dimension breakdown
  const dimColumns = [
    {
      title: t('trend.dimension'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Text strong style={{ color: '#fff' }}>
          {DIM_ICONS[name] ?? ''} {t(`trend.${name}`)}
        </Text>
      ),
    },
    {
      title: t('trend.rawScore'),
      dataIndex: 'rawScore',
      key: 'rawScore',
      render: (v: number) => (
        <Text style={{ color: scoreColor(v), fontWeight: 600 }}>
          {v > 0 ? '+' : ''}{v.toFixed(4)}
        </Text>
      ),
    },
    {
      title: t('trend.baseWeight'),
      dataIndex: 'baseWeight',
      key: 'baseWeight',
      render: (v: number) => <Text style={{ color: '#888' }}>{(v * 100).toFixed(0)}%</Text>,
    },
    {
      title: t('trend.adjustedWeight'),
      dataIndex: 'adjustedWeight',
      key: 'adjustedWeight',
      render: (v: number) => (
        <Text style={{ color: '#1677ff', fontWeight: 600 }}>{(v * 100).toFixed(1)}%</Text>
      ),
    },
    {
      title: t('trend.severity'),
      dataIndex: 'severity',
      key: 'severity',
      render: (v: number) => <Progress percent={Math.round(v * 100)} size="small" strokeColor="#faad14" />,
    },
    {
      title: t('trend.dimensionDetail'),
      dataIndex: 'summary',
      key: 'summary',
      render: (s: string) => <Text style={{ color: '#aaa', fontSize: 12 }}>{s}</Text>,
    },
  ];

  return (
    <div className="trend-report">
      <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            <FundOutlined /> {t('trend.title')}
          </Title>
        </Col>
        <Col>
          <Select
            value={symbol}
            onChange={setSymbol}
            style={{ width: 160 }}
          >
            {SYMBOLS.map((s) => (
              <Option key={s} value={s}>{s}</Option>
            ))}
          </Select>
        </Col>
      </Row>

      {/* Composite Score + Signal */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card className="dim-card" style={{ background: '#161b22', border: '1px solid #1f2937' }}>
            <div className="score-gauge">
              <div className="score-value" style={{ color: cfg.color }}>
                {report.compositeScore > 0 ? '+' : ''}{report.compositeScore.toFixed(2)}
              </div>
              <div className="score-label" style={{ color: '#888' }}>{t('trend.compositeScore')}</div>
              <div style={{ marginTop: 12 }}>
                <Tag className="signal-tag" color={cfg.tagColor}>
                  {signalLabel(report.signal, t)}
                </Tag>
              </div>
              <Progress
                type="dashboard"
                percent={Math.round((report.compositeScore + 1) * 50)}
                strokeColor={cfg.color}
                trailColor="#1f2937"
                size={180}
                format={() => ''}
                style={{ marginTop: 16 }}
              />
              <div style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
                {t('trend.scoreRange')}
              </div>
            </div>
          </Card>
        </Col>

        {/* Radar Chart */}
        <Col xs={24} lg={14}>
          <Card
            className="dim-card"
            title={<span style={{ color: '#fff' }}><RadarChartOutlined /> {t('trend.radarTitle')}</span>}
            style={{ background: '#161b22', border: '1px solid #1f2937' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1f2937" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#aaa', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#666', fontSize: 10 }} />
                <Radar
                  dataKey="score"
                  stroke="#1677ff"
                  fill="#1677ff"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', color: '#fff' }}
                  formatter={(v: number) => [`${v}/100`, t('market.score')]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Dimension Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {report.dimensions.map((d) => (
          <Col xs={24} sm={12} lg={Math.floor(24 / report.dimensions.length)} key={d.name}>
            <Card
              className="dim-card"
              title={
                <span style={{ color: '#fff', fontSize: 13 }}>
                  {DIM_ICONS[d.name]} {t(`trend.${d.name}`)}
                </span>
              }
              style={{ background: '#161b22', border: '1px solid #1f2937' }}
            >
              <div className="dim-score" style={{ color: scoreColor(d.rawScore) }}>
                {d.rawScore > 0 ? '+' : ''}{d.rawScore.toFixed(2)}
              </div>
              <div className="dim-weight" style={{ color: '#888' }}>
                {t('trend.baseWeight')}: {(d.baseWeight * 100).toFixed(0)}% →{' '}
                {t('trend.adjustedWeight')}: {(d.adjustedWeight * 100).toFixed(1)}%
              </div>
              <div className="dim-summary" style={{ color: '#aaa' }}>
                {d.summary}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Dimension Breakdown Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title={<span style={{ color: '#fff' }}>{t('trend.dimensionBreakdown')}</span>}
            style={{ background: '#161b22', border: '1px solid #1f2937' }}
          >
            <Table
              dataSource={report.dimensions}
              columns={dimColumns}
              rowKey="name"
              pagination={false}
              size="small"
              className="dark-table"
            />
          </Card>
        </Col>
      </Row>

      {/* Summary + Formula */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card
            title={<span style={{ color: '#fff' }}>{t('trend.summary')}</span>}
            style={{ background: '#161b22', border: '1px solid #1f2937' }}
          >
            <Alert
              type={report.compositeScore >= 0.2 ? 'success' : report.compositeScore > -0.2 ? 'warning' : 'error'}
              showIcon
              message={
                <Text style={{ color: '#fff' }}>
                  {signalLabel(report.signal, t)} ({report.compositeScore > 0 ? '+' : ''}{report.compositeScore.toFixed(2)})
                </Text>
              }
              description={<Paragraph style={{ color: '#ccc', marginBottom: 0 }}>{report.summary}</Paragraph>}
              style={{ background: '#0d1117', border: '1px solid #1f2937' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={<span style={{ color: '#fff' }}>{t('trend.weightFormula')}</span>}
            style={{ background: '#161b22', border: '1px solid #1f2937' }}
          >
            <div className="formula-box" style={{ background: '#0d1117', color: '#aaa' }}>
              <div><code style={{ color: '#73d13d' }}>adjusted_weight = base_weight × (1 + boost_factor)</code></div>
              <div style={{ marginTop: 4 }}><code style={{ color: '#73d13d' }}>boost_factor = severity × 0.8</code></div>
              <div style={{ marginTop: 8, color: '#888' }}>{t('trend.formulaDesc')}</div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TrendReport;
