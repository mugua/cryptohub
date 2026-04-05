import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

export default function ProfilePage() {
  return (
    <View style={{ padding: '16px' }}>
      <View style={{ textAlign: 'center', marginBottom: '24px' }}>
        <View style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
          <Text style={{ color: '#fff', fontSize: '32px' }}>U</Text>
        </View>
        <Text style={{ fontSize: '18px', fontWeight: 'bold', display: 'block', marginTop: '12px' }}>User</Text>
      </View>
      {[
        { label: 'Binance', connected: true },
        { label: 'OKX', connected: false },
        { label: 'Bybit', connected: false },
      ].map((ex) => (
        <View key={ex.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1E293B', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
          <Text style={{ color: '#F1F5F9' }}>{ex.label}</Text>
          <View style={{ padding: '4px 12px', borderRadius: '4px', background: ex.connected ? '#26A69A' : '#334155' }}>
            <Text style={{ color: '#fff', fontSize: '12px' }}>{ex.connected ? 'Connected' : 'Connect'}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}
