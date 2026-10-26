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
| Rome | Pantheon | `rome/pantheon.js` | ride in under the porch between the columns, up to the doors |
| Rome | Fontana di Trevi | `rome/trevi.js` | bump into the front, the rocks and the basin's rim |
| Rome | Colonna di Marco Aurelio | `rome/colonna.js` | bump into its pedestal |
| Rome | Vittoriano | `rome/vittoriano.js` | bump into it from the foot of its steps |
| Rome | Foro Romano: the Curia Iulia, the Arco di Settimio Severo, the temples of Saturn, Vespasian, the Dioscuri, Vesta, Antoninus and Faustina and Romulus, the Colonna di Foca, the Basilica di Massenzio, and the rest of its ruins | `rome/foro.js` | bump into the ruins, ride through the arch's three arches and in under the basilica's vaults |
| Rome | Piazza Navona: the Fontana dei Quattro Fiumi, the Fontana del Moro, the Fontana del Nettuno, Sant'Agnese in Agone | `rome/navona.js` | bump into the basins' rims and the church's front |
| Rome | The temples of Largo di Torre Argentina | `rome/argentina.js` | bump into the podiums and the railing, which has two ways in |
| Florence | Loggia dei Lanzi | `florence/loggia.js` | bump into it (it stands on its steps) |
| Florence | Santa Maria del Fiore (the Duomo) | `florence/duomo.js` | bump into it |
| Florence | Campanile di Giotto | `florence/campanile.js` | bump into it |
| Florence | Battistero di San Giovanni | `florence/battistero.js` | bump into it |
| Florence | Palazzo Vecchio and its tower | `florence/palazzo-vecchio.js` | bump into it |
| Florence | Uffizi | `florence/uffizi.js` | ride up the Piazzale between its wings, bump into the portico's columns |
| Florence | Ponte Vecchio | `florence/ponte-vecchio.js` | ride over it between the shops |
| Florence | Santa Croce and its bell tower | `florence/santa-croce.js` | bump into it, the tower and Dante |
| Florence | Santa Maria Novella and its bell tower | `florence/santa-maria-novella.js` | bump into it |
| Florence | Porcellino | `florence/porcellino.js` | bump into his plinth |
| Berlin | Brandenburger Tor | `berlin/tor.js` | go through its five passages |
| Venice | Campanile di San Marco and the Loggetta | `venice/campanile.js` | bump into both |
| Venice | Basilica di San Marco | `venice/basilica.js` | bump into it |
| Venice | Palazzo Ducale | `venice/ducale.js` | bump into it |
| Venice | Ponte di Rialto | `venice/rialto.js` | ride over it, through the portico (the map's level deck) |
| Venice | Ponte dei Sospiri, Torre dell'Orologio, the Piazzetta's columns, the flagpoles | `venice/piazza.js` | ride through the clock tower's arch |
| Venice | La Fenice's front | `venice/fenice.js` | ride past it |
| Copenhagen | Rundetårn | `copenhagen/rundetaarn.js` | bump into it |
| Prague | Prašná brána | `prague/prasna-brana.js` | ride through it along Celetná |
| London | Elizabeth Tower (Big Ben) | `london/elizabeth-tower.js` | bump into it |
| London | Houses of Parliament | `london/parliament.js` | bump into it |
| London | Westminster Abbey | `london/westminster-abbey.js` | bump into it |
| London | Westminster Bridge | `london/westminster-bridge.js` | ride over the map's deck, as before |
| London | London Eye | `london/london-eye.js` | bump into the feet of its legs |
| London | Horse Guards | `london/horse-guards.js` | ride through its arches into the courtyard |
| London | No. 10 Downing Street (its front) | `london/downing-street.js` | bump into the railings |
| London | National Gallery | `london/national-gallery.js` | bump into it and the portico's podium |
| London | Nelson's Column | `london/nelson.js` | bump into its steps and the lions' plinths |
| Paris | Tour Saint-Jacques | `paris/saint-jacques.js` | bump into it |
| Paris | Tour Eiffel | `paris/eiffel.js` | ride in under it between its legs |
| Paris | Notre-Dame | `paris/notre-dame.js` | bump into it |
| Paris | Sainte-Chapelle | `paris/sainte-chapelle.js` | bump into it |
| Paris | the Conciergerie's towers and the Tour de l'Horloge | `paris/conciergerie.js` | bump into them |
| Paris | Hôtel de Ville | `paris/hotel-de-ville.js` | bump into it |
| Paris | Centre Pompidou | `paris/pompidou.js` | bump into it |
| Paris | Pont Neuf and Henri IV | `paris/pont-neuf.js` | ride over it (the map's deck) |
| Paris | Palais du Louvre and the Arc du Carrousel | `paris/louvre.js` | ride into the Cour Carrée and through the Guichets |
| Barcelona | Monument a Colom | `barcelona/colom.js` | ride round its steps |
| Bruges | Belfort | `bruges/belfort.js` | bump into it, short of the Markt's footway |

The Eiffel Tower is not built on the arcade generator but of rods (`Kit.rod`): each leg a lattice
box of four chords braced in crosses, following the tower's curve from its measured widths at each
floor. Paris's map was stretched west along the Seine to the Champ de Mars for it.

The palaces and big blocks (the Hôtel de Ville, the Louvre) are blocks on their outlines with
mansards (`Kit.frustum`, a block narrowing to its top), rows of windows and pavilions under tall
roofs. The Louvre's wings are drawn by hand rather than taken from the map, whose one outline of
the palace fills in its courtyards. The Pont Neuf's arches show only as their crowns, as the river
lies just 2.4 m under the streets in the game. A monument built over a street of the map (the
Hôtel de Ville's courtyard road) names it in `streets`, so the street goes (`core/js/landmarks.js`).

They were drawn from their measurements and from memory of photos, without Mapillary or Commons
photos at hand: with those, their details (the reliefs, the statues, the tracery) can be sharpened.

In Rome:

- The Forum's ruins that are only walls, stumps and podiums on the map (the Basilica Iulia's
  piers, the Basilica Aemilia, the Regia, the House of the Vestals) were put up as houses with
  windows and roofs. `rome/foro.js` stands each one up as a plain ruin on its outline instead: a
  stump of marble, a wall of brick or tuff, a low podium. Their heights are a guess per piece.
- Largo di Torre Argentina is a dig about 6 m below the street, and the Forum lies below the
  streets round it too; the game's ground is flat, so both stand at street level. A relief that
  sinks them would make them read much better.
- Sant'Agnese's front and dome stand in front of and over the map's church, which stays behind
  them (it also holds the Palazzo Pamphilj's part of the block).
- The statues (Oceanus, the river gods, the Moor, the quadrigas) are rough figures of a few
  shapes; with photos at hand they deserve better ones.
- The fountains' water is the map's sunk pool, and the Fontana dei Quattro Fiumi's grotto is a
  heap of rocks round an opening rather than a carved cliff.
The Belfort stands without the Halle behind it, which the map does not have as a building; the
Loggia, the Campanile, the Elizabeth Tower and the Colom drop the map's footways drawn across them.

London's two Gothic buildings, the Houses of Parliament and Westminster Abbey, share
`london/gothic.js`: a range of walls with rows of pointed windows between buttresses that rise as
pinnacles, and its roof; gables, rose windows, pinnacles and octagonal turrets. The palace fills its
courtyards only where the map has buildings, and Westminster Hall stands turned a little to the rest,
as it is. No. 10 is only its front, on the map's house. Westminster Bridge keeps the map's deck,
which lies 2.6 m above the river, so its arches are far flatter than the real ones: lifting the deck
would be a map fix of its own.

Florence's marble churches share `florence/marble.js` on top of `arcade.js`: a map outline's sides as
paths, the green frames of the marble panels, Gothic and round windows laid on a wall's face, blocks
raised on an outline, octagonal shells (the Duomo's dome, the Baptistery's roof) and pitched roofs.
Open there:

- The Arno runs only 2.6 m under the street in the game, so the Ponte Vecchio's three arches show as
  a low band of dark openings between the cutwaters. Lowering the river under the bridge (a map fix
  of its own) would let them stand at their real height of some 10 m.
- The Palazzo Vecchio's wings behind Arnolfo's block and the deep parts of the Uffizi's outline get
  flat roofs of tiles; their real roofs are hipped, wing by wing.
- The Loggia del Mercato Nuovo behind the Porcellino is still the map's closed block; it is an open
  loggia of twenty columns.

Next in line: St Peter's colonnade (an arc of Tuscan columns), the arcades round Piazza San Marco,
the Arena of Verona, the Roman theatre of Lecce, the Pont Saint-Bénezet in Avignon (its arches
broken off in the Rhône, but the map has a footway along it at the water's level: the deck would
have to be lifted with it, a map fix of its own).
