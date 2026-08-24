# -*- coding: utf-8 -*-
"""
凛穏ロゴから、アプリで使う画像を書き出す。

  python make_assets.py

入力  assets/logo_src.png（白背景・913x922・凛穏塾ロゴ）
出力
  ../icon-192.png      PWAアイコン（白地）
  ../icon-512.png      同上
  ../icon-512-maskable.png  Android用（余白多め）
  ../favicon-32.png    ファビコン
  ../favicon-64.png    ファビコン（高解像度）
  logo.png             余白を整えた正方形ロゴ（明るい背景用）
  logo-app.png         アプリ用に軽くしたロゴ（白地・乗算合成で光に溶かす）
  logo-mark.png        マニュアルの足元に埋め込む小さいロゴ
"""

import os
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
SRC = os.path.join(HERE, "logo_src.png")

# 中身の入っている範囲（実測）。ここを基準に正方形へ整える
BOX = (54, 66, 888, 882)


def trimmed():
    """余白を落として、中身を正方形の中央に置いたロゴ（白背景）"""
    im = Image.open(SRC).convert("RGB")
    cut = im.crop(BOX)
    w, h = cut.size
    side = max(w, h)
    canvas = Image.new("RGB", (side, side), (255, 255, 255))
    canvas.paste(cut, ((side - w) // 2, (side - h) // 2))
    return canvas


def icon(size, pad=0.11, bg_top=(255, 255, 255), bg_bottom=(242, 248, 253)):
    """白地のアプリアイコン。ふちに余白を取り、丸くマスクされても切れないようにする"""
    base = Image.new("RGB", (size, size), bg_top)
    d = ImageDraw.Draw(base)
    for y in range(size):                      # ごく淡い縦グラデーション
        t = y / float(size - 1)
        d.line([(0, y), (size, y)],
               fill=tuple(int(bg_top[i] + (bg_bottom[i] - bg_top[i]) * t) for i in range(3)))
    inner = int(size * (1 - pad * 2))
    logo = trimmed().resize((inner, inner), Image.LANCZOS)
    base.paste(logo, ((size - inner) // 2, (size - inner) // 2))
    return base


def flatten(im, size, colors=128):
    """白地のまま軽くする。乗算合成で使うので、白は必ず純白 #ffffff に戻す"""
    q = im.resize((size, size), Image.LANCZOS).convert("RGB").quantize(
        colors=colors, method=Image.MEDIANCUT).convert("RGB")
    px = q.load()
    for y in range(size):                      # 量子化でくすんだ白を純白へ
        for x in range(size):
            r, g, b = px[x, y]
            if r > 246 and g > 246 and b > 246:
                px[x, y] = (255, 255, 255)
    return q.quantize(colors=colors, method=Image.MEDIANCUT)


def main():
    outs = []

    logo = trimmed()
    p = os.path.join(HERE, "logo.png")
    logo.resize((900, 900), Image.LANCZOS).save(p, optimize=True)
    outs.append(p)

    p = os.path.join(HERE, "logo-app.png")     # アプリの起動画面など（白は乗算で消える）
    flatten(logo, 480).save(p, optimize=True)
    outs.append(p)

    p = os.path.join(HERE, "logo-mark.png")    # マニュアルの足元（HTMLへ埋め込む）
    flatten(logo, 220, 96).save(p, optimize=True)
    outs.append(p)

    for s in (192, 512):
        p = os.path.join(ROOT, "icon-%d.png" % s)
        icon(s).save(p, optimize=True)
        outs.append(p)

    # Androidのマスク（丸く切り抜かれる）用に、余白を多めに取ったもの
    p = os.path.join(ROOT, "icon-512-maskable.png")
    icon(512, pad=0.22).save(p, optimize=True)
    outs.append(p)

    for s in (32, 64):
        p = os.path.join(ROOT, "favicon-%d.png" % s)
        icon(s, pad=0.05).save(p, optimize=True)
        outs.append(p)

    for p in outs:
        print("%-16s %7d bytes" % (os.path.basename(p), os.path.getsize(p)))


if __name__ == "__main__":
    main()
