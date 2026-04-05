import { useState } from 'react'
import { View, Text, Picker } from '@tarojs/components'

const LANGS = ['中文', 'English', '日本語', '한국어', 'Español']

export default function SettingsPage() {
  const [langIdx, setLangIdx] = useState(1)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <View style={{ padding: '16px' }}>
      <Text style={{ fontSize: '16px', fontWeight: 'bold', display: 'block', marginBottom: '16px' }}>Settings / 设置</Text>
      <View style={{ background: '#1E293B', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#F1F5F9' }}>Dark Mode / 深色模式</Text>
          <View style={{ padding: '4px 12px', borderRadius: '4px', background: darkMode ? '#3B82F6' : '#334155', cursor: 'pointer' }} onClick={() => setDarkMode(!darkMode)}>
            <Text style={{ color: '#fff' }}>{darkMode ? 'ON' : 'OFF'}</Text>
          </View>
        </View>
      </View>
      <View style={{ background: '#1E293B', borderRadius: '8px', padding: '12px' }}>
        <Picker mode='selector' range={LANGS} value={langIdx} onChange={(e) => setLangIdx(Number(e.detail.value))}>
          <View style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text style={{ color: '#F1F5F9' }}>Language / 语言</Text>
            <Text style={{ color: '#3B82F6' }}>{LANGS[langIdx]} ▶</Text>
          </View>
        </Picker>
      </View>
    </View>
  )
}
