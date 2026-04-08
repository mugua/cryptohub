import React from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import Logo from '../../components/Common/Logo';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const onFinish = (values: {
    email: string;
    username: string;
    password: string;
    confirm: string;
  }) => {
    void values;
    login('mock-token-456', {
      id: '2',
      email: values.email,
      username: values.username,
    });
    message.success(t('auth.registerSuccess'));
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
            {t('auth.createAccount')}
          </Typography.Title>
        </div>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('errors.emailRequired') },
              { type: 'email', message: t('errors.emailInvalid') },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder={t('auth.email')}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="username"
            rules={[{ required: true, message: t('errors.validationError') }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t('auth.username')}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: t('errors.passwordRequired') },
              { min: 6, message: t('errors.passwordTooShort') },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('auth.password')}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: t('errors.passwordRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('errors.passwordMismatch')));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('auth.confirmPassword')}
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              {t('auth.registerButton')}
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center' }}>
          <Typography.Text type="secondary">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" style={{ color: '#F0B90B' }}>
              {t('auth.goLogin')}
            </Link>
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
};

export default Register;
