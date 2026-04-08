import React from 'react';
import { Form, InputNumber, Button, Divider, Typography, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { COINS } from '../../utils/constants';

const TradingPrefs: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        defaultLeverage: 5,
        stopLoss: 5,
        takeProfit: 10,
      }}
    >
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item label={t('profile.defaultLeverage')} name="defaultLeverage">
            <InputNumber min={1} max={125} style={{ width: '100%' }} addonAfter="x" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label={t('profile.stopLoss')} name="stopLoss">
            <InputNumber min={0.1} max={50} step={0.1} style={{ width: '100%' }} addonAfter="%" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label={t('profile.takeProfit')} name="takeProfit">
            <InputNumber min={0.1} max={100} step={0.1} style={{ width: '100%' }} addonAfter="%" />
          </Form.Item>
        </Col>
      </Row>
      <Divider />
      <Typography.Text type="secondary">{t('profile.maxPosition')}</Typography.Text>
      {COINS.slice(0, 4).map((coin) => (
        <Row key={coin.symbol} gutter={16} style={{ marginTop: 8 }}>
          <Col span={6}>
            <Typography.Text>{coin.symbol}</Typography.Text>
          </Col>
          <Col span={18}>
            <InputNumber
              style={{ width: '100%' }}
              defaultValue={coin.symbol === 'BTC' ? 1 : coin.symbol === 'ETH' ? 10 : 100}
              min={0}
              addonAfter={coin.symbol}
            />
          </Col>
        </Row>
      ))}
      <Button type="primary" style={{ marginTop: 16 }}>
        {t('common.save')}
      </Button>
    </Form>
  );
};

export default TradingPrefs;
