import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import OrderForm from '../../components/OrderForm';
import './index.scss';

const mockOrders = [
  {
    id: '1',
    pair: 'BTC/USDT',
    side: 'buy' as const,
    type: 'limit' as const,
    price: 66500,
    amount: 0.1,
    status: 'open',
    time: '2024-01-15 14:30',
  },
  {
    id: '2',
    pair: 'ETH/USDT',
    side: 'sell' as const,
    type: 'limit' as const,
    price: 3600,
    amount: 2.5,
    status: 'open',
    time: '2024-01-15 13:15',
  },
  {
    id: '3',
    pair: 'SOL/USDT',
    side: 'buy' as const,
    type: 'market' as const,
    price: 175,
    amount: 20,
    status: 'filled',
    time: '2024-01-15 12:00',
  },
];

export default function TradingPage() {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');

  const handleSubmit = (order: { type: string; price: string; amount: string; leverage: number }) => {
    Taro.showModal({
      title: '确认下单',
      content: `${side === 'buy' ? '买入' : '卖出'} BTC/USDT\n类型: ${order.type === 'market' ? '市价' : '限价'}\n${order.type === 'limit' ? `价格: $${order.price}\n` : ''}数量: ${order.amount}\n杠杆: ${order.leverage}x`,
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '下单成功', icon: 'success' });
        }
      },
    });
  };

  const handleCancel = (orderId: string) => {
    Taro.showToast({ title: `撤销订单 ${orderId}`, icon: 'none' });
  };

  const getStatusTag = (status: string) => {
    const styles: Record<string, { bg: string; color: string; text: string }> = {
      open: { bg: '#F0B90B20', color: '#F0B90B', text: '待成交' },
      filled: { bg: '#0ECB8120', color: '#0ECB81', text: '已成交' },
      canceled: { bg: '#F6465D20', color: '#F6465D', text: '已撤销' },
    };
    const s = styles[status] || styles.open;
    return s;
  };

  return (
    <ScrollView scrollY className='trading-page'>
      <View className='trading-page__price-header'>
        <View className='trading-page__pair-info'>
          <Text className='trading-page__pair-name'>BTC/USDT</Text>
          <Text className='trading-page__pair-label'>永续合约</Text>
        </View>
        <View className='trading-page__price-info'>
          <Text className='trading-page__current-price'>$67,890.50</Text>
          <Text className='trading-page__price-change' style={{ color: '#0ECB81' }}>
            +2.34%
          </Text>
        </View>
      </View>

      <View className='trading-page__tabs'>
        <View
          className={`trading-page__tab ${side === 'buy' ? 'trading-page__tab--buy' : ''}`}
          onClick={() => setSide('buy')}
        >
          <Text
            className='trading-page__tab-text'
            style={{ color: side === 'buy' ? '#FFFFFF' : '#848E9C' }}
          >
            买入
          </Text>
        </View>
        <View
          className={`trading-page__tab ${side === 'sell' ? 'trading-page__tab--sell' : ''}`}
          onClick={() => setSide('sell')}
        >
          <Text
            className='trading-page__tab-text'
            style={{ color: side === 'sell' ? '#FFFFFF' : '#848E9C' }}
          >
            卖出
          </Text>
        </View>
      </View>

      <View className='trading-page__form-section card'>
        <OrderForm side={side} onSubmit={handleSubmit} />
      </View>

      <View className='trading-page__orders-section'>
        <Text className='trading-page__orders-title'>当前委托</Text>
        {mockOrders.map((order) => {
          const statusTag = getStatusTag(order.status);
          return (
            <View key={order.id} className='trading-page__order-item'>
              <View className='trading-page__order-top'>
                <View className='trading-page__order-pair-row'>
                  <Text className='trading-page__order-pair'>{order.pair}</Text>
                  <Text
                    className='trading-page__order-side'
                    style={{ color: order.side === 'buy' ? '#0ECB81' : '#F6465D' }}
                  >
                    {order.side === 'buy' ? '买入' : '卖出'}
                  </Text>
                </View>
                <View
                  className='trading-page__order-status'
                  style={{ backgroundColor: statusTag.bg }}
                >
                  <Text style={{ color: statusTag.color, fontSize: '22rpx' }}>
                    {statusTag.text}
                  </Text>
                </View>
              </View>
              <View className='trading-page__order-details'>
                <View className='trading-page__order-detail'>
                  <Text className='trading-page__detail-label'>价格</Text>
                  <Text className='trading-page__detail-value'>${order.price.toLocaleString()}</Text>
                </View>
                <View className='trading-page__order-detail'>
                  <Text className='trading-page__detail-label'>数量</Text>
                  <Text className='trading-page__detail-value'>{order.amount}</Text>
                </View>
                <View className='trading-page__order-detail'>
                  <Text className='trading-page__detail-label'>时间</Text>
                  <Text className='trading-page__detail-value'>{order.time}</Text>
                </View>
              </View>
              {order.status === 'open' && (
                <View
                  className='trading-page__cancel-btn'
                  onClick={() => handleCancel(order.id)}
                >
                  <Text className='trading-page__cancel-text'>撤销</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={{ height: '120rpx' }} />
    </ScrollView>
  );
}
