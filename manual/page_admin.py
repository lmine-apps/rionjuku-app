# -*- coding: utf-8 -*-
"""運営さま向け：運営ページの手順書"""

from _base import page, phone, win, row, note, card, steps, table, qa, flow

ADMIN = "apps.l-mine.com/rionjuku-app/admin.html"

AHD = ('<div class="a-hd"><div class="a-brand">凛穏塾<small>ADMINISTRATION</small></div>'
       '<div class="a-sp"></div><div class="a-chip">運営スタッフ さん（運営）</div>'
       '<div class="a-chip">受講生ページ</div><div class="a-chip">再読込</div>'
       '<div class="a-chip">ログアウト</div></div>')

TABS = ('<div class="a-tabs"><div class="a-tab on">&#127916; 動画</div>'
        '<div class="a-tab">&#128227; お知らせ</div><div class="a-tab">&#128101; 閲覧者</div>'
        '<div class="a-tab">&#128218; コース設定</div></div>')


SCR_ADMIN_LOGIN = """
<div class="a-body" style="padding:26px 16px 22px">
  <div style="text-align:center;margin-bottom:14px">
    <div style="font-family:var(--serif);font-size:18px;letter-spacing:.2em">凛穏塾 運営</div>
    <div style="font-size:8.5px;color:#8fd0f5;letter-spacing:.28em;margin-top:3px">ADMINISTRATION</div>
  </div>
  <div class="a-field"><span class="a-label">メールアドレス</span><div class="a-input">&nbsp;</div></div>
  <div class="a-field"><span class="a-label">パスワード</span><div class="a-input">&nbsp;</div></div>
  <div class="a-btn">ログイン</div>
  <p class="a-note">受講生ページと同じログインです。<br>
    タグに <b style="color:#8fd0f5">admin</b> がある方のみ操作できます。</p>
</div>"""

SCR_VIDEO = AHD + TABS + """
<div class="a-toolbar">
  <span class="a-pill">すべてのコース ▾</span>
  <span class="a-pill">タイトルで絞り込み</span>
  <span class="a-pill on">＋ 動画を追加</span>
  <span class="a-muted" style="font-size:8.5px">全152本中 152本を表示</span>
</div>
<div style="padding:0 10px 10px">
<table class="a-tbl">
<tr><th>行</th><th>コース</th><th>チャプター</th><th>タイトル</th><th>視聴期限</th><th>状態</th><th></th></tr>
<tr><td>2</td><td>凛穏塾2.5期生</td><td>入学式</td><td>入学式</td><td>無期限</td>
  <td><span class="a-badge a-badge--ok">公開中</span></td><td>編集 削除</td></tr>
<tr><td>3</td><td>凛穏塾2.5期生</td><td>オンライン講義</td><td>第1回講義</td><td>無期限</td>
  <td><span class="a-badge a-badge--ok">公開中</span></td><td>編集 削除</td></tr>
<tr><td>4</td><td>凛穏塾2.5期生</td><td>オンライン講義</td><td>第2回講義</td><td>2026-09-30</td>
  <td><span class="a-badge a-badge--ok">公開中</span></td><td>編集 削除</td></tr>
</table></div>"""

SCR_VIDEO_MODAL = """
<div class="a-modal">
  <div class="a-modal__t">動画を追加</div>
  <div class="a-row2">
    <div class="a-field"><span class="a-label">コース</span>
      <div class="a-input a-input--fill">凛穏塾2.5期生 ▾</div></div>
    <div class="a-field"><span class="a-label">チャプター（章）</span>
      <div class="a-input a-input--fill">オンライン講義 ▾</div></div>
  </div>
  <div class="a-field"><span class="a-label">レッスンタイトル</span>
    <div class="a-input a-input--fill">第6回講義</div></div>
  <div class="a-field"><span class="a-label">動画URL（Vimeo）</span>
    <div class="a-input a-input--fill">https://vimeo.com/1234567890</div></div>
  <div class="a-row2">
    <div class="a-field"><span class="a-label">視聴開始（任意）</span>
      <div class="a-input">年 / 月 / 日</div></div>
    <div class="a-field"><span class="a-label">視聴期限（任意）</span>
      <div class="a-input">年 / 月 / 日</div></div>
  </div>
  <div class="a-field"><span class="a-label">補足＆タイム</span>
    <div class="a-input a-input--fill" style="line-height:1.7">0:00:01　ごあいさつ<br>0:12:30　本日のテーマ</div></div>
  <div class="a-btn">保存する</div>
</div>"""

SCR_BLOCKS = """
<div class="a-modal">
  <div class="a-modal__t">動画の下に置く資料（ブロック）</div>
  <div class="a-block"><div class="a-block__h">文章</div>
    今回のレジュメです。印刷してお使いください。</div>
  <div class="a-block"><div class="a-block__h">画像</div>
    <span class="a-muted">https://drive.google.com/file/d/･･･</span></div>
  <div class="a-block"><div class="a-block__h">音声</div>
    <span class="a-muted">https://drive.google.com/file/d/･･･</span></div>
  <div class="a-add"><span>＋ 文章</span><span>＋ 画像</span><span>＋ 音声</span></div>
</div>"""

SCR_NEWS_MODAL = """
<div class="a-modal">
  <div class="a-modal__t">お知らせを作成</div>
  <div class="a-field"><span class="a-label">見出し</span>
    <div class="a-input a-input--fill">9月のゆるカフェ質問会のご案内</div></div>
  <div class="a-field"><span class="a-label">本文</span>
    <div class="a-input a-input--fill" style="line-height:1.7">9月14日(日) 10:00〜、<br>オンラインで開催します。</div></div>
  <div class="a-field"><span class="a-label">誰に見せるか（宛先）</span>
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px">
      <span class="a-pill">&#128101; 全員</span><span class="a-pill">&#128274; 運営だけ</span>
      <span class="a-pill on">2.5期生<span class="n">52</span></span>
      <span class="a-pill">2期生<span class="n">37</span></span>
      <span class="a-pill">サロン<span class="n">89</span></span></div></div>
  <div class="a-field"><span class="a-label">アンケート（1行に1つ）</span>
    <div class="a-input a-input--fill" style="line-height:1.7">参加します<br>欠席します</div></div>
  <div class="a-btn">保存する</div>
</div>"""

SCR_PUSH_MODAL = """
<div class="a-modal">
  <div class="a-modal__t">通知を送る：9月のゆるカフェ質問会のご案内</div>
  <p class="a-muted" style="margin:0 0 8px">宛先は、お知らせの宛先と同じです。
    通知をオンにしている方の端末にだけ届きます。</p>
  <div class="a-field"><span class="a-label">通知の文面（本文の先頭が入ります）</span>
    <div class="a-input a-input--fill">9月14日(日) 10:00〜、オンラインで開催します。</div></div>
  <div class="a-row2" style="margin-top:8px">
    <div class="a-btn a-btn--ghost" style="margin:0">&#129514; 自分にテスト</div>
    <div class="a-btn" style="margin:0">&#128226; 全員に送信</div>
  </div>
</div>"""

SCR_STUDENT = AHD + TABS.replace('a-tab on">&#127916; 動画', 'a-tab">&#127916; 動画').replace(
    'a-tab">&#128101; 閲覧者', 'a-tab on">&#128101; 閲覧者') + """
<div class="a-toolbar">
  <span class="a-pill">名前・メールで絞り込み</span>
  <span class="a-pill on">＋ 閲覧者を追加</span>
  <span class="a-muted" style="font-size:8.5px">全150名中 150名を表示（&#128276; 通知オン 34名）</span>
</div>
<div class="a-toolbar" style="padding-top:0">
  <span class="a-pill on">すべて<span class="n">150</span></span>
  <span class="a-pill">2.5期生<span class="n">52</span></span>
  <span class="a-pill">2期生<span class="n">37</span></span>
  <span class="a-pill">サロン<span class="n">89</span></span>
  <span class="a-pill">admin<span class="n">5</span></span>
  <span class="a-pill">&#128276; 通知オン<span class="n">34</span></span>
  <span class="a-pill">&#128241; LINE連携<span class="n">61</span></span>
  <span class="a-pill">&#9940; 停止<span class="n">0</span></span>
</div>
<div style="padding:0 10px 10px">
<table class="a-tbl">
<tr><th>行</th><th>名前</th><th>メールアドレス</th><th>タグ</th><th>状態</th><th>通知</th><th></th></tr>
<tr><td>2</td><td>山田 花子</td><td>hanako@example.com</td>
  <td><span class="a-tag">2.5期生</span><span class="a-tag">凛コース</span></td>
  <td><span class="a-badge a-badge--ok">有効</span></td><td>&#128276; 1台</td><td>編集 削除</td></tr>
<tr><td>3</td><td>鈴木 太郎</td><td>taro@example.com</td>
  <td><span class="a-tag">サロン</span></td>
  <td><span class="a-badge a-badge--ok">有効</span></td><td>—</td><td>編集 削除</td></tr>
</table></div>"""

SCR_COURSE = AHD + TABS.replace('a-tab on">&#127916; 動画', 'a-tab">&#127916; 動画').replace(
    'a-tab">&#128218; コース設定', 'a-tab on">&#128218; コース設定') + """
<div class="a-toolbar"><span class="a-muted" style="font-size:8.5px">
  「タグ」が閲覧者のタグと一致した人だけ、そのコースを視聴できます。並び順は小さい数が上。</span></div>
<div style="padding:0 10px 10px">
<table class="a-tbl">
<tr><th>コース名</th><th>タグ</th><th>並び順</th><th>公開</th><th>説明</th></tr>
<tr><td>凛穏塾2.5期生</td><td><span class="a-tag">2.5期生</span></td><td>10</td>
  <td><span class="a-badge a-badge--ok">公開</span></td><td>2.5期生の講義アーカイブです。</td></tr>
<tr><td>卒業生サロン</td><td><span class="a-tag">サロン</span></td><td>30</td>
  <td><span class="a-badge a-badge--ok">公開</span></td><td></td></tr>
</table></div>"""


# ---------- 本文 ----------

S1 = (
    '<p class="sec__lead">運営ページは、受講生ページと<b>同じメールアドレス・同じパスワード</b>で'
    'お入りいただけます。タグに <code>admin</code> が入っている方だけが操作できます。</p>'
    + card("運営ページのアドレス",
           '<p style="margin:0"><code>https://%s</code></p>'
           '<p style="font-size:13.5px;color:var(--ink-soft);margin:6px 0 0">'
           'ブックマークしておくと便利です。受講生ページの右上メニューにある'
           '「⚙ 運営ページ」からも入れます。</p>' % ADMIN)
    + win(SCR_ADMIN_LOGIN, ADMIN, "運営ページのログイン")
    + note("<b>このアドレスは受講生には配らないでください</b>"
           "ログインは掛かっていますが、混乱のもとになります。", "warn")
)

S2 = (
    '<p class="sec__lead">画面は4つのタブに分かれています。'
    'それぞれが、スプレッドシートの1枚のシートと繋がっています。</p>'
    + win(SCR_VIDEO, ADMIN, "運営ページ（動画タブ）")
    + table(["タブ", "できること", "つながっているシート"],
            [["🎬 動画", "動画の追加・編集・削除、公開日と期限の設定", "動画一覧"],
             ["📣 お知らせ", "お知らせの作成、宛先の指定、通知の送信、回答の集計", "お知らせ／お知らせ回答"],
             ["👥 閲覧者", "受講生の追加・編集、タグ（＝観られるコース）の割り当て", "閲覧者一覧"],
             ["📚 コース設定", "コースとタグの紐付け、並び順、公開・非公開", "コース設定"]])
    + note("<b>ここで直した内容は、そのままスプレッドシートに書き込まれます</b>"
           "逆に、スプレッドシートを直接直しても、アプリにすぐ反映されます。"
           "どちらから作業していただいても大丈夫です。", "ok")
)

S3 = (
    '<p class="sec__lead">いちばんよく使う操作です。所要1分ほどです。</p>'
    + steps([
        "<b>「🎬 動画」タブ →「＋ 動画を追加」を押します</b>",
        "<b>コースを選びます</b>コースを選ぶと、<b>そのコースにある章だけ</b>が"
        "チャプターの候補に出ます。新しい章を作るときは「＋ 新しいチャプター」を選んでください。",
        "<b>レッスンタイトルと、VimeoのURLを入れます</b>"
        "URLは <code>https://vimeo.com/1234567890</code> の形でそのまま貼り付けてください。",
        "<b>必要なら、視聴開始日・視聴期限を入れます</b>空欄なら「いつでも観られる」です。",
        "<b>「補足＆タイム」に目次を入れます（任意）</b>"
        "<code>0:12:30　本日のテーマ</code> のように書くと、受講生の画面で"
        "<b>タップでその場面に飛べる目次</b>になります。",
        "<b>保存を押します</b>スプレッドシートの、そのコースの最後の行の下に入ります。",
    ])
    + row(win(SCR_VIDEO_MODAL, ADMIN, "動画を追加する画面"))
    + '<h3>動画の下に資料や音声を置く</h3>'
    + '<p>編集画面の下のほうに、<b>ブロック</b>という欄があります。'
    '「＋ 文章」「＋ 画像」「＋ 音声」を押すと、上から順に積んでいけます。'
    '順番の入れ替えもできます。</p>'
    + win(SCR_BLOCKS, ADMIN, "ブロックで資料を積む")
    + note("<b>画像と音声はGoogleドライブのリンクでOKです</b>"
           "ドライブで「リンクを知っている全員」に共有してから、そのURLを貼ってください。"
           "表示用の形へ自動で変換されます。", "amber")
    + '<h3>「更新!!」の目印と、ひとことを出す</h3>'
    + '<p>動画を差し替えたときや、期限をはっきり伝えたいときに使います。'
    'どちらも<b>書いた文字がそのまま出ます</b>。消したいときは空にしてください。</p>'
    + table(["欄", "書く例", "受講生の画面での出かた"],
            [['目印<br><span class="hint">シートのF列</span>', "<code>更新!!</code>　<code>NEW</code>　<code>再アップ</code>",
              "レッスン名の右に<b>赤いバッジ</b>。そのコースの一覧にも同じ印が付くので、"
              "アプリを開いた瞬間に気づいてもらえます"],
             ['ひとこと<br><span class="hint">シートのG列</span>', "<code>視聴は9月30日まで！</code>",
              "動画タイトルのすぐ下に<b>赤い帯で1行</b>"]])
    + note("<b>目印は自動では消えません</b>"
           "「更新!!」を出したままにすると、いつまでも新しく見えてしまいます。"
           "落ち着いたころに空欄へ戻してください（スプレッドシートの<b>F列</b>をまとめて消してもOK）。", "amber")
    + note("<b>視聴期限のバーは、これとは別に自動で出ます</b>"
           "「視聴開始・視聴期限」を入れておけば、"
           "受講生の画面には「⏳ この動画は○月○日まで視聴できます（残り○日）」が自動で出ます。"
           "<b>ひとこと</b>は、それとは別に強調したいときにお使いください。")
    + '<h3>あとから直す・消す</h3>'
    + '<p>一覧の右にある<b>「編集」</b>で同じ画面が開きます。'
    '<b>「削除」</b>はスプレッドシートの行ごと消えますので、ご注意ください。'
    '一時的に隠したいだけのときは、編集画面の<b>「公開状態」を非公開</b>にしてください。</p>'
)

S4 = (
    '<p class="sec__lead">お知らせは、宛先を選んで出せます。'
    '通知（プッシュ）は、お知らせを保存したあとに送ります。</p>'
    + steps([
        "<b>「📣 お知らせ」タブ →「＋ お知らせを作成」</b>",
        "<b>見出しと本文を書きます</b>改行はそのまま反映されます。",
        "<b>宛先をボタンで選びます</b>「👥 全員」か、期・コースのタグを選んでください"
        "（複数選べます）。「🔒 運営だけ」は下書き代わりに使えます。",
        "<b>ご出欠などを聞きたいときは、アンケートを入れます</b>"
        "1行に1つ書くと、その数だけボタンが並びます。",
        "<b>保存します</b>これで受講生の画面に出ます。",
        "<b>通知を送るなら、一覧の「🔔 通知」を押します</b>"
        "まず<b>「🧪 自分にテスト」</b>で自分の端末に届くか確かめてから、"
        "<b>「📢 全員に送信」</b>を押してください。",
    ])
    + row(win(SCR_NEWS_MODAL, ADMIN, "お知らせを作成"),
          win(SCR_PUSH_MODAL, ADMIN, "通知を送る"))
    + note("<b>「自分にテスト」で『端末がありません』と出るとき</b>"
           "今ログインしている<b>ご自身のアカウント</b>で、まだ通知をオンにしていないためです。"
           "受講生ページの右上メニュー →「🔔 通知の設定」からオンにしてください。"
           "（別のアカウントで運営ページに入っていると、この行き違いが起きます）", "warn")
    + '<h3>アンケートの回答を見る</h3>'
    + '<p>お知らせ一覧の<b>「📊 回答」</b>から、選択肢ごとの人数と、'
    'どなたが何を選んだかの一覧を見られます。スプレッドシートの'
    '「お知らせ回答」シートにも同じものが残ります。</p>'
)

S5 = (
    '<p class="sec__lead">受講生の追加、コースの割り当て、パスワードの再設定はここです。</p>'
    + win(SCR_STUDENT, ADMIN, "閲覧者タブ")
    + '<h3>絞り込み</h3>'
    + '<p>上の入力欄で<b>名前・メール</b>から探せます。'
    'その下のボタンで<b>タグ・通知オン・LINE連携・停止</b>で絞り込めます。'
    'ボタンの数字は、その条件に当てはまる人数です。</p>'
    + '<h3>新しい受講生を追加する</h3>'
    + steps([
        "<b>「＋ 閲覧者を追加」を押します</b>",
        "<b>お名前とメールアドレスを入れます</b>メールアドレスがログインIDになります。",
        "<b>タグを入れます</b>カンマ区切りです。例：<code>2.5期生,凛コース</code>"
        "<br>ここに入れたタグと一致するコースだけが、その方の画面に出ます。",
        "<b>パスワードは空のままで大丈夫です</b>"
        "ご本人に「はじめての方はこちら」から決めていただく形になります。",
    ])
    + '<h3>パスワードを忘れたと連絡が来たら</h3>'
    + table(["やり方", "手順", "向いている場面"],
            [["こちらで決める", "編集画面の「パスワード」に新しいものを入れて保存し、ご本人へお伝えする",
              "すぐ入れるようにしてさしあげたいとき"],
             ["ご本人に決め直してもらう", "スプレッドシート「閲覧者一覧」のI列（初回設定）を空にする。"
              "その方は再び「はじめての方はこちら」を使えるようになります",
              "パスワードを人に伝えたくないとき（おすすめ）"]])
    + note("<b>受講を止められた方</b>「状態」を<b>停止</b>にすると、ログインできなくなります。"
           "行を消さずに残しておけるので、再開のときもそのまま戻せます。")
)

S6 = (
    '<p class="sec__lead">「どのタグの人が、どのコースを観られるか」を決めているのが'
    'コース設定です。</p>'
    + win(SCR_COURSE, ADMIN, "コース設定タブ")
    + flow([("受講生", "", "閲覧者一覧のタグ　例：<b>2.5期生</b>"),
            ("コース設定", "gas", "コース「凛穏塾2.5期生」のタグ　＝ <b>2.5期生</b>"),
            ("動画", "sys", "動画一覧でコース名が「凛穏塾2.5期生」の動画が、すべて観られる")])
    + note("<b>動画一覧のF列（タグ）は、ふだん空欄で大丈夫です</b>"
           "空欄なら「コース設定のタグ」がそのまま使われます。"
           "1本だけ特別に見せたい／見せたくないときにだけ、その動画に直接タグを書いてください。", "amber")
    + '<h3>新しい期がはじまったときの3手</h3>'
    + steps([
        "<b>コース設定に1行足します</b>コース名・タグ・並び順・公開。",
        "<b>動画一覧に動画を足します</b>（運営ページの「＋ 動画を追加」でOK）",
        "<b>受講生のタグに、新しい期のタグを足します</b>",
    ])
    + note("<b>プログラムの作り直し（再デプロイ）は要りません</b>"
           "動画・お知らせ・受講生・コースは、すべて画面かシートから足せます。", "ok")
)

S7 = (
    '<p class="sec__lead">運営ページを使わず、スプレッドシートを直接直しても構いません。'
    'そのときのお約束です。</p>'
    + table(["シート", "気をつけること"],
            [["動画一覧", "<b>同じコースの行は、続けて並べてください。</b>"
                          "コース名（A列）と章名（B列）は、空欄にすると<b>上の行と同じ</b>とみなされます"],
             ["閲覧者一覧", "メールアドレスは<b>小文字・スペースなし</b>で。タグはカンマ区切り"],
             ["コース設定", "並び順（C列）は小さい数が上。空欄ならシートの行順になります"],
             ["プッシュ", "<b>さわらないでください。</b>通知の宛先が自動で記録されています"],
             ["ログイン履歴", "記録用です。増えすぎたら古い行を消しても大丈夫です"]])
    + note("<b>列の順番は変えないでください</b>"
           "プログラムが「何列目に何がある」で読んでいます。"
           "列の追加・入れ替え・削除をされると、動かなくなります。"
           "（右端に新しい列を足すのは大丈夫です）", "warn")
    + note("<b>共有は「制限付き」のままにしてください</b>"
           "このシートにはパスワードが入っています。"
           "「リンクを知っている全員」に変えると、外から読めてしまいます。", "warn")
)

S8 = qa([
    ("受講生から「ログインできない」と言われました",
     "①メールアドレスの打ち間違い（全角・スペース）、②まだ閲覧者一覧に登録がない、"
     "③状態が「停止」になっている、の順でご確認ください。"
     "閲覧者タブの絞り込みでお名前を検索すると早いです。"),
    ("「観られるはずの動画が出ない」と言われました",
     "その方のタグと、コース設定のタグが一致しているかをご確認ください。"
     "一致していれば、その動画の視聴開始日が未来になっていないか、"
     "非公開になっていないかもご確認ください。"),
    ("画面がずっと「読み込んでいます」のまま",
     "通信が不安定なときに起こります。「再読込」ボタンを押してみてください。"
     "何度も続く場合は、開発担当（あかり）までご連絡ください。"),
    ("「サーバー側でエラーが発生しました」と出ました",
     "スプレッドシートの列がずれている可能性があります。"
     "直前に列を足したり消したりされていないかご確認のうえ、ご連絡ください。"),
    ("動画を間違えて削除してしまいました",
     "スプレッドシートで <b>Ctrl+Z</b>（元に戻す）が効きます。"
     "時間が経っていたら、シートの「ファイル → 変更履歴」から戻せます。"),
    ("受講生に配るURLはどれですか",
     "LINEからご案内するときは末尾に <code>?uid=[[uid]]</code> を付けたもの、"
     "メールなど他の方法のときは付けないもの、と使い分けてください。"
     "詳しくはURLリストをご覧ください。"),
])

SECS = [
    ("運営ページに入る", S1),
    ("画面の見取り図", S2),
    ("動画を追加する", S3),
    ("お知らせを出す・通知を送る", S4),
    ("受講生を管理する", S5),
    ("コースとタグのしくみ", S6),
    ("スプレッドシートを直接さわるとき", S7),
    ("こまったときは", S8),
]


def build():
    return page(
        fname="manual-admin.html",
        title="運営の手順書｜凛穏塾 動画視聴アプリ",
        kicker="RIONJUKU ADMINISTRATION",
        cover_title="運営の手順書",
        cover_sub="動画の追加、お知らせと通知、受講生の管理まで。"
                  "運営ページだけで完結する手順をまとめています。",
        secs=SECS,
        meta="2026.08 &nbsp;/&nbsp; ver.1.0 &nbsp;/&nbsp; 関係者用",
    )
