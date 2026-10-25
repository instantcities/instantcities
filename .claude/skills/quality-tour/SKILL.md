---
name: quality-tour
description: Walk a city's tour route picture by picture looking for things that are off (blank walls, holes between houses, floating or sunken props, wrong colours, clipping), compare with Mapillary / Street View, report and fix. Use when Wouter asks for a "quality tour", a visual check of the tour route, or to look for "lege gevels" along the route.
---

# Quality tour

A visual check of everything the tour flies past, without a headless browser (it renders the
WebGL on the CPU and overheats Wouter's laptop; see CLAUDE.md). The game takes its own pictures
while Wouter plays the tour in his own, GPU-backed browser; I read them afterwards.

## 0. Without a browser first

`node tools/tourcheck.mjs <city>` flies the tour's path metre by metre the way the game does and
lists every stretch where the camera goes through a building or grazes its wall (map.js outlines
and heights). Fix those in `<city>/tour.js` (a point higher, or out over the street) until it says
"the camera clears every building", before taking pictures.

## 1. Pictures (Wouter's browser)

1. Start the dev server: `python3 serve.py` (port 8321; it has the `/__tourshot` endpoint).
2. Ask Wouter to open `http://localhost:8321/ghent/play/?shots=60` (or `/lecce/play/`) and leave the tab in
   front until the tour has gone round once (a few minutes). It starts the tour on autoplay and
   saves a picture every 60 m of path into `tools/cache/tourshots/<city>/` (`000.jpg`, …, plus
   `shots.jsonl` with the camera's place and direction). A new round clears the last one's.
   Fewer metres: more pictures. The cards and bars are HTML, so they are not in the pictures.
3. Do not drive the game myself, and never with Playwright/Puppeteer/headless Chrome.

## 2. Index

`node tools/tourshots.mjs <city>` prints one line per picture (path metres, street, game x/z,
the lat/lon it looks at and the heading) and writes `tools/cache/tourshots/<city>/index.html`: the
pictures side by side with Mapillary and Street View links at that spot, and a "ride there" link
(`?pos=x,z`). With `MAPILLARY_TOKEN` set (free, mapillary.com/dashboard/developers) it puts
Mapillary's nearest photos beside each picture.

## 3. Look

Make smaller copies first (`sips -Z 1400` into the scratchpad), then read every one with the Read tool, in order. To find which building a wall in a picture is, cast a ray from the camera (shots.jsonl) at the picture's heading plus the offset of that spot from the middle (the view is about 106° wide on a wide window) through map.js's outlines. Per picture note anything that looks off:

- a blank or windowless wall facing the street, or one wall texture stretched or squashed
- a hole in a row of houses, ground showing where a house should stand, a house inside another
- a landmark missing, in the wrong place, or overlapping the houses round it
- props floating, sunk into the ground, standing in the road or in the water
- roofs or gables that stick out oddly, z-fighting, flicker stripes
- a sight the card names that is not in view at that moment

When something might be real (a blank wall can be a real blind wall), look at the real place: the
Mapillary photos in index.html, or `node tools/photos.mjs <city> <id> --at <lat>,<lon>` for
Commons and Mapillary photos of that spot.

## 4. Report

One table: picture, street, what is off, how sure (real bug or maybe), likely cause (map data,
`<city>/infill.js`, `fronts.js`, `landmarks.json`, a prop list). Then fix the real ones, grouped by
cause, preferring a fix in the generator (tools/*.mjs, core/js/scenery.js) over a one-off
patch when several pictures share it. Ask Wouter to check fixed spots with the "ride there" links
rather than taking a new round of pictures myself.
