import Taro, { useEffect } from '@tarojs/taro'

function App({ children }: { children: any }) {
  useEffect(() => {
    console.log('CryptoHub Mini-program started')
  }, [])
  return children
}

export default App
