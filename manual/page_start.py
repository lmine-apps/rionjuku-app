# -*- coding: utf-8 -*-
"""
はじめての方へ（初回登録のご案内）

LINE／メールのご案内メッセージに貼る、いちばん短い1枚。
・スマートフォンで読まれる前提。文字は大きめ、1画面に1つのことだけ。
・URLに ?uid=… が付いていたら、そのまま「動画ページをひらく」ボタンへ引き継ぐ
  （プロラインの [[uid]] で来た方は、アプリ側で名簿にUIDが記録される）
・画面の写真は assets/shots/*.jpg（アプリを実際に開いて撮ったもの）。
  撮り直しは manual/shoot.py を実行する。
"""

from _base import CSS, shot_phone, note, qa, logo_b64, _mark

APP = "apps.l-mine.com/rionjuku-app/"

EXTRA = """
.hero { max-width: 720px; margin: -30px auto 0; padding: 0 16px; position: relative; z-index: 2; }
.hero__box { background: var(--card); border: 1px solid var(--line); border-radius: 16px;
  box-shadow: var(--shadow); padding: 22px 20px 24px; text-align: center; }
.hero__lead { font-size: 15.5px; margin: 0 0 10px; }
.hero__time { display: inline-block; font-size: 12.5px; letter-spacing: .06em;
  background: var(--sky-soft); color: var(--sky); border-radius: 20px; padding: 3px 13px;
  margin-bottom: 4px; }
.go { display: block; text-decoration: none; text-align: center;
  background: linear-gradient(100deg, #12345a, #2e93cf); color: #fff;
  font-size: 18px; font-weight: 700; letter-spacing: .06em;
  padding: 19px 18px; border-radius: 13px; margin: 14px 0 8px;
  box-shadow: 0 8px 20px rgba(18,52,90,.28); }
.go small { display: block; font-weight: 400; font-size: 12px; opacity: .85;
  letter-spacing: .04em; margin-top: 4px; }
.go:active { transform: translateY(1px); }
.url { font-family: var(--mono); font-size: 12px; color: var(--ink-soft);
  word-break: break-all; margin: 0; }

/* 手順 */
.stp { padding: 20px 0 6px; border-top: 1px dashed var(--line); }
.stp:first-of-type { border-top: 0; }
.stp__h { display: grid; grid-template-columns: 42px 1fr; gap: 13px; align-items: center; }
.stp__n { width: 38px; height: 38px; border-radius: 50%; background: var(--navy); color: #fff;
  font-family: var(--num); font-size: 19px; display: flex; align-items: center;
  justify-content: center; }
.stp__t { font-family: var(--serif); font-size: 18px; color: var(--navy-dk); margin: 0;
  line-height: 1.45; }
.stp__d { margin: 10px 0 0; font-size: 15px; }

/* 画面の中のどこを押すか */
.here { display: inline-block; background: var(--navy); color: #fff; font-size: 13px;
  font-weight: 700; border-radius: 6px; padding: 1px 8px; margin: 0 2px;
  white-space: nowrap; letter-spacing: .02em; }

/* 2つ並べる（iPhone / Android） */
.two { display: grid; gap: 14px; margin-top: 14px; }
@media (min-width: 640px) { .two { grid-template-columns: 1fr 1fr; } }
.os { background: var(--card); border: 1px solid var(--line); border-radius: 13px;
  padding: 16px 18px; }
.os__t { font-family: var(--serif); font-size: 16px; color: var(--navy-dk); margin: 0 0 8px;
  display: flex; align-items: center; gap: 8px; }
.os__ic { width: 30px; height: 30px; border-radius: 8px; background: var(--sky-soft);
  color: var(--sky); font-size: 16px; display: flex; align-items: center;
  justify-content: center; flex: none; }
.os ol { margin: 0; padding-left: 1.2em; font-size: 14.5px; }
.os li { margin: 5px 0; }

/* 完了後の見え方 */
.done-box { background: var(--green-soft); border: 1px solid rgba(31,122,92,.24);
  border-radius: 14px; padding: 18px 18px 6px; margin: 22px 0 0; }
.done-box__t { font-family: var(--serif); font-size: 17px; color: var(--green);
  margin: 0 0 4px; text-align: center; }
.done-box__d { text-align: center; font-size: 14.5px; margin: 0; }

/* 画面のここを見てほしい、という説明 */
.pts { list-style: none; margin: 14px 0 0; padding: 0; }
.pts li { position: relative; padding: 0 0 0 26px; margin: 8px 0; font-size: 14.5px; }
.pts li::before { content: "\\25CF"; position: absolute; left: 4px; top: 0;
  color: var(--sky); font-size: 11px; }

@media (max-width: 560px) {
  .hero__box { padding: 18px 15px 20px; }
  .go { font-size: 17px; padding: 18px 14px; }
  .stp__t { font-size: 17px; }
  .phone { width: 280px; }
}
"""

BODY = """
<div class="hero"><div class="hero__box">
  <p class="hero__lead">凛穏塾の講義動画を、いつでも何度でもご覧いただけます。<br>
    はじめに、<b>ご自身のパスワードをお決めいただきます。</b></p>
  <p class="hero__time">かかる時間は 1分ほどです</p>
  <a class="go" id="go" href="index.html">&#9654;&nbsp; 動画ページをひらく
    <small>スマートフォンのままで大丈夫です</small></a>
  <p class="url">https://%s</p>
</div></div>

<main class="wrap" style="padding-top:26px">

  <div class="sec" style="margin-top:8px"><div class="sec__head">
    <span class="sec__no">01</span><h2 class="sec__title">はじめの3ステップ</h2></div>
    <p class="sec__lead">上のボタンから動画ページを開いて、この順に進んでください。</p>
  </div>

  <div class="stp">
    <div class="stp__h"><div class="stp__n">1</div>
      <p class="stp__t">「パスワードを設定する」を押す</p></div>
    <p class="stp__d">ログイン画面がひらきます。<b>いちばん下の</b>
      <span class="here">パスワードを設定する</span>を押してください。<br>
      （2回目からは、上のメールアドレスとパスワードでお入りいただきます）</p>
  </div>
  %s

  <div class="stp">
    <div class="stp__h"><div class="stp__n">2</div>
      <p class="stp__t">メールアドレスを入れる</p></div>
    <p class="stp__d">凛穏塾に<b>お伝えいただいているメールアドレス</b>をご入力いただき、
      <span class="here">次へ</span>を押してください。<br>
      名簿と照らし合わせて、ご本人さまかどうかを確認します。</p>
  </div>
  %s

  <div class="stp">
    <div class="stp__h"><div class="stp__n">3</div>
      <p class="stp__t">パスワードを決める</p></div>
    <p class="stp__d"><b>お名前が表示されたら、確認ができています。</b>
      あとはパスワードをお決めいただくだけです。<br>
      4文字以上でしたら、覚えやすいもので大丈夫です。
      <span class="here">設定して入る</span>を押すと、そのまま動画ページがひらきます。</p>
  </div>
  %s

  <div class="done-box">
    <p class="done-box__t">&#127881; これで完了です</p>
    <p class="done-box__d">次回からは、メールアドレスとこのパスワードでお入りいただけます。</p>
  </div>
  %s

  %s

  <div class="sec"><div class="sec__head">
    <span class="sec__no">02</span><h2 class="sec__title">動画の観かた</h2></div>
    <p class="sec__lead">コースを選ぶと、講義の一覧が出てきます。観たい回を押してください。</p>
  </div>
  %s
  <ul class="pts">
    <li><b>10秒もどす／10秒すすむ</b> … 聞きのがしたところへ、すぐ戻れます</li>
    <li><b>視聴済みにする</b> … 押すとチェックが付きます。
      9割ほどご覧いただくと<b>自動でチェック</b>が付きます</li>
    <li><b>残りの日数</b> … 視聴できる期間がある動画は、上に表示されます</li>
  </ul>

  <div class="sec"><div class="sec__head">
    <span class="sec__no">03</span><h2 class="sec__title">ホーム画面に置いてください</h2></div>
    <p class="sec__lead">次からは1タップで開けます。
      <b>iPhoneで通知を受け取るには、この設定が必要です。</b></p>
  </div>
  <div class="two">
    <div class="os"><p class="os__t"><span class="os__ic"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v11M12 3l-3.4 3.4M12 3l3.4 3.4"/><path d="M6 11H4.6v9.4h14.8V11H18"/></svg></span>iPhone（Safari）</p>
      <ol>
        <li>画面のいちばん下にある<b>共有ボタン</b>（四角に↑の矢印）を押す</li>
        <li>下のほうへたどって<b>「ホーム画面に追加」</b>を押す</li>
        <li>右上の<b>「追加」</b>を押す</li>
      </ol></div>
    <div class="os"><p class="os__t"><span class="os__ic"><svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><circle cx="12" cy="5" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="12" cy="19" r="1.9"/></svg></span>Android（Chrome）</p>
      <ol>
        <li>右上の<b>点が縦に3つ並んだマーク</b>を押す</li>
        <li><b>「ホーム画面に追加」</b>を押す</li>
        <li><b>「追加」</b>を押す</li>
      </ol></div>
  </div>
  <div style="text-align:center;margin-top:18px">
    <img src="data:image/png;base64,%s" alt="凛穏塾" width="60" height="60"
      style="border-radius:14px;background:#fff;padding:2px;box-shadow:var(--shadow)">
    <p style="font-size:13px;color:var(--ink-soft);margin:7px 0 0">
      ホーム画面に、このマークが並びます</p>
  </div>

  <div class="sec"><div class="sec__head">
    <span class="sec__no">04</span><h2 class="sec__title">通知を受け取る</h2></div>
    <p class="sec__lead">新しい動画やお知らせを、スマホにお届けします。</p>
  </div>
  <p>ホーム画面のアイコンからひらいて、右上の<b>お名前のボタン</b>を押すと、
    このメニューが出てきます。<span class="here">&#128276; 通知の設定</span>
    →「通知をオンにする」→ 端末の確認に<b>「許可」</b>で完了です。</p>
  %s

  <div class="sec"><div class="sec__head">
    <span class="sec__no">05</span><h2 class="sec__title">こまったときは</h2></div></div>
  %s

  <div style="text-align:center;margin:32px 0 0">
    <a href="guide.html" style="font-size:15px">&#128214; くわしい使い方ガイドを見る</a>
  </div>

  %s
  <p class="foot" style="margin-top:14px;border-top:0">凛穏塾 動画視聴アプリ &nbsp;/&nbsp; 2026.09</p>
</main>

<script>
（PLACEHOLDER）
</script>
"""

JS = """(function () {
  // ご案内のURLに ?uid=… が付いていたら、動画ページへそのまま引き継ぐ
  // （プロラインの [[uid]] 経由で来られた方は、名簿にUIDが記録されます）
  var m = location.search.match(/[?&](?:uid|lineuid)=([^&]+)/);
  var uid = m ? m[1] : '';
  if (!uid || /^(%5B%5B|\\[\\[)/.test(uid)) return;   // 未置換の [[uid]] は無視
  var a = document.getElementById('go');
  if (a) a.href = 'index.html?uid=' + uid;
})();"""


def build():
    body = BODY % (
        APP,
        shot_phone("assets/shots/login.jpg", "① ログイン画面"),
        shot_phone("assets/shots/first.jpg", "② メールアドレスの確認"),
        shot_phone("assets/shots/firstpass.jpg", "③ パスワードを決める"),
        shot_phone("assets/shots/picker.jpg", "④ ご受講中のコースが並びます"),
        note("<b>「ご登録がありません」と出たとき</b>"
             "別のメールアドレスでご登録されている可能性があります。"
             "お手数ですが、運営スタッフまでご連絡ください。", "warn"),
        shot_phone("assets/shots/watch.jpg", "動画の画面"),
        logo_b64(),
        shot_phone("assets/shots/menu.jpg", "右上のメニュー"),
        qa([
            ("パスワードを忘れてしまいました",
             "運営スタッフまでご連絡ください。すぐに再設定できます。"),
            ("「ご登録がありません」と出ます",
             "凛穏塾にお伝えいただいたものと、別のメールアドレスを入れている可能性があります。"
             "ご確認のうえ、それでも出る場合は運営スタッフまでご連絡ください。"),
            ("パソコンでも観られますか？",
             "観られます。同じメールアドレスとパスワードでお入りいただけます。"
             "アプリの右上のメニューから「パソコンで見る（URLをコピー）」もお使いいただけます。"),
            ("動画が再生されません",
             "電波の良いところで、もう一度ひらいてみてください。"
             "それでも出てこない場合は、一度アプリを閉じてから開き直してください。"),
            ("機種を変えました",
             "新しい端末で同じURLをひらき、メールアドレスとパスワードでログインしてください。"
             "視聴済みの記録は引き継がれます。"),
        ]),
        _mark(),
    )
    body = body.replace("（PLACEHOLDER）", JS)
    return """<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,nofollow">
<title>はじめての方へ｜凛穏塾 受講生専用 動画ページ</title>
<style>%s%s</style>
</head>
<body>
<header class="cover" style="padding:44px 22px 52px">
  <div class="cover__kicker">RIONJUKU ONLINE STUDY</div>
  <h1 class="cover__title" style="font-size:26px">はじめての方へ</h1>
  <p class="cover__sub">動画ページの、最初のご登録のご案内です。</p>
</header>
%s
</body>
</html>
""" % (CSS, EXTRA, body)
