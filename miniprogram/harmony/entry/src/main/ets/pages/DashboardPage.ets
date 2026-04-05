// CryptoHub HarmonyOS Dashboard
@Entry
@Component
struct DashboardPage {
  @State totalAssets: number = 124680.00
  @State pnlPct: number = 2.34

  private coins: Array<{ symbol: string; price: number; change: number; color: string }> = [
    { symbol: 'BTC', price: 67500, change: 2.34, color: '#F7931A' },
    { symbol: 'ETH', price: 3850, change: -0.87, color: '#627EEA' },
    { symbol: 'BNB', price: 612, change: 1.23, color: '#F3BA2F' },
    { symbol: 'SOL', price: 178, change: 5.61, color: '#9945FF' },
  ]

  build() {
    Scroll() {
      Column({ space: 16 }) {
        Column({ space: 8 }) {
          Text('总资产 / Total Assets').fontSize(14).fontColor('#94A3B8')
          Text(`$${this.totalAssets.toLocaleString()}`).fontSize(32).fontWeight(FontWeight.Bold).fontColor('#F1F5F9')
          Text(`+${this.pnlPct}% today`).fontSize(14).fontColor('#26A69A')
        }
        .width('100%').padding(20).backgroundColor('#1E3A8A').borderRadius(12)

        Text('市场行情 / Market').fontSize(16).fontWeight(FontWeight.Bold).alignSelf(ItemAlign.Start)

        Grid() {
          ForEach(this.coins, (coin: { symbol: string; price: number; change: number; color: string }) => {
            GridItem() {
              Column({ space: 4 }) {
                Text(coin.symbol).fontSize(14).fontWeight(FontWeight.Bold).fontColor('#F1F5F9')
                Text(`$${coin.price.toLocaleString()}`).fontSize(16).fontColor('#F1F5F9')
                Text(`${coin.change >= 0 ? '+' : ''}${coin.change}%`).fontSize(12).fontColor(coin.change >= 0 ? '#26A69A' : '#EF5350')
              }
              .padding(12).backgroundColor('#1E293B').borderRadius(8).width('100%')
            }
          })
        }
        .columnsTemplate('1fr 1fr').columnsGap(8).rowsGap(8).width('100%')
      }
      .padding(16).width('100%')
    }
  }
}
