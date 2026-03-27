import React, { useState } from 'react';
import {
  Card, Form, Input, Button, Typography, Tabs, message,
  Space, Divider, Steps,
} from 'antd';
import {
  UserOutlined, LockOutlined, MailOutlined,
  GoogleOutlined, GithubOutlined, SafetyOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  loginByPassword, registerByEmail, sendVerificationCode, resetPassword,
} from '../../services/api';
import './Login.css';

const { Title, Text, Link } = Typography;

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [registerStep, setRegisterStep] = useState(0);
  const [resetStep, setResetStep] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [showReset, setShowReset] = useState(false);

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    const result = await loginByPassword(values.email, values.password);
    setLoading(false);
    if (result.success && result.user && result.token) {
      message.success(t('auth.loginSuccess'));
      login(result.user, result.token);
      navigate('/');
    } else {
      message.error(t(result.message || 'auth.loginFailed'));
    }
  };

  const handleSendCode = async (formInstance: ReturnType<typeof Form.useForm>[0], fieldName = 'email') => {
    const email = formInstance.getFieldValue(fieldName);
    if (!email) {
      message.error(t('profile.enterEmail'));
      return;
    }
    await sendVerificationCode(email);
    startCountdown();
    message.success(t('profile.codeSent'));
  };

  const handleRegisterNext = async () => {
    if (registerStep === 0) {
      await registerForm.validateFields(['email']);
      await handleSendCode(registerForm);
      setRegisterStep(1);
    } else if (registerStep === 1) {
      await registerForm.validateFields(['code']);
      setRegisterStep(2);
    }
  };

  const handleRegister = async (values: { email: string; code: string; password: string }) => {
    setLoading(true);
    const result = await registerByEmail(values.email, values.password, values.code);
    setLoading(false);
    if (result.success && result.user && result.token) {
      message.success(t('auth.registerSuccess'));
      login(result.user, result.token);
      navigate('/');
    } else {
      message.error(t(result.message || 'auth.registerFailed'));
    }
  };

  const handleResetNext = async () => {
    if (resetStep === 0) {
      await resetForm.validateFields(['email']);
      await handleSendCode(resetForm);
      setResetStep(1);
    } else if (resetStep === 1) {
      await resetForm.validateFields(['code']);
      setResetStep(2);
    }
  };

  const handleReset = async (values: { email: string; code: string; newPassword: string }) => {
    setLoading(true);
    const result = await resetPassword(values.email, values.code, values.newPassword);
    setLoading(false);
    if (result.success) {
      message.success(t('auth.resetSuccess'));
      setShowReset(false);
      setResetStep(0);
      resetForm.resetFields();
      setActiveTab('login');
    } else {
      message.error(t(result.message || 'auth.resetFailed'));
    }
  };

  const resetPasswordForm = (
    <div>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <SafetyOutlined style={{ fontSize: 40, color: '#1677ff' }} />
        <Title level={4} style={{ color: '#fff', marginTop: 12, marginBottom: 4 }}>
          {t('auth.resetPassword')}
        </Title>
        <Text style={{ color: '#888' }}>{t('auth.resetDesc')}</Text>
      </div>
      <Steps
        current={resetStep}
        size="small"
        style={{ marginBottom: 24 }}
        items={[
          { title: t('auth.enterEmail') },
          { title: t('auth.verifyCode') },
          { title: t('auth.newPassword') },
        ]}
      />
      <Form form={resetForm} layout="vertical" onFinish={handleReset}>
        {resetStep === 0 && (
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('profile.emailRequired') },
              { type: 'email', message: t('profile.emailInvalid') },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#888' }} />}
              placeholder={t('profile.emailPlaceholder')}
              size="large"
            />
          </Form.Item>
        )}
        {resetStep === 1 && (
          <Form.Item
            name="code"
            rules={[
              { required: true, message: t('profile.codeRequired') },
              { len: 6, message: t('profile.codeLengthError') },
            ]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input
                prefix={<SafetyOutlined style={{ color: '#888' }} />}
                placeholder={t('profile.codePlaceholder')}
                size="large"
                maxLength={6}
              />
              <Button size="large" disabled={countdown > 0} onClick={() => handleSendCode(resetForm)}>
                {countdown > 0 ? `${countdown}s` : t('profile.resendCode')}
              </Button>
            </Space.Compact>
          </Form.Item>
        )}
        {resetStep === 2 && (
          <>
            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: t('profile.passwordRequired') },
                { min: 6, message: t('auth.passwordMinLength') },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#888' }} />}
                placeholder={t('auth.newPasswordPlaceholder')}
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="confirmNewPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: t('profile.confirmPasswordRequired') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                    return Promise.reject(new Error(t('profile.passwordMismatch')));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#888' }} />}
                placeholder={t('profile.confirmPasswordPlaceholder')}
                size="large"
              />
            </Form.Item>
          </>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          {resetStep < 2 ? (
            <Button type="primary" size="large" block onClick={handleResetNext}>
              {t('profile.nextStep')}
            </Button>
          ) : (
            <Button type="primary" size="large" block htmlType="submit" loading={loading}>
              {t('auth.confirmReset')}
            </Button>
          )}
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link onClick={() => { setShowReset(false); setResetStep(0); resetForm.resetFields(); }}>
            {t('auth.backToLogin')}
          </Link>
        </div>
      </Form>
    </div>
  );

  const loginFormContent = (
    <Form form={loginForm} layout="vertical" onFinish={handleLogin}>
      <Form.Item
        name="email"
        rules={[
          { required: true, message: t('profile.emailRequired') },
          { type: 'email', message: t('profile.emailInvalid') },
        ]}
      >
        <Input
          prefix={<UserOutlined style={{ color: '#888' }} />}
          placeholder={t('profile.emailPlaceholder')}
          size="large"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: t('profile.passwordRequired') }]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: '#888' }} />}
          placeholder={t('auth.passwordPlaceholder')}
          size="large"
        />
      </Form.Item>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Link onClick={() => { setShowReset(true); setResetStep(0); resetForm.resetFields(); }}>
          {t('auth.forgotPassword')}
        </Link>
      </div>
      <Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
          {t('auth.login')}
        </Button>
      </Form.Item>
      <Divider style={{ borderColor: '#1f2937' }}>
        <Text style={{ color: '#888', fontSize: 12 }}>{t('auth.orLoginWith')}</Text>
      </Divider>
      <Space style={{ width: '100%', justifyContent: 'center' }} size="large">
        <Button icon={<GoogleOutlined />} shape="circle" size="large" title="Google" />
        <Button icon={<GithubOutlined />} shape="circle" size="large" title="GitHub" />
      </Space>
    </Form>
  );

  const registerFormContent = (
    <div>
      <Steps
        current={registerStep}
        size="small"
        style={{ marginBottom: 24 }}
        items={[
          { title: t('auth.enterEmail') },
          { title: t('auth.verifyCode') },
          { title: t('auth.setPassword') },
        ]}
      />
      <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
        {registerStep === 0 && (
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('profile.emailRequired') },
              { type: 'email', message: t('profile.emailInvalid') },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#888' }} />}
              placeholder={t('profile.emailPlaceholder')}
              size="large"
            />
          </Form.Item>
        )}
        {registerStep === 1 && (
          <Form.Item
            name="code"
            rules={[
              { required: true, message: t('profile.codeRequired') },
              { len: 6, message: t('profile.codeLengthError') },
            ]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input
                prefix={<SafetyOutlined style={{ color: '#888' }} />}
                placeholder={t('profile.codePlaceholder')}
                size="large"
                maxLength={6}
              />
              <Button size="large" disabled={countdown > 0} onClick={() => handleSendCode(registerForm)}>
                {countdown > 0 ? `${countdown}s` : t('profile.resendCode')}
              </Button>
            </Space.Compact>
          </Form.Item>
        )}
        {registerStep === 2 && (
          <>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: t('profile.passwordRequired') },
                { min: 6, message: t('auth.passwordMinLength') },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#888' }} />}
                placeholder={t('profile.passwordPlaceholder')}
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
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
              <Input.Password
                prefix={<LockOutlined style={{ color: '#888' }} />}
                placeholder={t('profile.confirmPasswordPlaceholder')}
                size="large"
              />
            </Form.Item>
          </>
        )}
        {registerStep < 2 ? (
          <Button type="primary" size="large" block onClick={handleRegisterNext}>
            {t('profile.nextStep')}
          </Button>
        ) : (
          <Button type="primary" size="large" block htmlType="submit" loading={loading}>
            {t('profile.completeRegistration')}
          </Button>
        )}
      </Form>
    </div>
  );

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <span className="login-logo">₿</span>
          <Title level={2} style={{ color: '#fff', margin: 0 }}>CryptoHub</Title>
          <Text style={{ color: '#888', fontSize: 14 }}>{t('auth.subtitle')}</Text>
        </div>
        <Card className="login-card">
          {showReset ? (
            resetPasswordForm
          ) : (
            <Tabs
              activeKey={activeTab}
              onChange={(key) => { setActiveTab(key); setRegisterStep(0); }}
              centered
              items={[
                { key: 'login', label: t('auth.login'), children: loginFormContent },
                { key: 'register', label: t('auth.register'), children: registerFormContent },
              ]}
            />
          )}
        </Card>
        <div className="login-footer">
          <Text style={{ color: '#555', fontSize: 12 }}>
            {t('auth.defaultAccount')}: admin@cryptohub.io / 123456
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Login;
