import { useState } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'

export default function TradingPage() {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [price, setPrice] = useState('')
  const [qty, setQty] = useState('')

  const onSubmit = () => {
    Taro.showToast({ title: `${side.toUpperCase()} order submitted`, icon: 'success' })
  }

  return (
    <View style={{ padding: '16px' }}>
      <View style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {(['buy', 'sell'] as const).map((s) => (
          <View key={s} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: side === s ? (s === 'buy' ? '#26A69A' : '#EF5350') : '#1E293B', textAlign: 'center', cursor: 'pointer' }} onClick={() => setSide(s)}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{s === 'buy' ? '买入 Buy' : '卖出 Sell'}</Text>
          </View>
        ))}
      </View>
      <View style={{ marginBottom: '12px' }}>
        <Text style={{ color: '#94A3B8', marginBottom: '4px', display: 'block' }}>Price / 价格 (USDT)</Text>
        <Input style={{ background: '#1E293B', padding: '10px', borderRadius: '8px', color: '#F1F5F9' }} type='number' value={price} onInput={(e) => setPrice(e.detail.value)} placeholder='Enter price' />
      </View>
      <View style={{ marginBottom: '16px' }}>
        <Text style={{ color: '#94A3B8', marginBottom: '4px', display: 'block' }}>Quantity / 数量 (BTC)</Text>
        <Input style={{ background: '#1E293B', padding: '10px', borderRadius: '8px', color: '#F1F5F9' }} type='number' value={qty} onInput={(e) => setQty(e.detail.value)} placeholder='Enter quantity' />
      </View>
      <View style={{ padding: '14px', borderRadius: '8px', background: side === 'buy' ? '#26A69A' : '#EF5350', textAlign: 'center', cursor: 'pointer' }} onClick={onSubmit}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>{side === 'buy' ? '🟢 Buy BTC' : '🔴 Sell BTC'}</Text>
      </View>
    </View>
  )
}
