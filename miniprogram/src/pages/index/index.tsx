import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import PriceCard from '../../components/PriceCard';
import './index.scss';

const statsData = [
  { label: '总资产', value: '$12,345', icon: '💰' },
  { label: '盈亏', value: '+$234', icon: '📈', color: '#0ECB81' },
  { label: '策略数', value: '3', icon: '🤖' },
  { label: '挂单数', value: '5', icon: '📋' },
];

const mockCoins = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67890.50, change24h: 2.34 },
  { symbol: 'ETH', name: 'Ethereum', price: 3456.78, change24h: -1.25 },
  { symbol: 'SOL', name: 'Solana', price: 178.90, change24h: 5.67 },
  { symbol: 'BNB', name: 'BNB', price: 612.30, change24h: 0.89 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.1823, change24h: -3.45 },
];

const recentTrades = [
  { id: '1', pair: 'BTC/USDT', side: 'buy', price: 67500, amount: 0.05, time: '12:30' },
  { id: '2', pair: 'ETH/USDT', side: 'sell', price: 3480, amount: 1.2, time: '11:15' },
  { id: '3', pair: 'SOL/USDT', side: 'buy', price: 175, amount: 10, time: '10:00' },
];

export default function IndexPage() {
  const handleViewAll = () => {
    Taro.switchTab({ url: '/pages/market/index' });
  };

  const handleAction = (action: string) => {
    Taro.showToast({ title: `${action}功能开发中`, icon: 'none' });
  };

  return (
    <ScrollView scrollY className='home-page'>
      <View className='home-page__banner'>
        <Text className='home-page__welcome'>欢迎回来 👋</Text>
        <Text className='home-page__subtitle'>CryptoHub 智能交易平台</Text>
      </View>

      <View className='home-page__stats'>
        {statsData.map((stat) => (
          <View key={stat.label} className='home-page__stat-card'>
            <Text className='home-page__stat-icon'>{stat.icon}</Text>
            <Text
              className='home-page__stat-value'
              style={stat.color ? { color: stat.color } : {}}
            >
              {stat.value}
            </Text>
            <Text className='home-page__stat-label'>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View className='home-page__section'>
        <View className='home-page__section-header'>
          <Text className='home-page__section-title'>市场概览</Text>
          <Text className='home-page__view-all' onClick={handleViewAll}>查看全部 →</Text>
        </View>
        {mockCoins.map((coin) => (
          <PriceCard
            key={coin.symbol}
            symbol={coin.symbol}
            name={coin.name}
            price={coin.price}
            change24h={coin.change24h}
          />
        ))}
      </View>

      <View className='home-page__section'>
        <View className='home-page__section-header'>
          <Text className='home-page__section-title'>最近交易</Text>
        </View>
        {recentTrades.map((trade) => (
          <View key={trade.id} className='home-page__trade-item'>
            <View className='home-page__trade-left'>
              <Text className='home-page__trade-pair'>{trade.pair}</Text>
              <Text
                className='home-page__trade-side'
                style={{ color: trade.side === 'buy' ? '#0ECB81' : '#F6465D' }}
              >
                {trade.side === 'buy' ? '买入' : '卖出'}
              </Text>
            </View>
            <View className='home-page__trade-right'>
              <Text className='home-page__trade-price'>${trade.price.toLocaleString()}</Text>
              <Text className='home-page__trade-amount'>{trade.amount}</Text>
            </View>
            <Text className='home-page__trade-time'>{trade.time}</Text>
          </View>
        ))}
      </View>

      <View className='home-page__section'>
        <View className='home-page__section-header'>
          <Text className='home-page__section-title'>快捷操作</Text>
        </View>
        <View className='home-page__actions'>
          <View className='home-page__action-btn' onClick={() => handleAction('充值')}>
            <Text className='home-page__action-icon'>💳</Text>
            <Text className='home-page__action-text'>充值</Text>
          </View>
          <View className='home-page__action-btn' onClick={() => handleAction('提现')}>
            <Text className='home-page__action-icon'>🏦</Text>
            <Text className='home-page__action-text'>提现</Text>
          </View>
          <View className='home-page__action-btn' onClick={() => handleAction('划转')}>
            <Text className='home-page__action-icon'>🔄</Text>
            <Text className='home-page__action-text'>划转</Text>
          </View>
        </View>
      </View>

      <View style={{ height: '120rpx' }} />
    </ScrollView>
  );
}
