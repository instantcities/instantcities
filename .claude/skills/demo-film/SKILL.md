---
name: demo-film
description: Make or change the game's demo film / trailer (the minute or so of tour shots and game shots behind the menu's 🎞️ Trailer card), try shots, and film it to an mp4 with the music. Use when Wouter asks for the trailer, the demo film, a "demo movie", to add or change a shot in it, or to render a new video of it.
---

# Demo film

The trailer is a script, like the tour: `ghent/demo.js` (`DEMO`), a list of shots played one after
the other, each fading to black and back in a flash, to the tour's music. `core/js/demo.js` plays
it (and plays player 1 in the game shots); `core/js/main.js` sets each shot up (`startDemo`).
The comment at the top of `ghent/demo.js` lists everything a shot can have; in short:

- `tour: [x, z]` a stretch of the tour from that point of its path (`welcome`, `speed`, `cards`, `pre`)
- `quest: id` a quest from quests.js (`mount`, `pre`, `tired`, `behind`, `steady`)
- `race: id` a race from its countdown; `explore: { at, look, mount }` riding about (`car: 'police' | 'bus'`)
- `drive`: who plays it: `'chase'`, `'shoot'`, `'race'`, `'heli'` (`turn`), or `[[x, z], ...]` points
- `for` seconds, `name` (its part of the bar at the top), `title` / `sub` (`*Gent*` in light blue),
  `pace` (game speed in that shot); and `fade`, `fadeIn`, `brand`, `music` for the whole film

## 1. Watch it

- In the game: menu → Tour → 🎞️ Trailer (Esc or ✕ stops it; the bar at the top jumps to a shot).
- A link: `http://localhost:8321/ghent/play/?demo` (`python3 serve.py`), click to start; `&shots=7-9`
  plays only those shots (numbered from 0).

## 2. Try a shot without filming

Shots from the game itself depend on traffic and the player's autopilot, so check a changed shot
before filming the whole thing. Quick and light, every 15th picture of some shots:

    node tools/demo.mjs ghent --shots 7-9 --every 15 --no-video --width 640

Pictures land in `tools/cache/demo/ghent/`; look through them (a contact sheet:
`ffmpeg -i tools/cache/demo/ghent/%05d.jpg -vf "scale=320:-1,tile=8x8" -frames:v 1 sheet.jpg`).
Things to check: the thief is caught ("GEVANGEN!"), the helicopter's winch finishes before the cut,
the horse gets into the water and becomes a boat, the bike comes off in the rails.

## 3. Film it

    node tools/demo.mjs ghent --window          # on a laptop: a Chrome window, on the graphics card
    node tools/demo.mjs ghent                   # headless, on the CPU (a cloud container: ~2 hours)

It steps the game a frame at a time (30 fps, 1280x720; `--fps`, `--width`, `--lang en`) and takes
a picture of each, then ffmpeg puts the music under it: `tools/cache/demo/ghent.mp4`. With
`--window` leave the window alone until it closes. Needs Playwright (`npm i -g playwright`) and
ffmpeg (`brew install ffmpeg`). Headless rendering is what makes a laptop run hot (CLAUDE.md): on
a laptop use `--window`.

## 4. Share it

The video goes on a branch of its own, out of any pull request's diff, as the screenshots do:
`pr<number>-video` with `demo/ghent.mp4`, linked as
`https://github.com/instantcities/instantcities/blob/pr<number>-video/demo/ghent.mp4?raw=true`.
