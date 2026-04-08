import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.scss';

interface TabBarProps {
  current: number;
}

interface TabItem {
  icon: string;
  text: string;
  path: string;
}

const tabs: TabItem[] = [
  { icon: '🏠', text: '首页', path: '/pages/index/index' },
  { icon: '📊', text: '市场', path: '/pages/market/index' },
  { icon: '💹', text: '交易', path: '/pages/trading/index' },
  { icon: '👤', text: '我的', path: '/pages/profile/index' },
];

export default function TabBar({ current }: TabBarProps) {
  const handleTap = (index: number) => {
    if (index === current) return;
    Taro.switchTab({ url: tabs[index].path });
  };

  return (
    <View className='tab-bar'>
      {tabs.map((tab, index) => (
        <View
          key={tab.path}
          className={`tab-bar__item ${index === current ? 'tab-bar__item--active' : ''}`}
          onClick={() => handleTap(index)}
        >
          <Text className='tab-bar__icon'>{tab.icon}</Text>
          <Text
            className='tab-bar__text'
            style={{ color: index === current ? '#F0B90B' : '#848E9C' }}
          >
            {tab.text}
          </Text>
        </View>
      ))}
    </View>
  );
}
