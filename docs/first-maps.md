# First maps: Rome, Paris, Amsterdam, Venice, Barcelona and London

Six cities went from "coming soon" to playable in one go, each with a small piece of its centre
(about 1.5 by 2 km), one race and free riding. They were made the way Lecce was
(`docs/lecce-exercise.md`), from OpenStreetMap only, with no quests, sights, monuments or fronts yet.

| City      | Piece of the centre                                   | Race                                     | Buildings |
|-----------|--------------------------------------------------------|------------------------------------------|-----------|
| Rome      | Piazza Venezia, Via del Corso, Pantheon, Navona, up to the Colosseum | `romacentro`, loop, 3.0 km | 6,093 |
| Paris     | Île de la Cité, Hôtel de Ville, Rue de Rivoli, Louvre  | `cite`, loop, 2.8 km                     | 5,566 |
| Amsterdam | Dam, Singel, Spui, Rokin, Westerkerk to Nieuwmarkt     | `grachten`, loop, 1.7 km                 | 7,915 |
| Venice    | San Marco, Mercerie, Rialto                            | `mercerie`, open (start to finish), 0.9 km | 2,537 |
| Barcelona | Plaça de Catalunya, Rambla, Barri Gòtic, Colom         | `rambla`, loop, 4.2 km                   | 4,367 |
| London    | Trafalgar Square, Whitehall, Westminster, Embankment   | `westminster`, loop, 2.3 km              | 2,648 |

## How each one was made

1. `area.json`: a bbox round the piece of the centre, the same four corners as `zone_points` (so
   the whole box is kept, not only what lies near the route), `floors`, `hw`, and for the flat-roofed
   towns `"roofs": "flat"`.
2. The download (`node tools/osm_map.mjs <city> --fetch`). Overpass was busy every time; the tile
   fallback took 15 to 40 s a city.
3. The route. Picking street names by hand with `tools/routecheck.mjs` is slow, so a throwaway
   helper found a shortest loop through a few landmarks along the named streets and printed its street
   names. That worked straight away for Rome, Paris, Barcelona and London. In Amsterdam and Venice
   every bridge and lock has a name of its own, so a loop there is dozens of short legs; Amsterdam's
   was written by hand (Dam, Paleisstraat, Singel, Spui, Rokin) and Venice's is an open route along
   the Mercerie.
4. `node tools/crossings.mjs <city>` and `node tools/furniture.mjs <city>`; no `transit.mjs`, so
   no buses or stops yet.
5. `city.js` (the look, the weathers, the names on the big map), `races.js`, `page.json` and
   `loader.html` (a skyline with the city's landmark), then `node tools/pages.mjs <city>`.

## What changed in the shared code

- **No stepped gables outside Flanders and Amsterdam**: old houses (heritage-tagged) got a Flemish
  stepped gable everywhere. `"gables": false` in `area.json` turns that off; Paris had 50 of them.
- **Traffic on the left**: `THEME.left` (London) puts the cars on the left of the street.

## Rough edges to pick up next

- The big landmarks are OpenStreetMap boxes: the Colosseum, Notre-Dame, St Mark's, Big Ben and the
  Sagrada Família (not on the map) need models or fronts, as Lecce's monuments did.
- Venice has no water traffic, and its calli are narrower than the race (`hw` 2.6), so some house
  corners along the Mercerie are cut back.
- Amsterdam's big buildings on the Dam get the grey stone look; its canal houses are fine.
- The traffic lights in London still stand for traffic on the right.
- No quests, no sights cards and no tour yet. The "Missions" tab only has free exploring.
