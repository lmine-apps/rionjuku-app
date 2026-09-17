# Codexへの依頼：凛穏塾 動画視聴アプリ（受講生ページ）の見た目を磨いてほしい

## 0. あなたにお願いしたいこと（要約）

すでに公開・本番稼働しているWebアプリの、**受講生が見る画面の見た目だけ**を磨いてください。
**HTMLの構造とJavaScriptには手を入れません。CSSの調整が中心**です。
機能の追加・変更は不要です。

---

## 1. 場所

| | |
|---|---|
| ローカルの作業フォルダ | `C:\Users\mtoor\OneDrive\デスクトップ\クロードコードフォルダ\全体フォルダ\顧客コンサルプロジェクト\凛穏塾\rionjuku-app` |
| GitHub | `https://github.com/lmine-apps/rionjuku-app`（public / GitHub Pages・main・root） |
| 公開URL（受講生ページ） | https://apps.l-mine.com/rionjuku-app/ |
| 公開URL（運営ページ） | https://apps.l-mine.com/rionjuku-app/admin.html |
| デモ（GASに繋がずダミーデータで動く） | https://apps.l-mine.com/rionjuku-app/?mock=1 |

### フォルダ構成

```
rionjuku-app/
├ index.html            ← ★今回の主役（受講生ページ）
├ admin.html              運営ページ（今回は対象外）
├ css/style.css         ← ★ここを主に触る（854行・両ページ共通）
├ js/
│   ├ app.js              受講生ページの動き（触らない）
│   ├ admin.js            運営ページの動き（触らない）
│   ├ common.js           共通処理・通信（触らない）
│   ├ config.js           接続先の設定（触らない）
│   └ mock.js             デモ用ダミーデータ（触らない）
├ assets/                 ロゴ画像と生成スクリプト
│   ├ logo-app.png        起動画面で使う白地ロゴ
│   ├ logo.png            ロゴ（余白を整えた正方形・元データ）
│   └ shots/              マニュアル用の画面キャプチャ
├ manual/                 マニュアルHTMLを生成するPython（今回は対象外）
├ gas/Code.gs             サーバー側（絶対に触らない）
├ start.html / guide.html / manual-*.html   自動生成物（触らない）
└ manifest.json, icon-*.png, favicon-*.png  PWA用
```

---

## 2. このアプリについて

凛穏塾という学びのコミュニティの、**受講生150名向けの会員制 動画視聴アプリ**です。

- スプレッドシートが台帳、Google Apps Script が門番、画面は GitHub Pages という構成
- 受講生は**メールアドレスとパスワードでログイン**し、自分が受講しているコースの動画だけが見える
- 動画は Vimeo 埋め込み
- **利用者はほぼ全員スマートフォン**。年齢層は高め（40〜60代が中心）で、ITが得意な方ばかりではありません
- ホーム画面に追加して**アプリのように使う**前提（PWA）

### デザインの決まりごと（これは維持してください）

- **濃紺 × スカイブルー**。塾のブランドカラーで、金色は使いません
- **見出しは明朝体**（`--serif`）、本文はゴシック（`--sans`）、数字は Georgia（`--num`）
- 落ち着いた、品のある雰囲気。**にぎやかにしない**
- スクロールで**ふわっと出てくる**演出が好まれています（実装済み・`.reveal`）

CSSの先頭に色と書体の変数（デザイントークン）がまとまっています。

```css
:root {
  --navy-950: #07172c;  --navy-900: #0b203d;  --navy-800: #12345a;  --navy-700: #1c4b78;
  --sky-500: #62b7e7;   --sky-400: #84cef1;   --sky-300: #afe0f7;   --sky-100: #e5f5fd;
  --text: #172b3d;      --text-mid: #61768a;
  --line: rgba(18,52,90,.12);
  --shadow: 0 12px 36px rgba(7,23,44,.11);   --shadow-sm: 0 7px 24px rgba(7,23,44,.07);
  --serif: "Yu Mincho", ...;  --sans: ...;  --num: Georgia, ...;
}
```

**新しい色を増やすときも、必ずこの `:root` に変数として足してください。**
CSSの途中に直接カラーコードを書き散らさないでください。

---

## 3. 今回の対象と、見てほしい画面

対象は **`index.html`（受講生ページ）だけ**です。運営ページとマニュアルは今回ふくみません。

画面は1枚のHTMLの中で切り替わります。デモモードで順に確認できます。

| 画面 | 出し方 |
|---|---|
| 起動画面（白い光にロゴが浮かぶ・1.5秒） | ページを開いた瞬間 |
| ログイン画面 | `index.html?mock=1` |
| はじめての方（メール確認 → パスワード設定） | 上の画面で「はじめての方はこちら」 |
| コース選択 | `index.html?mock=1&shot=picker` |
| 視聴画面（動画・目次・補足・資料） | `index.html?mock=1&shot=watch` |
| 右上のアカウントメニュー | `index.html?mock=1&shot=menu` |
| お知らせ（いいね・アンケート） | ログイン後、右上の「お知らせ」 |
| 左の目次（章ごとの色分け・スマホは左下の「目次」ボタン） | 視聴画面から |

`?shot=` は**デモモード専用の撮影用の裏口**です（本番では動きません）。
これを付けると、アニメーションとデモの帯が止まった状態で表示されます。

デモのログインは `demo@example.com` / `demo` です。

### 今、気になっているところ（優先度つき・あくまで叩き台）

1. **スマホでの視認性**。文字が小さいと感じる箇所がないか。本文は 14px 基準です
2. **左の目次**（章の色分けバーとレッスン一覧）。色が7色ぐるぐる回る作りなので、まとまりを出したい
3. **視聴画面**。動画の下に「目次（時刻ジャンプ）」「補足」「資料・音声」「この章の動画」「前へ／次へ」が縦に続き、間延びして見えるかもしれません
4. **お知らせ**のカードと、いいね・アンケートのボタン
5. **余白のリズム**。セクションごとの上下の空きがバラついていないか
6. **押せるものが押せると分かるか**（ボタン・リンクの見分け）

「ここは直さないほうが良い」という判断も歓迎します。理由を添えて教えてください。

---

## 4. 絶対に守ってほしいこと

### ★1. id・class・data属性を変えない、消さない

JavaScriptがこれらを目印にDOMを掴んでいます。**名前を変えると画面が動かなくなります。**
（見た目のためにクラスを**足す**のは構いません）

JSが参照しているidの一覧です。

```
acctBtn acctMenu backdrop blockBody blockCard chapList chapListTitle doneBtn drawerTab
email firstLink fsEmail fsPass fsPass2 fsWord loginBtn loginForm loginMsg markCard marks
newsBadge newsBtn newsLead newsList nextBtn noteCard noteText pass pfCur pfName pfNew pfNew2
pickerList player prevBtn scApp scLogin side sideBody sideHead toPicker
vCrumb vHint vLimit vTitle who
```

JSが付け外ししているクラス（**CSSから定義を消さないでください**）。

```
hidden / on / open / done / is-visible / reveal / empty-side / has-demo-bar / shooting
```

とくに **`.hidden` は「表示を消す」ための最重要クラス**です。定義や優先順位を弱めないでください。

そのほか、JSが掴んでいるセレクタ：
`.side-lesson` `.lesson` `.chap-h` `.pick` `.course-btn` `.ord` `.mark` `.modal` `.modal-bg` `.modal-msg` `.tagpick` `.gt` `.adminonly` `.loading-text` `.loading-sub`、および `[data-*]` すべて。

### ★2. 触ってはいけないファイル

- `js/` の中身すべて（動きの変更は今回の依頼ではありません）
- `gas/Code.gs`（サーバー側）
- `start.html` `guide.html` `manual.html` `manual-admin.html` `manual-system.html`
  → **これらは `manual/*.py` から自動生成されたHTMLです。**直接編集しても次のビルドで消えます
- `js/config.js`（接続先の設定）

### ★3. HTMLの構造は変えない

`index.html` を触るのは、次の場合だけにしてください。

- `?v=NN` のキャッシュ番号を上げるとき（後述）
- 見た目のために**クラスを足す**とき

要素の並び替え・入れ子の変更・削除はしないでください。

### ★4. キャッシュ番号を必ず上げる

`index.html` の中に、こういう記述があります。

```html
<link rel="stylesheet" href="css/style.css?v=33">
<script src="js/app.js?v=33"></script>
```

**CSSを直したら、この `?v=33` を `?v=34` のように全部そろえて上げてください。**
上げ忘れると、受講生のスマホに古い見た目が残り続けます（実際に何度か起きています）。
`admin.html` にも同じ番号があるので、そろえてください。

### ★5. git push はしないでください

コミットまでで止めて、**push はとーるさんの承認後**です。
本番に即反映されるため、この運用にしています。

### ★6. 動作確認は必ずデモモードで

`?mock=1` を付けてください。付けないと**本番のスプレッドシート（受講生150名の実データ）に繋がります**。
デモモードでは画面上部に黄色い帯が出るので、それが目印です。

---

## 5. やってほしい進め方

1. まず `index.html` と `css/style.css` を読んで、**現状のデザインの意図を把握**してください
2. 上の「気になっているところ」を参考に、**直す候補をリストにして、先に見せてください**
   （いきなり全部書き換えず、方針の合意を取ってから進めたいです）
3. 合意できたら、**CSSを中心に修正**します
4. デモモードの各画面（上の表の全部）で、**スマホ幅（375〜390px）と PC幅の両方**を確認してください
5. `?v=` を上げて、変更点を報告してください

### 確認するときの注意

- **スマホ幅での確認を最優先**にしてください。利用者のほとんどがスマホです
- ダークモードの端末でも破綻しないか見てください（現状は基本ライト基調です）
- `prefers-reduced-motion`（動きを減らす設定）の分岐が既にあります。アニメを足すときは、ここにも追記してください

---

## 6. 完了したら教えてほしいこと

- **何をどう変えたか**（ファイルごとに、変更の意図とセットで）
- **やめておいた提案**があれば、その理由
- 確認したブラウザ・画面幅
- 気づいた問題点（デザイン以外でも構いません）

---

## 7. 補足：仕組みをもっと知りたいとき

リポジトリの中に、このアプリの全体像をまとめたページがあります。

- `manual-system.html` … 画面と仕組み（データの流れ、スプレッドシートの列の意味）
- `manual-admin.html` … 運営の手順書
- `README.md` … 開発メモ

ブラウザで開くと読めます。分からないことがあれば、遠慮なく質問してください。
