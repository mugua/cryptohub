import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'

const PRICES = [
  { symbol: 'BTC', price: 67500, change: 2.34 },
  { symbol: 'ETH', price: 3850, change: -0.87 },
  { symbol: 'BNB', price: 612, change: 1.23 },
  { symbol: 'SOL', price: 178, change: 5.61 },
]

export default function DashboardPage() {
  return (
    <ScrollView scrollY style={{ height: '100vh' }}>
      <View style={{ padding: '16px' }}>
        <View style={{ background: 'linear-gradient(135deg, #1D4ED8, #1E40AF)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Total Assets / 总资产</Text>
          <Text style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', display: 'block', marginTop: '8px' }}>$124,680.00</Text>
          <Text style={{ color: '#34D399', fontSize: '14px' }}>+2.34% today</Text>
        </View>
        <Text style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', display: 'block' }}>市场行情</Text>
        <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {PRICES.map((p) => (
            <View key={p.symbol} style={{ background: '#1E293B', borderRadius: '8px', padding: '12px' }}>
              <Text style={{ color: '#94A3B8', fontSize: '12px' }}>{p.symbol}/USDT</Text>
              <Text style={{ color: '#F1F5F9', fontSize: '16px', display: 'block', fontWeight: 'bold' }}>${p.price.toLocaleString()}</Text>
              <Text style={{ color: p.change >= 0 ? '#34D399' : '#F87171', fontSize: '12px' }}>
                {p.change >= 0 ? '+' : ''}{p.change}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}
