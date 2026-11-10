#!/usr/bin/env python3
"""The App Store screenshots in a frame: a colour gradient, a short line on top, the screenshot
below it with rounded corners. Reads app/app-store-assets/screenshots/<lang>/<device>/NN-*.png
(made by tools/storeshots.mjs), writes the same names to app/app-store-assets/framed/, at the
same size, so they upload to the same place.

    python3 tools/storeframes.py
"""
import glob
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'app', 'app-store-assets', 'screenshots')
OUT = os.path.join(ROOT, 'app', 'app-store-assets', 'framed')
FONT = '/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'

# per shot number: the line on top, and the gradient (top colour, bottom colour)
LINES = {
    1: {'en': 'Fly over Paris', 'nl': 'Vlieg over Parijs'},
    2: {'en': 'Cycle across San Marco', 'nl': 'Fiets over San Marco'},
    3: {'en': 'Pick a mission, race or tour', 'nl': 'Kies een missie, race of tour'},
    4: {'en': 'Ride through Amsterdam', 'nl': 'Fiets door Amsterdam'},
    5: {'en': 'See Ghent from above', 'nl': 'Bekijk Gent van boven'},
    6: {'en': 'Ride through New York', 'nl': 'Fiets door New York'},
}
COLOURS = [((41, 128, 222), (20, 40, 110)), ((255, 140, 66), (196, 40, 90)), ((40, 180, 150), (20, 80, 120)),
           ((120, 90, 230), (40, 30, 120)), ((250, 180, 40), (220, 80, 40)), ((60, 70, 90), (15, 20, 35))]


def gradient(w, h, top, bottom):
    col = Image.new('RGB', (1, h))
    for y in range(h):
        t = y / (h - 1)
        col.putpixel((0, y), tuple(round(a + (b - a) * t) for a, b in zip(top, bottom)))
    return col.resize((w, h))


def wrap(draw, text, font, width):
    lines, line = [], ''
    for word in text.split():
        test = f'{line} {word}'.strip()
        if draw.textlength(test, font=font) <= width or not line:
            line = test
        else:
            lines.append(line)
            line = word
    return lines + [line]


for src in sorted(glob.glob(os.path.join(SRC, '*', '*', '*.png'))):
    lang, device, name = src.split(os.sep)[-3:]
    n = int(name[:2])
    shot = Image.open(src).convert('RGB')
    W, H = shot.size
    img = gradient(W, H, *COLOURS[(n - 1) % len(COLOURS)])
    draw = ImageDraw.Draw(img)
    # the line: about 7% of the width high, one or two lines, centred in the top part
    size = round(W * (0.075 if device == 'iphone' else 0.06))
    font = ImageFont.truetype(FONT, size)
    lines = wrap(draw, LINES[n][lang], font, W * 0.86)
    top = round(H * 0.075)
    for i, line in enumerate(lines):
        draw.text((W / 2, top + i * size * 1.15), line, font=font, fill='white', anchor='mt')
    text_bottom = top + len(lines) * size * 1.15
    # the screenshot: below the line, to the bottom edge with a margin, rounded corners and a soft edge
    y0 = round(text_bottom + H * 0.04)
    k = (H - y0 - round(H * 0.035)) / H
    sw, sh = round(W * k), round(H * k)
    small = shot.resize((sw, sh), Image.LANCZOS)
    r = round(sw * 0.07)
    mask = Image.new('L', (sw, sh), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, sw - 1, sh - 1), r, fill=255)
    x0 = (W - sw) // 2
    border = round(sw * 0.012)
    ImageDraw.Draw(img).rounded_rectangle((x0 - border, y0 - border, x0 + sw + border, y0 + sh + border), r + border, fill=(20, 20, 24))
    img.paste(small, (x0, y0), mask)
    out = os.path.join(OUT, lang, device, name)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img.save(out, optimize=True)
    print(os.path.relpath(out, ROOT))
