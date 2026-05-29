#!/usr/bin/env python3
"""Derive assets/world-map.svg (embedded into index.html as #worldMap) from
assets/world-map_raw.svg (Wikimedia Commons BlankMap-World.svg).

Strips the embedded stylesheet (we apply our own fill model), drops the root
title, rounds every coordinate to 1 decimal (paths are RELATIVE, so harder
rounding risks cumulative drift / coastline gaps), and collapses whitespace.

Run from the repo root:  python3 assets/optimize-world-svg.py
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "world-map_raw.svg")
DST = os.path.join(ROOT, "assets", "world-map.svg")

raw = open(SRC, encoding="utf-8").read()

s = re.sub(r"<\?xml[^>]*\?>", "", raw)
inner = re.search(r"<svg\b[^>]*>(.*)</svg>", s, flags=re.S).group(1)

inner = re.sub(r"<style\b.*?</style>", "", inner, flags=re.S)
inner = re.sub(r"<!--.*?-->", "", inner, flags=re.S)
inner = re.sub(r"<title>\s*World Map\s*</title>", "", inner, count=1)

def round1(m):
    v = round(float(m.group(0)), 1)
    iv = int(v)
    return str(iv) if v == iv else str(v)

inner = re.sub(r"-?\d+\.\d+", round1, inner)
inner = re.sub(r">\s+<", "><", inner)
inner = re.sub(r"[ \t\r\n]+", " ", inner).strip()

out = (
    '<svg id="worldMap" viewBox="0 0 2754 1398" role="img" '
    'aria-labelledby="worldMapTitle worldMapDesc">'
    '<title id="worldMapTitle">Clickable World Map</title>'
    '<desc id="worldMapDesc">Outline map of world countries.</desc>'
    + inner + "</svg>"
)

open(DST, "w", encoding="utf-8").write(out)
print("raw bytes      :", len(raw))
print("optimized bytes:", len(out))
print("reduction      : {:.1f}%".format(100 * (1 - len(out) / len(raw))))
