import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'

const COINS = ['BTC', 'ETH', 'BNB', 'SOL']
const DIMENSIONS = [
  { key: 'macro', label: '宏观经济', score: 35 },
  { key: 'policy', label: '政策法规', score: 20 },
  { key: 'supply_demand', label: '市场供需', score: 55 },
  { key: 'sentiment', label: '市场情绪', score: 40 },
  { key: 'technical', label: '技术分析', score: 48 },
]

export default function AnalysisPage() {
  const [activeCoin, setActiveCoin] = useState('BTC')
  const overallScore = 42.5

  return (
    <ScrollView scrollY>
      <View style={{ padding: '16px' }}>
        <View style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
          {COINS.map((c) => (
            <View key={c}
              style={{ padding: '6px 16px', borderRadius: '20px', background: activeCoin === c ? '#3B82F6' : '#1E293B', cursor: 'pointer' }}
              onClick={() => setActiveCoin(c)}>
              <Text style={{ color: activeCoin === c ? '#fff' : '#94A3B8' }}>{c}</Text>
            </View>
          ))}
        </View>
        <View style={{ background: '#1E293B', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '16px' }}>
          <Text style={{ color: '#94A3B8' }}>{activeCoin} Trend Score / 趋势得分</Text>
          <Text style={{ fontSize: '48px', fontWeight: 'bold', color: '#26A69A', display: 'block' }}>{overallScore}</Text>
          <Text style={{ color: '#26A69A', fontSize: '18px' }}>📈 Bull / 看涨</Text>
        </View>
        {DIMENSIONS.map((d) => (
          <View key={d.key} style={{ background: '#1E293B', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
            <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text style={{ color: '#F1F5F9' }}>{d.label}</Text>
              <Text style={{ color: d.score >= 0 ? '#26A69A' : '#EF5350', fontWeight: 'bold' }}>{d.score}</Text>
            </View>
            <View style={{ background: '#334155', height: '6px', borderRadius: '3px' }}>
              <View style={{ background: d.score >= 0 ? '#26A69A' : '#EF5350', width: `${(d.score + 100) / 2}%`, height: '100%', borderRadius: '3px' }} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
