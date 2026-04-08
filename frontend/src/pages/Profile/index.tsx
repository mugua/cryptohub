import React from 'react';
import { Card, Tabs, Avatar, Typography, Descriptions, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import ApiKeys from './ApiKeys';
import TradingPrefs from './TradingPrefs';
import FundFlow from './FundFlow';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 20 }}>
        {t('profile.title')}
      </Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ textAlign: 'center' }}>
            <Avatar size={80} icon={<UserOutlined />} style={{ background: '#F0B90B', marginBottom: 16 }} />
            <Typography.Title level={5}>
              {user?.username || 'Demo User'}
            </Typography.Title>
            <Descriptions column={1} size="small" style={{ textAlign: 'left' }}>
              <Descriptions.Item label={t('profile.email')}>
                {user?.email || 'demo@cryptohub.com'}
              </Descriptions.Item>
              <Descriptions.Item label={t('profile.joinDate')}>
                2025-01-01
              </Descriptions.Item>
              <Descriptions.Item label={t('profile.lastLogin')}>
                2025-01-15 14:30
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card bordered={false}>
            <Tabs
              items={[
                { key: 'apiKeys', label: t('profile.apiKeys'), children: <ApiKeys /> },
                { key: 'prefs', label: t('profile.tradingPrefs'), children: <TradingPrefs /> },
                { key: 'flow', label: t('profile.fundFlow'), children: <FundFlow /> },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
