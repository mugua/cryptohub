// CryptoHub HarmonyOS Trading Page / 交易页面
@Entry
@Component
struct TradingPage {
  @State side: string = 'buy'
  @State price: string = ''
  @State quantity: string = ''

  build() {
    Column({ space: 16 }) {
      Text('交易 Trading').fontSize(20).fontWeight(FontWeight.Bold).fontColor('#F1F5F9').padding({ top: 16, left: 16 })

      Row({ space: 8 }) {
        Button('买入 Buy')
          .backgroundColor(this.side === 'buy' ? '#26A69A' : '#1E293B').fontColor('#fff').width('50%')
          .onClick(() => { this.side = 'buy' })
        Button('卖出 Sell')
          .backgroundColor(this.side === 'sell' ? '#EF5350' : '#1E293B').fontColor('#fff').width('50%')
          .onClick(() => { this.side = 'sell' })
      }.padding({ left: 16, right: 16 })

      Column({ space: 12 }) {
        Text('价格 Price (USDT)').fontColor('#94A3B8').alignSelf(ItemAlign.Start)
        TextInput({ placeholder: 'Enter price / 输入价格', text: this.price })
          .backgroundColor('#1E293B').fontColor('#F1F5F9').onChange((v) => { this.price = v })

        Text('数量 Quantity (BTC)').fontColor('#94A3B8').alignSelf(ItemAlign.Start)
        TextInput({ placeholder: 'Enter quantity / 输入数量', text: this.quantity })
          .backgroundColor('#1E293B').fontColor('#F1F5F9').type(InputType.Number).onChange((v) => { this.quantity = v })

        Button(this.side === 'buy' ? '🟢 Buy BTC' : '🔴 Sell BTC')
          .backgroundColor(this.side === 'buy' ? '#26A69A' : '#EF5350')
          .fontColor('#fff').width('100%').height(48).fontSize(16)
          .onClick(() => {})
      }.padding(16)
    }
    .height('100%').backgroundColor('#0F172A')
  }
}
