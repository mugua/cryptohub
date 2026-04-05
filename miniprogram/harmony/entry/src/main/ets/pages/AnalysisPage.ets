// CryptoHub HarmonyOS Analysis Page / 趋势分析页
@Entry
@Component
struct AnalysisPage {
  @State activeCoin: string = 'BTC'
  @State overallScore: number = 42.5
  @State trendLabel: string = '看涨 Bull'

  private coins: string[] = ['BTC', 'ETH', 'BNB', 'SOL']
  private dimensions: Array<{ name: string; score: number }> = [
    { name: '宏观经济', score: 35 },
    { name: '政策法规', score: 20 },
    { name: '市场供需', score: 55 },
    { name: '市场情绪', score: 40 },
    { name: '技术分析', score: 48 },
  ]

  build() {
    Column({ space: 16 }) {
      Row({ space: 8 }) {
        ForEach(this.coins, (coin: string) => {
          Button(coin)
            .backgroundColor(this.activeCoin === coin ? '#3B82F6' : '#1E293B')
            .fontColor('#fff').borderRadius(20)
            .padding({ left: 16, right: 16, top: 6, bottom: 6 })
            .onClick(() => { this.activeCoin = coin })
        })
      }.width('100%').padding({ top: 16, left: 16, right: 16 })

      Column({ space: 8 }) {
        Text(`${this.activeCoin} 趋势得分`).fontSize(14).fontColor('#94A3B8')
        Text(this.overallScore.toFixed(1)).fontSize(48).fontWeight(FontWeight.Bold).fontColor('#26A69A')
        Text(this.trendLabel).fontSize(18).fontColor('#26A69A')
      }
      .width('100%').padding(20).backgroundColor('#1E293B').borderRadius(12).margin({ left: 16, right: 16 })

      List({ space: 8 }) {
        ForEach(this.dimensions, (dim: { name: string; score: number }) => {
          ListItem() {
            Column({ space: 8 }) {
              Row() {
                Text(dim.name).fontColor('#F1F5F9')
                Blank()
                Text(dim.score.toString()).fontColor(dim.score >= 0 ? '#26A69A' : '#EF5350').fontWeight(FontWeight.Bold)
              }.width('100%')
              Progress({ value: (dim.score + 100) / 2, total: 100, type: ProgressType.Linear })
                .color(dim.score >= 0 ? '#26A69A' : '#EF5350')
            }
            .padding(12).backgroundColor('#1E293B').borderRadius(8)
          }
        })
      }.padding({ left: 16, right: 16 })
    }
    .height('100%').backgroundColor('#0F172A')
  }
}
