import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Table, Tag, Button, Modal, Form, Input, Select,
  Typography, Statistic, Space, Popconfirm, message, Tooltip, Badge,
  Tabs, Avatar, Descriptions, Divider, Steps,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, SyncOutlined, CheckCircleOutlined,
  ApiOutlined, UserOutlined, MailOutlined, LockOutlined,
  WalletOutlined, HistoryOutlined, CrownOutlined, GoogleOutlined,
  GithubOutlined, EditOutlined, SafetyOutlined, DollarOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  fetchExchangeAccounts, fetchOrders, fetchUserProfile, fetchVipPlans,
  sendVerificationCode, registerUser, updateUserProfile, loginWithThirdParty,
} from '../../services/api';
import type { ExchangeAccount, Order, ExchangeName, UserProfile, VipPlan } from '../../types';
import './PersonalCenter.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const EXCHANGE_LOGOS: Record<ExchangeName, string> = {
  binance: '🟡',
  okx: '⚫',
  bybit: '🟠',
  coinbase: '🔵',
  kraken: '🟣',
  gate: '🟢',
  huobi: '🔴',
};

const ROLE_CONFIG: Record<string, { color: string; label: string }> = {
  user: { color: '#888', label: 'profile.roleUser' },
  vip1: { color: '#faad14', label: 'profile.roleVip1' },
  vip2: { color: '#1677ff', label: 'profile.roleVip2' },
  vip3: { color: '#722ed1', label: 'profile.roleVip3' },
  admin: { color: '#f5222d', label: 'profile.roleAdmin' },
};

const PersonalCenter: React.FC = () => {
  const [accounts, setAccounts] = useState<ExchangeAccount[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [vipPlans, setVipPlans] = useState<VipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [vipOpen, setVipOpen] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [registerStep, setRegisterStep] = useState(0);
  const [form] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    Promise.all([
      fetchExchangeAccounts(),
      fetchOrders(),
      fetchUserProfile(),
      fetchVipPlans(),
    ]).then(([a, o, u, v]) => {
      setAccounts(a);
      setOrders(o);
      setUserProfile(u);
      setVipPlans(v);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    const email = registerForm.getFieldValue('email');
    if (!email) {
      message.error(t('profile.enterEmail'));
      return;
    }
    await sendVerificationCode(email);
    setCountdown(60);
    message.success(t('profile.codeSent'));
  };

  const handleRegister = async (values: Record<string, string>) => {
    await registerUser(values.email, values.code, values.password);
    message.success(t('profile.registerSuccess'));
    setRegisterOpen(false);
    registerForm.resetFields();
    setRegisterStep(0);
  };

  const handleThirdPartyLogin = async (provider: 'google' | 'github') => {
    const result = await loginWithThirdParty(provider);
    if (result.success) {
      message.info(t('profile.redirecting', { provider: provider === 'google' ? 'Google' : 'GitHub' }));
    }
  };

  const handleEditProfile = async (values: Record<string, string>) => {
    await updateUserProfile(values as Partial<UserProfile>);
    if (userProfile) {
      setUserProfile({ ...userProfile, ...values });
    }
    message.success(t('profile.profileUpdated'));
    setEditProfileOpen(false);
  };

  const handleAddAccount = (values: Record<string, string>) => {
    const newAcc: ExchangeAccount = {
      id: `e${Date.now()}`,
      exchange: values.exchange as ExchangeName,
      label: values.label,
      apiKey: `${values.apiKey.slice(0, 6)}****${values.apiKey.slice(-4)}`,
      isConnected: false,
      permissions: ['read'],
      createdAt: new Date().toISOString(),
    };
    setAccounts((prev) => [...prev, newAcc]);
    setAddOpen(false);
    form.resetFields();
    message.success(t('profile.accountAdded'));
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) => (a.id === newAcc.id ? { ...a, isConnected: true, lastSyncAt: new Date().toISOString() } : a)),
      );
      message.success(t('profile.accountConnected'));
    }, 2000);
  };

  const handleSync = (id: string) => {
    message.loading({ content: t('profile.syncing'), key: id });
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, lastSyncAt: new Date().toISOString() } : a)),
      );
      message.success({ content: t('profile.syncComplete'), key: id });
    }, 1500);
  };

  const handleRemove = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    message.success(t('profile.accountRemoved'));
  };

  const locale = i18n.language === 'en_US' ? 'en-US' : 'zh-CN';

  const accountColumns = [
    {
      title: t('profile.exchange'),
      key: 'exchange',
      render: (row: ExchangeAccount) => (
        <Space>
          <span style={{ fontSize: 20 }}>{EXCHANGE_LOGOS[row.exchange]}</span>
          <div>
            <Text strong style={{ color: '#fff', display: 'block' }}>{row.label}</Text>
            <Text style={{ color: '#888', fontSize: 11 }}>{row.exchange.toUpperCase()}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: t('profile.apiKey'),
      dataIndex: 'apiKey',
      key: 'apiKey',
      render: (v: string) => <Text style={{ color: '#888', fontFamily: 'monospace', fontSize: 12 }}>{v}</Text>,
    },
    {
      title: t('profile.status'),
      dataIndex: 'isConnected',
      key: 'isConnected',
      render: (v: boolean) => (
        v
          ? <Badge status="success" text={<Text style={{ color: '#52c41a', fontSize: 12 }}>{t('profile.connected')}</Text>} />
          : <Badge status="error" text={<Text style={{ color: '#f5222d', fontSize: 12 }}>{t('profile.disconnected')}</Text>} />
      ),
    },
    {
      title: t('profile.permissions'),
      dataIndex: 'permissions',
      key: 'permissions',
      render: (perms: string[]) => (
        <Space>
          {perms.map((p) => (
            <Tag key={p} color={p === 'withdraw' ? 'error' : p === 'trade' ? 'success' : 'blue'} style={{ fontSize: 11 }}>
              {p === 'read' ? t('profile.readOnly') : p === 'trade' ? t('profile.trade') : t('profile.withdraw')}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: t('profile.lastSync'),
      dataIndex: 'lastSyncAt',
      key: 'lastSyncAt',
      render: (v?: string) => (
        <Text style={{ color: '#888', fontSize: 12 }}>
          {v ? new Date(v).toLocaleString(locale) : t('common.never')}
        </Text>
      ),
    },
    {
      title: t('profile.actions'),
      key: 'actions',
      render: (_: unknown, row: ExchangeAccount) => (
        <Space>
          <Tooltip title={t('profile.syncAccount')}>
            <Button type="text" size="small" icon={<SyncOutlined style={{ color: '#1677ff' }} />} onClick={() => handleSync(row.id)} />
          </Tooltip>
          <Popconfirm title={t('profile.confirmDeleteAccount')} onConfirm={() => handleRemove(row.id)} okText={t('common.delete')} cancelText={t('common.cancel')}>
            <Button type="text" size="small" icon={<DeleteOutlined style={{ color: '#f5222d' }} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const orderColumns = [
    {
      title: t('profile.time'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => <Text style={{ color: '#888', fontSize: 11 }}>{new Date(v).toLocaleString(locale)}</Text>,
    },
    {
      title: t('profile.exchange'),
      dataIndex: 'exchange',
      key: 'exchange',
      render: (v: string) => <Text style={{ color: '#ccc', fontSize: 12 }}>{v.toUpperCase()}</Text>,
    },
    {
      title: t('profile.tradingPair'),
      dataIndex: 'symbol',
      key: 'symbol',
      render: (v: string) => <Text strong style={{ color: '#fff', fontSize: 12 }}>{v}</Text>,
    },
    {
      title: t('profile.direction'),
      dataIndex: 'side',
      key: 'side',
      render: (v: string) => <Tag color={v === 'buy' ? 'success' : 'error'} style={{ fontSize: 11 }}>{v === 'buy' ? t('profile.buy') : t('profile.sell')}</Tag>,
    },
    {
      title: t('profile.orderType'),
      dataIndex: 'type',
      key: 'type',
      render: (v: string) => <Tag color="blue" style={{ fontSize: 11 }}>{v === 'market' ? t('profile.market') : v === 'limit' ? t('profile.limit') : v}</Tag>,
    },
    {
      title: t('profile.price'),
      dataIndex: 'price',
      key: 'price',
      render: (v?: number) => <Text style={{ color: '#ccc', fontSize: 12 }}>{v ? `$${v.toLocaleString('en-US', { maximumFractionDigits: 2 })}` : t('profile.marketPrice')}</Text>,
    },
    {
      title: t('profile.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (v: number) => <Text style={{ color: '#ccc', fontSize: 12 }}>{v.toFixed(4)}</Text>,
    },
    {
      title: t('profile.status'),
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => {
        const map: Record<string, [string, string]> = {
          filled: ['success', t('profile.filled')],
          open: ['processing', t('profile.open')],
          partially_filled: ['warning', t('profile.partiallyFilled')],
          cancelled: ['default', t('profile.cancelled')],
          rejected: ['error', t('profile.rejected')],
        };
        const [color, label] = map[v] ?? ['default', v];
        return <Badge status={color as never} text={<Text style={{ fontSize: 11, color: '#ccc' }}>{label}</Text>} />;
      },
    },
  ];

  const connectedCount = accounts.filter((a) => a.isConnected).length;
  const roleConfig = userProfile ? ROLE_CONFIG[userProfile.role] : ROLE_CONFIG.user;

  return (
    <div className="personal-center">
      {/* User Header */}
      <div className="pc-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar size={56} style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>
                {userProfile?.nickname || t('profile.title')}
              </Title>
              {userProfile && (
                <Tag color={roleConfig.color} icon={userProfile.role === 'admin' ? <SafetyOutlined /> : userProfile.role !== 'user' ? <CrownOutlined /> : undefined}>
                  {t(roleConfig.label)}
                </Tag>
              )}
            </div>
            <Text style={{ color: '#888', fontSize: 12 }}>
              {userProfile?.email || t('profile.subtitle')}
            </Text>
          </div>
        </div>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => {
            if (userProfile) {
              profileForm.setFieldsValue({
                nickname: userProfile.nickname,
                email: userProfile.email,
                phone: userProfile.phone,
              });
            }
            setEditProfileOpen(true);
          }}>
            {t('profile.editProfile')}
          </Button>
          <Button type="primary" icon={<CrownOutlined />} onClick={() => setVipOpen(true)}>
            {t('profile.upgradeVip')}
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>{t('profile.connectedExchanges')}</span>}
              value={connectedCount}
              suffix={`/ ${accounts.length}`}
              valueStyle={{ color: '#52c41a', fontSize: 22 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>{t('profile.historicalOrders')}</span>}
              value={orders.length}
              valueStyle={{ color: '#1677ff', fontSize: 22 }}
              prefix={<HistoryOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>{t('profile.filledOrders')}</span>}
              value={orders.filter((o) => o.status === 'filled').length}
              valueStyle={{ color: '#52c41a', fontSize: 22 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card" size="small">
            <Statistic
              title={<span style={{ color: '#888', fontSize: 12 }}>{t('profile.pendingOrders')}</span>}
              value={orders.filter((o) => o.status === 'open').length}
              valueStyle={{ color: '#faad14', fontSize: 22 }}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="profile"
        items={[
          {
            key: 'profile',
            label: <span><UserOutlined /> {t('profile.personalInfo')}</span>,
            children: (
              <Card className="pc-card">
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Card className="inner-card" size="small" title={<span style={{ color: '#ccc' }}>{t('profile.accountInfo')}</span>}>
                      {userProfile && (
                        <Descriptions column={1} size="small" labelStyle={{ color: '#888' }} contentStyle={{ color: '#fff' }}>
                          <Descriptions.Item label={t('profile.emailLabel')}>{userProfile.email}</Descriptions.Item>
                          <Descriptions.Item label={t('profile.nicknameLabel')}>{userProfile.nickname}</Descriptions.Item>
                          <Descriptions.Item label={t('profile.phoneLabel')}>{userProfile.phone || '-'}</Descriptions.Item>
                          <Descriptions.Item label={t('profile.memberLevel')}>
                            <Tag color={roleConfig.color}>{t(roleConfig.label)}</Tag>
                          </Descriptions.Item>
                          <Descriptions.Item label={t('profile.loginMethod')}>
                            <Tag color="blue">
                              {userProfile.loginMethod === 'google' ? 'Google' : userProfile.loginMethod === 'github' ? 'GitHub' : t('profile.emailLogin')}
                            </Tag>
                          </Descriptions.Item>
                          <Descriptions.Item label={t('profile.registrationDate')}>
                            {new Date(userProfile.createdAt).toLocaleDateString(locale)}
                          </Descriptions.Item>
                          <Descriptions.Item label={t('profile.lastLogin')}>
                            {new Date(userProfile.lastLoginAt).toLocaleString(locale)}
                          </Descriptions.Item>
                        </Descriptions>
                      )}
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card className="inner-card" size="small" title={<span style={{ color: '#ccc' }}>{t('profile.quickLogin')}</span>}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
                        <Button
                          block
                          size="large"
                          icon={<MailOutlined />}
                          onClick={() => setRegisterOpen(true)}
                        >
                          {t('profile.emailRegisterLogin')}
                        </Button>
                        <Button
                          block
                          size="large"
                          icon={<GoogleOutlined />}
                          onClick={() => handleThirdPartyLogin('google')}
                          style={{ borderColor: '#4285f4', color: '#4285f4' }}
                        >
                          {t('profile.googleLogin')}
                        </Button>
                        <Button
                          block
                          size="large"
                          icon={<GithubOutlined />}
                          onClick={() => handleThirdPartyLogin('github')}
                          style={{ borderColor: '#fff', color: '#fff' }}
                        >
                          {t('profile.githubLogin')}
                        </Button>
                      </div>
                      <Paragraph style={{ color: '#666', fontSize: 11, marginTop: 12 }}>
                        {t('profile.thirdPartyNotice')}
                      </Paragraph>
                    </Card>
                  </Col>
                </Row>
              </Card>
            ),
          },
          {
            key: 'accounts',
            label: <span><ApiOutlined />{t('profile.exchangeAccounts')}</span>,
            children: (
              <Card className="pc-card">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
                    {t('profile.addExchange')}
                  </Button>
                </div>
                <Table
                  dataSource={accounts}
                  columns={accountColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                  size="middle"
                  className="dark-table"
                  scroll={{ x: 700 }}
                />
              </Card>
            ),
          },
          {
            key: 'orders',
            label: <span><HistoryOutlined />{t('profile.orderHistory')}</span>,
            children: (
              <Card className="pc-card">
                <Table
                  dataSource={orders}
                  columns={orderColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10, size: 'small' }}
                  size="small"
                  className="dark-table"
                  scroll={{ x: 800 }}
                />
              </Card>
            ),
          },
          {
            key: 'vip',
            label: <span><CrownOutlined /> {t('profile.vipCenter')}</span>,
            children: (
              <Card className="pc-card">
                <div style={{ marginBottom: 16 }}>
                  <Title level={5} style={{ color: '#fff' }}>
                    <CrownOutlined style={{ color: '#faad14' }} /> {t('profile.vipPlans')}
                  </Title>
                  <Text style={{ color: '#888', fontSize: 12 }}>{t('profile.vipDesc')}</Text>
                </div>
                <Row gutter={[16, 16]}>
                  {vipPlans.map((plan) => {
                    const isCurrentPlan = userProfile?.role === plan.level;
                    const planColors: Record<string, string> = { vip1: '#faad14', vip2: '#1677ff', vip3: '#722ed1' };
                    return (
                      <Col xs={24} md={8} key={plan.level}>
                        <Card
                          className="inner-card"
                          style={{
                            border: isCurrentPlan ? `2px solid ${planColors[plan.level]}` : undefined,
                          }}
                          title={
                            <div style={{ textAlign: 'center', padding: '8px 0' }}>
                              <CrownOutlined style={{ color: planColors[plan.level], fontSize: 24, display: 'block', marginBottom: 4 }} />
                              <Text strong style={{ color: planColors[plan.level], fontSize: 18 }}>{plan.name}</Text>
                            </div>
                          }
                        >
                          <div style={{ textAlign: 'center', marginBottom: 16 }}>
                            <Text style={{ color: '#fff', fontSize: 28, fontWeight: 700 }}>{plan.priceUsdt}</Text>
                            <Text style={{ color: '#888', fontSize: 12 }}> USDT / {t('profile.month')}</Text>
                          </div>
                          <Divider style={{ borderColor: '#1f2937', margin: '8px 0 12px' }} />
                          <div style={{ marginBottom: 16 }}>
                            {plan.features.map((f, idx) => (
                              <div key={idx} style={{ padding: '4px 0', color: '#ccc', fontSize: 13 }}>
                                <CheckCircleOutlined style={{ color: planColors[plan.level], marginRight: 8 }} />
                                {t(`profile.vipFeature_${f}`)}
                              </div>
                            ))}
                          </div>
                          <Button
                            type="primary"
                            block
                            disabled={isCurrentPlan}
                            style={isCurrentPlan ? {} : { background: planColors[plan.level], borderColor: planColors[plan.level] }}
                            icon={<DollarOutlined />}
                            onClick={() => setVipOpen(true)}
                          >
                            {isCurrentPlan ? t('profile.currentPlan') : t('profile.subscribe')}
                          </Button>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            ),
          },
        ]}
      />

      {/* Email Register Modal */}
      <Modal
        title={<span style={{ color: '#fff' }}><MailOutlined /> {t('profile.emailRegisterLogin')}</span>}
        open={registerOpen}
        onCancel={() => { setRegisterOpen(false); setRegisterStep(0); registerForm.resetFields(); }}
        footer={null}
        styles={{ body: { background: '#161b22' }, header: { background: '#161b22', borderBottom: '1px solid #1f2937' } }}
      >
        <Steps
          current={registerStep}
          size="small"
          style={{ marginBottom: 24, marginTop: 16 }}
          items={[
            { title: t('profile.enterEmail') },
            { title: t('profile.verifyCode') },
            { title: t('profile.setPassword') },
          ]}
        />
        <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
          {registerStep === 0 && (
            <>
              <Form.Item
                name="email"
                label={<span style={{ color: '#ccc' }}>{t('profile.emailLabel')}</span>}
                rules={[
                  { required: true, message: t('profile.emailRequired') },
                  { type: 'email', message: t('profile.emailInvalid') },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder={t('profile.emailPlaceholder')} size="large" />
              </Form.Item>
              <Button type="primary" block size="large" onClick={() => {
                registerForm.validateFields(['email']).then(() => {
                  handleSendCode();
                  setRegisterStep(1);
                });
              }}>
                {t('profile.sendCode')}
              </Button>
            </>
          )}
          {registerStep === 1 && (
            <>
              <Form.Item
                name="code"
                label={<span style={{ color: '#ccc' }}>{t('profile.verificationCode')}</span>}
                rules={[
                  { required: true, message: t('profile.codeRequired') },
                  { len: 6, message: t('profile.codeLengthError') },
                ]}
              >
                <Input
                  prefix={<SafetyOutlined />}
                  placeholder={t('profile.codePlaceholder')}
                  maxLength={6}
                  size="large"
                  suffix={
                    <Button type="link" size="small" disabled={countdown > 0} onClick={handleSendCode}>
                      {countdown > 0 ? `${countdown}s` : t('profile.resendCode')}
                    </Button>
                  }
                />
              </Form.Item>
              <Button type="primary" block size="large" onClick={() => {
                registerForm.validateFields(['code']).then(() => setRegisterStep(2));
              }}>
                {t('profile.nextStep')}
              </Button>
            </>
          )}
          {registerStep === 2 && (
            <>
              <Form.Item
                name="password"
                label={<span style={{ color: '#ccc' }}>{t('profile.password')}</span>}
                rules={[
                  { required: true, message: t('profile.passwordRequired') },
                  { min: 8, message: t('profile.passwordMinLength') },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder={t('profile.passwordPlaceholder')} size="large" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label={<span style={{ color: '#ccc' }}>{t('profile.confirmPassword')}</span>}
                rules={[
                  { required: true, message: t('profile.confirmPasswordRequired') },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error(t('profile.passwordMismatch')));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder={t('profile.confirmPasswordPlaceholder')} size="large" />
              </Form.Item>
              <Button type="primary" block size="large" htmlType="submit">
                {t('profile.completeRegistration')}
              </Button>
            </>
          )}
        </Form>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        title={<span style={{ color: '#fff' }}><EditOutlined /> {t('profile.editProfile')}</span>}
        open={editProfileOpen}
        onCancel={() => setEditProfileOpen(false)}
        onOk={() => profileForm.submit()}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        styles={{ body: { background: '#161b22' }, header: { background: '#161b22', borderBottom: '1px solid #1f2937' }, footer: { background: '#161b22', borderTop: '1px solid #1f2937' } }}
      >
        <Form form={profileForm} layout="vertical" onFinish={handleEditProfile} style={{ marginTop: 16 }}>
          <Form.Item name="nickname" label={<span style={{ color: '#ccc' }}>{t('profile.nicknameLabel')}</span>} rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item name="email" label={<span style={{ color: '#ccc' }}>{t('profile.emailLabel')}</span>} rules={[{ type: 'email' }]}>
            <Input prefix={<MailOutlined />} disabled />
          </Form.Item>
          <Form.Item name="phone" label={<span style={{ color: '#ccc' }}>{t('profile.phoneLabel')}</span>}>
            <Input placeholder={t('profile.phonePlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>

      {/* VIP Purchase Modal */}
      <Modal
        title={<span style={{ color: '#fff' }}><DollarOutlined /> {t('profile.purchaseVip')}</span>}
        open={vipOpen}
        onCancel={() => setVipOpen(false)}
        footer={null}
        styles={{ body: { background: '#161b22' }, header: { background: '#161b22', borderBottom: '1px solid #1f2937' } }}
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Title level={5} style={{ color: '#faad14' }}>{t('profile.paymentMethod')}</Title>
          <Card className="inner-card" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ color: '#fff', fontSize: 16 }}>USDT (TRC20)</Text>
            </div>
            <Text style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 12 }}>{t('profile.trc20Notice')}</Text>
            <Input
              value="TRC20WalletAddressPlaceholder"
              readOnly
              addonAfter={
                <Button type="link" size="small" onClick={() => {
                  navigator.clipboard.writeText('TRC20WalletAddressPlaceholder');
                  message.success(t('profile.addressCopied'));
                }}>
                  {t('profile.copyAddress')}
                </Button>
              }
            />
          </Card>
          <Paragraph style={{ color: '#888', fontSize: 12 }}>
            {t('profile.paymentNotice')}
          </Paragraph>
        </div>
      </Modal>

      {/* Add Exchange Modal */}
      <Modal
        title={<span style={{ color: '#fff' }}><ApiOutlined /> {t('profile.addExchangeAccount')}</span>}
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={() => form.submit()}
        okText={t('profile.addAndVerify')}
        cancelText={t('common.cancel')}
        styles={{ body: { background: '#161b22' }, header: { background: '#161b22', borderBottom: '1px solid #1f2937' }, footer: { background: '#161b22', borderTop: '1px solid #1f2937' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddAccount} style={{ marginTop: 16 }}>
          <Form.Item name="exchange" label={<span style={{ color: '#ccc' }}>{t('profile.exchange')}</span>} rules={[{ required: true }]}>
            <Select placeholder={t('profile.selectExchange')}>
              {(['binance', 'okx', 'bybit', 'gate', 'coinbase', 'kraken', 'huobi'] as ExchangeName[]).map((e) => (
                <Option key={e} value={e}>
                  {EXCHANGE_LOGOS[e]} {e.toUpperCase()}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="label" label={<span style={{ color: '#ccc' }}>{t('profile.accountLabel')}</span>} rules={[{ required: true, message: t('profile.accountLabelRequired') }]}>
            <Input placeholder={t('profile.accountLabelPlaceholder')} />
          </Form.Item>
          <Form.Item name="apiKey" label={<span style={{ color: '#ccc' }}>{t('profile.apiKey')}</span>} rules={[{ required: true, message: t('profile.apiKeyRequired') }]}>
            <Input placeholder={t('profile.apiKeyPlaceholder')} />
          </Form.Item>
          <Form.Item name="secretKey" label={<span style={{ color: '#ccc' }}>{t('profile.secretKey')}</span>} rules={[{ required: true, message: t('profile.secretKeyRequired') }]}>
            <Input.Password placeholder={t('profile.secretKeyPlaceholder')} />
          </Form.Item>
          <Form.Item name="passphrase" label={<span style={{ color: '#ccc' }}>{t('profile.passphrase')}</span>}>
            <Input.Password placeholder={t('profile.passphrasePlaceholder')} />
          </Form.Item>
        </Form>
        <div style={{ background: '#0d1117', border: '1px solid #374151', borderRadius: 6, padding: '10px 14px', marginTop: 8 }}>
          <Text style={{ color: '#888', fontSize: 12 }}>
            {t('profile.securityNotice')}
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default PersonalCenter;
