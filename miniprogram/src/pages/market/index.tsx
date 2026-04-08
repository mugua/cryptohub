import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import './index.scss';

interface CoinItem {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: string;
}

const allCoins: CoinItem[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67890.50, change24h: 2.34, volume24h: '28.5B' },
  { symbol: 'ETH', name: 'Ethereum', price: 3456.78, change24h: -1.25, volume24h: '15.2B' },
  { symbol: 'SOL', name: 'Solana', price: 178.90, change24h: 5.67, volume24h: '4.8B' },
  { symbol: 'BNB', name: 'BNB', price: 612.30, change24h: 0.89, volume24h: '2.1B' },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.1823, change24h: -3.45, volume24h: '1.9B' },
  { symbol: 'XRP', name: 'Ripple', price: 0.6234, change24h: 1.12, volume24h: '1.5B' },
  { symbol: 'ADA', name: 'Cardano', price: 0.4567, change24h: -0.78, volume24h: '0.8B' },
  { symbol: 'AVAX', name: 'Avalanche', price: 38.90, change24h: 4.23, volume24h: '0.7B' },
  { symbol: 'DOT', name: 'Polkadot', price: 7.89, change24h: -2.10, volume24h: '0.5B' },
  { symbol: 'MATIC', name: 'Polygon', price: 0.7234, change24h: 3.45, volume24h: '0.6B' },
];

export default function MarketPage() {
  const [searchText, setSearchText] = useState('');

  const filteredCoins = allCoins.filter((coin) => {
    const query = searchText.toLowerCase();
    return coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query);
  });

  const handleCoinTap = (symbol: string) => {
    Taro.navigateTo({ url: `/pages/market-detail/index?symbol=${symbol}` });
  };

  const formatPrice = (price: number): string => {
    if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };

  return (
    <View className='market-page'>
      <View className='market-page__search'>
        <Input
          className='market-page__search-input'
          placeholder='搜索币种...'
          placeholderStyle='color: #474D57'
          value={searchText}
          onInput={(e) => setSearchText(e.detail.value)}
        />
      </View>

      <View className='market-page__header'>
        <Text className='market-page__col-name'>名称</Text>
        <Text className='market-page__col-price'>最新价</Text>
        <Text className='market-page__col-change'>涨跌幅</Text>
      </View>

      <ScrollView scrollY className='market-page__list'>
        {filteredCoins.map((coin) => {
          const isPositive = coin.change24h >= 0;
          const changeColor = isPositive ? '#0ECB81' : '#F6465D';
          const arrow = isPositive ? '▲' : '▼';

          return (
            <View
              key={coin.symbol}
              className='market-page__coin-item'
              onClick={() => handleCoinTap(coin.symbol)}
            >
              <View className='market-page__coin-info'>
                <View className='market-page__coin-icon'>
                  <Text className='market-page__coin-icon-text'>
                    {coin.symbol.charAt(0)}
                  </Text>
                </View>
                <View className='market-page__coin-names'>
                  <Text className='market-page__coin-symbol'>{coin.symbol}</Text>
                  <Text className='market-page__coin-name'>{coin.name}</Text>
                </View>
              </View>
              <Text className='market-page__coin-price'>{formatPrice(coin.price)}</Text>
              <View
                className='market-page__coin-change'
                style={{ backgroundColor: changeColor + '20' }}
              >
                <Text style={{ color: changeColor, fontSize: '24rpx', fontWeight: '600' }}>
                  {arrow} {isPositive ? '+' : ''}{coin.change24h.toFixed(2)}%
                </Text>
              </View>
            </View>
          );
        })}
        {filteredCoins.length === 0 && (
          <View className='market-page__empty'>
            <Text className='market-page__empty-text'>暂无匹配币种</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
