/**
 * 凛穏塾 動画視聴アプリ ── 設定
 */
window.RJ_CONFIG = {
  // Apps Script ウェブアプリの /exec URL（プロジェクト「凛穏塾 動画アプリ門番」）
  GAS_URL: 'https://script.google.com/macros/s/AKfycbzF6jMW-UHALjgGrpMpga4VREFBoDF8AYkRv3wp6U-5pq_mNi2GzzrroRGd5jkh7Rh6IQ/exec',

  SITE_NAME: '凛穏塾',
  SITE_SUB: '受講生専用 動画ページ',

  // 公開URL（メニューの「パソコンで見る」でコピーされるアドレス。空ならその時開いているURL）
  PUBLIC_URL: 'https://apps.l-mine.com/rionjuku-app/',

  // ── LINEからの簡単ログイン ──────────────────────────────
  // プロラインの自作ページに次のURLを登録すると、uid付きで開かれます。
  //   https://apps.l-mine.com/rionjuku-app/?uid=[[uid]]
  // 実際に「パスワードなしで入れる」ようにするには、GAS側の
  // スクリプトプロパティ LINE_QUICK_LOGIN も on にしてください（二重ロック）。
  LINE_QUICK_LOGIN: true,

  // ── Webプッシュ通知（Firebase Cloud Messaging）──────────
  // 下の FIREBASE と VAPID_KEY を埋めてから PUSH_READY を true にする。
  PUSH_READY: false,
  FIREBASE: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    messagingSenderId: '',
    appId: ''
  },
  VAPID_KEY: '',

  // 法務ページ（凛穏塾さん専用のものができたら差し替え）
  TERMS_URL: 'https://columns.l-mine.com/legal/terms.html',
  PRIVACY_URL: 'https://columns.l-mine.com/legal/privacy.html',

  CONTACT: '運営スタッフ'
};
