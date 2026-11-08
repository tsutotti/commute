# 通勤快適（出発時刻重視版 v2）

つと個人用の通勤PWA。

- 烏丸御池 ⇄ 京都 ⇄ 大阪
- JRは新快速のみ
- 現在時刻／指定時刻から検索
- 3候補
- 出発時刻を主役に表示
- 到着時刻は小さく表示
- オフライン利用対応

## GitHub Pages更新時
このフォルダの中身をリポジトリのルートへ上書きアップロードしてください。
`index.html`、`app.js`、`style.css`、`sw.js`、`manifest.json`、`update.json`、`data/timetable.js` を同じ階層に置きます。


v2.1: bundled timetable is authoritative; stale localStorage timetable overrides removed; arrival time is secondary in the UI.
