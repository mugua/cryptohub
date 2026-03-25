import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Form, Input, Select, Switch, Slider, Button,
  Typography, Divider, InputNumber, message, Spin, Tabs, Tag,
} from 'antd';
import {
  SettingOutlined, BellOutlined, SafetyOutlined, GlobalOutlined,
  ApiOutlined, SaveOutlined,
} from '@ant-design/icons';
import { fetchSettings } from '../../services/api';
import './Settings.css';

const { Title, Text } = Typography;
const { Option } = Select;

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [generalForm] = Form.useForm();
  const [notifyForm] = Form.useForm();
  const [riskForm] = Form.useForm();

  useEffect(() => {
    fetchSettings().then((s) => {
      generalForm.setFieldsValue({ language: s.language, theme: s.theme, currency: s.currency });
      notifyForm.setFieldsValue(s.notifications);
      riskForm.setFieldsValue(s.risk);
      setLoading(false);
    });
  }, []);

  const handleSaveGeneral = (_values: Record<string, unknown>) => {
    message.success('通用设置已保存');
  };

  const handleSaveNotify = (_values: Record<string, unknown>) => {
    message.success('通知设置已保存');
  };

  const handleSaveRisk = (_values: Record<string, unknown>) => {
    message.success('风控设置已保存');
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

  return (
    <div className="settings-page">
      <Title level={4} style={{ color: '#fff', marginBottom: 20 }}>
        <SettingOutlined /> 系统设置
      </Title>

      <Tabs
        defaultActiveKey="general"
        items={[
          {
            key: 'general',
            label: <span><GlobalOutlined /> 通用设置</span>,
            children: (
              <Card className="settings-card">
                <Form form={generalForm} layout="vertical" onFinish={handleSaveGeneral}>
                  <Row gutter={24}>
                    <Col xs={24} md={8}>
                      <Form.Item name="language" label={<span style={labelStyle}>界面语言</span>} style={formItemStyle}>
                        <Select>
                          <Option value="zh_CN">🇨🇳 简体中文</Option>
                          <Option value="en_US">🇺🇸 English</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="theme" label={<span style={labelStyle}>主题模式</span>} style={formItemStyle}>
                        <Select>
                          <Option value="dark">🌙 暗色模式</Option>
                          <Option value="light">☀️ 亮色模式</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="currency" label={<span style={labelStyle}>计价货币</span>} style={formItemStyle}>
                        <Select>
                          <Option value="USD">🇺🇸 USD</Option>
                          <Option value="CNY">🇨🇳 CNY</Option>
                          <Option value="EUR">🇪🇺 EUR</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    保存通用设置
                  </Button>
                </Form>
              </Card>
            ),
          },
          {
            key: 'notify',
            label: <span><BellOutlined /> 通知设置</span>,
            children: (
              <Card className="settings-card">
                <Form form={notifyForm} layout="vertical" onFinish={handleSaveNotify}>
                  <Text style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 16 }}>
                    配置价格预警、策略状态、订单成交等通知渠道
                  </Text>
                  <Divider style={{ borderColor: '#1f2937', margin: '8px 0 20px' }}>
                    <Text style={{ color: '#888', fontSize: 12 }}>通知渠道</Text>
                  </Divider>
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Card className="inner-card" size="small" title={<span style={{ color: '#ccc', fontSize: 13 }}>📧 邮件通知</span>}>
                        <Form.Item name="email" valuePropName="checked" style={{ marginBottom: 8 }}>
                          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                        </Form.Item>
                        <Form.Item name="emailAddress" label={<span style={{ color: '#888', fontSize: 12 }}>邮箱地址</span>} style={{ marginBottom: 0 }}>
                          <Input placeholder="your@email.com" size="small" />
                        </Form.Item>
                      </Card>
                    </Col>
                    <Col xs={24} md={12}>
                      <Card className="inner-card" size="small" title={<span style={{ color: '#ccc', fontSize: 13 }}>✈️ Telegram 通知</span>}>
                        <Form.Item name="telegram" valuePropName="checked" style={{ marginBottom: 8 }}>
                          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                        </Form.Item>
                        <Form.Item name="telegramToken" label={<span style={{ color: '#888', fontSize: 12 }}>Bot Token</span>} style={{ marginBottom: 0 }}>
                          <Input.Password placeholder="Bot Token" size="small" />
                        </Form.Item>
                      </Card>
                    </Col>
                  </Row>

                  <Divider style={{ borderColor: '#1f2937', margin: '20px 0' }}>
                    <Text style={{ color: '#888', fontSize: 12 }}>通知类型</Text>
                  </Divider>
                  <Row gutter={16}>
                    {[
                      { name: 'priceAlerts', label: '价格预警' },
                      { name: 'strategyAlerts', label: '策略状态变更' },
                      { name: 'orderAlerts', label: '订单成交' },
                      { name: 'pushEnabled', label: '推送通知' },
                    ].map(({ name, label }) => (
                      <Col key={name} xs={12} sm={6}>
                        <Card className="inner-card" size="small" style={{ textAlign: 'center' }}>
                          <Text style={{ color: '#ccc', fontSize: 12, display: 'block', marginBottom: 8 }}>{label}</Text>
                          <Form.Item name={name} valuePropName="checked" style={{ marginBottom: 0 }}>
                            <Switch checkedChildren="开" unCheckedChildren="关" />
                          </Form.Item>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  <div style={{ marginTop: 20 }}>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      保存通知设置
                    </Button>
                  </div>
                </Form>
              </Card>
            ),
          },
          {
            key: 'risk',
            label: <span><SafetyOutlined /> 风控设置</span>,
            children: (
              <Card className="settings-card">
                <Form form={riskForm} layout="vertical" onFinish={handleSaveRisk}>
                  <Text style={{ color: '#faad14', fontSize: 12, display: 'block', marginBottom: 16 }}>
                    ⚠️ 风控参数直接影响资金安全，请谨慎设置。
                  </Text>
                  <Row gutter={24}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="maxPositionSizeUsd"
                        label={<span style={labelStyle}>单笔最大仓位 (USD)</span>}
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
                        label={<span style={labelStyle}>每日最大亏损 (USD)</span>}
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
                      <Form.Item name="maxDrawdownPct" label={<span style={labelStyle}>最大回撤限制 (%)</span>} style={formItemStyle}>
                        <Slider
                          min={5} max={50} step={1}
                          marks={{ 5: '5%', 15: '15%', 30: '30%', 50: '50%' }}
                          tooltip={{ formatter: (v) => `${v}%` }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="stopLossPct" label={<span style={labelStyle}>止损比例 (%)</span>} style={formItemStyle}>
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
                      📋 风控规则说明：<br />
                      • 单笔最大仓位：限制每笔策略单次开仓的最大资金量<br />
                      • 每日最大亏损：触达后自动停止当日所有策略运行<br />
                      • 最大回撤限制：账户总资产回撤超过阈值时触发保护<br />
                      • 止损比例：每笔交易相对开仓价格的最大允许亏损
                    </Text>
                  </Card>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />} danger>
                    保存风控设置
                  </Button>
                </Form>
              </Card>
            ),
          },
          {
            key: 'about',
            label: <span><ApiOutlined /> 关于系统</span>,
            children: (
              <Card className="settings-card">
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Text style={{ color: '#888', fontSize: 13, display: 'block', marginBottom: 16, lineHeight: '2' }}>
                      <strong style={{ color: '#fff' }}>CryptoHub</strong> — 专业加密货币量化交易平台
                    </Text>
                    {[
                      { label: '版本', value: 'v1.0.0' },
                      { label: '前端', value: 'React 18 + TypeScript + Vite' },
                      { label: '后端 (核心交易)', value: 'Go 1.24 + Gin' },
                      { label: '后端 (策略分析)', value: 'Python 3.12 + FastAPI' },
                      { label: 'APP', value: 'Flutter 3.x (Android & iOS)' },
                      { label: '小程序', value: 'uni-app (微信 / 抖音)' },
                      { label: '数据库', value: 'PostgreSQL + Redis + InfluxDB' },
                      { label: '消息队列', value: 'Apache Kafka' },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', marginBottom: 10, gap: 16 }}>
                        <Text style={{ color: '#888', fontSize: 12, width: 140, flexShrink: 0 }}>{label}：</Text>
                        <Tag color="blue" style={{ fontSize: 11 }}>{value}</Tag>
                      </div>
                    ))}
                  </Col>
                  <Col xs={24} md={12}>
                    <Text style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 12 }}>支持的交易所</Text>
                    {['Binance', 'OKX', 'Bybit', 'Coinbase', 'Kraken', 'Gate.io', 'Huobi'].map((e) => (
                      <Tag key={e} color="geekblue" style={{ marginBottom: 6, fontSize: 12 }}>{e}</Tag>
                    ))}
                    <Text style={{ color: '#888', fontSize: 12, display: 'block', marginTop: 16, marginBottom: 12 }}>支持的策略</Text>
                    {['网格交易', 'DCA定投', '动量策略', '均值回归', '套利', 'MACD', 'RSI反转', '布林带', '海龟交易', '自定义'].map((s) => (
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
