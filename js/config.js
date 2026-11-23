/**
 * 凛穏塾 動画視聴アプリ ── 設定
 */
window.RJ_CONFIG = {
  // Apps Script ウェブアプリの /exec URL（プロジェクト「凛穏塾 動画アプリ門番」）
  GAS_URL: 'https://script.google.com/macros/s/AKfycbzF6jMW-UHALjgGrpMpga4VREFBoDF8AYkRv3wp6U-5pq_mNi2GzzrroRGd5jkh7Rh6IQ/exec',

  SITE_NAME: '凛穏塾',
  SITE_SUB: '会員専用 動画ページ',

  // 公開URL（メニューの「パソコンで見る」でコピーされるアドレス。空ならその時開いているURL）
  PUBLIC_URL: 'https://apps.l-mine.com/rionjuku-app/',

  // ── LINEからの簡単ログイン ──────────────────────────────
  // プロラインの自作ページに次のURLを登録すると、uid付きで開かれます。
  //   https://apps.l-mine.com/rionjuku-app/?uid=[[uid]]
  // 実際に「パスワードなしで入れる」ようにするには、GAS側の
  // スクリプトプロパティ LINE_QUICK_LOGIN も on にしてください（二重ロック）。
  LINE_QUICK_LOGIN: true,

  // メニューの「LINE連携」から着火する、プロラインのステップのURL。
  // 押すとLINEが開き、ログイン用のURL（?uid=付き）がトークに届きます。
  // 空にすると、メニューの項目そのものが出なくなります。
  LINE_LINK_URL: 'https://mka0tn6z.autosns.app/addfriend/s/IxaQFqNy6W/@129snyzr',

  // ── 常時販売（オンライン講義）──────────────────────────
  // 視聴期間が終わった方にお出しする「延長はこちら」の行き先。
  // プロラインのステップ着火URL（押すとLINEが開き、延長のご案内が届く）を入れます。
  // 空のあいだはボタンを出さず、「LINEからお手続きいただけます」の一文だけになります。
  EXTEND_URL: '',

  // オープニング動画（受講方法と注意事項）のVimeoの番号。
  // 凛穏オンライン講義をお求めの方が、初めて入ったときに一度だけ全画面でお出しします。
  // 空にすると、演出もメニューの「オープニングを見る」も出なくなります。
  OPENING_VIMEO: '1206946551',

  // 講義の追加購入（凛穏オンライン講義をお求めの方に、まだお持ちでない講義をご案内する）
  //   PD_BASE  … プロラインの決済ページ。うしろに商品ごとの番号と ?uid= を付けて開く
  //   LINE_URL … uidが分からない方をLINEへご案内する、プロラインの自作ページのURL（uidなしで開くとLINEログインを経てuidが付く）。
  //              届くメッセージのボタンには、次のURLを登録する：
  //                https://apps.l-mine.com/rionjuku-app/?uid=[[uid]]&open=buy
  //              空のあいだは「公式LINEからお手続きください」の一文だけになる
  //   VIA_LINE … true にすると、uidが分かっている方も全員LINEを経由する
  //   PRODUCTS … course は「コース設定」のコース名と同じにする（お持ちかどうかの見分けに使う）
  BUY: {
    PD_BASE: 'https://mka0tn6z.autosns.app/pd/',
    LINE_URL: 'https://mka0tn6z.autosns.app/cp/Wp03yv6zuG',
    VIA_LINE: false,
    PRODUCTS: [
      { code: 'L1', course: '凛穏オンライン講義 LEVEL1', name: 'LEVEL1　伝説の500人講義', desc: '伝説の500人講義', price: 8800, term: '1年', pd: 'ZJxf9jukgv' },
      { code: 'L2', course: '凛穏オンライン講義 LEVEL2', name: 'LEVEL2　2Days講座', desc: '2Days講座＋質問回答会＋補足ボイス', price: 18500, term: '1年', pd: 'lp9tWilDBo' }
    ]
  },

  // ── Webプッシュ通知（Firebase Cloud Messaging）──────────
  // 下の FIREBASE と VAPID_KEY を埋めてから PUSH_READY を true にする。
  PUSH_READY: true,
  FIREBASE: {
    apiKey: 'AIzaSyBpBpGmxfWhyHq3rzwH2Oa_6IWDIZbOAj8',
    authDomain: 'elabo-plus.firebaseapp.com',
    projectId: 'elabo-plus',
    messagingSenderId: '452649305918',
    appId: '1:452649305918:web:4bef5bae57aee4d86c4e6f'
  },
  VAPID_KEY: 'BAtxAvwJITAJ_q2DHtIajcTI_UEgJQhOlPI3uQ8IlXoV_kfyG3SQyRSVkT83Iyln9RsReuwgcR3By6g7roWif1Y',

  // 法務ページ（凛穏塾さん専用のものができたら差し替え）
  TERMS_URL: 'https://columns.l-mine.com/legal/terms.html',
  PRIVACY_URL: 'https://columns.l-mine.com/legal/privacy.html',

  CONTACT: '運営スタッフ'
};
