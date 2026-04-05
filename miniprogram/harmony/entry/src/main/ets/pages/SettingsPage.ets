// CryptoHub HarmonyOS Settings Page / 设置页面
@Entry
@Component
struct SettingsPage {
  @State darkMode: boolean = true
  @State langIndex: number = 0
  private langs: string[] = ['中文 (简体)', 'English', '日本語', '한국어']

  build() {
    Column({ space: 16 }) {
      Text('设置 Settings').fontSize(20).fontWeight(FontWeight.Bold).fontColor('#F1F5F9').padding({ top: 16, left: 16 })

      Row() {
        Text('深色模式 Dark Mode').fontColor('#F1F5F9')
        Blank()
        Toggle({ type: ToggleType.Switch, isOn: this.darkMode })
          .selectedColor('#3B82F6').onChange((v) => { this.darkMode = v })
      }
      .width('100%').padding(16).backgroundColor('#1E293B').borderRadius(8).margin({ left: 16, right: 16 })

      Column({ space: 8 }) {
        Text('语言 Language').fontColor('#94A3B8').alignSelf(ItemAlign.Start)
        Select(this.langs.map(l => ({ value: l } as SelectOption)))
          .selected(this.langIndex).onSelect((idx) => { this.langIndex = idx }).width('100%')
      }
      .padding(16).backgroundColor('#1E293B').borderRadius(8).margin({ left: 16, right: 16 })
    }
    .height('100%').backgroundColor('#0F172A')
  }
}
