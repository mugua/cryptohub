import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Form, Input, Select, Switch, Slider, Button,
  Typography, Divider, InputNumber, message, Spin, Tabs, Tag,
} from 'antd';
import {
  SettingOutlined, BellOutlined, SafetyOutlined, GlobalOutlined,
  ApiOutlined, SaveOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fetchSettings } from '../../services/api';
import './Settings.css';

const { Title, Text } = Typography;
const { Option } = Select;

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [generalForm] = Form.useForm();
  const [notifyForm] = Form.useForm();
  const [riskForm] = Form.useForm();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetchSettings().then((s) => {
      generalForm.setFieldsValue({ language: s.language, theme: s.theme, currency: s.currency });
      notifyForm.setFieldsValue(s.notifications);
      riskForm.setFieldsValue(s.risk);
      setLoading(false);
    });
  }, []);

  const handleSaveGeneral = (values: Record<string, unknown>) => {
    const lang = values.language as string;
    if (lang && lang !== i18n.language) {
      i18n.changeLanguage(lang);
      localStorage.setItem('language', lang);
    }
    message.success(t('settings.generalSaved'));
  };

  const handleSaveNotify = (_values: Record<string, unknown>) => {
    message.success(t('settings.notifySaved'));
  };

  const handleSaveRisk = (_values: Record<string, unknown>) => {
    message.success(t('settings.riskSaved'));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Spin size="large" />
      </div>
    );
  }

  const formItemStyle = { marginBottom: 16 };
  const labelStyle = { color: '#ccc' };

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
                          tooltip={{ formatter: (v) => `${v}%` }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="stopLossPct" label={<span style={labelStyle}>{t('settings.stopLoss')}</span>} style={formItemStyle}>
                        <Slider
                          min={1} max={20} step={0.5}
                          marks={{ 1: '1%', 5: '5%', 10: '10%', 20: '20%' }}
                          tooltip={{ formatter: (v) => `${v}%` }}
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
    </div>
  );
};

export default Settings;
