# Real-world maps: what's there and what's next

## What's there

- **One builder, `tools/osmbuild.mjs`**, run by `tools/osm_map.mjs`. It turns OpenStreetMap data
  plus routes (each a list of street names in riding order) into one map file holding them all
  (`map.routes`), clearing buildings off every raced street. It replaced the
  old Python script and gives the same Brugse Poort map (24 of 5511 buildings get an equivalent
  roof box from near-square tie-breaks). Every route street is ridden for at least 25 m, so a
  street can't be skipped at a junction its neighbours share.
- **Downloading, `tools/osmfetch.mjs`**: Nominatim finds the town; Overpass finds the route streets
  and then the area around them. Overpass is often busy, so after a timeout it falls back to
  Nominatim street by street and to the main OSM API in tiles.
- **One file per built-in area**, `tools/areas/<id>.json`: the town and the route are enough; the
  bounding box is worked out and written back.
- **Tracks from a map, `js/realtrack.js`**: the shared look of real neighbourhoods, and items and
  obstacles placed to suit the one-way stretches (lone cars and planters only where the street is
  two-way).
- **Towers**: OSM `height`, `min_height` and `building:part` are used, so the Belfort,
  Sint-Baafs and Sint-Niklaas stand at their real height in stone, with a spire on the slim
  towers. A building split into parts is drawn from its parts.
- **Bridges and water**: OSM's `bridge=yes` streets lie level with the street, on railings. The
  ones the area's `bridges` calls `arched` stand 3 m above it, arched a little, and the streets onto
  them climb over the last 28 m (`road.y`, a height per point; `road.br` for the bridge itself,
  which gets parapets). A route over a bridge climbs too (`map.rise`). In the
  game `js/relief.js` gives the height under a rider: streets passing under a bridge stay low. The
  canals and the river lie 1 m below the streets between quay walls, through a hole in the ground
  (a stencil mask), and a horse wades in them up to its belly.
- **Ghent's look**: streets tagged `surface=sett`/`cobblestone` are cobbled (`road.c`, and
  `map.sett` per route point for the raced street). `railway=tram` ways become rails set in the
  street with the contact wire overhead on poles (`map.trams`). Houses take Ghent's colours (dark
  brick, whitewash, sandstone, Doornik blue-grey, slate roofs), or their own `building:colour` and
  `roof:colour`; `roof:shape=flat` gets no ridge. Old houses (`heritage=*`, or a Gothic, Renaissance
  or Baroque `building:architecture`) turn their steep gable end to the street behind a stepped
  gable (`b.sg`). Tour boats go up and down the river and the canals, steps lead down the quay
  walls where a quiet street or footpath runs along the water, and the cafés on a square set out
  rows of tables under parasols.
- **Measured heights (Flanders)**: an area with `"heights": "dhmv"` gets every building's real
  height from Digitaal Vlaanderen's height model DHMV II (1 m surface minus 1 m ground, flown
  2013-2015, open WCS; `tools/dhmv.mjs`, cached in `tools/cache/<id>-dhmv.bin`, 170 MB for the
  R40). The builder samples it every metre inside each building's walls: the walls go up to the
  eaves (`b.e`), a pitched roof up to its ridge (`b.t`), its ridge the way the heights fall
  away, and flat roofs where the roof doesn't rise. The 3D GRB itself is only LoD1 blocks (made from
  the same model), not LoD2, so the height model is the better source.
- **Gent binnen de R40**, now the game's only map, with the Gent Centrum and Brugse Poort routes
  in it (they were separate maps before). The whole ring: 26,331 buildings, 5.5 MB (1.4 MB gzipped), about 3 s to
  build at the start of a race and above 100 fps on a Mac in split screen. Phones would need the
  city drawn in tiles, so only the nearby ones are drawn (about 14.6M triangles a frame now).

## What's next

1. **A `/new-route` skill**: add a route to the area file, rebuild, register the track,
   screenshot.
2. **Real roof shapes**: the height model has every roof to the metre; hipped roofs, L-shaped
   houses and dormers could come from it too (fit roof planes per building), and the Flemish
   orthophotos could texture squares and parks.
3. **Ground height**: apart from the bridges and the water the game is flat. Ghent's centre
   barely climbs, but hillier towns would need terrain (OSM has no heights; it would need an
   elevation source such as Terrarium tiles, or the DHMV ground model in Flanders).
