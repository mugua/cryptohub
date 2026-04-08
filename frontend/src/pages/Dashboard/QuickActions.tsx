import React from 'react';
import { Card, Button, Space } from 'antd';
import {
  PlusCircleOutlined,
  MinusCircleOutlined,
  RobotOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card title={t('dashboard.quickActions')} bordered={false}>
      <Space wrap>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          style={{ background: '#0ECB81', borderColor: '#0ECB81' }}
          onClick={() => navigate('/trading')}
        >
          {t('dashboard.buy')}
        </Button>
        <Button
          type="primary"
          icon={<MinusCircleOutlined />}
          style={{ background: '#F6465D', borderColor: '#F6465D' }}
          onClick={() => navigate('/trading')}
        >
          {t('dashboard.sell')}
        </Button>
        <Button
          icon={<RobotOutlined />}
          onClick={() => navigate('/trading')}
        >
          {t('trading.newStrategy')}
        </Button>
        <Button
          icon={<FileTextOutlined />}
          onClick={() => navigate('/market')}
        >
          {t('market.generateReport')}
        </Button>
      </Space>
    </Card>
  );
};

export default QuickActions;
