import { View, Text } from '@tarojs/components';
import './index.scss';

interface PriceCardProps {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export default function PriceCard({ symbol, name, price, change24h }: PriceCardProps) {
  const isPositive = change24h >= 0;
  const changeColor = isPositive ? '#0ECB81' : '#F6465D';
  const arrow = isPositive ? '▲' : '▼';
  const changeText = `${isPositive ? '+' : ''}${change24h.toFixed(2)}%`;

  const formatPrice = (p: number): string => {
    if (p >= 1000) return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    return `$${p.toFixed(4)}`;
  };

  return (
    <View className='price-card'>
      <View className='price-card__header'>
        <Text className='price-card__name'>{name}</Text>
        <Text className='price-card__symbol'>{symbol}</Text>
      </View>
      <View className='price-card__body'>
        <Text className='price-card__price'>{formatPrice(price)}</Text>
        <Text className='price-card__change' style={{ color: changeColor }}>
          {arrow} {changeText}
        </Text>
      </View>
    </View>
  );
}
