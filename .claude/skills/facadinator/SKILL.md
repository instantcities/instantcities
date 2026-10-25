---
name: facadinator
description: Colour Ghent's house fronts after the real ones, street by street, from Mapillary photos (tools/facadinator.mjs: street.mjs, looks.mjs → ghent/looks.js), keep the city-wide to-do list (tools/streets/ghent/TODO.md) up to date, and prove each street with photo vs game before/after pictures. Use when Wouter asks to do a street or a wijk ("doe Malem", "more streets"), to colour fronts from photos, for the facade to-do list, or for the Facadinator.
---

# Facadinator

## Goal

Every ordinary house front in the game should have its real wall colour (and, now and then, its
real kind: shop, block of flats, stone), read off Mapillary photos, instead of one picked by a
hash. Done once per street, kept in `ghent/looks.js`, and worked through the whole city with
`tools/streets/ghent/TODO.md` as the list. Hand-drawn fronts (`ghent/fronts.js`, the specs in
`ghent/streets.js`) are better than any photo colour and are left alone.

## How it fits together

- `ghent/looks.js`: `{ street slug: { "x,z": { id, c, t?, hand? } } }`. The key is the middle of the
  building's outline in `ghent/map.js` (the average of its corners, to 0.1 m), so it survives a
  map rebuild that renumbers buildings. `c` is the wall colour; `t` (`house` / `shop` / `block` /
  `stone`) overrides the game's guess; `hand: true` means fixed by eye, never sampled again.
  Written by `tools/looks.mjs`: re-run it rather than editing by hand, except to fix one front.
- `core/js/scenery.js` (`osmBuildings`, `photoWall`): a building found in `LOOKS` uses that colour,
  in steps of 16 so alike houses share a texture. The palette (Ghent's `GENT_WALLS`, or a
  quarter's own, `QUARTERS` in `ghent/city.js`) only decides brick or plaster; red-brown is brick.
- `tools/streets/ghent/<slug>/street.json`: the street's fronts (where, how wide, which way) and the
  photos showing each, with the slice of the photo each front fills. Checked in. The photos beside
  it (`photos/`) are not, since #128 (`.gitignore`; about 2 MB a street), except the streets done
  before that.

## Before starting: can this session reach Mapillary?

`tools/street.mjs` needs `MAPILLARY_TOKEN` (in `.env` on the desktop, kept out of git; in a cloud
session an environment variable) and network access to `graph.mapillary.com` and Mapillary's image
hosts. Check with `curl -sS -o /dev/null -w '%{http_code}' https://graph.mapillary.com/`. If it is
blocked or there is no token, say so and point Wouter to the cloud environment's settings (never
ask for the token in the chat). Everything after the fetch (sampling, the to-do list, the
pictures) works offline on photos already on disk.

## One street

`node tools/facadinator.mjs ghent "<Street name>"` does steps 1, 2 and 4 in one go (and makes
Node's fetch use the HTTP proxy in a cloud session). Then check its work as below; the steps
separately:

1. **Fetch:** `node tools/street.mjs ghent "<Street name>"` (the name as on the map; `--dry` lists
   the fronts only, `--n 3` photos per front, `--reach 14` how far from the street's middle line a
   front may stand). Where no flat photo looks at a front it cuts a view out of the nearest
   panorama. Long roads (Rooigemlaan, the steenwegen) are slow and mostly cross other wijken: do
   them last, or only the stretch that is in the wijk being done.
2. **Sample:** `node tools/looks.mjs ghent <slug>` writes the street into `ghent/looks.js` and a
   contact sheet, `tools/cache/looks/ghent-<slug>.jpg`: every photo with the box it sampled and
   the colour found under it. Read the sheet. A box on a car, a tree, a shop window or the
   neighbour's house gives a wrong colour: fix that front in `looks.js` by hand with
   `"hand": true`, or leave it out. Set `t` by hand where a front is plainly a shop or a block.
3. **Prove it:** with `python3 serve.py` running, `node tools/lookshots.mjs ghent <slug> <photo id>...`
   renders the game from where each photo was taken, without and with `looks.js`
   (`tools/cache/lookshots/<id>-before.jpg`, `-after.jpg`). Pick 2–4 photos with telling colours
   (painted houses, brick next to plaster) and put each photo beside its two renders in one grid.
   It is a headless browser (see CLAUDE.md): one run at a time, a few photos, nothing left
   running. Where three.js can't come from the CDN (a sandbox), unpack `three@0.170.0` from npm
   and set `THREE_DIR` to it.
4. **Update the list:** `node tools/todo.mjs ghent` rewrites `TODO.md` from what is on disk. Tick
   the street (`- [x]`) once its sheet and pictures look right; ticks are kept between runs.
5. **Heights:** `node tools/heightcheck.mjs ghent "<street>"` (the Facadinator runs it last) lists
   fronts two storeys or more lower than the street around them. In a city of row houses those are
   most likely wrong in the map; check them in the photos and name them in the PR. Without a
   street it sweeps the whole city into `tools/streets/ghent/HEIGHTS.md`.

## The to-do list and the wijken overview

`tools/streets/ghent/TODO.md`, written by `tools/todo.mjs`, is the place to start. On top, the
city's total and an overview of the wijken on the map: per wijk its streets and house fronts, how
many are done (coloured from photos, drawn by hand), and what is modelled in it on purpose: 3D
landmarks (`landmarks.js`), squares with their own paving and walls (`squares.js`), monuments
(`monuments.js`), tour sights (`sights.js`), places named on the big map (`famous.js`), and how
many houses stand in a quarter with its own kind of front (`QUARTERS`). Then, per wijk, every
street with house fronts on it, biggest first, with how many fronts it has and its state (`todo`,
`photos`, `no photos`, `partial`, `sampled`, `hand-drawn`). Read it to choose what is
next: Wouter's wijk if he names one (Malem is in Brugse Poort – Rooigem), else finish the wijk
furthest along. Re-run it after every street and commit it with the street.

To see it on a map, `node tools/donemap.mjs ghent` draws every building from above
(`tools/cache/donemap-ghent.jpg`): fronts coloured from photos in their wall colour, the ones drawn
by hand in gold, the rest dark grey. `--around x,z --size 1500` zooms in on one part of the city.

The wijken come from `tools/streets/ghent/wijken.json`: a few anchor streets well inside each of
Ghent's 25 wijken. Each house goes to the wijk of the nearest anchor and a street to the wijk most
of its houses are in, so near a border a street can land in the neighbouring wijk. Move it by
adding it (or a street next to it) to the right wijk's anchors. Long roads make poor anchors. The
official boundaries (data.stad.gent) could replace the anchors if they can be downloaded.

## Commit and PR

One PR per street or batch of streets (a wijk at a time is fine): `ghent/looks.js`, the streets'
`street.json` and `tools/streets/ghent/index.json`, `TODO.md`. CLAUDE.md sets the description: per
street a heading with its name and progress (fronts coloured out of the street's fronts, and the
city total as `tools/todo.mjs` prints it), with screenshots of that street in the game under it
(a few views, from one light headless browser), plus anything fixed by hand. The screenshots go on
their own `pr<number>-screenshots` branch (an orphan, kept out of the PR's diff; push it from a
`git worktree` so the working branch is left alone) and are linked as
`https://github.com/instantcities/instantcities/blob/pr<number>-screenshots/<name>.jpg?raw=true`. A
photo vs before/after grid from `lookshots.mjs` is a good extra for a street where the colours
changed a lot. Give the Netlify preview link (CLAUDE.md), with `?pos=x,z` to ride straight to the
street. Never merge without Wouter saying so.

## Not the quality tour

The `quality-tour` skill is a different job: it looks for things that are broken along the tour's
route (blank walls, holes between houses, floating props, the camera going through a building)
from pictures the game takes while Wouter plays the tour, and fixes them. The Facadinator makes
ordinary, working house fronts look like the real ones, street by street, all over the city. A
quality tour can turn up a wrong colour; this is how a street then gets its real ones.

## Things learnt

- Mapillary photos are dark and grey on a dull day: brick reads grey-brown, a blue wall grey-blue.
  `looks.mjs` lightens by at most 1.35× and pushes colours away from grey; if a whole street comes
  out pale or grey on its sheet, look there first.
- Snapping to the 10 palette colours threw the real colour away (no blue at all), which is why the
  colour is now used as read. Check the before/after pictures for exactly that kind of loss.
- `tools/img.mjs` reads photos with macOS `sips`, and with ImageMagick's `convert` elsewhere; the
  two decode a colour or two apart, so a re-run on another machine moves `looks.js` by that much.
- In `lookshots.mjs` the near plane stops just short of the front, to leave out the parked cars
  between the camera and the kerb; the street in front goes with them, which is expected.
