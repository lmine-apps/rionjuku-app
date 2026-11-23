# -*- coding: utf-8 -*-
"""
ご購入ありがとうございます（凛穏オンライン講義・はじめてのご案内）

決済のあとに公式LINEへ届く「講義を見る」ボタンの行き先。
いきなりアプリを開かず、ここで流れをお伝えしてからアプリへ入っていただく。

・ステップ配信に貼るURL：
    https://apps.l-mine.com/rionjuku-app/start-online.html?uid=[[uid]]
  ?uid=… は「講義をひらく」ボタンへそのまま引き継ぐ（アプリはLINEのuidでそのまま開く）。
・サロン生向けの start.html との違い：
    サロン生 … 名簿のメールアドレスで本人確認 → パスワードを決める
    ご購入の方 … LINEからそのまま入れる → 入ったあとにメールアドレスとパスワードを登録
・登録の画面とコースの画面は、撮影ではなく再現（a-○○ の部品）で描いている。
  アプリの文言を変えたら、ここも合わせること（js/app.js の showAccountSetup）。
"""

from _base import CSS, shot_phone, phone, note, qa, logo_b64, _mark
from page_start import EXTRA as START_EXTRA, JS

APP = "apps.l-mine.com/rionjuku-app/"

EXTRA = START_EXTRA + """
.pc { text-align: left; background: var(--card-soft); border: 1px solid var(--line);
  border-radius: 13px; padding: 13px 16px; margin: 14px 0 0; }
.pc__t { font-size: 13px; font-weight: 700; color: var(--sky); letter-spacing: .04em; margin: 0 0 4px; }
.pc__d { font-size: 12.5px; line-height: 1.75; color: var(--ink-soft); margin: 0 0 8px; }
.pc .url { font-size: 13px; color: var(--ink); user-select: all; }
.rule { background: var(--card); border: 1px solid var(--line); border-radius: 13px;
  padding: 4px 18px; margin: 16px 0 0; }
.rule__r { display: grid; grid-template-columns: 6.2em 1fr; gap: 12px; padding: 13px 0;
  border-top: 1px solid var(--line); font-size: 14.5px; }
.rule__r:first-child { border-top: 0; }
.rule__k { font-family: var(--serif); color: var(--navy-dk); font-weight: 600; }
.ban { border: 2px solid var(--warn); background: var(--warn-soft); border-radius: 13px;
  padding: 15px 18px; margin: 16px 0 0; }
.ban__t { color: var(--warn); font-weight: 700; font-size: 15.5px; margin: 0 0 6px; }
.ban ul { margin: 0; padding-left: 1.2em; font-size: 14.5px; }
.ban li { margin: 3px 0; }
.ban p { margin: 8px 0 0; font-size: 13.5px; color: var(--ink-soft); }
"""

# 入ってすぐの画面（コースの一覧）の再現
PICKER = """
<div class="a-hd"><div class="a-brand">凛穏塾<small>RIONJUKU</small></div>
  <span class="a-sp"></span><span class="a-chip">お名前 &#9662;</span></div>
<div class="a-body">
  <div class="a-h1">受講コース</div>
  <div class="a-card"><div class="a-card__t">凛穏オンライン講義 LEVEL1</div>
    <div class="a-muted">&#9203; 2027年11月22日まで（残り365日）</div></div>
  <div class="a-card"><div class="a-card__t">凛穏オンライン講義 LEVEL2</div>
    <div class="a-muted">&#9203; 2027年11月22日まで（残り365日）</div></div>
  <div class="a-note">ご購入のプランに含まれるコースだけが並びます</div>
</div>
"""

# メールアドレスとパスワードのご登録（入ったあとに出てくる画面）の再現
SETUP = """
<div class="a-hd"><div class="a-brand">凛穏塾<small>RIONJUKU</small></div>
  <span class="a-sp"></span><span class="a-chip">お名前 &#9662;</span></div>
<div class="a-modal">
  <div class="a-modal__t">メールアドレスとパスワードのご登録</div>
  <p class="a-lead">ご登録いただくと、ホーム画面のアイコンからすぐ開けるようになります。</p>
  <div class="a-field"><span class="a-label">メールアドレス</span>
    <div class="a-input a-input--fill">hanako@example.com</div></div>
  <div class="a-field"><span class="a-label">パスワード（4文字以上）</span>
    <div class="a-input a-input--fill">&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;</div></div>
  <div class="a-field"><span class="a-label">もう一度入力してください</span>
    <div class="a-input a-input--fill">&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;</div></div>
  <div class="a-row2"><div class="a-btn a-btn--ghost">あとで</div><div class="a-btn">登録する</div></div>
</div>
"""

BODY = """
<div class="hero"><div class="hero__box">
  <p class="hero__lead"><b>ご購入ありがとうございます。</b><br>
    下のボタンから、すぐに講義をご覧いただけます。</p>
  <p class="hero__time">LINEから開けば、パスワードの入力はいりません</p>
  <a class="go" id="go" href="index.html">&#9654;&nbsp; 講義をひらく
    <small>スマートフォンのままで大丈夫です</small></a>
  <div class="pc">
    <p class="pc__t">パソコンでご覧になる方へ</p>
    <p class="pc__d">パソコンで下のURLをひらき、ご登録のメールアドレスとパスワードでログインしてください。<br>ご登録がまだの方は、先にスマートフォンで上のボタンからお入りいただき、ご登録をお済ませください（下の手順②）。</p>
    <p class="url">https://%s</p>
  </div>
</div></div>

<main class="wrap" style="padding-top:26px">

  <div class="sec" style="margin-top:8px"><div class="sec__head">
    <span class="sec__no">01</span><h2 class="sec__title">はじめの3ステップ</h2></div>
    <p class="sec__lead">1つ目だけでご覧いただけます。2つ目と3つ目は、
      次から楽に開くための準備です。</p>
  </div>

  <div class="stp">
    <div class="stp__h"><div class="stp__n">1</div>
      <p class="stp__t">「講義をひらく」を押す</p></div>
    <p class="stp__d">上のボタンを押すと、<b>そのまま講義のページがひらきます。</b>
      ご購入いただいたコースが並びますので、観たいコースを押してください。<br>
      コースの下に、<b>いつまでご覧いただけるか</b>が表示されます。</p>
  </div>
  %s

  <div class="stp">
    <div class="stp__h"><div class="stp__n">2</div>
      <p class="stp__t">メールアドレスとパスワードを登録する</p></div>
    <p class="stp__d">ひらいて少しすると、ご登録の画面が出てきます。
      メールアドレスとお好きなパスワードを入れて、<span class="here">登録する</span>を押してください。<br>
      ご登録いただくと、<b>LINEをたどらなくても、パソコンや別のスマートフォンから</b>
      ご覧いただけるようになります。</p>
  </div>
  %s
  %s

  <div class="stp">
    <div class="stp__h"><div class="stp__n">3</div>
      <p class="stp__t">ホーム画面にアイコンを置く</p></div>
    <p class="stp__d">ご登録のあと、<span class="here">置き方を見る</span>を押すと手順が出てきます。
      置いておくと、次からは<b>アイコンひとつ</b>で開けます。<br>
      くわしい手順は、このページの <a href="#home">03 ホーム画面に置く</a> にもあります。</p>
  </div>

  <div class="done-box">
    <p class="done-box__t">&#127881; 準備はこれで完了です</p>
    <p class="done-box__d">次回からは、ホーム画面のアイコンか、公式LINEの「講義を見る」ボタンからお入りください。</p>
  </div>

  <div class="sec"><div class="sec__head">
    <span class="sec__no">02</span><h2 class="sec__title">動画の観かた</h2></div>
    <p class="sec__lead">コースを選ぶと、講義の一覧が出てきます。観たい回を押してください。</p>
  </div>
  %s
  <ul class="pts">
    <li><b>前回の続きから</b> … 途中で止めても、次にひらくと「○分から再開」を選べます</li>
    <li><b>10秒もどす／10秒すすむ</b> … 聞きのがしたところへ、すぐ戻れます</li>
    <li><b>再生速度</b> … 0.75倍でゆっくり、1.25倍・1.5倍で早く。一度選ぶと次の動画にも引き継がれます</li>
    <li><b>視聴済みにする</b> … 押すとチェックが付きます。
      9割ほどご覧いただくと<b>自動でチェック</b>が付きます</li>
    <li><b>ボイス講義</b> … 音声の回も、同じ一覧から再生できます</li>
  </ul>

  <div class="sec" id="home"><div class="sec__head">
    <span class="sec__no">03</span><h2 class="sec__title">ホーム画面に置く</h2></div>
    <p class="sec__lead">次からは1タップで開けます。先に、ステップ2のご登録をお済ませください。</p>
  </div>
  %s
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
  %s

  <div class="sec"><div class="sec__head">
    <span class="sec__no">04</span><h2 class="sec__title">ご利用にあたって</h2></div>
    <p class="sec__lead">はじめに、こちらだけご確認ください。</p>
  </div>
  <div class="rule">
    <div class="rule__r"><div class="rule__k">視聴期間</div>
      <div>ご購入日から、プランごとの期間（1年間、お試しは90日間）ご覧いただけます。
        <b>終了日はコースの下に表示されます。</b>期間を過ぎると再生できなくなります。</div></div>
    <div class="rule__r"><div class="rule__k">端末</div>
      <div>ご利用いただける端末は<b>3つまで</b>です。4つ目でログインすると、
        いちばん長く使っていない端末が自動でログアウトします。</div></div>
    <div class="rule__r"><div class="rule__k">お支払い</div>
      <div>一回限りのお支払いです。自動で更新されることはありません。</div></div>
  </div>
  <div class="ban">
    <p class="ban__t">ご視聴は、ご購入者ご本人のみです</p>
    <ul>
      <li>SNSなどへの転載・公開</li>
      <li>転売、第三者への譲渡・貸与</li>
      <li>メールアドレスとパスワードの共有</li>
      <li>録画・録音・スクリーンショット</li>
    </ul>
    <p>これらは固くお断りしております。</p>
  </div>

  <div class="sec"><div class="sec__head">
    <span class="sec__no">05</span><h2 class="sec__title">こまったときは</h2></div></div>
  %s

  <div style="text-align:center;margin:32px 0 0">
    <a class="go" id="go2" href="index.html">&#9654;&nbsp; 講義をひらく</a>
  </div>

  %s
  <p class="foot" style="margin-top:14px;border-top:0">凛穏オンライン講義 &nbsp;/&nbsp; 2026.11</p>
</main>

<script>
（PLACEHOLDER）
</script>
"""

# 下のボタンにも uid を引き継ぐ
JS2 = JS.replace("if (a) a.href = 'index.html?uid=' + uid;",
                 "if (a) a.href = 'index.html?uid=' + uid;\n"
                 "  var b = document.getElementById('go2');\n"
                 "  if (b) b.href = 'index.html?uid=' + uid;")
assert JS2 != JS


def build():
    body = BODY % (
        APP,
        phone(PICKER, "① ご購入のコースが並びます"),
        phone(SETUP, "② ご登録の画面"),
        note("<b>「あとで」を押しても、ご覧いただけます</b>"
             "ご登録の画面は、次にひらいたときにもう一度出てきます。"
             "右上のお名前のボタン →「パスワードを変更」からも、いつでもご登録いただけます。"),
        shot_phone("assets/shots/watch.jpg", "動画の画面"),
        note("<b>LINEの中で開いているときは、先にブラウザで開いてください</b>"
             "LINEの画面からは、ホーム画面に追加できません。"
             "画面の右上または右下のメニューから<b>「ブラウザで開く」</b>"
             "（機種によっては「Safariで開く」「他のアプリで開く」）を選んでから、下の手順にお進みください。",
             "amber"),
        logo_b64(),
        note("<b>アイコンから開いた最初の一度だけ、ログインが必要です</b>"
             "ステップ2で登録したメールアドレスとパスワードを入れてください。"
             "LINEで開いた画面とホーム画面のアイコンは、入れ物が別のためです。"),
        qa([
            ("「講義をひらく」を押したら、ログインの画面が出ました",
             "LINEの外から開いたときに出ます。公式LINEに届いた「講義を見る」ボタンから、"
             "もう一度お開きください。メールアドレスとパスワードをご登録済みの方は、"
             "その画面でログインしていただいても大丈夫です。"),
            ("パスワードを忘れてしまいました",
             "公式LINEの「講義を見る」ボタンからは、パスワードなしでお入りいただけます。"
             "再設定をご希望の場合は、公式LINEのトークでご連絡ください。"),
            ("パソコンでも観られますか？",
             "ご覧いただけます。メールアドレスとパスワードをご登録のうえ、"
             "アプリ右上のメニューから「パソコンで見る（URLをコピー）」をお使いください。"),
            ("「ほかの端末でログインされたため…」と出ました",
             "ご利用の端末が3つを超えたため、その端末がログアウトしました。"
             "もう一度ログインすると、その端末でご覧いただけます。"),
            ("動画が再生されません",
             "電波の良いところで、もう一度ひらいてみてください。"
             "それでも出てこない場合は、一度閉じてから開き直してください。"),
            ("視聴期間が終わったあとも観たいです",
             "公式LINEから、あらためてお求めいただけます。"),
        ]),
        _mark(),
    )
    body = body.replace("（PLACEHOLDER）", JS2)
    return """<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,nofollow">
<title>ご購入ありがとうございます｜凛穏オンライン講義</title>
<style>%s%s</style>
</head>
<body>
<header class="cover" style="padding:44px 22px 52px">
  <div class="cover__kicker">RIONJUKU ONLINE LECTURE</div>
  <h1 class="cover__title" style="font-size:26px">凛穏オンライン講義<br>ご視聴のご案内</h1>
  <p class="cover__sub">はじめての方へ。講義のひらき方と、ご利用のご案内です。</p>
</header>
%s
</body>
</html>
""" % (CSS, EXTRA, body)
