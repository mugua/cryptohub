// CryptoHub HarmonyOS Profile Page / 个人资料页
@Entry
@Component
struct ProfilePage {
  build() {
    Scroll() {
      Column({ space: 16 }) {
        Column({ space: 8 }) {
          Text('U').fontSize(32).fontColor('#fff').width(80).height(80)
            .backgroundColor('#3B82F6').borderRadius(40).textAlign(TextAlign.Center)
          Text('User').fontSize(18).fontWeight(FontWeight.Bold).fontColor('#F1F5F9')
        }
        .width('100%').alignItems(HorizontalAlign.Center).padding({ top: 24 })

        Text('交易所 Exchanges').fontSize(16).fontWeight(FontWeight.Bold).fontColor('#F1F5F9')
          .alignSelf(ItemAlign.Start).padding({ left: 16 })

        ForEach(['Binance', 'OKX', 'Bybit'], (exchange: string) => {
          Row() {
            Text(exchange).fontColor('#F1F5F9')
            Blank()
            Button('Connect').backgroundColor('#3B82F6').fontColor('#fff')
              .padding({ left: 12, right: 12, top: 6, bottom: 6 }).borderRadius(6)
          }
          .width('100%').padding(16).backgroundColor('#1E293B').borderRadius(8).margin({ left: 16, right: 16 })
        })
      }.padding(16)
    }
    .height('100%').backgroundColor('#0F172A')
  }
}
