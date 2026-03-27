import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Form, Input, Select, Switch, Slider, Button,
  Typography, Divider, InputNumber, message, Spin, Tabs, Tag,
  Table, Space, Popconfirm, Modal, Badge, Alert, Collapse,
} from 'antd';
import {
  SettingOutlined, BellOutlined, SafetyOutlined, GlobalOutlined,
  ApiOutlined, SaveOutlined, PlusOutlined, DeleteOutlined,
  LinkOutlined, FundOutlined, DownOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../ThemeContext';
import { fetchSettings, fetchExchangeApiConfigs, saveExchangeApiConfig, fetchTrendReportConfig, saveTrendReportConfig } from '../../services/api';
import type { ExchangeApiConfig, ExchangeName, TrendReportConfig, SubItemConfig } from '../../types';
import './Settings.css';

const { Title, Text } = Typography;
const { Option } = Select;

const EXCHANGE_LOGOS: Record<ExchangeName, string> = {
  binance: '🟡', okx: '⚫', bybit: '🟠', coinbase: '🔵',
  kraken: '🟣', gate: '🟢', huobi: '🔴',
};

const PIE_COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff7a45', '#722ed1'];

const colorDotStyle = (color: string, marginRight = 0): React.CSSProperties => ({
  display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, marginRight,
});

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [exchangeConfigs, setExchangeConfigs] = useState<ExchangeApiConfig[]>([]);
  const [trendConfig, setTrendConfig] = useState<TrendReportConfig | null>(null);
  const [addExchangeOpen, setAddExchangeOpen] = useState(false);
  const [generalForm] = Form.useForm();
  const [notifyForm] = Form.useForm();
  const [riskForm] = Form.useForm();
  const [exchangeForm] = Form.useForm();
  const { t, i18n } = useTranslation();
  const { themeMode, setThemeMode } = useTheme();

  useEffect(() => {
    Promise.all([fetchSettings(), fetchExchangeApiConfigs(), fetchTrendReportConfig()]).then(([s, configs, tc]) => {
      generalForm.setFieldsValue({ language: s.language, theme: themeMode, currency: s.currency });
      notifyForm.setFieldsValue(s.notifications);
      riskForm.setFieldsValue(s.risk);
      setExchangeConfigs(configs);
      setTrendConfig(tc);
      setLoading(false);
    });
  }, []);

  const handleSaveGeneral = (values: Record<string, unknown>) => {
    const lang = values.language as string;
    if (lang && lang !== i18n.language) {
      i18n.changeLanguage(lang);
      localStorage.setItem('language', lang);
    }
    const newTheme = values.theme as 'dark' | 'light';
    if (newTheme && newTheme !== themeMode) {
      setThemeMode(newTheme);
    }
    message.success(t('settings.generalSaved'));
  };

  const handleSaveNotify = (_values: Record<string, unknown>) => {
    message.success(t('settings.notifySaved'));
  };

  const handleSaveRisk = (_values: Record<string, unknown>) => {
    message.success(t('settings.riskSaved'));
  };

  const handleAddExchangeConfig = async (values: Record<string, string>) => {
    const newConfig: ExchangeApiConfig = {
      id: `cfg${Date.now()}`,
      exchange: values.exchange as ExchangeName,
      label: values.label,
      apiKey: values.apiKey || '',
      secretKey: values.secretKey || '',
      passphrase: values.passphrase || '',
      isEnabled: true,
      createdAt: new Date().toISOString(),
    };
    await saveExchangeApiConfig(newConfig);
    setExchangeConfigs((prev) => [...prev, newConfig]);
    setAddExchangeOpen(false);
    exchangeForm.resetFields();
    message.success(t('settings.exchangeAdded'));
  };

  const handleDeleteExchangeConfig = (id: string) => {
    setExchangeConfigs((prev) => prev.filter((c) => c.id !== id));
    message.success(t('settings.exchangeRemoved'));
  };

  const handleToggleExchange = (id: string, enabled: boolean) => {
    setExchangeConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isEnabled: enabled } : c)),
    );
    message.success(enabled ? t('settings.exchangeEnabled') : t('settings.exchangeDisabled'));
  };

  const handleTrendWeightChange = (index: number, value: number | null) => {
    if (!trendConfig || value === null) return;
    const updated = { ...trendConfig, dimensions: [...trendConfig.dimensions] };
    updated.dimensions[index] = { ...updated.dimensions[index], baseWeight: value / 100 };
    setTrendConfig(updated);
  };

  const handleTrendEnabledChange = (index: number, enabled: boolean) => {
    if (!trendConfig) return;
    const updated = { ...trendConfig, dimensions: [...trendConfig.dimensions] };
    updated.dimensions[index] = { ...updated.dimensions[index], enabled };
    setTrendConfig(updated);
  };

  const handleBoostFactorChange = (value: number | null) => {
    if (!trendConfig || value === null) return;
    setTrendConfig({ ...trendConfig, boostFactor: value });
  };

  const handleSaveTrendConfig = async () => {
    if (!trendConfig) return;
    const totalWeight = trendConfig.dimensions
      .filter((d) => d.enabled)
      .reduce((acc, d) => acc + d.baseWeight, 0);
    if (Math.abs(totalWeight - 1) > 0.01) {
      message.warning(t('settings.trendWeightWarning'));
      return;
    }
    await saveTrendReportConfig(trendConfig);
    message.success(t('settings.trendConfigSaved'));
  };

  /* ── Sub-item handlers ── */
  const handleSubItemChange = (dimIdx: number, subIdx: number, field: keyof SubItemConfig, value: unknown) => {
    if (!trendConfig) return;
    const updated = { ...trendConfig, dimensions: trendConfig.dimensions.map((d, i) => {
      if (i !== dimIdx) return d;
      const subs = [...(d.subItems || [])];
      subs[subIdx] = { ...subs[subIdx], [field]: field === 'weight' ? (value as number) / 100 : value };
      return { ...d, subItems: subs };
    })};
    setTrendConfig(updated);
  };

  const handleAddSubItem = (dimIdx: number) => {
    if (!trendConfig) return;
    const updated = { ...trendConfig, dimensions: trendConfig.dimensions.map((d, i) => {
      if (i !== dimIdx) return d;
      const subs = [...(d.subItems || [])];
      subs.push({ name: '', weight: 0, dataSource: '', dataDescription: '', apiType: 'REST API', apiEndpoint: '', enabled: true });
      return { ...d, subItems: subs };
    })};
    setTrendConfig(updated);
  };

  const handleDeleteSubItem = (dimIdx: number, subIdx: number) => {
    if (!trendConfig) return;
    const updated = { ...trendConfig, dimensions: trendConfig.dimensions.map((d, i) => {
      if (i !== dimIdx) return d;
      const subs = [...(d.subItems || [])];
      subs.splice(subIdx, 1);
      return { ...d, subItems: subs };
    })};
    setTrendConfig(updated);
  };

  /* ── Coin-specific item handlers ── */
  const handleCoinItemChange = (dimIdx: number, coin: string, subIdx: number, field: keyof SubItemConfig, value: unknown) => {
    if (!trendConfig) return;
    const updated = { ...trendConfig, dimensions: trendConfig.dimensions.map((d, i) => {
      if (i !== dimIdx) return d;
      const coinItems = { ...(d.coinSpecificItems || {}) };
      const subs = [...(coinItems[coin] || [])];
      if (subIdx < 0 || subIdx >= subs.length) return d;
      subs[subIdx] = { ...subs[subIdx], [field]: field === 'weight' ? (value as number) / 100 : value };
      coinItems[coin] = subs;
      return { ...d, coinSpecificItems: coinItems };
    })};
    setTrendConfig(updated);
  };

  const handleAddCoinItem = (dimIdx: number, coin: string) => {
    if (!trendConfig) return;
    const updated = { ...trendConfig, dimensions: trendConfig.dimensions.map((d, i) => {
      if (i !== dimIdx) return d;
      const coinItems = { ...(d.coinSpecificItems || {}) };
      const subs = [...(coinItems[coin] || [])];
      subs.push({ name: '', weight: 0, dataSource: '', dataDescription: '', apiType: 'REST API', apiEndpoint: '', enabled: true });
      coinItems[coin] = subs;
      return { ...d, coinSpecificItems: coinItems };
    })};
    setTrendConfig(updated);
  };

  const handleDeleteCoinItem = (dimIdx: number, coin: string, subIdx: number) => {
    if (!trendConfig) return;
    const updated = { ...trendConfig, dimensions: trendConfig.dimensions.map((d, i) => {
      if (i !== dimIdx) return d;
      const coinItems = { ...(d.coinSpecificItems || {}) };
      const subs = [...(coinItems[coin] || [])];
      if (subIdx < 0 || subIdx >= subs.length) return d;
      subs.splice(subIdx, 1);
      coinItems[coin] = subs;
      return { ...d, coinSpecificItems: coinItems };
    })};
    setTrendConfig(updated);
  };

  const handleAddCoinGroup = (dimIdx: number) => {
    if (!trendConfig) return;
    const coin = (newCoinSymbol || '').toUpperCase().trim();
    if (!coin) return;
    const updated = { ...trendConfig, dimensions: trendConfig.dimensions.map((d, i) => {
      if (i !== dimIdx) return d;
      const coinItems = { ...(d.coinSpecificItems || {}) };
      if (coinItems[coin]) return d;
      coinItems[coin] = [];
      return { ...d, coinSpecificItems: coinItems };
    })};
    setTrendConfig(updated);
    setNewCoinSymbol('');
  };

  const handleDeleteCoinGroup = (dimIdx: number, coin: string) => {
    if (!trendConfig) return;
    const updated = { ...trendConfig, dimensions: trendConfig.dimensions.map((d, i) => {
      if (i !== dimIdx) return d;
      const coinItems = { ...(d.coinSpecificItems || {}) };
      delete coinItems[coin];
      return { ...d, coinSpecificItems: coinItems };
    })};
    setTrendConfig(updated);
  };

  const [newCoinSymbol, setNewCoinSymbol] = useState<string>('');

  const isTrendWeightValid = trendConfig
    ? Math.abs(trendConfig.dimensions.filter((d) => d.enabled).reduce((a, d) => a + d.baseWeight, 0) - 1) < 0.01
    : true;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Spin size="large" />
      </div>
    );
  }

  const formItemStyle = { marginBottom: 16 };
  const labelStyle = { color: '#ccc' };

  const exchangeColumns = [
    {
      title: t('settings.exchangeName'),
      key: 'exchange',
      render: (row: ExchangeApiConfig) => (
        <Space>
          <span style={{ fontSize: 18 }}>{EXCHANGE_LOGOS[row.exchange]}</span>
          <div>
            <Text strong style={{ color: '#fff', display: 'block' }}>{row.label}</Text>
            <Text style={{ color: '#888', fontSize: 11 }}>{row.exchange.toUpperCase()}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: t('settings.apiKeyStatus'),
      key: 'apiKey',
      render: (row: ExchangeApiConfig) => (
        row.apiKey
          ? <Badge status="success" text={<Text style={{ color: '#52c41a', fontSize: 12 }}>{t('settings.configured')}</Text>} />
          : <Badge status="default" text={<Text style={{ color: '#888', fontSize: 12 }}>{t('settings.notConfigured')}</Text>} />
      ),
    },
    {
      title: t('settings.enabledStatus'),
      key: 'isEnabled',
      render: (row: ExchangeApiConfig) => (
        <Switch
          checked={row.isEnabled}
          onChange={(checked) => handleToggleExchange(row.id, checked)}
          checkedChildren={t('common.on')}
          unCheckedChildren={t('common.off')}
        />
      ),
    },
    {
      title: t('profile.actions'),
      key: 'actions',
      render: (_: unknown, row: ExchangeApiConfig) => (
        <Space>
          <Popconfirm
            title={t('settings.confirmDeleteExchange')}
            onConfirm={() => handleDeleteExchangeConfig(row.id)}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
          >
            <Button type="text" size="small" icon={<DeleteOutlined style={{ color: '#f5222d' }} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const strategyNames = [
    t('settings.strategies.grid'),
    t('settings.strategies.dca'),
    t('settings.strategies.momentum'),
    t('settings.strategies.meanReversion'),
    t('settings.strategies.arbitrage'),
    t('settings.strategies.macd'),
    t('settings.strategies.rsiReversal'),
    t('settings.strategies.bollingerBands'),
    t('settings.strategies.turtleTrading'),
    t('settings.strategies.custom'),
  ];

  return (
    <div className="settings-page">
      <Title level={4} style={{ color: '#fff', marginBottom: 20 }}>
        <SettingOutlined /> {t('settings.title')}
      </Title>

      <Tabs
        defaultActiveKey="general"
        items={[
          {
            key: 'general',
            label: <span><GlobalOutlined /> {t('settings.general')}</span>,
            children: (
              <Card className="settings-card">
                <Form form={generalForm} layout="vertical" onFinish={handleSaveGeneral}>
                  <Row gutter={24}>
                    <Col xs={24} md={8}>
                      <Form.Item name="language" label={<span style={labelStyle}>{t('settings.language')}</span>} style={formItemStyle}>
                        <Select>
                          <Option value="zh_CN">{t('settings.zhCN')}</Option>
                          <Option value="en_US">{t('settings.enUS')}</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="theme" label={<span style={labelStyle}>{t('settings.theme')}</span>} style={formItemStyle}>
                        <Select>
                          <Option value="dark">{t('settings.darkMode')}</Option>
                          <Option value="light">{t('settings.lightMode')}</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="currency" label={<span style={labelStyle}>{t('settings.currency')}</span>} style={formItemStyle}>
                        <Select>
                          <Option value="USD">🇺🇸 USD</Option>
                          <Option value="CNY">🇨🇳 CNY</Option>
                          <Option value="EUR">🇪🇺 EUR</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    {t('settings.saveGeneral')}
                  </Button>
                </Form>
              </Card>
            ),
          },
          {
            key: 'exchange',
            label: <span><LinkOutlined /> {t('settings.exchangeApi')}</span>,
            children: (
              <Card className="settings-card">
                <Text style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 16 }}>
                  {t('settings.exchangeApiDesc')}
                </Text>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddExchangeOpen(true)}>
                    {t('settings.addExchangeApi')}
                  </Button>
                </div>
                <Table
                  dataSource={exchangeConfigs}
                  columns={exchangeColumns}
                  rowKey="id"
                  pagination={false}
                  size="middle"
                  className="dark-table"
                />
                <Card className="inner-card" size="small" style={{ marginTop: 16 }}>
                  <Text style={{ color: '#888', fontSize: 12 }}>
                    {t('settings.exchangeApiNotice')}
                  </Text>
                </Card>
              </Card>
            ),
          },
          {
            key: 'notify',
            label: <span><BellOutlined /> {t('settings.notification')}</span>,
            children: (
              <Card className="settings-card">
                <Form form={notifyForm} layout="vertical" onFinish={handleSaveNotify}>
                  <Text style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 16 }}>
                    {t('settings.notifyDesc')}
                  </Text>
                  <Divider style={{ borderColor: '#1f2937', margin: '8px 0 20px' }}>
                    <Text style={{ color: '#888', fontSize: 12 }}>{t('settings.notifyChannels')}</Text>
                  </Divider>
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Card className="inner-card" size="small" title={<span style={{ color: '#ccc', fontSize: 13 }}>{t('settings.emailNotify')}</span>}>
                        <Form.Item name="email" valuePropName="checked" style={{ marginBottom: 8 }}>
                          <Switch checkedChildren={t('common.enabled')} unCheckedChildren={t('common.disabled')} />
                        </Form.Item>
                        <Form.Item name="emailAddress" label={<span style={{ color: '#888', fontSize: 12 }}>{t('settings.emailAddress')}</span>} style={{ marginBottom: 0 }}>
                          <Input placeholder="your@email.com" size="small" />
                        </Form.Item>
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card className="inner-card" size="small" title={<span style={{ color: '#ccc', fontSize: 13 }}>{t('settings.telegramNotify')}</span>}>
                        <Form.Item name="telegram" valuePropName="checked" style={{ marginBottom: 8 }}>
                          <Switch checkedChildren={t('common.enabled')} unCheckedChildren={t('common.disabled')} />
                        </Form.Item>
                        <Form.Item name="telegramToken" label={<span style={{ color: '#888', fontSize: 12 }}>{t('settings.botToken')}</span>} style={{ marginBottom: 0 }}>
                          <Input.Password placeholder="Bot Token" size="small" />
                        </Form.Item>
                      </Card>
                    </Col>
                  </Row>

                  <Divider style={{ borderColor: '#1f2937', margin: '20px 0' }}>
                    <Text style={{ color: '#888', fontSize: 12 }}>{t('settings.notifyTypes')}</Text>
                  </Divider>
                  <Row gutter={16}>
                    {[
                      { name: 'priceAlerts', label: t('settings.priceAlerts') },
                      { name: 'strategyAlerts', label: t('settings.strategyAlerts') },
                      { name: 'orderAlerts', label: t('settings.orderAlerts') },
                      { name: 'pushEnabled', label: t('settings.pushNotify') },
                    ].map(({ name, label }) => (
                      <Col key={name} xs={12} sm={6}>
                        <Card className="inner-card" size="small" style={{ textAlign: 'center' }}>
                          <Text style={{ color: '#ccc', fontSize: 12, display: 'block', marginBottom: 8 }}>{label}</Text>
                          <Form.Item name={name} valuePropName="checked" style={{ marginBottom: 0 }}>
                            <Switch checkedChildren={t('common.on')} unCheckedChildren={t('common.off')} />
                          </Form.Item>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  <div style={{ marginTop: 20 }}>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      {t('settings.saveNotify')}
                    </Button>
                  </div>
                </Form>
              </Card>
            ),
          },
          {
            key: 'risk',
            label: <span><SafetyOutlined /> {t('settings.risk')}</span>,
            children: (
              <Card className="settings-card">
                <Form form={riskForm} layout="vertical" onFinish={handleSaveRisk}>
                  <Text style={{ color: '#faad14', fontSize: 12, display: 'block', marginBottom: 16 }}>
                    {t('settings.riskWarning')}
                  </Text>
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="maxPositionSizeUsd"
                        label={<span style={labelStyle}>{t('settings.maxPositionSize')}</span>}
                        style={formItemStyle}
                      >
                        <InputNumber
                          min={100} max={1000000} step={100}
                          style={{ width: '100%' }}
                          formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(v) => (v ? Number(v.replace(/\$\s?|(,*)/g, '')) : 100) as 100}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="maxDailyLossUsd"
                        label={<span style={labelStyle}>{t('settings.maxDailyLoss')}</span>}
                        style={formItemStyle}
                      >
                        <InputNumber
                          min={0} max={100000} step={100}
                          style={{ width: '100%' }}
                          formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(v) => (v ? Number(v.replace(/\$\s?|(,*)/g, '')) : 0) as 0}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="maxDrawdownPct" label={<span style={labelStyle}>{t('settings.maxDrawdown')}</span>} style={formItemStyle}>
                        <Slider
                          min={5} max={50} step={1}
                          marks={{ 5: '5%', 15: '15%', 30: '30%', 50: '50%' }}
                          tooltip={{ formatter: (v?: number) => `${v}%` }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="stopLossPct" label={<span style={labelStyle}>{t('settings.stopLoss')}</span>} style={formItemStyle}>
                        <Slider
                          min={1} max={20} step={0.5}
                          marks={{ 1: '1%', 5: '5%', 10: '10%', 20: '20%' }}
                          tooltip={{ formatter: (v?: number) => `${v}%` }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Card className="inner-card" size="small" style={{ marginBottom: 16 }}>
                    <Text style={{ color: '#888', fontSize: 13 }}>
                      {t('settings.riskRules')}<br />
                      • {t('settings.riskRule1')}<br />
                      • {t('settings.riskRule2')}<br />
                      • {t('settings.riskRule3')}<br />
                      • {t('settings.riskRule4')}
                    </Text>
                  </Card>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />} danger>
                    {t('settings.saveRisk')}
                  </Button>
                </Form>
              </Card>
            ),
          },
          {
            key: 'trend',
            label: <span><FundOutlined /> {t('settings.trendConfig')}</span>,
            children: (
              <Card className="settings-card">
                <Text style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 16 }}>
                  {t('settings.trendConfigDesc')}
                </Text>
                {trendConfig && (
                  <>
                    {/* Real-time validation warning */}
                    {!isTrendWeightValid && (
                      <Alert
                        type="warning"
                        showIcon
                        message={t('settings.trendWeightWarning')}
                        style={{ marginBottom: 16 }}
                      />
                    )}

                    <Row gutter={24}>
                      {/* Left: Pie chart */}
                      <Col xs={24} md={10}>
                        <Divider style={{ borderColor: '#1f2937', margin: '0 0 12px' }}>
                          <Text style={{ color: '#888', fontSize: 12 }}>{t('settings.weightDistribution')}</Text>
                        </Divider>
                        <ResponsiveContainer width="100%" height={240}>
                          <PieChart>
                            <Pie
                              data={trendConfig.dimensions.filter(d => d.enabled).map((dim) => ({
                                name: t(`trend.${dim.name}`),
                                value: Math.round(dim.baseWeight * 100),
                                fill: PIE_COLORS[trendConfig.dimensions.indexOf(dim) % PIE_COLORS.length],
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={90}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, value }) => `${name} ${value}%`}
                              labelLine={{ stroke: '#888' }}
                            >
                              {trendConfig.dimensions.filter(d => d.enabled).map((dim) => (
                                <Cell key={dim.name} fill={PIE_COLORS[trendConfig.dimensions.indexOf(dim) % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{ textAlign: 'center', marginTop: 4 }}>
                          <Text style={{ color: '#ccc', fontSize: 13 }}>
                            {t('settings.totalWeight')}:{' '}
                            <Tag color={isTrendWeightValid ? 'green' : 'red'}>
                              {Math.round(trendConfig.dimensions.filter((d) => d.enabled).reduce((a, d) => a + d.baseWeight, 0) * 100)}%
                            </Tag>
                          </Text>
                        </div>
                      </Col>

                      {/* Right: Dimension weight inputs */}
                      <Col xs={24} md={14}>
                        <Divider style={{ borderColor: '#1f2937', margin: '0 0 12px' }}>
                          <Text style={{ color: '#888', fontSize: 12 }}>{t('settings.dimensionWeights')}</Text>
                        </Divider>
                        {trendConfig.dimensions.map((dim, idx) => (
                          <Row key={dim.name} gutter={12} style={{ marginBottom: 12, alignItems: 'center' }}>
                            <Col flex="auto">
                              <Space>
                                <Switch
                                  size="small"
                                  checked={dim.enabled}
                                  onChange={(checked) => handleTrendEnabledChange(idx, checked)}
                                />
                                <span style={colorDotStyle(PIE_COLORS[idx % PIE_COLORS.length])} />
                                <Text style={{ color: dim.enabled ? '#ccc' : '#555', fontSize: 13 }}>
                                  {t(`trend.${dim.name}`)}
                                </Text>
                              </Space>
                            </Col>
                            <Col>
                              <InputNumber
                                min={0}
                                max={100}
                                step={1}
                                value={Math.round(dim.baseWeight * 100)}
                                onChange={(v) => handleTrendWeightChange(idx, v)}
                                disabled={!dim.enabled}
                                formatter={(v) => `${v}%`}
                                parser={(v) => (v ? Number(v.replace('%', '')) : 0) as number}
                                style={{ width: 80 }}
                                size="small"
                              />
                            </Col>
                          </Row>
                        ))}
                      </Col>
                    </Row>

                    {/* Sub-items configuration */}
                    <Divider style={{ borderColor: '#1f2937', margin: '20px 0 12px' }}>
                      <Text style={{ color: '#888', fontSize: 12 }}>{t('settings.subItems')}</Text>
                    </Divider>
                    <Collapse
                      ghost
                      expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 0 : -90} style={{ color: '#888' }} />}
                      items={trendConfig.dimensions.map((dim, dimIdx) => ({
                        key: dim.name,
                        label: (
                          <Text style={{ color: dim.enabled ? '#ccc' : '#555', fontSize: 13 }}>
                            <span style={colorDotStyle(PIE_COLORS[dimIdx % PIE_COLORS.length], 8)} />
                            {t(`trend.${dim.name}`)} — {(dim.subItems || []).length} {t('settings.subItemCount')}
                          </Text>
                        ),
                        children: (
                          <div style={{ paddingLeft: 8 }}>
                            {(dim.subItems || []).map((sub, subIdx) => {
                              return (
                                <Card key={subIdx} className="inner-card" size="small" style={{ marginBottom: 8 }}>
                                  <Row gutter={8} style={{ alignItems: 'center' }}>
                                    <Col>
                                      <Switch
                                        size="small"
                                        checked={sub.enabled}
                                        onChange={(checked) => handleSubItemChange(dimIdx, subIdx, 'enabled', checked)}
                                      />
                                    </Col>
                                    <Col flex="120px">
                                      <Input
                                        size="small"
                                        placeholder={t('settings.subItemName')}
                                        value={sub.name}
                                        onChange={(e) => handleSubItemChange(dimIdx, subIdx, 'name', e.target.value)}
                                        style={{ color: '#ccc', background: '#161b22', borderColor: '#1f2937' }}
                                      />
                                    </Col>
                                    <Col>
                                      <InputNumber
                                        min={0} max={100} step={1} size="small"
                                        value={Math.round(sub.weight * 100)}
                                        onChange={(v) => handleSubItemChange(dimIdx, subIdx, 'weight', v ?? 0)}
                                        formatter={(v) => `${v}%`}
                                        parser={(v) => (v ? Number(v.replace('%', '')) : 0) as number}
                                        style={{ width: 70 }}
                                        disabled={!sub.enabled}
                                      />
                                    </Col>
                                    <Col flex="auto">
                                      <Input
                                        size="small"
                                        placeholder={t('settings.dataSource')}
                                        value={sub.dataSource}
                                        onChange={(e) => handleSubItemChange(dimIdx, subIdx, 'dataSource', e.target.value)}
                                        style={{ color: '#ccc', background: '#161b22', borderColor: '#1f2937' }}
                                      />
                                    </Col>
                                    <Col>
                                      <Select
                                        size="small"
                                        value={sub.apiType}
                                        onChange={(v) => handleSubItemChange(dimIdx, subIdx, 'apiType', v)}
                                        style={{ width: 130 }}
                                        options={[
                                          { value: 'REST API', label: 'REST API' },
                                          { value: 'GraphQL API', label: 'GraphQL API' },
                                          { value: 'REST/WebSocket', label: 'REST/WebSocket' },
                                          { value: 'JSON API', label: 'JSON API' },
                                          { value: 'RSS/JSON', label: 'RSS/JSON' },
                                          { value: 'Scraper', label: 'Scraper (爬虫)' },
                                        ]}
                                      />
                                    </Col>
                                    <Col>
                                      <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteSubItem(dimIdx, subIdx)} />
                                    </Col>
                                  </Row>
                                  <Row gutter={8} style={{ marginTop: 4 }}>
                                    <Col xs={12}>
                                      <Input
                                        size="small"
                                        addonBefore={<span style={{ fontSize: 11 }}>{t('settings.dataDescription')}</span>}
                                        value={sub.dataDescription}
                                        onChange={(e) => handleSubItemChange(dimIdx, subIdx, 'dataDescription', e.target.value)}
                                        style={{ color: '#ccc', background: '#161b22', borderColor: '#1f2937' }}
                                      />
                                    </Col>
                                    <Col xs={12}>
                                      <Input
                                        size="small"
                                        addonBefore={<span style={{ fontSize: 11 }}>{t('settings.apiEndpoint')}</span>}
                                        value={sub.apiEndpoint}
                                        onChange={(e) => handleSubItemChange(dimIdx, subIdx, 'apiEndpoint', e.target.value)}
                                        style={{ color: '#ccc', background: '#161b22', borderColor: '#1f2937' }}
                                      />
                                    </Col>
                                  </Row>
                                </Card>
                              );
                            })}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                              <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => handleAddSubItem(dimIdx)}>
                                {t('settings.addSubItem')}
                              </Button>
                              {(dim.subItems || []).length > 0 && (() => {
                                const subTotal = (dim.subItems || []).filter(s => s.enabled).reduce((a, s) => a + s.weight, 0);
                                return (
                                  <Tag color={Math.abs(subTotal - 1) < 0.01 ? 'green' : 'orange'}>
                                    {t('settings.subItemWeight')}: {Math.round(subTotal * 100)}%
                                  </Tag>
                                );
                              })()}
                            </div>
                          </div>
                        ),
                      }))}
                    />

                    {/* Coin-specific items configuration */}
                    <Divider style={{ borderColor: '#1f2937', margin: '20px 0 12px' }}>
                      <Text style={{ color: '#888', fontSize: 12 }}>{t('settings.coinSpecificItems')}</Text>
                    </Divider>
                    <Collapse
                      ghost
                      expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 0 : -90} style={{ color: '#888' }} />}
                      items={trendConfig.dimensions.filter(dim => dim.coinSpecificItems && Object.keys(dim.coinSpecificItems).length > 0).map((dim) => {
                        const dimIdx = trendConfig.dimensions.indexOf(dim);
                        const coins = Object.keys(dim.coinSpecificItems || {});
                        return {
                          key: `coin_${dim.name}`,
                          label: (
                            <Text style={{ color: dim.enabled ? '#ccc' : '#555', fontSize: 13 }}>
                              <span style={colorDotStyle(PIE_COLORS[dimIdx % PIE_COLORS.length], 8)} />
                              {t(`trend.${dim.name}`)} — {coins.length} {t('settings.coinGroupCount')}
                            </Text>
                          ),
                          children: (
                            <div style={{ paddingLeft: 8 }}>
                              {coins.map((coin) => {
                                const items = (dim.coinSpecificItems || {})[coin] || [];
                                return (
                                  <Card key={coin} className="inner-card" size="small" style={{ marginBottom: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                      <Tag color="blue" style={{ fontSize: 13, fontWeight: 600 }}>{coin} {t('settings.coinSpecificFactors')}</Tag>
                                      <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteCoinGroup(dimIdx, coin)}>
                                        {t('settings.deleteCoinGroup')}
                                      </Button>
                                    </div>
                                    {items.map((sub, subIdx) => (
                                      <Card key={subIdx} size="small" style={{ marginBottom: 6, background: '#0d1117', border: '1px solid #1f2937' }}>
                                        <Row gutter={8} style={{ alignItems: 'center' }}>
                                          <Col>
                                            <Switch size="small" checked={sub.enabled}
                                              onChange={(checked) => handleCoinItemChange(dimIdx, coin, subIdx, 'enabled', checked)} />
                                          </Col>
                                          <Col flex="120px">
                                            <Input size="small" placeholder={t('settings.subItemName')} value={sub.name}
                                              onChange={(e) => handleCoinItemChange(dimIdx, coin, subIdx, 'name', e.target.value)}
                                              style={{ color: '#ccc', background: '#161b22', borderColor: '#1f2937' }} />
                                          </Col>
                                          <Col>
                                            <InputNumber min={0} max={100} step={1} size="small"
                                              value={Math.round(sub.weight * 100)}
                                              onChange={(v) => handleCoinItemChange(dimIdx, coin, subIdx, 'weight', v ?? 0)}
                                              formatter={(v) => `${v}%`}
                                              parser={(v) => (v ? Number(v.replace('%', '')) : 0) as number}
                                              style={{ width: 70 }} disabled={!sub.enabled} />
                                          </Col>
                                          <Col flex="auto">
                                            <Input size="small" placeholder={t('settings.dataSource')} value={sub.dataSource}
                                              onChange={(e) => handleCoinItemChange(dimIdx, coin, subIdx, 'dataSource', e.target.value)}
                                              style={{ color: '#ccc', background: '#161b22', borderColor: '#1f2937' }} />
                                          </Col>
                                          <Col>
                                            <Button type="text" size="small" danger icon={<DeleteOutlined />}
                                              onClick={() => handleDeleteCoinItem(dimIdx, coin, subIdx)} />
                                          </Col>
                                        </Row>
                                        <Row gutter={8} style={{ marginTop: 4 }}>
                                          <Col xs={12}>
                                            <Input size="small"
                                              addonBefore={<span style={{ fontSize: 11 }}>{t('settings.dataDescription')}</span>}
                                              value={sub.dataDescription}
                                              onChange={(e) => handleCoinItemChange(dimIdx, coin, subIdx, 'dataDescription', e.target.value)}
                                              style={{ color: '#ccc', background: '#161b22', borderColor: '#1f2937' }} />
                                          </Col>
                                          <Col xs={12}>
                                            <Input size="small"
                                              addonBefore={<span style={{ fontSize: 11 }}>{t('settings.apiEndpoint')}</span>}
                                              value={sub.apiEndpoint}
                                              onChange={(e) => handleCoinItemChange(dimIdx, coin, subIdx, 'apiEndpoint', e.target.value)}
                                              style={{ color: '#ccc', background: '#161b22', borderColor: '#1f2937' }} />
                                          </Col>
                                        </Row>
                                      </Card>
                                    ))}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                      <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => handleAddCoinItem(dimIdx, coin)}>
                                        {t('settings.addSubItem')}
                                      </Button>
                                      {items.length > 0 && (() => {
                                        const coinTotal = items.filter(s => s.enabled).reduce((a, s) => a + s.weight, 0);
                                        return (
                                          <Tag color={Math.abs(coinTotal - 1) < 0.01 ? 'green' : 'orange'}>
                                            {t('settings.subItemWeight')}: {Math.round(coinTotal * 100)}%
                                          </Tag>
                                        );
                                      })()}
                                    </div>
                                  </Card>
                                );
                              })}
                              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <Input
                                  size="small"
                                  placeholder={t('settings.newCoinSymbol')}
                                  value={newCoinSymbol}
                                  onChange={(e) => setNewCoinSymbol(e.target.value)}
                                  style={{ width: 120, color: '#ccc', background: '#161b22', borderColor: '#1f2937' }}
                                  onPressEnter={() => handleAddCoinGroup(dimIdx)}
                                />
                                <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => handleAddCoinGroup(dimIdx)}>
                                  {t('settings.addCoinGroup')}
                                </Button>
                              </div>
                            </div>
                          ),
                        };
                      })}
                    />

                    <Divider style={{ borderColor: '#1f2937', margin: '16px 0 20px' }}>
                      <Text style={{ color: '#888', fontSize: 12 }}>{t('settings.boostConfig')}</Text>
                    </Divider>
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                      <Col xs={24} md={8}>
                        <Text style={{ color: '#ccc', fontSize: 13, display: 'block', marginBottom: 8 }}>
                          {t('settings.boostFactor')}
                        </Text>
                        <InputNumber
                          min={0}
                          max={2}
                          step={0.1}
                          value={trendConfig.boostFactor}
                          onChange={handleBoostFactorChange}
                          style={{ width: 120 }}
                        />
                      </Col>
                      <Col xs={24} md={16}>
                        <Card className="inner-card" size="small" style={{ marginTop: 28 }}>
                          <Text style={{ color: '#888', fontSize: 12 }}>
                            {t('settings.boostFormulaDesc')}
                          </Text>
                        </Card>
                      </Col>
                    </Row>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveTrendConfig} disabled={!isTrendWeightValid}>
                      {t('settings.saveTrendConfig')}
                    </Button>
                  </>
                )}
              </Card>
            ),
          },
          {
            key: 'about',
            label: <span><ApiOutlined /> {t('settings.about')}</span>,
            children: (
              <Card className="settings-card">
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Text style={{ color: '#888', fontSize: 13, display: 'block', marginBottom: 16, lineHeight: '2' }}>
                      <strong style={{ color: '#fff' }}>CryptoHub</strong> — {t('settings.aboutDesc')}
                    </Text>
                    {[
                      { label: t('settings.version'), value: 'v1.0.0' },
                      { label: t('settings.frontend'), value: 'React 18 + TypeScript + Vite' },
                      { label: t('settings.backendTrading'), value: 'Go 1.24 + Gin' },
                      { label: t('settings.backendAnalysis'), value: 'Python 3.12 + FastAPI' },
                      { label: t('settings.app'), value: 'Flutter 3.x (Android & iOS)' },
                      { label: t('settings.miniProgram'), value: 'uni-app' },
                      { label: t('settings.database'), value: 'PostgreSQL + Redis + InfluxDB' },
                      { label: t('settings.messageQueue'), value: 'Apache Kafka' },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', marginBottom: 10, gap: 16 }}>
                        <Text style={{ color: '#888', fontSize: 12, width: 140, flexShrink: 0 }}>{label}：</Text>
                        <Tag color="blue" style={{ fontSize: 11 }}>{value}</Tag>
                      </div>
                    ))}
                  </Col>
                  <Col xs={24} md={12}>
                    <Text style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 12 }}>{t('settings.supportedExchanges')}</Text>
                    {['Binance', 'OKX', 'Bybit', 'Coinbase', 'Kraken', 'Gate.io', 'Huobi'].map((e) => (
                      <Tag key={e} color="geekblue" style={{ marginBottom: 6, fontSize: 12 }}>{e}</Tag>
                    ))}
                    <Text style={{ color: '#888', fontSize: 12, display: 'block', marginTop: 16, marginBottom: 12 }}>{t('settings.supportedStrategies')}</Text>
                    {strategyNames.map((s) => (
                      <Tag key={s} color="purple" style={{ marginBottom: 6, fontSize: 11 }}>{s}</Tag>
                    ))}
                  </Col>
                </Row>
              </Card>
            ),
          },
        ]}
      />

      {/* Add Exchange API Modal */}
      <Modal
        title={<span style={{ color: '#fff' }}><LinkOutlined /> {t('settings.addExchangeApi')}</span>}
        open={addExchangeOpen}
        onCancel={() => setAddExchangeOpen(false)}
        onOk={() => exchangeForm.submit()}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        styles={{ body: { background: '#161b22' }, header: { background: '#161b22', borderBottom: '1px solid #1f2937' }, footer: { background: '#161b22', borderTop: '1px solid #1f2937' } }}
      >
        <Form form={exchangeForm} layout="vertical" onFinish={handleAddExchangeConfig} style={{ marginTop: 16 }}>
          <Form.Item name="exchange" label={<span style={{ color: '#ccc' }}>{t('settings.selectExchange')}</span>} rules={[{ required: true }]}>
            <Select placeholder={t('settings.selectExchange')}>
              {(['binance', 'okx', 'bybit', 'gate', 'coinbase', 'kraken', 'huobi'] as ExchangeName[]).map((e) => (
                <Option key={e} value={e}>
                  {EXCHANGE_LOGOS[e]} {e.toUpperCase()}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="label" label={<span style={{ color: '#ccc' }}>{t('settings.configLabel')}</span>} rules={[{ required: true }]}>
            <Input placeholder={t('settings.configLabelPlaceholder')} />
          </Form.Item>
          <Form.Item name="apiKey" label={<span style={{ color: '#ccc' }}>API Key</span>}>
            <Input placeholder={t('settings.apiKeyPlaceholder')} />
          </Form.Item>
          <Form.Item name="secretKey" label={<span style={{ color: '#ccc' }}>Secret Key</span>}>
            <Input.Password placeholder={t('settings.secretKeyPlaceholder')} />
          </Form.Item>
          <Form.Item name="passphrase" label={<span style={{ color: '#ccc' }}>Passphrase ({t('common.optional')})</span>}>
            <Input.Password placeholder={t('settings.passphrasePlaceholder')} />
          </Form.Item>
        </Form>
        <div style={{ background: '#0d1117', border: '1px solid #374151', borderRadius: 6, padding: '10px 14px', marginTop: 8 }}>
          <Text style={{ color: '#888', fontSize: 12 }}>
            {t('settings.exchangeSecurityNotice')}
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
