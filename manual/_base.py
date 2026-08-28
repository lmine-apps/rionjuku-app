# -*- coding: utf-8 -*-
"""
凛穏塾 動画視聴アプリ ── マニュアル共通パーツ

・3ページ（受講生ガイド／運営の手順書／画面と仕組み）で使う CSS とヘルパー。
・出力する HTML は 1枚で完結（外部ファイルを読まない）＝メール添付でもそのまま開ける。
"""

CSS = r"""
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }

:root {
  --ground:    #eaf4fb;
  --card:      #ffffff;
  --card-soft: #f4fafd;
  --ink:       #172b3d;
  --ink-soft:  #5f7387;
  --ink-faint: #93a6b6;
  --line:      #d5e4ef;
  --navy:      #12345a;
  --navy-dk:   #0b203d;
  --sky:       #2e93cf;
  --sky-soft:  #e5f5fd;
  --green:     #1f7a5c;
  --green-soft:#e6f3ee;
  --warn:      #c0503f;
  --warn-soft: #fdf0ed;
  --amber:     #9a6b12;
  --amber-soft:#fbf3e0;
  --shadow:    0 10px 30px rgba(7, 23, 44, .13);
  --serif: "Yu Mincho", YuMincho, "Hiragino Mincho ProN", "Noto Serif JP", "MS PMincho", serif;
  --sans: "Hiragino Kaku Gothic ProN", "Yu Gothic UI", "Yu Gothic", YuGothic, Meiryo, system-ui, sans-serif;
  --num: Georgia, "Times New Roman", serif;
  --mono: Consolas, "Cascadia Mono", ui-monospace, monospace;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --ground:#07172a; --card:#0e2338; --card-soft:#142a41;
    --ink:#e6eef5; --ink-soft:#9db1c3; --ink-faint:#6b8299; --line:#22405c;
    --navy:#9fc9e8; --navy-dk:#cfe6f6; --sky:#62b7e7; --sky-soft:#10293d;
    --green:#6cc39f; --green-soft:#102b23; --warn:#e0917f; --warn-soft:#33201c;
    --amber:#d1a95f; --amber-soft:#2b2312;
    --shadow:0 10px 30px rgba(0,0,0,.5);
  }
}
:root[data-theme="dark"] {
  --ground:#07172a; --card:#0e2338; --card-soft:#142a41;
  --ink:#e6eef5; --ink-soft:#9db1c3; --ink-faint:#6b8299; --line:#22405c;
  --navy:#9fc9e8; --navy-dk:#cfe6f6; --sky:#62b7e7; --sky-soft:#10293d;
  --green:#6cc39f; --green-soft:#102b23; --warn:#e0917f; --warn-soft:#33201c;
  --amber:#d1a95f; --amber-soft:#2b2312;
  --shadow:0 10px 30px rgba(0,0,0,.5);
}

body { background: var(--ground); color: var(--ink); font-family: var(--sans);
  line-height: 1.9; font-size: 15.5px; -webkit-text-size-adjust: 100%; }

/* ---------- 表紙 ---------- */
.cover { background: linear-gradient(160deg, #0b203d 0%, #12345a 55%, #1d5b8c 100%);
  color: #fff; padding: 54px 22px 46px; text-align: center; position: relative; overflow: hidden; }
.cover::after { content: ""; position: absolute; inset: auto -20% -60% -20%; height: 200px;
  background: radial-gradient(ellipse at center, rgba(98,183,231,.35), transparent 70%); }
.cover__kicker { font-family: var(--num); letter-spacing: .32em; font-size: 11px;
  opacity: .8; text-transform: uppercase; }
.cover__title { font-family: var(--serif); font-size: 29px; font-weight: 600;
  margin: 12px 0 10px; letter-spacing: .06em; line-height: 1.5; }
.cover__sub { font-size: 14px; opacity: .88; margin: 0 auto; max-width: 30em; }
.cover__meta { margin-top: 22px; font-family: var(--num); font-size: 11.5px; opacity: .62; }

/* ---------- 目次 ---------- */
.toc { max-width: 860px; margin: -26px auto 0; padding: 0 16px; position: relative; z-index: 2; }
.toc__box { background: var(--card); border: 1px solid var(--line); border-radius: 14px;
  box-shadow: var(--shadow); padding: 18px 20px; }
.toc__t { font-family: var(--serif); font-size: 14px; color: var(--ink-soft);
  letter-spacing: .16em; margin: 0 0 10px; }
.toc__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
.toc__list a { display: flex; gap: 10px; align-items: baseline; text-decoration: none;
  color: var(--ink); padding: 7px 8px; border-radius: 8px; font-size: 14.5px; }
.toc__list a:hover { background: var(--sky-soft); }
.toc__no { font-family: var(--num); color: var(--sky); font-size: 13px; min-width: 1.4em; }

/* ---------- 本文 ---------- */
.wrap { max-width: 860px; margin: 0 auto; padding: 30px 16px 90px; }
.sec { margin: 44px 0 0; scroll-margin-top: 14px; }
.sec__head { display: flex; align-items: baseline; gap: 12px; border-bottom: 2px solid var(--navy);
  padding-bottom: 8px; margin-bottom: 6px; }
.sec__no { font-family: var(--num); font-size: 26px; color: var(--sky); line-height: 1; }
.sec__title { font-family: var(--serif); font-size: 20px; font-weight: 600; margin: 0;
  letter-spacing: .04em; }
.sec__lead { color: var(--ink-soft); font-size: 14.5px; margin: 12px 0 0; }

h3 { font-family: var(--serif); font-size: 16.5px; margin: 30px 0 8px; letter-spacing: .03em;
  padding-left: 12px; border-left: 4px solid var(--sky); }
p { margin: 10px 0; }
b, strong { color: var(--navy-dk); font-weight: 700; }
a { color: var(--sky); }
code { font-family: var(--mono); font-size: .88em; background: var(--sky-soft);
  padding: 2px 6px; border-radius: 5px; color: var(--navy-dk); word-break: break-all; }

/* ---------- カード・囲み ---------- */
.card { background: var(--card); border: 1px solid var(--line); border-radius: 13px;
  padding: 16px 18px; margin: 16px 0; box-shadow: 0 2px 8px rgba(7,23,44,.05); }
.card__t { font-family: var(--serif); font-size: 15.5px; margin: 0 0 8px; color: var(--navy-dk); }
.note { border-radius: 11px; padding: 12px 16px; margin: 14px 0; font-size: 14.5px;
  border-left: 4px solid var(--sky); background: var(--sky-soft); }
.note > b:first-child { display: block; margin-bottom: 2px; }
.note--warn  { border-left-color: var(--warn);  background: var(--warn-soft); }
.note--ok    { border-left-color: var(--green); background: var(--green-soft); }
.note--amber { border-left-color: var(--amber); background: var(--amber-soft); }

/* ---------- 手順 ---------- */
.steps { list-style: none; counter-reset: st; margin: 16px 0; padding: 0; }
.steps > li { counter-increment: st; position: relative; padding: 2px 0 16px 46px; }
.steps > li::before { content: counter(st); position: absolute; left: 0; top: 0;
  width: 30px; height: 30px; border-radius: 50%; background: var(--navy); color: #fff;
  font-family: var(--num); font-size: 15px; display: flex; align-items: center;
  justify-content: center; }
.steps > li::after { content: ""; position: absolute; left: 15px; top: 34px; bottom: 2px;
  width: 1px; background: var(--line); }
.steps > li:last-child::after { display: none; }
.steps b { display: block; }

/* ---------- 表 ---------- */
.tablewrap { overflow-x: auto; margin: 16px 0; -webkit-overflow-scrolling: touch; }
table { border-collapse: collapse; width: 100%; font-size: 14px; background: var(--card);
  border-radius: 10px; overflow: hidden; min-width: 460px; }
th, td { border-bottom: 1px solid var(--line); padding: 9px 12px; text-align: left;
  vertical-align: top; }
th { background: var(--sky-soft); color: var(--navy-dk); font-weight: 700; white-space: nowrap; }
td code { background: transparent; padding: 0; }

/* ---------- 画面イメージ（共通の枠） ---------- */
.shot { margin: 20px 0 24px; }
.shot__cap { font-size: 12.5px; color: var(--ink-faint); text-align: center;
  margin-top: 9px; font-family: var(--num); letter-spacing: .08em; }
.shot--row { display: flex; gap: 18px; flex-wrap: wrap; justify-content: center; }

/* スマホ枠 */
.phone { width: 300px; margin: 0 auto; background: #16283a; border-radius: 30px;
  padding: 9px; box-shadow: var(--shadow); }
.phone__scr { background: #07172c; border-radius: 23px; overflow: hidden; position: relative;
  color: #eaf4fb; font-size: 12px; line-height: 1.65; }
.phone--img { padding: 7px; }
.phone__img { display: block; width: 100%; height: auto; border-radius: 17px; }
.phone__notch { position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 96px; height: 17px; background: #16283a; border-radius: 0 0 12px 12px; z-index: 5; }

/* PC枠 */
.win { max-width: 660px; margin: 0 auto; background: #16283a; border-radius: 12px;
  padding: 0 0 8px; box-shadow: var(--shadow); }
.win__bar { display: flex; align-items: center; gap: 6px; padding: 9px 12px; }
.win__dot { width: 9px; height: 9px; border-radius: 50%; background: #43596e; }
.win__url { flex: 1; margin-left: 8px; background: #0b1e30; color: #8fa9bd; font-size: 10.5px;
  font-family: var(--mono); padding: 4px 10px; border-radius: 20px; overflow: hidden;
  white-space: nowrap; text-overflow: ellipsis; }
.win__scr { background: #07172c; margin: 0 8px; border-radius: 7px; overflow: hidden;
  color: #eaf4fb; font-size: 11.5px; line-height: 1.6; }

/* ---------- アプリ画面の再現パーツ ---------- */
.a-hd { display: flex; align-items: center; gap: 8px; padding: 11px 12px;
  background: linear-gradient(100deg, #0b2743, #14456f);
  border-bottom: 1px solid rgba(255,255,255,.09); }
.a-brand { font-family: var(--serif); font-size: 13px; letter-spacing: .18em; }
.a-brand small { display: block; font-family: var(--num); font-size: 6.5px;
  letter-spacing: .3em; opacity: .6; }
.a-sp { flex: 1; }
.a-chip { border: 1px solid rgba(255,255,255,.28); border-radius: 20px; padding: 2px 9px;
  font-size: 9.5px; white-space: nowrap; }
.a-body { padding: 12px; }
.a-h1 { font-family: var(--serif); font-size: 15px; margin: 2px 0 8px; letter-spacing: .04em; }
.a-lead { color: #9db6cc; font-size: 10.5px; margin: 0 0 10px; }
.a-field { margin-bottom: 9px; }
.a-label { font-size: 9.5px; color: #9db6cc; letter-spacing: .1em; display: block;
  margin-bottom: 3px; }
.a-input { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.16);
  border-radius: 8px; padding: 7px 9px; font-size: 11px; color: #cfe2f2; }
.a-input--fill { color: #eaf4fb; }
.a-btn { display: block; text-align: center; background: linear-gradient(100deg,#1d5b8c,#2e93cf);
  color: #fff; border-radius: 9px; padding: 8px; font-size: 11.5px; font-weight: 700;
  margin-top: 11px; }
.a-btn--ghost { background: transparent; border: 1px solid rgba(255,255,255,.25); }
.a-link { display: block; text-align: center; color: #8fd0f5; font-size: 10px;
  margin-top: 10px; text-decoration: underline; }
.a-note { color: #7f97ab; font-size: 9.5px; text-align: center; margin-top: 9px; line-height: 1.7; }
.a-card { background: rgba(255,255,255,.055); border: 1px solid rgba(255,255,255,.1);
  border-radius: 9px; padding: 9px 10px; margin-bottom: 8px; }
.a-card__t { font-family: var(--serif); font-size: 11.5px; margin-bottom: 3px; }
.a-muted { color: #8ba4b9; font-size: 9.5px; }
.a-vid { background: #000; border-radius: 7px; aspect-ratio: 16/9; display: flex;
  align-items: center; justify-content: center; color: #55708a; font-size: 18px; }
.a-marks { display: flex; flex-wrap: wrap; gap: 5px; }
.a-mark { background: rgba(98,183,231,.16); border: 1px solid rgba(98,183,231,.4);
  color: #a8dcf7; border-radius: 20px; padding: 2px 8px; font-size: 9.5px;
  font-family: var(--num); }
.a-side { background: rgba(255,255,255,.03); border-right: 1px solid rgba(255,255,255,.08);
  padding: 9px; }
.a-chap { border-radius: 7px; padding: 5px 8px; font-size: 9.5px; white-space: nowrap; margin-bottom: 4px;
  color: #fff; font-weight: 700; display: flex; justify-content: space-between; gap: 6px; }
.cc0 { background: #1f5f8b; } .cc1 { background: #2b7a6b; } .cc2 { background: #6a4b8a; }
.cc3 { background: #8a5a2b; } .cc4 { background: #2b5f8a; } .cc5 { background: #7a2b4b; }
.a-lesson { font-size: 10px; padding: 4px 8px 4px 14px; color: #c6d8e7;
  border-left: 1px solid rgba(255,255,255,.12); margin-left: 6px; }
.a-lesson.on { color: #fff; background: rgba(98,183,231,.14); border-radius: 0 6px 6px 0; }
.a-lim { display: inline-block; font-size: 8.5px; border-radius: 4px; padding: 0 5px;
  margin-left: 4px; font-family: var(--num); }
.a-lim--soon { background: #6b3a1e; color: #ffd7a8; }
.a-lim--before { background: #23405c; color: #a8cbe6; }
.a-menu { background: #0e2338; border: 1px solid rgba(255,255,255,.14); border-radius: 10px;
  padding: 5px; margin-top: 6px; }
.a-menu div { font-size: 10.5px; padding: 5px 8px; border-radius: 6px; }
.a-menu div.sep { padding: 0; margin: 4px 6px; height: 1px; background: rgba(255,255,255,.1); }
.a-menu div.adm { color: #ffd8a3; }
.a-tabs { display: flex; gap: 5px; padding: 8px 10px 0; }
.a-tab { font-size: 10px; padding: 4px 9px; border-radius: 7px 7px 0 0;
  background: rgba(255,255,255,.06); color: #a8c2d6; }
.a-tab.on { background: #123a5e; color: #fff; font-weight: 700; }
.a-toolbar { display: flex; gap: 5px; align-items: center; padding: 8px 10px; flex-wrap: wrap; }
.a-pill { font-size: 9px; border-radius: 20px; padding: 2px 8px;
  background: rgba(255,255,255,.07); color: #b6cee0; border: 1px solid rgba(255,255,255,.12); }
.a-pill.on { background: #2e93cf; color: #06182a; border-color: #2e93cf; font-weight: 700; }
.a-pill .n { font-family: var(--num); opacity: .75; margin-left: 3px; }
.a-tbl { width: 100%; border-collapse: collapse; font-size: 9.5px; min-width: 0; background: none; }
.a-tbl th { background: rgba(98,183,231,.12); color: #bcdcf2; padding: 4px 6px;
  border-bottom: 1px solid rgba(255,255,255,.12); white-space: nowrap; }
.a-tbl td { padding: 4px 6px; border-bottom: 1px solid rgba(255,255,255,.07); color: #d3e3f0; }
.a-badge { border-radius: 4px; font-size: 8.5px; padding: 1px 5px; }
.a-badge--ok { background: rgba(108,195,159,.2); color: #8fe0bd; }
.a-tag { background: rgba(255,255,255,.09); border-radius: 4px; font-size: 8.5px;
  padding: 1px 5px; margin-right: 3px; display: inline-block; }
.a-modal { background: #0e2338; border: 1px solid rgba(255,255,255,.16); border-radius: 11px;
  padding: 11px; margin: 10px; box-shadow: 0 12px 30px rgba(0,0,0,.5); }
.a-modal__t { font-family: var(--serif); font-size: 12px; margin-bottom: 8px;
  padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,.12); }
.a-row2 { display: flex; gap: 6px; }
.a-row2 > * { flex: 1; }
.a-block { border: 1px dashed rgba(255,255,255,.22); border-radius: 8px; padding: 6px 8px;
  margin-bottom: 6px; font-size: 10px; }
.a-block__h { font-size: 8.5px; color: #8fd0f5; letter-spacing: .1em; margin-bottom: 3px; }
.a-add { display: flex; gap: 5px; margin-top: 6px; }
.a-add span { font-size: 9.5px; border: 1px solid rgba(255,255,255,.25); border-radius: 20px;
  padding: 2px 9px; color: #bcdcf2; }
.a-drawer { position: absolute; left: 8px; bottom: 12px; background: #123a5e; color: #fff;
  font-size: 10px; padding: 5px 12px; border-radius: 0 8px 8px 0; }
.a-toast { background: #0e2338; border: 1px solid rgba(255,255,255,.16); border-radius: 10px;
  padding: 12px; margin: 26px 12px; text-align: center; }
.a-dots { display: flex; gap: 4px; justify-content: center; margin-top: 8px; }
.a-dots i { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.25); }
.a-dots i.on { background: #62b7e7; }
.a-sys { background: #dfe6ec; color: #1b2a38; font-size: 10px; border-radius: 9px;
  padding: 8px 10px; margin: 8px; }
.a-sys b { color: #1b2a38; }
.a-sysbtn { background: #fff; border: 1px solid #b9c6d1; border-radius: 6px; padding: 3px 8px;
  display: inline-block; margin-top: 5px; font-size: 9.5px; }

/* ---------- 足元のロゴ ---------- */
/* 白地のロゴを、白い光の中に multiply で重ねる。
   明るい紙面でも濃紺のダークモードでも、四角い画像に見えない。 */
.mark { position: relative; width: 186px; height: 186px; margin: 44px auto 0;
  display: flex; align-items: center; justify-content: center; }
.mark::before { content: ""; position: absolute; inset: 0; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,.97) 0%, rgba(255,255,255,.92) 30%,
    rgba(240,250,255,.55) 48%, rgba(235,247,255,.22) 66%, rgba(255,255,255,0) 84%); }
.mark img { position: relative; width: 112px; height: 112px; mix-blend-mode: multiply; }

/* ---------- 流れ図 ---------- */
.flow { margin: 18px 0; }
.flow__row { display: grid; grid-template-columns: 96px 1fr; gap: 12px; align-items: start;
  padding: 11px 0; border-top: 1px dashed var(--line); }
.flow__row:first-child { border-top: 0; }
.flow__who { font-size: 12px; text-align: center; border-radius: 8px; padding: 5px 4px;
  background: var(--sky-soft); color: var(--navy-dk); font-weight: 700; }
.flow__who--sys { background: var(--green-soft); color: var(--green); }
.flow__who--gas { background: var(--amber-soft); color: var(--amber); }
.flow__what { font-size: 14.5px; }
.flow__arrow { text-align: center; color: var(--ink-faint); font-size: 13px; margin: -4px 0; }

/* ---------- その他 ---------- */
.kv { display: grid; grid-template-columns: 7.5em 1fr; gap: 4px 12px; font-size: 14.5px;
  margin: 10px 0; }
.kv dt { color: var(--ink-soft); }
.kv dd { margin: 0; }
.qa { border-top: 1px solid var(--line); padding: 13px 0; }
.qa__q { font-weight: 700; color: var(--navy-dk); }
.qa__q::before { content: "Q. "; font-family: var(--num); color: var(--sky); }
.qa__a { font-size: 14.5px; margin-top: 3px; }
.qa__a::before { content: "A. "; font-family: var(--num); color: var(--ink-faint); }
.foot { text-align: center; color: var(--ink-faint); font-size: 12px; margin-top: 60px;
  padding-top: 20px; border-top: 1px solid var(--line); font-family: var(--num);
  letter-spacing: .1em; }
.top { position: fixed; right: 14px; bottom: 14px; background: var(--navy); color: #fff;
  border-radius: 50%; width: 42px; height: 42px; display: flex; align-items: center;
  justify-content: center; text-decoration: none; box-shadow: var(--shadow); font-size: 15px; }

@media print {
  .top, .toc { display: none; }
  body { background: #fff; }
  .sec { break-inside: avoid; }
}
@media (max-width: 560px) {
  body { font-size: 15px; }
  .cover__title { font-size: 23px; }
  .sec__title { font-size: 17.5px; }
  .win { max-width: 100%; }
  .kv { grid-template-columns: 1fr; gap: 0 0; }
  .kv dt { margin-top: 8px; font-size: 12.5px; }
  .flow__row { grid-template-columns: 74px 1fr; }
}
"""


def logo_b64():
    """ロゴ画像の中身（base64）。1枚完結にするため直接埋め込む"""
    import base64, os
    f = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                     "..", "assets", "logo-mark.png")
    return base64.b64encode(open(os.path.normpath(f), "rb").read()).decode("ascii")


def _mark():
    """足元に置くロゴ"""
    return ('<div class="mark"><img src="data:image/png;base64,%s" alt="凛穏塾"></div>'
            % logo_b64())


def page(fname, title, kicker, cover_title, cover_sub, secs, meta=""):
    """1枚完結の HTML を組み立てて返す"""
    toc = "".join(
        '<li><a href="#s%d"><span class="toc__no">%02d</span><span>%s</span></a></li>'
        % (i + 1, i + 1, s[0]) for i, s in enumerate(secs)
    )
    body = "".join(
        '<section class="sec" id="s%d"><div class="sec__head">'
        '<span class="sec__no">%02d</span><h2 class="sec__title">%s</h2></div>%s</section>'
        % (i + 1, i + 1, s[0], s[1]) for i, s in enumerate(secs)
    )
    return """<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,nofollow">
<title>%s</title>
<style>%s</style>
</head>
<body>
<header class="cover">
  <div class="cover__kicker">%s</div>
  <h1 class="cover__title">%s</h1>
  <p class="cover__sub">%s</p>
  <div class="cover__meta">%s</div>
</header>

<nav class="toc"><div class="toc__box">
  <p class="toc__t">もくじ</p>
  <ul class="toc__list">%s</ul>
</div></nav>

<main class="wrap">%s
  %s
  <p class="foot" style="margin-top:14px;border-top:0">凛穏塾 動画視聴アプリ &nbsp;/&nbsp; %s</p>
</main>
<a class="top" href="#" aria-label="ページの先頭へ">&#9650;</a>
</body>
</html>
""" % (title, CSS, kicker, cover_title, cover_sub, meta, toc, body, _mark(), meta)


# ---- 小さなヘルパー -------------------------------------------------------

def shot_phone(src, cap="", w=""):
    """実際の画面キャプチャをスマホ枠に入れる（ノッチは付けない）"""
    c = '<p class="shot__cap">%s</p>' % cap if cap else ""
    return ('<div class="shot"><div class="phone phone--img"><div class="phone__scr">'
            '<img class="phone__img" src="%s" alt="" loading="lazy"></div></div>%s</div>'
            ) % (src, c)


def phone(inner, cap=""):
    c = '<p class="shot__cap">%s</p>' % cap if cap else ""
    return ('<div class="shot"><div class="phone"><div class="phone__scr">'
            '<div class="phone__notch"></div>%s</div></div>%s</div>') % (inner, c)


def win(inner, url="apps.l-mine.com/rionjuku-app/admin.html", cap=""):
    c = '<p class="shot__cap">%s</p>' % cap if cap else ""
    return ('<div class="shot"><div class="win"><div class="win__bar">'
            '<span class="win__dot"></span><span class="win__dot"></span>'
            '<span class="win__dot"></span><span class="win__url">%s</span></div>'
            '<div class="win__scr">%s</div></div>%s</div>') % (url, inner, c)


def row(*shots):
    return '<div class="shot shot--row">%s</div>' % "".join(shots)


def note(text, kind=""):
    k = " note--" + kind if kind else ""
    return '<div class="note%s">%s</div>' % (k, text)


def card(title, body):
    return '<div class="card"><p class="card__t">%s</p>%s</div>' % (title, body)


def steps(items):
    return '<ol class="steps">%s</ol>' % "".join("<li>%s</li>" % i for i in items)


def table(head, rows):
    h = "".join("<th>%s</th>" % x for x in head)
    b = "".join("<tr>%s</tr>" % "".join("<td>%s</td>" % c for c in r) for r in rows)
    return ('<div class="tablewrap"><table><thead><tr>%s</tr></thead>'
            '<tbody>%s</tbody></table></div>') % (h, b)


def qa(pairs):
    return "".join('<div class="qa"><p class="qa__q">%s</p><p class="qa__a">%s</p></div>'
                   % (q, a) for q, a in pairs)


def flow(rows):
    out = []
    for i, (who, kind, what) in enumerate(rows):
        if i:
            out.append('<p class="flow__arrow">&#9660;</p>')
        k = " flow__who--" + kind if kind else ""
        out.append('<div class="flow__row"><div class="flow__who%s">%s</div>'
                   '<div class="flow__what">%s</div></div>' % (k, who, what))
    return '<div class="flow">%s</div>' % "".join(out)
