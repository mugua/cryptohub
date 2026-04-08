import { useState } from 'react';
import { View, Text, Input, Picker } from '@tarojs/components';
import './index.scss';

interface OrderFormProps {
  side: 'buy' | 'sell';
  onSubmit: (order: {
    type: string;
    price: string;
    amount: string;
    leverage: number;
  }) => void;
}

export default function OrderForm({ side, onSubmit }: OrderFormProps) {
  const [orderType, setOrderType] = useState<string>('limit');
  const [price, setPrice] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [leverage, setLeverage] = useState<number>(1);

  const orderTypes = ['market', 'limit'];
  const leverageOptions = [1, 2, 3, 5, 10, 20, 50, 100];
  const percentages = [25, 50, 75, 100];

  const isBuy = side === 'buy';
  const accentColor = isBuy ? '#0ECB81' : '#F6465D';

  const handlePercentage = (pct: number) => {
    const mockBalance = 10000;
    const calculated = ((mockBalance * pct) / 100).toFixed(2);
    setAmount(calculated);
  };

  const handleSubmit = () => {
    onSubmit({ type: orderType, price, amount, leverage });
  };

  return (
    <View className='order-form'>
      <View className='order-form__type-row'>
        {orderTypes.map((t) => (
          <View
            key={t}
            className={`order-form__type-btn ${orderType === t ? 'order-form__type-btn--active' : ''}`}
            style={orderType === t ? { borderColor: accentColor, color: accentColor } : {}}
            onClick={() => setOrderType(t)}
          >
            <Text className='order-form__type-text' style={orderType === t ? { color: accentColor } : {}}>
              {t === 'market' ? '市价' : '限价'}
            </Text>
          </View>
        ))}
      </View>

      {orderType === 'limit' && (
        <View className='order-form__field'>
          <Text className='order-form__label'>价格</Text>
          <Input
            className='order-form__input'
            type='digit'
            placeholder='输入价格'
            placeholderStyle='color: #474D57'
            value={price}
            onInput={(e) => setPrice(e.detail.value)}
          />
        </View>
      )}

      <View className='order-form__field'>
        <Text className='order-form__label'>数量</Text>
        <Input
          className='order-form__input'
          type='digit'
          placeholder='输入数量'
          placeholderStyle='color: #474D57'
          value={amount}
          onInput={(e) => setAmount(e.detail.value)}
        />
      </View>

      <View className='order-form__pct-row'>
        {percentages.map((pct) => (
          <View
            key={pct}
            className='order-form__pct-btn'
            onClick={() => handlePercentage(pct)}
          >
            <Text className='order-form__pct-text'>{pct}%</Text>
          </View>
        ))}
      </View>

      <View className='order-form__field'>
        <Text className='order-form__label'>杠杆</Text>
        <View className='order-form__leverage-row'>
          {leverageOptions.map((lev) => (
            <View
              key={lev}
              className={`order-form__lev-btn ${leverage === lev ? 'order-form__lev-btn--active' : ''}`}
              style={leverage === lev ? { backgroundColor: accentColor } : {}}
              onClick={() => setLeverage(lev)}
            >
              <Text
                className='order-form__lev-text'
                style={leverage === lev ? { color: '#fff' } : {}}
              >
                {lev}x
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View
        className='order-form__submit'
        style={{ backgroundColor: accentColor }}
        onClick={handleSubmit}
      >
        <Text className='order-form__submit-text'>
          {isBuy ? '买入' : '卖出'}
        </Text>
      </View>
    </View>
  );
}
