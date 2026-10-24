# Landmarks: open todos

The landmarks modelled by hand on their outlines: Gent-Sint-Pieters and Gent-Dampoort
(`ghent/stations.js`), De Krook (`ghent/krook.js`) and the Dulle Griet (`ghent/monuments.js`).
They were drawn from Wikimedia Commons photos (`node tools/photos.mjs ghent <id> ...`); there was
no `MAPILLARY_TOKEN` on hand, so with a token the Mapillary photos can sharpen them further.

## Gent-Sint-Pieters

- Long beige blocks with rows of windows stand along the tracks east of the big roof (around
  x −1005, z 2495). They are not map buildings and not part of the station model: they belong to
  one of the city's batched meshes (a mesh of 160k vertices in the scenery group). Find out what
  draws them (street fronts along the platform footways?) and keep it off the yard.
- The big roof over the middle of the platforms is a plain flat slab: give it its skylight
  strips and lighter steelwork, and make it thinner.
- Riders cannot step up onto the platforms (the relief only lifts them onto bridges), so the
  platforms are solid blocks for now. Ramps or a raised relief would let you ride along them.
- The tracks stop where they leave the yard, as the streets that pass under them are at street
  level in the flat map (Kortrijksesteenweg in the east, the tram tunnel in the west).

## Gent-Dampoort

- The tracks lie on an embankment in reality and the streets under them (the *doorgangen*) pass
  underneath; in the game the yard simply ends north of the station.
- Check the four pillars' lettering faces the forecourt, and the plinth under them.

## De Krook

- It comes out too dark and boxy: lighter glass that reflects the sky, lighter bronze louvres
  standing further out (four bands a storey rather than three), thinner floor edges.
- The real floors step back and forth more, and the top floors split into separate volumes.

## Dulle Griet

- It lies against the plain side wall the map draws for the house behind it. That house's real
  front is brick, so it would deserve a front spec of its own (`ghent/streets.js`).

## Building them lazily

- Main now puts monuments up only as they come into sight (`place()` in `core/js/landmarks.js`,
  with a monument's `reach`). The two stations still build their whole model when
  `ghent/stations.js` is imported, as their `area` and `foot` come out of the same build. Split
  the outlines from the geometry, so the stations' meshes wait until they come into sight too.
