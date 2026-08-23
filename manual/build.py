# -*- coding: utf-8 -*-
"""
マニュアル3種＋入口ページを書き出す。

  python build.py

出力先はこのフォルダの1つ上（＝リポジトリ直下）。
  guide.html          受講生さま向け 使い方ガイド
  manual-admin.html   運営の手順書
  manual-system.html  画面と仕組み
  manual.html         3つへの入口
"""

import io
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from _base import CSS          # noqa: E402
import page_guide              # noqa: E402
import page_admin              # noqa: E402
import page_system             # noqa: E402

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

HUB_CARDS = [
    ("guide.html", "&#128218;", "受講生さま向け 使い方ガイド",
     "はじめてのログインから、動画の観かた・通知の受け取りかたまで。"
     "そのまま受講生さまにお渡しいただけます。", "配布用"),
    ("manual-admin.html", "&#9881;&#65039;", "運営の手順書",
     "動画の追加、お知らせと通知、受講生の管理。運営ページの操作手順です。", "関係者用"),
    ("manual-system.html", "&#128506;&#65039;", "画面と仕組み",
     "何がどこにあり、どう繋がっているか。引き継ぎ・改修のときの地図です。", "関係者用"),
]


def hub():
    cards = "".join(
        '<a class="hub" href="%s"><div class="hub__ic">%s</div>'
        '<div><div class="hub__t">%s<span class="hub__badge">%s</span></div>'
        '<p class="hub__d">%s</p></div><div class="hub__go">&#8250;</div></a>'
        % (href, ic, t, badge, d) for href, ic, t, d, badge in HUB_CARDS
    )
    extra = """
.hub { display:flex; gap:14px; align-items:center; text-decoration:none; color:var(--ink);
  background:var(--card); border:1px solid var(--line); border-radius:14px;
  padding:16px 18px; margin:12px 0; box-shadow:0 2px 8px rgba(7,23,44,.05);
  transition:transform .15s ease, box-shadow .15s ease; }
.hub:hover { transform:translateY(-2px); box-shadow:var(--shadow); }
.hub__ic { font-size:26px; }
.hub__t { font-family:var(--serif); font-size:16.5px; color:var(--navy-dk); }
.hub__badge { font-family:var(--sans); font-size:10.5px; letter-spacing:.1em;
  background:var(--sky-soft); color:var(--sky); border-radius:20px; padding:2px 9px;
  margin-left:9px; vertical-align:2px; }
.hub__d { font-size:13.5px; color:var(--ink-soft); margin:3px 0 0; }
.hub__go { margin-left:auto; color:var(--ink-faint); font-size:22px; }
"""
    return """<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,nofollow">
<title>マニュアル｜凛穏塾 動画視聴アプリ</title>
<style>%s%s</style>
</head>
<body>
<header class="cover">
  <div class="cover__kicker">RIONJUKU ONLINE STUDY</div>
  <h1 class="cover__title">動画視聴アプリ<br>マニュアル</h1>
  <p class="cover__sub">見る方・運営する方・手を入れる方。それぞれの視点でまとめています。</p>
  <div class="cover__meta">2026.08 &nbsp;/&nbsp; ver.1.0</div>
</header>
<main class="wrap" style="padding-top:34px">
  %s
  <div class="note" style="margin-top:26px"><b>受講生さまにお渡しできるのは「使い方ガイド」だけです</b>
    ほかの2つは運営の内部情報を含みますので、関係者のみでご利用ください。</div>
  <p class="foot">凛穏塾 動画視聴アプリ &nbsp;/&nbsp; 2026.08</p>
</main>
</body>
</html>
""" % (CSS, extra, cards)


def main():
    files = [
        ("guide.html", page_guide.build()),
        ("manual-admin.html", page_admin.build()),
        ("manual-system.html", page_system.build()),
        ("manual.html", hub()),
    ]
    for name, html in files:
        path = os.path.join(OUT, name)
        io.open(path, "w", encoding="utf-8", newline="\n").write(html)
        print("%-20s %7d bytes" % (name, len(html.encode("utf-8"))))
    print("\n出力先: %s" % OUT)


if __name__ == "__main__":
    main()
