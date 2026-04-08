import { View, Text } from '@tarojs/components';
import './index.scss';

interface FactorBarProps {
  name: string;
  score: number;
  weight: number;
}

export default function FactorBar({ name, score, weight }: FactorBarProps) {
  const normalizedScore = Math.max(-100, Math.min(100, score));
  const percentage = ((normalizedScore + 100) / 200) * 100;

  const getColor = (): string => {
    if (normalizedScore >= 60) return '#0ECB81';
    if (normalizedScore >= 30) return '#F0B90B';
    if (normalizedScore >= 0) return '#B7BFC7';
    if (normalizedScore >= -30) return '#F0B90B';
    return '#F6465D';
  };

  const color = getColor();

  return (
    <View className='factor-bar'>
      <View className='factor-bar__header'>
        <Text className='factor-bar__name'>{name}</Text>
        <View className='factor-bar__values'>
          <Text className='factor-bar__score' style={{ color }}>{normalizedScore}</Text>
          <Text className='factor-bar__weight'>×{weight.toFixed(1)}</Text>
        </View>
      </View>
      <View className='factor-bar__track'>
        <View
          className='factor-bar__fill'
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}
