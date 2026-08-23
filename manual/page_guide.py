# -*- coding: utf-8 -*-
"""受講生さま向け：使い方ガイド（ユーザー目線）"""

from _base import page, phone, win, row, note, card, steps, table, qa

APP = "apps.l-mine.com/rionjuku-app/"

# ---------- 画面イメージ（HTMLで再現） ----------

HD = ('<div class="a-hd"><div class="a-brand">凛穏塾<small>ONLINE STUDY</small></div>'
      '<div class="a-sp"></div><div class="a-chip">お知らせ</div>'
      '<div class="a-chip">山田 花子 さん ▾</div></div>')

SCR_LOGIN = """
<div class="a-body" style="padding:26px 16px 20px">
  <div style="text-align:center;margin-bottom:14px">
    <div style="font-family:var(--serif);font-size:20px;letter-spacing:.2em">凛穏塾</div>
    <div style="font-size:9px;color:#8fd0f5;letter-spacing:.25em;margin-top:3px">受講生専用 動画ページ</div>
  </div>
  <div class="a-field"><span class="a-label">メールアドレス</span>
    <div class="a-input">&nbsp;</div></div>
  <div class="a-field"><span class="a-label">パスワード</span>
    <div class="a-input">&nbsp;</div></div>
  <div class="a-btn">ログイン</div>
  <div class="a-link">はじめての方はこちら（パスワードを設定する）</div>
  <p class="a-note">2回目以降は、ご自身で決めた<br>パスワードでお入りください。</p>
</div>"""

SCR_FIRST = """
<div class="a-body" style="padding:26px 16px 20px">
  <div style="text-align:center;margin-bottom:12px">
    <div style="font-family:var(--serif);font-size:15px">はじめての方</div>
    <div style="font-size:9.5px;color:#9db6cc;margin-top:4px">ご登録のメールアドレスを<br>ご入力ください</div>
  </div>
  <div class="a-field"><span class="a-label">メールアドレス</span>
    <div class="a-input a-input--fill">hanako@example.com</div></div>
  <div class="a-btn">つぎへ</div>
  <div class="a-card" style="margin-top:14px">
    <div class="a-card__t">山田 花子 さま</div>
    <div class="a-muted">ご本人さまの確認ができました。<br>お好きなパスワードをお決めください。</div>
  </div>
  <div class="a-field"><span class="a-label">新しいパスワード（4文字以上）</span>
    <div class="a-input a-input--fill">••••••••</div></div>
  <div class="a-btn">設定してはじめる</div>
</div>"""

SCR_PICKER = HD + """
<div class="a-body">
  <div class="a-h1">コースを選んでください</div>
  <p class="a-lead">ご受講いただいているコースです。</p>
  <div class="a-card"><div class="a-card__t">凛穏塾2.5期生</div>
    <div class="a-muted">全25本</div></div>
  <div class="a-card"><div class="a-card__t">卒業生サロン</div>
    <div class="a-muted">全47本</div></div>
</div>"""

SCR_WATCH = HD + """
<div style="display:grid;grid-template-columns:104px 1fr">
  <div class="a-side">
    <div class="a-chap cc0"><span>入学式</span><span>3</span></div>
    <div class="a-chap cc1"><span>オンライン講義</span><span>12</span></div>
    <div class="a-lesson on">第1回講義</div>
    <div class="a-lesson">第2回講義<span class="a-lim a-lim--soon">あと5日</span></div>
    <div class="a-lesson">第3回講義<span class="a-lim a-lim--before">9/1〜</span></div>
    <div class="a-chap cc2"><span>ゆるカフェ</span><span>8</span></div>
  </div>
  <div class="a-body" style="padding:9px">
    <div class="a-muted" style="font-size:8.5px">凛穏塾2.5期生 &nbsp;/&nbsp; オンライン講義</div>
    <div class="a-h1" style="font-size:12.5px;margin:3px 0 6px">第1回講義</div>
    <div class="a-vid">&#9654;</div>
    <div style="margin-top:7px"><span class="a-pill">□ 視聴済みにする</span></div>
    <div class="a-card" style="margin-top:8px">
      <div class="a-card__t" style="font-size:10px">目次（タップでその場面へ）</div>
      <div class="a-marks"><span class="a-mark">0:00:01</span><span class="a-mark">0:13:44</span>
        <span class="a-mark">0:44:15</span></div>
    </div>
  </div>
</div>"""

SCR_DRAWER = HD + """
<div class="a-body" style="min-height:150px;position:relative">
  <div class="a-muted" style="font-size:9px">動画を観ているとき、左下に出ています</div>
  <div class="a-vid" style="margin-top:8px">&#9654;</div>
  <div class="a-drawer">目次</div>
</div>"""

SCR_MENU = HD + """
<div class="a-body" style="padding:8px 10px 14px">
  <div class="a-menu">
    <div>&#128214; 使い方ガイド</div>
    <div>&#128276; 通知の設定</div>
    <div>&#128187; パソコンで見る（URLをコピー）</div>
    <div class="sep"></div>
    <div>&#9999;&#65039; お名前を変更</div>
    <div>&#128273; パスワードを変更</div>
    <div class="sep"></div>
    <div>&#128196; 利用規約</div>
    <div>&#128274; プライバシーポリシー</div>
    <div class="sep"></div>
    <div>ログアウト</div>
  </div>
</div>"""

SCR_NEWS = HD + """
<div class="a-body">
  <div class="a-h1">お知らせ</div>
  <div class="a-card">
    <div class="a-muted" style="font-family:var(--num)">2026.09.01</div>
    <div class="a-card__t">9月のゆるカフェ質問会のご案内</div>
    <div class="a-muted">9月14日(日) 10:00〜、オンラインで開催します。
      ご参加の可否を下のボタンからお知らせください。</div>
    <div style="margin-top:7px;display:flex;gap:4px;flex-wrap:wrap">
      <span class="a-pill on">参加します</span><span class="a-pill">欠席します</span>
      <span class="a-pill">あとで決めます</span></div>
    <div style="margin-top:7px"><span class="a-pill">&#9825; いいね <span class="n">12</span></span></div>
  </div>
</div>"""

SCR_PUSH = HD + """
<div class="a-toast">
  <div style="font-family:var(--serif);font-size:12px">通知の設定</div>
  <p class="a-muted" style="margin:6px 0">新しい動画やお知らせが届いたとき、
    スマホにお知らせを表示します。</p>
  <div class="a-btn">&#128276; 通知をオンにする</div>
</div>
<div class="a-sys">
  <b>「凛穏塾」が通知の送信を求めています</b>
  <div style="margin-top:4px">
    <span class="a-sysbtn">許可しない</span>
    <span class="a-sysbtn" style="border-color:#2e93cf;color:#12345a;font-weight:700">許可</span>
  </div>
</div>"""

SCR_HOME = """
<div class="a-body" style="padding:16px 12px">
  <div class="a-card">
    <div class="a-card__t">iPhone（Safari）</div>
    <div class="a-muted">画面下の <b style="color:#8fd0f5">共有ボタン</b>（□に↑）
      → 下にたどって「ホーム画面に追加」→ 右上の「追加」</div>
  </div>
  <div class="a-card">
    <div class="a-card__t">Android（Chrome）</div>
    <div class="a-muted">右上の <b style="color:#8fd0f5">︙</b>
      →「ホーム画面に追加」→「追加」</div>
  </div>
  <div class="a-card" style="text-align:center">
    <div style="width:46px;height:46px;border-radius:11px;margin:0 auto 5px;
      background:linear-gradient(150deg,#0b2743,#2e93cf);display:flex;align-items:center;
      justify-content:center;font-family:var(--serif);font-size:16px">凛</div>
    <div class="a-muted">ホーム画面にこのマークが並びます</div>
  </div>
</div>"""


# ---------- 本文 ----------

S1 = (
    '<p class="sec__lead">凛穏塾の講義動画は、<b>スマートフォンのブラウザ</b>から'
    'いつでもご覧いただけます。アプリのダウンロードは要りません。</p>'
    + card("ご覧いただくアドレス",
           '<p style="margin:0"><code>https://%s</code></p>'
           '<p class="a-muted" style="color:var(--ink-soft);font-size:13.5px;margin:6px 0 0">'
           'LINEでお送りしたご案内から開いていただくのが、いちばん簡単です。</p>' % APP)
    + note("<b>ご用意いただくもの</b>凛穏塾にご登録の<b>メールアドレス</b>だけです。"
           "パスワードは、はじめてお入りいただくときに<b>ご自身でお決めいただきます</b>。")
    + '<h3>ご覧いただける動画について</h3>'
    + '<p>お手元の画面には、<b>ご受講中のコースの動画だけ</b>が並びます。'
    'ほかの期の動画は表示されません。新しいコースにお申し込みいただくと、自動的に増えます。</p>'
)

S2 = (
    '<p class="sec__lead">はじめての方は、パスワードをご自身でお決めいただきます。'
    '運営からパスワードをお送りすることはありません。</p>'
    + steps([
        "<b>ログイン画面をひらきます</b>ご案内のURLをタップしてください。",
        "<b>「はじめての方はこちら」を押します</b>ログインボタンのすぐ下にあります。",
        "<b>ご登録のメールアドレスを入れます</b>凛穏塾にお伝えいただいているアドレスです。",
        "<b>お名前が表示されたら、パスワードをお決めください</b>4文字以上でしたら、"
        "覚えやすいもので大丈夫です。",
        "<b>そのまま動画のページへ進みます</b>次からは、決めたパスワードでお入りください。",
    ])
    + row(phone(SCR_LOGIN, "ログイン画面"), phone(SCR_FIRST, "はじめての方の画面"))
    + note("<b>「ご登録がありません」と出たとき</b>"
           "別のメールアドレスでご登録されている可能性があります。"
           "お手数ですが運営スタッフまでご連絡ください。", "warn")
)

S3 = (
    '<p class="sec__lead">コースが2つ以上ある方は、最初にコースをお選びいただきます。'
    '1つだけの方は、そのまま動画の画面がひらきます。</p>'
    + row(phone(SCR_PICKER, "コースを選ぶ画面"), phone(SCR_WATCH, "動画を観る画面"))
    + '<h3>章（チャプター）ごとに並んでいます</h3>'
    + '<p>画面の左側に、<b>色のついた章</b>と、その中のレッスンが並びます。'
    '章名をタップすると、たたんだり広げたりできます。</p>'
    + '<p>スマホでは左側が隠れていますので、画面の<b>左下にある「目次」ボタン</b>を押すと'
    '出てきます。</p>'
    + phone(SCR_DRAWER, "スマホでは左下の「目次」から")
    + '<h3>期限のしるし</h3>'
    + table(["しるし", "意味"],
            [['<span style="background:#6b3a1e;color:#ffd7a8;border-radius:4px;padding:1px 6px;'
              'font-size:12px">あと5日</span>',
              "視聴期限が近づいています。お早めにご覧ください"],
             ['<span style="background:#23405c;color:#a8cbe6;border-radius:4px;padding:1px 6px;'
              'font-size:12px">9/1〜</span>',
              "まだ公開前です。その日になると観られるようになります"],
             ["しるしなし", "期限はありません。いつでもご覧いただけます"]])
)

S4 = (
    '<p class="sec__lead">長い講義でも、観たい場面からすぐに再生できます。</p>'
    + '<h3>目次から場面へ飛ぶ</h3>'
    + '<p>動画の下に <b>0:13:44</b> のような時刻が並んでいる回があります。'
    'これをタップすると、<b>その場面から再生</b>されます。</p>'
    + '<h3>観終わったら</h3>'
    + '<p>動画の下の <b>「□ 視聴済みにする」</b> を押しておくと、一覧に ✓ が付きます。'
    'どこまで観たかが分かりやすくなります（この記録はお手元の端末に残ります）。</p>'
    + '<h3>資料や音声がある回</h3>'
    + '<p>動画の下に、<b>補足の文章・画像の資料・音声</b>が付いている回があります。'
    '画像はタップで大きく表示、音声はその場で再生できます。</p>'
    + note("<b>動画が再生されないとき</b>Wi-Fiのつながる場所でお試しください。"
           "電波が弱いと、読み込みに時間がかかることがあります。", "amber")
)

S5 = (
    '<p class="sec__lead">新しい動画やお知らせを、運営からご連絡します。</p>'
    + row(phone(SCR_NEWS, "お知らせの画面"), phone(SCR_PUSH, "通知をオンにする"))
    + '<h3>お知らせを読む</h3>'
    + '<p>画面右上の <b>「お知らせ」</b> を押すと一覧が出ます。'
    '未読があるときは、赤い数字が付きます。</p>'
    + '<p>♡（いいね）を押していただくと、運営の励みになります。'
    'ご出欠などをお伺いする<b>アンケート</b>が付いていることもありますので、'
    'ボタンを1つお選びください（あとから変更できます）。</p>'
    + '<h3>通知（プッシュ）を受け取る</h3>'
    + steps([
        "<b>右上のお名前 → 「🔔 通知の設定」を開きます</b>",
        "<b>「通知をオンにする」を押します</b>",
        "<b>端末の確認が出たら「許可」を選びます</b>これで完了です。",
    ])
    + note("<b>iPhoneの方はご注意ください</b>"
           "iPhoneでは、<b>ホーム画面に追加してから開いた場合だけ</b>通知を受け取れます"
           "（Appleの仕様です）。次の項目の手順で、先にホーム画面へ追加してください。", "warn")
)

S6 = (
    '<p class="sec__lead">ホーム画面に置くと、次からは1タップで開けます。'
    'iPhoneで通知を受け取るには、この設定が必要です。</p>'
    + phone(SCR_HOME, "ホーム画面への追加")
    + note("<b>ログインし直しになりません</b>一度ログインしていただくと、"
           "しばらくはそのまま開けます（およそ1か月）。", "ok")
)

S7 = (
    '<p class="sec__lead">画面右上の<b>お名前</b>を押すと、メニューが出ます。</p>'
    + phone(SCR_MENU, "メニュー")
    + table(["メニュー", "できること"],
            [["📖 使い方ガイド", "このガイドの短い版を、いつでも見られます"],
             ["🔔 通知の設定", "通知のオン／オフを切り替えられます"],
             ["💻 パソコンで見る", "アドレスをコピーして、パソコンにメールで送れます"],
             ["✏️ お名前を変更", "表示されるお名前を変えられます"],
             ["🔑 パスワードを変更", "今のパスワードを入れてから、新しいものに変えられます"],
             ["📄 利用規約 / 🔒 プライバシーポリシー", "内容をご確認いただけます"],
             ["ログアウト", "共有のパソコンでご覧になったときは、押してお帰りください"]])
)

S8 = qa([
    ("パスワードを忘れてしまいました",
     "運営スタッフまでご連絡ください。すぐに再設定できます。"
     "（もう一度ご自身で決めていただく形にもできます）"),
    ("メールアドレスを変えたいです",
     "運営スタッフへ新しいアドレスをお知らせください。こちらで書き換えます。"),
    ("パソコンの大きな画面で観たいです",
     "メニューの「💻 パソコンで見る」でアドレスをコピーし、ご自身宛にメールしてください。"
     "パソコンでも同じログインでお入りいただけます。"),
    ("観られるはずの動画が出てきません",
     "コースの割り当てがまだの可能性があります。"
     "お手数ですが、お名前とコース名を添えて運営スタッフまでご連絡ください。"),
    ("「視聴期限が過ぎています」と出ました",
     "その動画は公開を終了しています。再公開のご希望は運営スタッフへご相談ください。"),
    ("家族と一緒に観てもいいですか",
     "ご本人さまのご視聴のためのページです。"
     "アドレスやパスワードを他の方へお渡しになるのはお控えください。"),
    ("通知が来なくなりました",
     "メニューの「🔔 通知の設定」から、もう一度オンにしてみてください。"
     "iPhoneの方は、ホーム画面のアイコンから開いてお試しください。"),
])

SECS = [
    ("はじめに", S1),
    ("はじめてお入りいただくとき", S2),
    ("動画のさがし方", S3),
    ("動画の観かた", S4),
    ("お知らせと通知", S5),
    ("ホーム画面に置く", S6),
    ("メニューでできること", S7),
    ("よくあるご質問", S8),
]


def build():
    return page(
        fname="guide.html",
        title="使い方ガイド｜凛穏塾 受講生専用 動画ページ",
        kicker="RIONJUKU ONLINE STUDY",
        cover_title="受講生さま向け<br>使い方ガイド",
        cover_sub="はじめてのログインから、動画の観かた・通知の受け取りかたまで。"
                  "スマートフォンだけで完結します。",
        secs=SECS,
        meta="2026.08 &nbsp;/&nbsp; ver.1.0",
    )
