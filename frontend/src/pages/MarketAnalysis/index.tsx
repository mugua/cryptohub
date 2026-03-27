import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Row, Col, Card, Select, Spin, Tag, Typography, Progress, Table,
  Statistic, Alert, Button, Space,
} from 'antd';
import {
  LineChartOutlined, FundOutlined, RadarChartOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { createChart, ColorType, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { fetchAnalysis, fetchCandles, fetchTrendReport } from '../../services/api';
import type { AnalysisReport, Candle, TrendReport, TrendSignal } from '../../types';
import './MarketAnalysis.css';

const { Title, Text } = Typography;
const { Option } = Select;

const SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT'];
const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W'];
const INDICATORS = ['SMA', 'EMA', 'RSI', 'MACD', 'BB', 'ATR', 'CCI', 'W%R', 'MFI', 'ADX', 'OBV', 'ADOSC', 'AD', 'KDJ'];

const TREND_SIGNAL_CONFIG: Record<TrendSignal, { color: string; tagColor: string }> = {
  strong_bullish: { color: '#52c41a', tagColor: 'success' },
  mild_bullish:   { color: '#73d13d', tagColor: 'lime' },
  neutral:        { color: '#faad14', tagColor: 'warning' },
  mild_bearish:   { color: '#ff7a45', tagColor: 'orange' },
  strong_bearish: { color: '#f5222d', tagColor: 'error' },
};

const DIM_ICONS: Record<string, string> = {
  macro: '🏦', policy: '📜', supply_demand: '⛓', sentiment: '💬', technical: '📈',
};

function trendSignalLabel(signal: TrendSignal, t: (k: string) => string): string {
  const map: Record<TrendSignal, string> = {
    strong_bullish: t('trend.strongBullish'),
    mild_bullish: t('trend.mildBullish'),
    neutral: t('trend.neutral'),
    mild_bearish: t('trend.mildBearish'),
    strong_bearish: t('trend.strongBearish'),
  };
  return map[signal] ?? signal;
}

function trendScoreColor(score: number): string {
  if (score >= 0.5) return '#52c41a';
  if (score >= 0.2) return '#73d13d';
  if (score > -0.2) return '#faad14';
  if (score > -0.5) return '#ff7a45';
  return '#f5222d';
}

function computeSMA(data: Candle[], period: number): { time: number; value: number }[] {
  const result: { time: number; value: number }[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += data[i - j].close;
    result.push({ time: data[i].time, value: sum / period });
  }
  return result;
}

function computeEMA(data: Candle[], period: number): { time: number; value: number }[] {
  const result: { time: number; value: number }[] = [];
  const k = 2 / (period + 1);
  let ema = data[0].close;
  for (let i = 0; i < data.length; i++) {
    ema = data[i].close * k + ema * (1 - k);
    if (i >= period - 1) {
      result.push({ time: data[i].time, value: ema });
    }
  }
  return result;
}

function computeBollingerBands(data: Candle[], period: number = 20, stdDev: number = 2) {
  const upper: { time: number; value: number }[] = [];
  const lower: { time: number; value: number }[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += data[i - j].close;
    const mean = sum / period;
    let sqSum = 0;
    for (let j = 0; j < period; j++) sqSum += (data[i - j].close - mean) ** 2;
    const std = Math.sqrt(sqSum / period);
    upper.push({ time: data[i].time, value: mean + stdDev * std });
    lower.push({ time: data[i].time, value: mean - stdDev * std });
  }
  return { upper, lower };
}

const MarketAnalysis: React.FC = () => {
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('1D');
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [trendReport, setTrendReport] = useState<TrendReport | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const indicatorSeriesRef = useRef<ISeriesApi<'Line'>[]>([]);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

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
    const limit = timeframe === '1W' ? 52 : timeframe === '1D' ? 120 : 200;
    const interval = ['1D', '1W'].includes(timeframe) ? '1d' : '1h';
    Promise.all([
      fetchAnalysis(symbol),
      fetchCandles(symbol, interval, limit),
      fetchTrendReport(symbol),
    ]).then(([r, c, tr]) => {
      setReport(r);
      setCandles(c);
      setTrendReport(tr);
      setLoading(false);
    });
  }, [symbol, timeframe]);

  const updateChart = useCallback(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    // Clean up existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 460,
      layout: {
        background: { type: ColorType.Solid, color: '#0d1117' },
        textColor: '#888',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: '#1f2937',
        scaleMargins: { top: 0.05, bottom: 0.2 },
      },
      timeScale: {
        borderColor: '#1f2937',
        timeVisible: true,
      },
    });

    chartRef.current = chart;

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const candleData: CandlestickData<Time>[] = candles.map((c) => ({
      time: (c.time / 1000) as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    candleSeries.setData(candleData);
    candleSeriesRef.current = candleSeries;

    // Volume series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    volumeSeries.setData(
      candles.map((c) => ({
        time: (c.time / 1000) as Time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)',
      })),
    );
    volumeSeriesRef.current = volumeSeries;

    // Clean up old indicator series
    indicatorSeriesRef.current = [];

    // Add indicator overlays
    if (activeIndicators.includes('SMA')) {
      const sma20 = computeSMA(candles, 20);
      const smaSeries = chart.addSeries(LineSeries, {
        color: '#f39c12',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      smaSeries.setData(sma20.map((d) => ({ time: (d.time / 1000) as Time, value: d.value })));
      indicatorSeriesRef.current.push(smaSeries);
    }

    if (activeIndicators.includes('EMA')) {
      const ema20 = computeEMA(candles, 20);
      const emaSeries = chart.addSeries(LineSeries, {
        color: '#3498db',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      emaSeries.setData(ema20.map((d) => ({ time: (d.time / 1000) as Time, value: d.value })));
      indicatorSeriesRef.current.push(emaSeries);
    }

    if (activeIndicators.includes('BB')) {
      const bb = computeBollingerBands(candles);
      const bbUpper = chart.addSeries(LineSeries, {
        color: 'rgba(155, 89, 182, 0.6)',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      bbUpper.setData(bb.upper.map((d) => ({ time: (d.time / 1000) as Time, value: d.value })));
      indicatorSeriesRef.current.push(bbUpper);

      const bbLower = chart.addSeries(LineSeries, {
        color: 'rgba(155, 89, 182, 0.6)',
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      bbLower.setData(bb.lower.map((d) => ({ time: (d.time / 1000) as Time, value: d.value })));
      indicatorSeriesRef.current.push(bbLower);
    }

    chart.timeScale().fitContent();

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === chartContainerRef.current) {
          chart.applyOptions({ width: entry.contentRect.width });
        }
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [candles, activeIndicators]);

  useEffect(() => {
    if (!loading) {
      updateChart();
    }
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [loading, updateChart]);

  const toggleIndicator = (indicator: string) => {
    setActiveIndicators((prev) =>
      prev.includes(indicator) ? prev.filter((i) => i !== indicator) : [...prev, indicator],
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" tip={t('market.generatingReport')} />
      </div>
    );
  }

  const locale = i18n.language === 'en_US' ? 'en-US' : 'zh-CN';

  const lastCandle = candles[candles.length - 1];
  const ohlcvDisplay = lastCandle ? {
    time: new Date(lastCandle.time).toLocaleString(locale),
    open: lastCandle.open.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    high: lastCandle.high.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    low: lastCandle.low.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    close: lastCandle.close.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    volume: lastCandle.volume.toLocaleString('en-US', { maximumFractionDigits: 0 }),
  } : null;

  // Trend report radar data
  const trendRadarData = trendReport
    ? trendReport.dimensions.map((d) => ({
        dimension: t(`trend.${d.name}`),
        score: Math.round((d.rawScore + 1) * 50),
        fullMark: 100,
      }))
    : [];

  // Key indicator columns from original analysis
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

      {/* Candlestick Chart Section */}
      <Card className="analysis-card" style={{ marginBottom: 16 }}>
        {/* Timeframe selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <Tag color="purple" style={{ fontSize: 12 }}>{symbol}</Tag>
          <Space size={4}>
            {TIMEFRAMES.map((tf) => (
              <Button
                key={tf}
                type={timeframe === tf ? 'primary' : 'text'}
                size="small"
                onClick={() => setTimeframe(tf)}
                style={{ fontSize: 12, padding: '0 8px', minWidth: 32 }}
              >
                {tf}
              </Button>
            ))}
          </Space>
        </div>

        {/* Indicator selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
          {INDICATORS.map((ind) => (
            <Button
              key={ind}
              type={activeIndicators.includes(ind) ? 'primary' : 'default'}
              size="small"
              onClick={() => toggleIndicator(ind)}
              style={{
                fontSize: 11,
                padding: '0 8px',
                height: 26,
                background: activeIndicators.includes(ind) ? undefined : '#1f2937',
                borderColor: activeIndicators.includes(ind) ? undefined : '#374151',
                color: activeIndicators.includes(ind) ? undefined : '#ccc',
              }}
            >
              {ind}
            </Button>
          ))}
        </div>

        {/* OHLCV data display */}
        {ohlcvDisplay && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 8, fontSize: 12, flexWrap: 'wrap' }}>
            <Text style={{ color: '#888' }}>Time: {ohlcvDisplay.time}</Text>
            <Text style={{ color: '#888' }}>Open: <span style={{ color: '#fff' }}>{ohlcvDisplay.open}</span></Text>
            <Text style={{ color: '#888' }}>High: <span style={{ color: '#52c41a' }}>{ohlcvDisplay.high}</span></Text>
            <Text style={{ color: '#888' }}>Low: <span style={{ color: '#f5222d' }}>{ohlcvDisplay.low}</span></Text>
            <Text style={{ color: '#888' }}>Close: <span style={{ color: '#fff' }}>{ohlcvDisplay.close}</span></Text>
            <Text style={{ color: '#888' }}>Volume: <span style={{ color: '#faad14' }}>{ohlcvDisplay.volume}</span></Text>
          </div>
        )}

        {/* Chart container */}
        <div ref={chartContainerRef} style={{ width: '100%' }} />
      </Card>

      {/* ── Trend Report Section ────────────────────────────────────────── */}
      {trendReport && (
        <>
          {/* Composite Score + Radar */}
          <Row gutter={[16, 16]}>
            <Col xs={24} xl={8}>
              <Card className="analysis-card" style={{ textAlign: 'center' }}>
                <FundOutlined style={{ fontSize: 20, color: '#1677ff', marginBottom: 8 }} />
                <div style={{ fontSize: 42, fontWeight: 700, color: TREND_SIGNAL_CONFIG[trendReport.signal].color, lineHeight: 1 }}>
                  {trendReport.compositeScore > 0 ? '+' : ''}{trendReport.compositeScore.toFixed(2)}
                </div>
                <div style={{ color: '#888', fontSize: 13, margin: '4px 0 12px' }}>{t('trend.compositeScore')}</div>
                <Tag
                  color={TREND_SIGNAL_CONFIG[trendReport.signal].tagColor}
                  style={{ fontSize: 14, padding: '4px 16px', borderRadius: 16, fontWeight: 600 }}
                >
                  {trendSignalLabel(trendReport.signal, t)}
                </Tag>
                <Progress
                  type="dashboard"
                  percent={Math.round((trendReport.compositeScore + 1) * 50)}
                  strokeColor={TREND_SIGNAL_CONFIG[trendReport.signal].color}
                  trailColor="#1f2937"
                  size={160}
                  format={() => ''}
                  style={{ marginTop: 16 }}
                />
                <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>{t('trend.scoreRange')}</div>
              </Card>
            </Col>

            <Col xs={24} xl={16}>
              <Card
                className="analysis-card"
                title={<span style={{ color: '#fff' }}><RadarChartOutlined /> {t('trend.radarTitle')}</span>}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={trendRadarData}>
                    <PolarGrid stroke="#1f2937" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: '#aaa', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#666', fontSize: 10 }} />
                    <Radar dataKey="score" stroke="#1677ff" fill="#1677ff" fillOpacity={0.3} />
                    <Tooltip
                      contentStyle={{ background: '#1f2937', border: '1px solid #374151', color: '#fff' }}
                      formatter={(v) => [`${v}/100`, t('market.score')]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Dimension Cards */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {trendReport.dimensions.map((d) => (
              <Col xs={24} sm={12} md={8} lg={8} xl={4} key={d.name}>
                <Card className="analysis-card" size="small">
                  <div style={{ fontSize: 13, color: '#ccc', marginBottom: 8 }}>
                    {DIM_ICONS[d.name]} {t(`trend.${d.name}`)}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: trendScoreColor(d.rawScore), lineHeight: 1 }}>
                    {d.rawScore > 0 ? '+' : ''}{d.rawScore.toFixed(2)}
                  </div>
                  <div style={{ color: '#888', fontSize: 11, margin: '4px 0' }}>
                    {t('trend.baseWeight')}: {(d.baseWeight * 100).toFixed(0)}% → {t('trend.adjustedWeight')}: {(d.adjustedWeight * 100).toFixed(1)}%
                  </div>
                  <Text style={{ color: '#aaa', fontSize: 12 }}>{d.summary}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* ── Key Market Items from Analysis ─────────────────────────────── */}
      {report && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {/* Key Metrics */}
          <Col xs={24} xl={8}>
            <Card className="analysis-card" title={<span style={{ color: '#fff' }}>{t('market.marketDataOverview')}</span>}>
              <Row gutter={[12, 16]}>
                <Col span={12}>
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
                <Col span={12}>
                  <Statistic
                    title={<span style={{ color: '#888', fontSize: 12 }}>{t('market.dollarIndex')}</span>}
                    value={report.macro.dollarIndex}
                    valueStyle={{ color: '#fff', fontSize: 22 }}
                  />
                </Col>
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
                  <div style={{ marginBottom: 4 }}>
                    <Text style={{ color: '#888', fontSize: 12 }}>{t('market.whaleActivity')}</Text>
                  </div>
                  <Tag color={report.supplyDemand.whaleActivity === 'accumulating' ? 'success' : report.supplyDemand.whaleActivity === 'distributing' ? 'error' : 'default'}>
                    {report.supplyDemand.whaleActivity === 'accumulating' ? t('market.accumulating') : report.supplyDemand.whaleActivity === 'distributing' ? t('market.distributing') : t('market.neutral')}
                  </Tag>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Technical Indicators */}
          <Col xs={24} xl={8}>
            <Card className="analysis-card" title={<span style={{ color: '#fff' }}>{t('market.technicalIndicators')}</span>}>
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

          {/* Key Levels + Trend */}
          <Col xs={24} xl={8}>
            <Card className="analysis-card" title={<span style={{ color: '#fff' }}>{t('market.keyLevels')}</span>}>
              <div style={{ marginBottom: 12 }}>
                <Text style={{ color: '#52c41a', fontSize: 13, display: 'block', marginBottom: 6 }}>{t('market.supportLevels')}</Text>
                {report.technical.supportLevels.map((l, i) => (
                  <Tag key={i} color="success" style={{ marginBottom: 4 }}>S{i + 1}: ${l.toLocaleString()}</Tag>
                ))}
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text style={{ color: '#f5222d', fontSize: 13, display: 'block', marginBottom: 6 }}>{t('market.resistanceLevels')}</Text>
                {report.technical.resistanceLevels.map((l, i) => (
                  <Tag key={i} color="error" style={{ marginBottom: 4 }}>R{i + 1}: ${l.toLocaleString()}</Tag>
                ))}
              </div>
              <div>
                <Text style={{ color: '#888', fontSize: 12 }}>{t('market.trendJudgment')}</Text>
                <Tag color={report.technical.trend === 'uptrend' ? 'success' : report.technical.trend === 'downtrend' ? 'error' : 'default'} style={{ marginLeft: 8 }}>
                  {report.technical.trend === 'uptrend' ? t('market.uptrend') : report.technical.trend === 'downtrend' ? t('market.downtrend') : t('market.sideways')}
                </Tag>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* View Full Trend Report link */}
      {trendReport && (
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Button
            type="link"
            onClick={() => navigate('/trend')}
            style={{ fontSize: 14, padding: 0 }}
          >
            {t('market.viewFullTrendReport')} <RightOutlined />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MarketAnalysis;
