# -*- coding: utf-8 -*-
"""
マニュアルに載せる「実際の画面」を撮り直す。

  python shoot.py

・アプリをデモモードで開いて、Chrome をヘッドレスで動かして撮る。
  URL は index.html?mock=1&shot=… （撮影用の裏口。デモモードのときだけ効く）
・出力は assets/shots/*.jpg（幅640・JPEG品質90）。
・画面の文言やデザインを直したら、これを実行すればマニュアルの画像も追いつく。

★ヘッドレスChromeの癖（ハマったところ）
  --window-size を 400 などにしても、実際のレイアウト幅は 500px 強になる
  （ウィンドウの最小幅がある）。画面だけが指定幅で切り取られるので、右が欠ける。
  → 幅は 520 にして、レイアウト幅 504px で撮っている（560px以下なのでスマホ表示のまま）。
"""

import os
import subprocess
import urllib.request
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
OUT = os.path.join(ROOT, "assets", "shots")
TMP = os.path.join(HERE, "_tmp_shots")

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
INDEX = os.path.join(ROOT, "index.html")

WIDTH, HEIGHT = 520, 1060      # ウィンドウ（実レイアウトは約504px幅）
SCALE = 2                      # 2倍で撮って縮小＝文字がきれいになる
OUT_W = 640                    # 書き出しの横幅

# 名前 → (撮影用パラメータ, 切り取り位置 top, bottom) ※2倍ピクセルで指定
SHOTS = [
    ("login",     "login",     0,   1750),
    ("first",     "first",     380, 1680),
    ("firstpass", "firstpass", 380, 1720),
    ("picker",    "picker",    0,   1040),
    ("menu",      "menu",      0,   1060),
]


def main():
    if not os.path.exists(CHROME):
        raise SystemExit("Chrome が見つかりません: " + CHROME)
    os.makedirs(TMP, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)
    base = urllib.request.pathname2url(INDEX)
    if not base.startswith("///"):
        base = "///" + base.lstrip("/")

    for name, shot, top, bottom in SHOTS:
        raw = os.path.join(TMP, name + ".png")
        subprocess.run([
            CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
            "--no-first-run", "--no-default-browser-check",
            "--force-device-scale-factor=%d" % SCALE,
            "--window-size=%d,%d" % (WIDTH, HEIGHT),
            "--virtual-time-budget=9000",
            "--screenshot=" + raw,
            "file:" + base + "?mock=1&shot=" + shot,
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        im = Image.open(raw).convert("RGB")
        im = im.crop((0, top, im.width, min(bottom, im.height)))
        im = im.resize((OUT_W, int(im.height * OUT_W / im.width)), Image.LANCZOS)
        p = os.path.join(OUT, name + ".jpg")
        im.save(p, quality=90, optimize=True, progressive=True)
        print("%-10s %s  %6d bytes" % (name, im.size, os.path.getsize(p)))

    for f in os.listdir(TMP):
        os.remove(os.path.join(TMP, f))
    os.rmdir(TMP)
    print("\n出力: %s\nこのあと build.py を実行してマニュアルを作り直してください。" % OUT)


if __name__ == "__main__":
    main()
