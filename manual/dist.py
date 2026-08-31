# -*- coding: utf-8 -*-
"""
配布用（1枚で完結するHTML）を書き出す。

  python dist.py

start.html は画面写真を assets/shots/*.jpg から読んでいるので、
ファイルだけ渡すと画像が出ない。ここで画像を中に埋め込んで、
Googleドライブやメール添付でもそのまま開ける形にする。

出力先： …\凛穏塾\配布用マニュアル\
  凛穏塾_はじめての方へ.html      （初回登録のご案内）
  凛穏塾_使い方ガイド.html        （くわしい版・もともと1枚完結）
"""

import base64
import io
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))          # rionjuku-app
OUT = os.path.normpath(os.path.join(ROOT, "..", "配布用マニュアル"))

FILES = [
    ("start.html", "凛穏塾_はじめての方へ.html"),
    ("guide.html", "凛穏塾_使い方ガイド.html"),
]


def embed(html):
    """<img src="assets/…"> を、画像そのものを埋め込んだ形に置き換える"""
    def rep(m):
        rel = m.group(1)
        path = os.path.join(ROOT, rel.replace("/", os.sep))
        if not os.path.exists(path):
            raise SystemExit("画像が見つかりません: " + path)
        ext = os.path.splitext(path)[1].lower()
        mime = "image/jpeg" if ext in (".jpg", ".jpeg") else "image/png"
        b = base64.b64encode(open(path, "rb").read()).decode("ascii")
        return 'src="data:%s;base64,%s"' % (mime, b)
    return re.sub(r'src="(assets/[^"]+)"', rep, html)


def main():
    os.makedirs(OUT, exist_ok=True)
    for src, name in FILES:
        html = io.open(os.path.join(ROOT, src), encoding="utf-8").read()
        html = embed(html)
        # 配布物からはアプリ内リンク（相対）を、開けるURLに直す
        html = html.replace('href="index.html"', 'href="https://apps.l-mine.com/rionjuku-app/"')
        html = html.replace('href="guide.html"', 'href="https://apps.l-mine.com/rionjuku-app/guide.html"')
        html = html.replace("'index.html?uid='", "'https://apps.l-mine.com/rionjuku-app/?uid='")
        if 'src="assets/' in html:
            raise SystemExit("埋め込みもれがあります: " + src)
        p = os.path.join(OUT, name)
        io.open(p, "w", encoding="utf-8", newline="\n").write(html)
        print("%-28s %8d bytes" % (name, os.path.getsize(p)))
    print("\n出力先: %s" % OUT)


if __name__ == "__main__":
    main()
