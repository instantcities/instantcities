# Lecce: a second city, to test how far the procedures stretch

Goal: do the whole Ghent exercise again for the centre of Lecce (Puglia, Italy), in
`game/js/cities/lecce/`, and write down every place where the tools or the game turned out to be
Ghent-only. Play it at `/game/?city=lecce` (Ghent stays the default).

## Running log

1. **Picking the city.** `js/city.js` was one hard-coded line (`export * from './cities/gent/city.js'`).
   Now it reads `?city=` and imports that folder with a top-level `await import()`, and re-exports a
   fixed list of names. Every city's `city.js` has to export all of them (an empty list for what it
   lacks).
2. **Download.** `area.json` with the city, a bbox round the ring of viali (Viale dell'Università,
   Viale Gallipoli, Viale Lo Re, Viale Otranto, Viale Cavallotti, Viale XXV Luglio, Viale De
   Pietro, Viale Calasso) plus the station, and zone points. `node tools/osm_map.mjs lecce --fetch`
   worked first time: Overpass timed out and the tile fallback took 36 tiles (17 MB cache).
3. **Routes were trial and error.** The builder only says "do not meet" (fine, it names the pair) or
   "does not join into a loop" (no hint which leg). Two things bit:
   - consecutive streets must share an OSM node, so the gates (Porta Rudiae, Porta Napoli) need
     the little connector streets named (Via Adua, Piazza Vittorio Aymone);
   - a street split into several unconnected ways (dual carriageway viali, Piazza Sant'Oronzo,
     Viale XXV Luglio) can make a leg impossible.
   I wrote two throwaway helpers for this (street adjacency, and per-street connected components):
   worth turning into a `tools/routecheck.mjs`.
   Result: **Lecce Centro** loop, 2668 m (Sant'Oronzo, Duomo, Porta Rudiae, Porta Napoli, Santa
   Croce) and the open route **Stazione → Sant'Oronzo**, 2540 m.
   3914 buildings, 1 MB map (Ghent: 26k buildings, 8.8 MB).
4. **First load works.** No errors: the game ran with all of Ghent's extras as empty lists
   (landmarks, facades, squares, crossings, transit, furniture). Ghent things that still showed:
   the title "Instant Gent" and its tagline ("Arteveldestad"), and snow.
5. **Lecce's old town came out nearly empty: the builder dropped multipolygon buildings.** Most of
   the centro storico is mapped as `type=multipolygon` relations (whole blocks), Ghent as plain
   ways. `fromElements` only kept ways and Overpass only asked for ways. Fixed in the shared tools:
   Overpass now also asks for multipolygon relations of the same kinds, and `fromElements` turns
   each into one way per outer ring with the relation's tags (holes left out). 3914 → 4302
   buildings, but the added ones are the big blocks of the old town. Ghent's map is unchanged
   until it is downloaded again (its cache has no relations in it).
6. **Ghent's look was hard-coded in `js/scenery.js`** (brick and whitewash walls, slate roofs,
   doors, the grey Gothic stone of churches, the colour of flat roofs, spires on every slim tower).
   A city can now export `LOOK` (`walls`, `bigWalls`, `roofs`, `doors`, `shutters`, `stone`,
   `flatRoof`, `spires`); without it Ghent's colours stay. Lecce: pietra leccese in honey and
   cream, green and brown louvred shutters with little balconies, flat pale roof terraces, bell
   towers without a spire. New area options in the builder: `"roofs": "flat"` (pitched only where
   OSM says `roof:shape`) and `"floors": 3` (the most storeys guessed for a building without
   `building:levels`; Lecce is lower than Ghent).
7. **Weather**: snow was one of the random skies; a city's `THEME.weathers` can now leave it out.
8. **The game's name**: "Instant Gent" and the Arteveldestad tagline were in `i18n.js` and the HTML.
   A city can export `WORDS` (per language: `title`, `tag`, or any other i18n key) that win over the
   shared words; `applyStatic` puts the title in front of the BETA badge and in `document.title`.
   The landing page (Jekyll) and the HTML `<meta>` tags still say Gent: left alone.
9. **Crossings, transit, furniture**: `tools/crossings.mjs`, `tools/transit.mjs --fetch` and
   `tools/furniture.mjs` ran on Lecce unchanged (40 lights, 887 crossings, 65 bus stops, 4 bus line
   stretches, 98 pieces of furniture). The bus stops and buses still look like De Lijn's.
10. **Route tooling**: `tools/routecheck.mjs <city> --route <id>` (or street names) shows for each
    street its kinds, oneway tags, how many unconnected pieces it is in and which streets it meets,
    and whether each pair in riding order meets. The builder's "does not join into a loop" error now
    names the street it could not get along.
11. **Content by Sonnet agents**: `sights.js` (10 sights, four languages) and `quests.js` (four
    quests: the stolen cartapesta Sant'Oronzo, the last train to Bari, pasticciotti among pizzica
    dancers, and getting past the Sant'Oronzo procession). The quest engine had Ghent's props
    built in (the thief always carried the Mystic Lamb, the collect quest always laid out student
    caps among vomiting students); a quest def now picks `loot` ('painting' | 'statue'), `item`
    ('cap' | 'pasticciotto'), `look` ('students' | 'pizzica') and `icon` (the counter's emoji).
    The shared "watch out, they'll be sick" lines are overridden per city through `WORDS`.
12. **The old town's blocks were dropped wherever a corner reached into the raced street** (39 of
    them, so Via Vittorio Emanuele II ran between empty lots). The builder now pulls the corners of
    a big outline (over 400 m²) back to the kerb instead, and only drops it when the route runs
    through it: 5 dropped. Lecce's raced streets are narrower too (`hw` 3.6 in area.json and races.js,
    Ghent 4.5); the two must match.
13. **Pedestrian streets got parked cars** because Lecce tags its pedestrian lanes `oneway=yes`
    and the builder parks cars along every one-way stretch. Now a pedestrian/footway is never
    one-way for parking.
14. **Every raced street was asphalt with a centre line.** The builder marks `surface=paving_stones`
    (and stone, flagstone) as slabs (`road.c = 2`, route `sett` 2), drawn as big pale slabs
    (`slabTexture`, in the theme's paving colour) on the route and off it.
15. **Big outlines got the office-block texture** (bands of wide windows), which suits flats in
    Ghent but not a block of terraced houses mapped as one outline; `LOOK.houseBlocks` gives them
    house fronts.
16. **Monuments and fronts by hand** (Sonnet agent): the Colonna di Sant'Oronzo (37 game metres,
    the bronze bishop on top), the Obelisco, and Porta Napoli as a triumphal arch the race rides
    through; the fronts of Santa Croce, the Duomo (its piazza side) and the Palazzo dei Celestini.
    Two small engine additions: a front can pick its stretch of wall by hand (`line`, as church
    outlines are many short edges) and a monument can collide as several rectangles (`solid`, so
    riders pass between a gate's piers). Rough edges: Santa Croce's box from OSM is 20 m high over
    its whole outline and a stub of it shows beside the front; the Celestini's roof overhangs.
    Fronts are matched by `at`, so re-check them if `map.js` is rebuilt with a different outline.
17. **Menu switch**: a 🏙️ Gent / Lecce chip on the menu (each city is its own page, `?city=`, as
    the whole world is built for one city at the start).

## What it took, in short

Worked straight away, unchanged: downloading (Overpass, with the tile fallback), the route
builder itself, crossings, transit, furniture, the race tracks, free roam, the minimap, the big
map's teleport places, sights cards, the quest kinds.

Had to become per city (all optional, Ghent keeps its defaults): which city is played
(`?city=`), the look of the houses (`LOOK`), the weathers, the game's name and any words
(`WORDS`), the quest props (`loot`, `item`, `look`, `icon`).

Real fixes in the shared builder, which any new town would have needed: multipolygon buildings,
big blocks trimmed back to the kerb rather than dropped, no parking on pedestrian streets,
stone-slab paving, flat-roof towns and lower guessed heights, a clearer route error and
`tools/routecheck.mjs`.

Still Ghent-only, left alone: the 3D landmark pipeline (`tools/gent3d.mjs`, Stad Gent's LoD2
data) and the measured heights (`dhmv`, Flanders only), so Lecce's heights are guessed from
`building:levels` or the area; the De Lijn look of buses, stops and trams; the stepped gables;
the landing page and the page's `<meta>` tags; the settings in localStorage are shared between
the cities.

Rough time: the map, routes and wiring took about an hour; the look and the builder fixes
another; the content (sights, quests, monuments) ran in parallel in three Sonnet agents.

## Afterwards: a folder per city

Lecce at `/game/?city=lecce` felt like a guest in Ghent's game. Now each city is a folder at the
top of the site with its own address, `/ghent/` and `/lecce/`, and the game they share is in
`core/`. A city's page maps the bare module name `city` to its own `city.js` (an import map), so
the engine never names a city and needs no `?city=`. The pages themselves are made from the
templates in `core/` by `tools/pages.mjs`, with each city's words (name, title, what shares show)
from its `page.json`, which also ends the Ghent `<meta>` tags on Lecce's page. `/game/` sends
visitors on to `/ghent/` (or `/lecce/`) and removes its old offline copy.

## Then: making Lecce look Italian

- **House fronts**: a city's `LOOK.style: 'italian'` draws every house, shop and palazzo with
  `core/js/italian.js`. That means stone quoins at the corners and a deep cornice under the roof
  terrace. Tall windows sit in stone frames under triangular or curved pediments, with persiane
  open or shut. The first floor (the piano nobile) gets wrought-iron balconies. The ground floor is
  rusticated, with an arched portone and a small barred window. The fronts are drawn at twice
  Ghent's resolution, as the railings are fine, and neighbours get different variants.
- **The loading screen per city**: its scene moved out of `core/game.html` into each city's
  `loader.html`. Lecce's skyline shows houses with roof terraces and balconies, Porta Napoli,
  Santa Croce with its rose window, the Duomo's bell tower, the Sant'Oronzo column and a palm. The
  runner carries the papier-mâché saint, chased by the cop.
- **The colours per city**: the sky, the skyline and the menu's see-through card are CSS variables
  now. A city's `page.json` can set them with `style`, as it already could the accent. Lecce is
  light sand with brown in place of Ghent's blue.
- **No city switch in the game** any more: each city is reached by its own address.
