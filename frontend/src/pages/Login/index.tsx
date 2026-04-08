import React from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import Logo from '../../components/Common/Logo';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const onFinish = (values: { email: string; password: string }) => {
    void values;
    // Mock login
    login('mock-token-123', {
      id: '1',
      email: 'demo@cryptohub.com',
      username: 'DemoUser',
    });
    message.success(t('auth.loginSuccess'));
    navigate('/');
  };

  return (
    <div className="login-bg">
      <Card
        style={{ width: 400, background: '#1E2329', border: '1px solid #2B3139' }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Logo />
          <Typography.Title level={4} style={{ marginTop: 8 }}>
            {t('auth.welcomeBack')}
          </Typography.Title>
        </div>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="email"
            rules={[{ required: true, message: t('errors.emailRequired') }]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder={t('auth.email')}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: t('errors.passwordRequired') }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('auth.password')}
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              {t('auth.loginButton')}
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center' }}>
          <Typography.Text type="secondary">
            {t('auth.noAccount')}{' '}
            <Link to="/register" style={{ color: '#F0B90B' }}>
              {t('auth.goRegister')}
            </Link>
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
