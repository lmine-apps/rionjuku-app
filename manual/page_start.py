# -*- coding: utf-8 -*-
"""
はじめての方へ（初回登録のご案内）

LINE／メールのご案内メッセージに貼る、いちばん短い1枚。
・URLに ?uid=… が付いていたら、そのまま「動画ページをひらく」ボタンへ引き継ぐ
  （プロラインの [[uid]] で来た方は、アプリ側で名簿にUIDが記録される）
"""

from _base import CSS, phone, note, logo_b64, _mark

APP = "apps.l-mine.com/rionjuku-app/"

EXTRA = """
.hero { max-width: 720px; margin: -30px auto 0; padding: 0 16px; position: relative; z-index: 2; }
.hero__box { background: var(--card); border: 1px solid var(--line); border-radius: 16px;
  box-shadow: var(--shadow); padding: 22px 20px 24px; text-align: center; }
.hero__lead { font-size: 15px; margin: 0 0 4px; }
.go { display: block; text-decoration: none; text-align: center;
  background: linear-gradient(100deg, #12345a, #2e93cf); color: #fff;
  font-size: 17px; font-weight: 700; letter-spacing: .06em;
  padding: 17px 18px; border-radius: 13px; margin: 16px 0 8px;
  box-shadow: 0 8px 20px rgba(18,52,90,.28); }
.go small { display: block; font-weight: 400; font-size: 11.5px; opacity: .8;
  letter-spacing: .04em; margin-top: 3px; }
.go:active { transform: translateY(1px); }
.url { font-family: var(--mono); font-size: 12px; color: var(--ink-soft);
  word-break: break-all; margin: 0; }
.stp { display: grid; grid-template-columns: 44px 1fr; gap: 14px; align-items: start;
  padding: 18px 0; border-top: 1px dashed var(--line); }
.stp:first-of-type { border-top: 0; }
.stp__n { width: 40px; height: 40px; border-radius: 50%; background: var(--navy); color: #fff;
  font-family: var(--num); font-size: 19px; display: flex; align-items: center;
  justify-content: center; }
.stp__t { font-family: var(--serif); font-size: 17px; color: var(--navy-dk); margin: 4px 0 4px; }
.stp__d { margin: 0; font-size: 14.5px; }
.two { display: flex; gap: 18px; flex-wrap: wrap; justify-content: center; margin-top: 8px; }
.os { flex: 1 1 260px; background: var(--card); border: 1px solid var(--line);
  border-radius: 12px; padding: 14px 16px; }
.os__t { font-family: var(--serif); font-size: 15px; color: var(--navy-dk); margin: 0 0 4px; }
.os p { margin: 0; font-size: 14px; }
@media (max-width: 560px) { .hero__box { padding: 18px 15px 20px; } .go { font-size: 16px; } }
"""

SCR_LOGIN = """
<div class="a-body" style="padding:24px 16px 18px">
  <div style="text-align:center;margin-bottom:12px">
    <div style="font-family:var(--serif);font-size:19px;letter-spacing:.2em">凛穏塾</div>
    <div style="font-size:9px;color:#8fd0f5;letter-spacing:.25em;margin-top:3px">受講生専用 動画ページ</div>
  </div>
  <div class="a-field"><span class="a-label">メールアドレス</span><div class="a-input">&nbsp;</div></div>
  <div class="a-field"><span class="a-label">パスワード</span><div class="a-input">&nbsp;</div></div>
  <div class="a-btn">ログイン</div>
  <div class="a-link" style="color:#ffd8a3">はじめての方はこちら（パスワードを設定する）</div>
  <p class="a-note">↑ 最初はこちらを押してください</p>
</div>"""

SCR_MAIL = """
<div class="a-body" style="padding:26px 16px 20px">
  <div style="text-align:center;margin-bottom:12px">
    <div style="font-family:var(--serif);font-size:15px">はじめての方</div>
    <div style="font-size:9.5px;color:#9db6cc;margin-top:4px">ご登録のメールアドレスを<br>ご入力ください</div>
  </div>
  <div class="a-field"><span class="a-label">メールアドレス</span>
    <div class="a-input a-input--fill">hanako@example.com</div></div>
  <div class="a-btn">つぎへ</div>
  <p class="a-note">凛穏塾にお伝えいただいている<br>アドレスをご入力ください</p>
</div>"""

SCR_PASS = """
<div class="a-body" style="padding:24px 16px 20px">
  <div class="a-card" style="margin-top:6px">
    <div class="a-card__t">山田 花子 さま</div>
    <div class="a-muted">ご本人さまの確認ができました。<br>お好きなパスワードをお決めください。</div>
  </div>
  <div class="a-field"><span class="a-label">新しいパスワード（4文字以上）</span>
    <div class="a-input a-input--fill">••••••••</div></div>
  <div class="a-field"><span class="a-label">確認のためもう一度</span>
    <div class="a-input a-input--fill">••••••••</div></div>
  <div class="a-btn">設定してはじめる</div>
</div>"""


BODY = """
<div class="hero"><div class="hero__box">
  <p class="hero__lead">凛穏塾の講義動画を、いつでも何度でもご覧いただけます。</p>
  <p class="url">https://%s</p>
  <a class="go" id="go" href="index.html">&#9654;&nbsp; 動画ページをひらく
    <small>スマートフォンのままで大丈夫です</small></a>
  <p style="font-size:13px;color:var(--ink-soft);margin:10px 0 0">
    はじめての方は、<b>ご自身でパスワードをお決めいただきます</b>（1分ほどです）。</p>
</div></div>

<main class="wrap" style="padding-top:26px">

  <div class="sec" style="margin-top:8px"><div class="sec__head">
    <span class="sec__no">01</span><h2 class="sec__title">はじめの3ステップ</h2></div></div>

  <div class="stp"><div class="stp__n">1</div><div>
    <p class="stp__t">「はじめての方はこちら」を押す</p>
    <p class="stp__d">上のボタンから動画ページを開き、ログインボタンのすぐ下にある
      <b>「はじめての方はこちら（パスワードを設定する）」</b>を押してください。</p>
  </div></div>
  %s

  <div class="stp"><div class="stp__n">2</div><div>
    <p class="stp__t">ご登録のメールアドレスを入れる</p>
    <p class="stp__d">凛穏塾に<b>お伝えいただいているメールアドレス</b>をご入力ください。
      お名前が表示されたら、ご本人さまの確認ができています。</p>
  </div></div>
  %s

  <div class="stp"><div class="stp__n">3</div><div>
    <p class="stp__t">パスワードをお決めいただく</p>
    <p class="stp__d">4文字以上でしたら、覚えやすいもので大丈夫です。
      決めたパスワードで、<b>次回からログイン</b>していただけます。</p>
  </div></div>
  %s

  %s

  <div class="sec"><div class="sec__head">
    <span class="sec__no">02</span><h2 class="sec__title">ホーム画面に置いてください</h2></div>
    <p class="sec__lead">次からは1タップで開けます。<b>iPhoneで通知を受け取るには、この設定が必要です。</b></p>
  </div>
  <div class="two">
    <div class="os"><p class="os__t">iPhone（Safari）</p>
      <p>画面下の<b>共有ボタン</b>（□に↑）→ 下にたどって<b>「ホーム画面に追加」</b>→ 右上の「追加」</p></div>
    <div class="os"><p class="os__t">Android（Chrome）</p>
      <p>右上の<b>「︙」</b>→<b>「ホーム画面に追加」</b>→「追加」</p></div>
  </div>
  <div style="text-align:center;margin-top:16px">
    <img src="data:image/png;base64,%s" alt="凛穏塾" width="54" height="54"
      style="border-radius:13px;background:#fff;padding:2px;box-shadow:var(--shadow)">
    <p style="font-size:13px;color:var(--ink-soft);margin:6px 0 0">
      ホーム画面にこのマークが並びます</p>
  </div>

  <div class="sec"><div class="sec__head">
    <span class="sec__no">03</span><h2 class="sec__title">通知を受け取る</h2></div>
    <p class="sec__lead">新しい動画やお知らせを、スマホにお届けします。</p>
  </div>
  <p>ホーム画面のアイコンからアプリを開き、右上の<b>お名前 →「🔔 通知の設定」</b>→
    <b>「通知をオンにする」</b>→ 端末の確認に<b>「許可」</b>で完了です。</p>

  %s

  <div style="text-align:center;margin:30px 0 0">
    <a href="guide.html" style="font-size:14.5px">&#128214; くわしい使い方ガイドを見る</a>
  </div>

  %s
  <p class="foot" style="margin-top:14px;border-top:0">凛穏塾 動画視聴アプリ &nbsp;/&nbsp; 2026.08</p>
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
        phone(SCR_LOGIN, "① ログイン画面"),
        phone(SCR_MAIL, "② メールアドレスの確認"),
        phone(SCR_PASS, "③ パスワードを決める"),
        note("<b>「ご登録がありません」と出たとき</b>"
             "別のメールアドレスでご登録されている可能性があります。"
             "お手数ですが、運営スタッフまでご連絡ください。", "warn"),
        logo_b64(),
        note("<b>パスワードを忘れてしまったら</b>"
             "運営スタッフまでご連絡ください。すぐに再設定できます。"),
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
