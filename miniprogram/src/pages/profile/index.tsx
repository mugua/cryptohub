import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { logout } from '../../store/auth';
import './index.scss';

const settingsItems = [
  { key: 'language', label: '语言设置', icon: '🌐', value: '中文' },
  { key: 'theme', label: '主题设置', icon: '🎨', value: '深色' },
  { key: 'apiKeys', label: 'API 密钥', icon: '🔑', value: '' },
  { key: 'notifications', label: '通知设置', icon: '🔔', value: '' },
  { key: 'fundFlow', label: '资金流水', icon: '💸', value: '' },
  { key: 'about', label: '关于', icon: 'ℹ️', value: 'v1.0.0' },
];

export default function ProfilePage() {
  const handleSettingTap = (key: string) => {
    Taro.showToast({ title: `${key} 功能开发中`, icon: 'none' });
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      cancelText: '取消',
      confirmColor: '#F6465D',
      success: (res) => {
        if (res.confirm) {
          logout();
          Taro.showToast({ title: '已退出登录', icon: 'success' });
        }
      },
    });
  };

  return (
    <ScrollView scrollY className='profile-page'>
      <View className='profile-page__header'>
        <View className='profile-page__avatar'>
          <Text className='profile-page__avatar-text'>C</Text>
        </View>
        <Text className='profile-page__username'>CryptoUser</Text>
        <Text className='profile-page__email'>user@cryptohub.com</Text>
      </View>

      <View className='profile-page__stats-row'>
        <View className='profile-page__stat-item'>
          <Text className='profile-page__stat-value'>$12,345</Text>
          <Text className='profile-page__stat-label'>总资产</Text>
        </View>
        <View className='profile-page__stat-divider' />
        <View className='profile-page__stat-item'>
          <Text className='profile-page__stat-value' style={{ color: '#0ECB81' }}>+$234</Text>
          <Text className='profile-page__stat-label'>总盈亏</Text>
        </View>
        <View className='profile-page__stat-divider' />
        <View className='profile-page__stat-item'>
          <Text className='profile-page__stat-value'>15</Text>
          <Text className='profile-page__stat-label'>交易次数</Text>
        </View>
      </View>

      <View className='profile-page__settings'>
        {settingsItems.map((item) => (
          <View
            key={item.key}
            className='profile-page__setting-cell'
            onClick={() => handleSettingTap(item.key)}
          >
            <View className='profile-page__setting-left'>
              <Text className='profile-page__setting-icon'>{item.icon}</Text>
              <Text className='profile-page__setting-label'>{item.label}</Text>
            </View>
            <View className='profile-page__setting-right'>
              {item.value && (
                <Text className='profile-page__setting-value'>{item.value}</Text>
              )}
              <Text className='profile-page__setting-arrow'>›</Text>
            </View>
          </View>
        ))}
      </View>

      <View className='profile-page__logout' onClick={handleLogout}>
        <Text className='profile-page__logout-text'>退出登录</Text>
      </View>

      <View style={{ height: '120rpx' }} />
    </ScrollView>
  );
}
