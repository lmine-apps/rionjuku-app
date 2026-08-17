/**
 * 凛穏塾 動画視聴アプリ ── 設定
 * GAS_URL だけ、Apps Scriptのデプロイ後に貼り替えてください。
 */
window.RJ_CONFIG = {
  // Apps Script ウェブアプリの /exec URL（プロジェクト「凛穏塾 動画アプリ門番」・2026-08-17）
  GAS_URL: 'https://script.google.com/macros/s/AKfycbzF6jMW-UHALjgGrpMpga4VREFBoDF8AYkRv3wp6U-5pq_mNi2GzzrroRGd5jkh7Rh6IQ/exec',

  SITE_NAME: '凛穏塾',
  SITE_SUB: '受講生専用 動画ページ',

  // 公開URL（メニューの「PCで見る」でコピーされるアドレス。空ならその時開いているURL）
  PUBLIC_URL: '',

  // LINEからの流入（?uid=…）でパスワードなしログインを許すか。
  // true にする場合は、GAS側のスクリプトプロパティ LINE_QUICK_LOGIN も on にする（両方必要）。
  LINE_QUICK_LOGIN: false,

  // 通知（Webプッシュ）。Firebaseの用意ができたら true にする
  PUSH_READY: false,

  // 法務ページ（凛穏塾さん専用のものができたら差し替え）
  TERMS_URL: 'https://columns.l-mine.com/legal/terms.html',
  PRIVACY_URL: 'https://columns.l-mine.com/legal/privacy.html',

  // 問い合わせ先（ログインできない時の案内に使う）
  CONTACT: '運営スタッフ'
};
