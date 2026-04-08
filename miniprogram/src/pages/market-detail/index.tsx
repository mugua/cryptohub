import { useState } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import TrendScore from '../../components/TrendScore';
import FactorBar from '../../components/FactorBar';
import './index.scss';

const coinInfo: Record<string, { name: string; price: number; change: number }> = {
  BTC: { name: 'Bitcoin', price: 67890.50, change: 2.34 },
  ETH: { name: 'Ethereum', price: 3456.78, change: -1.25 },
  SOL: { name: 'Solana', price: 178.90, change: 5.67 },
  BNB: { name: 'BNB', price: 612.30, change: 0.89 },
  DOGE: { name: 'Dogecoin', price: 0.1823, change: -3.45 },
  XRP: { name: 'Ripple', price: 0.6234, change: 1.12 },
  ADA: { name: 'Cardano', price: 0.4567, change: -0.78 },
  AVAX: { name: 'Avalanche', price: 38.90, change: 4.23 },
  DOT: { name: 'Polkadot', price: 7.89, change: -2.10 },
  MATIC: { name: 'Polygon', price: 0.7234, change: 3.45 },
};

const mockFactors = [
  { name: '宏观经济', score: 65, weight: 1.2 },
  { name: '政策法规', score: 45, weight: 1.0 },
  { name: '市场情绪', score: 78, weight: 1.5 },
  { name: '技术指标', score: 80, weight: 1.8 },
  { name: '供需关系', score: 60, weight: 1.3 },
];

export default function MarketDetailPage() {
  const router = useRouter();
  const symbol = router.params.symbol || 'BTC';
  const info = coinInfo[symbol] || coinInfo['BTC'];
  const [generating, setGenerating] = useState(false);

  const formatPrice = (price: number): string => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };

  const handleGenerateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      Taro.showToast({ title: '报告已生成', icon: 'success' });
    }, 1500);
  };

  const isPositive = info.change >= 0;
  const changeColor = isPositive ? '#0ECB81' : '#F6465D';

  return (
    <ScrollView scrollY className='detail-page'>
      <View className='detail-page__header'>
        <View className='detail-page__coin-info'>
          <Text className='detail-page__coin-name'>{info.name}</Text>
          <Text className='detail-page__coin-symbol'>{symbol}/USDT</Text>
        </View>
        <View className='detail-page__price-section'>
          <Text className='detail-page__price'>{formatPrice(info.price)}</Text>
          <Text className='detail-page__change' style={{ color: changeColor }}>
            {isPositive ? '+' : ''}{info.change.toFixed(2)}%
          </Text>
        </View>
      </View>

      <View className='detail-page__score-section card'>
        <Text className='detail-page__section-title'>趋势评分</Text>
        <TrendScore score={72} signal='buy' />
      </View>

      <View className='detail-page__factors-section card'>
        <Text className='detail-page__section-title'>因子分解</Text>
        <View className='detail-page__factors-list'>
          {mockFactors.map((factor) => (
            <FactorBar
              key={factor.name}
              name={factor.name}
              score={factor.score}
              weight={factor.weight}
            />
          ))}
        </View>
      </View>

      <View className='detail-page__summary card'>
        <Text className='detail-page__section-title'>分析总结</Text>
        <Text className='detail-page__summary-text'>
          综合多维度因子分析，{info.name}当前处于上升趋势中。技术指标显示强烈买入信号，
          市场情绪偏向乐观。宏观经济环境稳定，政策风险可控。建议关注关键支撑位和阻力位，
          合理控制仓位，分批建仓。当前综合评分72分，信号为买入。
        </Text>
      </View>

      <View className='detail-page__action'>
        <View
          className='detail-page__generate-btn'
          onClick={handleGenerateReport}
        >
          <Text className='detail-page__generate-text'>
            {generating ? '生成中...' : '生成新报告'}
          </Text>
        </View>
      </View>

      <View style={{ height: '60rpx' }} />
    </ScrollView>
  );
}
