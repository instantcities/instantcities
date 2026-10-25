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

## The other cities' landmarks

The other cities have no open 3D scan like Gent in 3D, so their landmarks are modelled by hand, the
way the Colosseo is (`rome/colosseo.js`): a monument in the city's `MONUMENTS`, with the map's
pieces of it under its `area`, its outline as its `foot`, and a `reach` so it goes up only when it
comes into sight. `core/js/arcade.js` has the parts that come back in landmark after landmark:

- a path (`ellipsePath`, `linePath`), with everything placed along it in (s, o, y): metres along
  it, out from it and up. Rings that are offsets of one path keep their bays in line.
- `wall`: a wall along the path with holes cut through it, `sweep`: a moulding, a slab or a slope
  of seats along it, `fin`: a wall across it, `column`: a column in one of the orders.
- `arcade`: bays of arches in storeys, with their columns, entablatures, attic windows and
  brackets, and `stand` for a ruin (storeys gone, or broken off through their arches).
- `square`, `polygon`: the sides of a tower (square, or an octagon) as paths, each with its outside
  to its right, `archRing` and `pointedRing`: a round or a Gothic arch's opening, to cut through a
  wall or to lay on it as a panel.
- `onMap` and `rect`: a ring in the model's own metres placed on the map at the monument's x, z and
  turn, for its `area`, `foot` and `paths`.

Built on it so far, each in its city's folder and listed in its `city.js`:

| City | Landmark | File | Riders |
| --- | --- | --- | --- |
| Rome | Colosseo | `rome/colosseo.js` | bump into its outer wall |
| Rome | Arco di Costantino | `rome/arco.js` | go through its three arches |
| Florence | Loggia dei Lanzi | `florence/loggia.js` | bump into it (it stands on its steps) |
| Berlin | Brandenburger Tor | `berlin/tor.js` | go through its five passages |
| Venice | Campanile di San Marco and the Loggetta | `venice/campanile.js` | bump into both |
| Copenhagen | Rundetårn | `copenhagen/rundetaarn.js` | bump into it |
| Prague | Prašná brána | `prague/prasna-brana.js` | ride through it along Celetná |
| London | Elizabeth Tower (Big Ben) | `london/elizabeth-tower.js` | bump into it |
| Paris | Tour Saint-Jacques | `paris/saint-jacques.js` | bump into it |
| Paris | Tour Eiffel | `paris/eiffel.js` | ride in under it between its legs |
| Barcelona | Monument a Colom | `barcelona/colom.js` | ride round its steps |
| Bruges | Belfort | `bruges/belfort.js` | bump into it, short of the Markt's footway |

The Eiffel Tower is not built on the arcade generator but of rods (`Kit.rod`): each leg a lattice
box of four chords braced in crosses, following the tower's curve from its measured widths at each
floor. Paris's map was stretched west along the Seine to the Champ de Mars for it.

They were drawn from their measurements and from memory of photos, without Mapillary or Commons
photos at hand: with those, their details (the reliefs, the statues, the tracery) can be sharpened.
The Belfort stands without the Halle behind it, which the map does not have as a building; the
Loggia, the Campanile, the Elizabeth Tower and the Colom drop the map's footways drawn across them.

Next in line: St Peter's colonnade (an arc of Tuscan columns), the arcades round Piazza San Marco,
the Arena of Verona, the Roman theatre of Lecce, the Pont Saint-Bénezet in Avignon (its arches
broken off in the Rhône, but the map has a footway along it at the water's level: the deck would
have to be lifted with it, a map fix of its own).
