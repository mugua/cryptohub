import { View, Text } from '@tarojs/components';
import './index.scss';

interface TrendScoreProps {
  score: number;
  signal: string;
}

export default function TrendScore({ score, signal }: TrendScoreProps) {
  const normalizedScore = Math.max(-100, Math.min(100, score));
  const percentage = ((normalizedScore + 100) / 200) * 100;

  const getColor = (): string => {
    if (normalizedScore >= 50) return '#0ECB81';
    if (normalizedScore >= 20) return '#B7BFC7';
    if (normalizedScore >= -20) return '#F0B90B';
    if (normalizedScore >= -50) return '#F6465D';
    return '#F6465D';
  };

  const getSignalText = (): string => {
    const map: Record<string, string> = {
      'strong_buy': '强烈买入',
      'buy': '买入',
      'neutral': '中性',
      'sell': '卖出',
      'strong_sell': '强烈卖出',
    };
    return map[signal] || signal;
  };

  const color = getColor();
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View className='trend-score'>
      <View className='trend-score__ring'>
        <View className='trend-score__circle' style={{
          background: `conic-gradient(${color} ${percentage * 3.6}deg, #2B3139 ${percentage * 3.6}deg)`,
        }}>
          <View className='trend-score__inner'>
            <Text className='trend-score__value' style={{ color }}>
              {normalizedScore}
            </Text>
            <Text className='trend-score__label'>Score</Text>
          </View>
        </View>
      </View>
      <View className='trend-score__signal' style={{ backgroundColor: color + '20' }}>
        <Text className='trend-score__signal-text' style={{ color }}>
          {getSignalText()}
        </Text>
      </View>
    </View>
  );
}
