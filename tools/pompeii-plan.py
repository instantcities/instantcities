#!/usr/bin/env python3
"""Where Pompeii is dug out, from the site's own plan of the excavations.

The source is the Parco Archeologico's visitor map (tools/sources/pompeii/PompeiiMAP.pdf, page 1
extracted as plan.jpg with `pdfimages -j`, page 2 as info.jpg). It draws every excavated house, wall
by wall; the parts of the town that are still buried (most of Regiones I, III, IV, V and IX) are
left plain. This script finds the excavated parts (where the drawing is dense with walls), keeps out
the gardens, the woods and the walk along the walls, and writes them as rings of [lat, lon] to
tools/sources/pompeii/excavated.json, which `fill.plan` in pompeii/area.json points to:
tools/osm_map.mjs fills those parts with houses, and leaves the buried ones open as the plan does.

The plan is a drawing seen a little from the south, not a survey: it is squeezed from north to south
and a few metres off here and there. It is laid on the map with control points (places on the plan
and the same places in the game: the Forum, the Teatro Grande, the amphitheatre and two crossings),
which puts it within some 15 m of OpenStreetMap; good enough to say which blocks are dug out.

Needs Python 3 with numpy and opencv (pip install numpy opencv-python-headless). Run it from the
repository's root after the map has moved (a new race route moves the game's metres):
    python3 tools/pompeii-plan.py            writes excavated.json and excavated.jpg (a picture to check)
"""
import json, os, re
import numpy as np
import cv2

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'tools', 'sources', 'pompeii')

# the map's frame: game metres to latitude and longitude (pompeii/map.js's geo)
geo = json.loads(re.search(r'"geo":(\{[^}]*\})', open(os.path.join(ROOT, 'pompeii', 'map.js')).read()).group(1))

# control points: [plan px (x, y) on plan.jpg, 4051 x 2636], [game metres (x, z)]
CONTROL = [
    ((1590, 1930), (-137, 144)),     # the middle of the Forum
    ((2310, 2020), (237, 214)),      # the Teatro Grande
    ((3665, 1430), (951, -124)),     # the arena of the amphitheatre
    ((2290, 1090), (233.6, -311.6)), # Via di Nola and Vicolo dei Gladiatori
    ((1255, 1720), (-285.4, 2.4)),   # Via Consolare and Via delle Terme
]

# the town on the plan (px at half size), to leave out the legend and the land outside the walls
TOWN = [[430, 640], [560, 520], [700, 430], [1000, 330], [1250, 300], [1450, 330], [1700, 470], [1830, 620],
        [1990, 950], [1990, 1000], [1700, 1075], [1300, 1130], [1000, 1180], [760, 1180], [540, 1050], [430, 860]]


def main():
    im = cv2.imread(os.path.join(SRC, 'plan.jpg'))
    im = cv2.resize(im, (im.shape[1] // 2, im.shape[0] // 2), interpolation=cv2.INTER_AREA)
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    disk = lambda n: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (n, n))

    # excavated: where the drawing is dense with the lines of walls, joined across the streets
    edges = np.hypot(cv2.Sobel(g, cv2.CV_32F, 1, 0), cv2.Sobel(g, cv2.CV_32F, 0, 1))
    dense = (cv2.blur(edges, (9, 9)) > 55).astype(np.uint8)
    dug = cv2.morphologyEx(dense, cv2.MORPH_CLOSE, disk(31))
    dug = cv2.morphologyEx(dug, cv2.MORPH_OPEN, disk(41))
    town = np.zeros_like(dug)
    cv2.fillPoly(town, [np.array(TOWN, np.int32)], 1)
    dug &= town

    # but not the gardens, vineyards and woods (drawn green, with trees: dense too)
    h, s = hsv[..., 0], hsv[..., 1]
    green = ((h > 25) & (h < 85) & (s > 38)).astype(np.uint8)
    green = cv2.morphologyEx(green, cv2.MORPH_OPEN, disk(9))
    green = cv2.morphologyEx(green, cv2.MORPH_CLOSE, disk(15))
    green = cv2.morphologyEx(green, cv2.MORPH_OPEN, disk(21))  # only the bigger ones; a peristyle's garden stays
    dug &= 1 - green
    dug = cv2.morphologyEx(dug, cv2.MORPH_OPEN, disk(15))

    # plan px (full size) -> game metres -> latitude and longitude
    P = np.array([c[0] for c in CONTROL], float)
    G = np.array([c[1] for c in CONTROL], float)
    A, *_ = np.linalg.lstsq(np.c_[P, np.ones(len(P))], G, rcond=None)
    err = np.hypot(*(np.c_[P, np.ones(len(P))] @ A - G).T)
    print('control points off by', ' '.join(f'{e:.0f}' for e in err), 'game metres')

    def latlon(px):
        x, z = (np.c_[px, np.ones(len(px))] @ A).T
        lon = (x + geo['cx']) / (geo['kx'] * geo['s']) + geo['lon']
        lat = geo['lat'] - (z + geo['cz']) / (geo['kz'] * geo['s'])
        return np.c_[lat, lon]

    contours, _ = cv2.findContours(dug, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    rings = []
    for c in contours:
        if cv2.contourArea(c) < 600:
            continue
        c = cv2.approxPolyDP(c, 2.0, True).reshape(-1, 2).astype(float) * 2
        rings.append([[round(a, 6), round(b, 6)] for a, b in latlon(c)])
    out = os.path.join(SRC, 'excavated.json')
    with open(out, 'w') as f:
        f.write('{"source": "tools/sources/pompeii/PompeiiMAP.pdf (Parco Archeologico di Pompei, 09/2025), by tools/pompeii-plan.py",\n'
                ' "rule": "even-odd: a point is dug out if it is inside an odd number of rings",\n "rings": [\n')
        f.write(',\n'.join('  ' + json.dumps(r, separators=(',', ':')) for r in rings))
        f.write('\n]}\n')
    print(len(rings), 'rings ->', os.path.relpath(out, ROOT))

    vis = im.copy()
    vis[dug > 0] = (vis[dug > 0] * 0.55 + np.array([0, 0, 110])).astype(np.uint8)
    cv2.imwrite(os.path.join(SRC, 'excavated.jpg'), vis[280:1200, 400:2010])


if __name__ == '__main__':
    main()
