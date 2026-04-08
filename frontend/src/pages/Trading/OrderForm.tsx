import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Button,
  InputNumber,
  Slider,
  Select,
  Space,
  Divider,
  Typography,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { COINS } from '../../utils/constants';

const OrderForm: React.FC = () => {
  const { t } = useTranslation();
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<number>(0);
  const [price, setPrice] = useState<number>(104250);
  const [leverage, setLeverage] = useState<number>(1);
  const [coin, setCoin] = useState('BTC');

  const isBuy = side === 'buy';

  return (
    <Card bordered={false} style={{ height: '100%' }}>
      <Select
        value={coin}
        onChange={setCoin}
        style={{ width: '100%', marginBottom: 12 }}
        options={COINS.map((c) => ({
          value: c.symbol,
          label: `${c.symbol}/USDT`,
        }))}
      />
      <Tabs
        activeKey={orderType}
        onChange={setOrderType}
        items={[
          { key: 'market', label: t('trading.marketOrder') },
          { key: 'limit', label: t('trading.limitOrder') },
        ]}
        size="small"
      />
      <Space style={{ width: '100%', marginBottom: 12 }}>
        <Button
          type={isBuy ? 'primary' : 'default'}
          onClick={() => setSide('buy')}
          style={
            isBuy
              ? { background: '#0ECB81', borderColor: '#0ECB81', flex: 1 }
              : { flex: 1 }
          }
          block
        >
          {t('trading.buyLong')}
        </Button>
        <Button
          type={!isBuy ? 'primary' : 'default'}
          onClick={() => setSide('sell')}
          style={
            !isBuy
              ? { background: '#F6465D', borderColor: '#F6465D', flex: 1 }
              : { flex: 1 }
          }
          block
        >
          {t('trading.sellShort')}
        </Button>
      </Space>
      {orderType === 'limit' && (
        <div style={{ marginBottom: 12 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {t('trading.price')} (USDT)
          </Typography.Text>
          <InputNumber
            value={price}
            onChange={(v) => setPrice(v ?? 0)}
            style={{ width: '100%' }}
            min={0}
            step={0.01}
          />
        </div>
      )}
      <div style={{ marginBottom: 12 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {t('trading.amount')} ({coin})
        </Typography.Text>
        <InputNumber
          value={amount}
          onChange={(v) => setAmount(v ?? 0)}
          style={{ width: '100%' }}
          min={0}
          step={0.001}
        />
      </div>
      <Slider
        value={amount}
        onChange={(v) => setAmount(v)}
        max={1}
        step={0.01}
        marks={{ 0: '0%', 0.25: '25%', 0.5: '50%', 0.75: '75%', 1: '100%' }}
        style={{ marginBottom: 24 }}
      />
      <div style={{ marginBottom: 12 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {t('trading.leverage')}
        </Typography.Text>
        <Select
          value={leverage}
          onChange={setLeverage}
          style={{ width: '100%' }}
          options={[1, 2, 3, 5, 10, 20, 50].map((v) => ({
            value: v,
            label: `${v}x`,
          }))}
        />
      </div>
      <Divider style={{ margin: '12px 0' }} />
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <Typography.Text type="secondary">{t('trading.total')}</Typography.Text>
        <Typography.Text>
          {(amount * (orderType === 'limit' ? price : 104250)).toFixed(2)} USDT
        </Typography.Text>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Typography.Text type="secondary">
          {t('trading.availableBalance')}
        </Typography.Text>
        <Typography.Text>50,000.00 USDT</Typography.Text>
      </div>
      <Button
        type="primary"
        block
        size="large"
        style={{
          background: isBuy ? '#0ECB81' : '#F6465D',
          borderColor: isBuy ? '#0ECB81' : '#F6465D',
          fontWeight: 600,
        }}
      >
        {isBuy ? t('trading.buyLong') : t('trading.sellShort')} {coin}
      </Button>
    </Card>
  );
};

export default OrderForm;
