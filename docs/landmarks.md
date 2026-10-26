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
  wall or to lay on it as a panel, `gable`: a pitched roof over a rectangle.
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
| Florence | Loggia del Mercato Nuovo | `florence/mercato-nuovo.js` | ride in between its piers and columns |
| Prague | the Týn church's towers | `prague/tyn.js` | bump into them (the nave stays the map's) |
| Prague | the Old Town Hall's tower and the Orloj | `prague/orloj.js` | bump into it |
| Prague | the Old Town Bridge Tower | `prague/mostecka-vez.js` | go through it along the Charles Bridge |
| Berlin | Fernsehturm | `berlin/fernsehturm.js` | bump into its foot |
| Amsterdam | Westertoren | `amsterdam/westertoren.js` | bump into it (the church stays the map's) |
| Antwerp | Brabofontein | `antwerp/brabo.js` | bump into its basin |
| Madrid | El Oso y el Madroño, Felipe III | `madrid/oso.js`, `madrid/felipe.js` | bump into their pedestals |
| Vienna | Pestsäule | `vienna/pestsaeule.js` | bump into its steps |
| Brussels | Hôtel de Ville and its tower | `brussels/hotel-de-ville.js` | bump into it |
| Brussels | the Grand-Place's guild houses, the Maison du Roi, the Ducs de Brabant | `brussels/grand-place.js` | ride round the square |
| Brussels | Bourse, the cathedral's west front, Galeries Saint-Hubert, Manneken Pis | `brussels/monuments.js` | ride through the galleries |
| Bruges | Stadhuis's front | `bruges/burg.js` | ride past it on the Burg |
| Bruges | Heilig-Bloedbasiliek | `bruges/burg.js` | bump into it |
| Bruges | Onze-Lieve-Vrouwekerk's and Sint-Salvator's towers | `bruges/towers.js` | bump into them |
| Bruges | Gruuthusepaleis | `bruges/gruuthuse.js` | bump into it |
| Avignon | Palais des Papes | `avignon/palais.js` | bump into it |
| Avignon | Notre-Dame des Doms and the gilded Virgin on its tower | `avignon/doms.js` | bump into it |
| Avignon | Hôtel de Ville and the Tour du Jacquemart | `avignon/horloge.js` | bump into it |
| Salerno | Duomo di San Matteo, its atrium and its bell tower | `salerno/duomo.js` | ride in through the Porta dei Leoni into the atrium's courtyard; bump into the porticoes, the church and the tower |
| Salerno | Teatro Verdi | `salerno/verdi.js` | bump into it |
| Salerno | Stazione Marittima | `salerno/marittima.js` | bump into it |
| Delft | Nieuwe Kerk's tower | `delft/nieuwe-kerk.js` | bump into its buttresses (the church stays the map's) |
| Delft | Stadhuis and Het Steen | `delft/stadhuis.js` | bump into it and its perron on the Markt |
| Delft | Oude Kerk's leaning tower (Oude Jan) | `delft/oude-kerk.js` | bump into it (the church stays the map's) |
| Utrecht | Domtoren | `utrecht/domtoren.js` | ride through the passage under it, bump into its two halves |
| Utrecht | Domkerk's choir and transept | `utrecht/domkerk.js` | bump into it (the Domplein stays open where the nave stood) |
| Utrecht | Pandhof | `utrecht/pandhof.js` | ride through the archway in its west gallery into the garden |
| Pisa | Torre di Pisa (leaning 4° to the south) | `pisa/torre.js` | bump into its foot |
| Pisa | Duomo di Pisa | `pisa/duomo.js` | bump into it |
| Pisa | Battistero | `pisa/battistero.js` | bump into it |
| Pisa | Camposanto and the Cappella Dal Pozzo | `pisa/camposanto.js` | bump into its outer wall |
| Pisa | Santa Maria della Spina | `pisa/spina.js` | bump into it |
| Siena | Palazzo Pubblico, the Torre del Mangia and the Cappella di Piazza | `siena/palazzo.js` | bump into it and the chapel |
| Siena | Fonte Gaia | `siena/fonte-gaia.js` | bump into the basin and its railing |
| Siena | Duomo di Siena and its bell tower | `siena/duomo.js` | bump into it |
| Siena | Facciatone | `siena/facciatone.js` | bump into the wall and its stair turret |
| Siena | Loggia della Mercanzia | `siena/mercanzia.js` | ride in under it between its piers |
| Rotterdam | Markthal | `rotterdam/markthal.js` | ride in through the doors in its glass ends, under the painted vault, and bump into the stalls |
| Rotterdam | Kubuswoningen and the Blaaktoren | `rotterdam/kubus.js` | ride in under the cubes between their pillars |
| Rotterdam | Witte Huis | `rotterdam/witte-huis.js` | bump into it |
| Rotterdam | Laurenskerk and its tower | `rotterdam/laurenskerk.js` | bump into it |
| Rotterdam | the Stadhuis's tower | `rotterdam/stadhuis.js` | bump into the town hall, which stays the map's block |
| New York | Empire State Building | `new-york/empire-state.js` | bump into its base |
| New York | Chrysler Building | `new-york/chrysler.js` | bump into its base |
| New York | Grand Central Terminal | `new-york/grand-central.js` | bump into its 42nd Street front |
| New York | New York Public Library and its lions | `new-york/library.js` | bump into it, the steps and the lions' plinths |
| New York | St Patrick's Cathedral | `new-york/st-patricks.js` | bump into it |
| Istanbul | Ayasofya | `istanbul/ayasofya.js` | bump into it, its buttresses and its minarets |
| Istanbul | Sultanahmet Camii (the Blue Mosque) and its courtyard | `istanbul/sultanahmet.js` | ride into the courtyard through its three gates and round the fountain |
| Istanbul | Yeni Cami and its courtyard | `istanbul/yeni-cami.js` | ride into the courtyard through its three gates |
| Istanbul | the Hippodrome's Egyptian Obelisk, Serpent Column and Walled Obelisk | `istanbul/hipodrom.js` | bump into their bases and railings |
| Istanbul | Çemberlitaş (Column of Constantine) | `istanbul/cemberlitas.js` | bump into its railing |
| San Francisco | Transamerica Pyramid | `san-francisco/transamerica.js` | bump into its foot |
| San Francisco | Ferry Building and its clock tower | `san-francisco/ferry-building.js` | bump into it |
| San Francisco | Coit Tower | `san-francisco/coit-tower.js` | bump into its base |
| San Francisco | Dragon Gate | `san-francisco/dragon-gate.js` | ride through its three openings (cars too, through the middle one) |

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
The Old Town Hall's tower in Prague had only its top in the map, floating; the Old Town Bridge
Tower was solid though the bridge goes through it.

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
- The Loggia del Mercato Nuovo behind the Porcellino (`florence/mercato-nuovo.js`) is open now, but
  with three bays by four and six free columns inside, fewer than its real twenty columns.

Two tools help place and check a landmark: `node tools/near.mjs <city> <landmark id>` prints where
it stands in game metres and the map's buildings round it (their rotated rectangles, turns and
heights), to put the model on its outline and size its `area`; `node tools/landmarkshots.mjs <city>
name:x,z:heading:distance:height ...` takes pictures of it in the game from one headless browser,
behind a lock so two runs never draw at once.

### Avignon, Salerno, Delft, Utrecht, Pisa, Siena, Rotterdam, New York, Istanbul, San Francisco

These ten were modelled together, from the map's outlines and from memory of photos, without
Mapillary. Some share helpers: Avignon and Salerno each have an `outline.js` (the same file twice),
Istanbul has `istanbul/mosque.js` (domes on drums, half-domes, minarets, courtyards), New York has
`new-york/deco.js`, and Pisa's and Siena's churches build on `florence/marble.js` and on
`pisa/romanico.js` (blind arches on pilasters, loggias of little columns), so a change to those
reaches Siena too. Avignon, Salerno, Siena and San Francisco have no terrain yet: the Palais des Papes
and the Doms stand at street level rather than on the Rocher, the Duomo of Salerno without its
steps, the Campo does not slope, and Coit Tower stands at street level, not on Telegraph Hill.

- Avignon: the palace stands on the map's one 70-point outline at one wall height (36 m in the game);
  its seven towers and two courtyards are placed by eye, and its wings get flat roofs behind the
  parapets where the real ones are low and hipped. The Hôtel de Ville's columns read as flat strips,
  and the jacquemarts are two small posts. The ramparts: the map has 16 of their towers but no walls
  between them, so the walls would have to be drawn by hand.
- Salerno: which way the Teatro Verdi's front faces is a guess (north, where the landmark's point and
  Piazza Luciani lie); if it faces south, flip `FRONT`. The Stazione Marittima reads as a smooth white
  shell rather than Hadid's sharp oyster. The atrium's porticoes are solid; a gap of 1.5 to 3 m stays
  between its east wing and the church. The Castello di Arechi lies outside the map.
- Delft: the Oostpoort is not in the map at all. The church's front stays the map's beige box under
  the Nieuwe Kerk's tower. The Stadhuis's frontispiece is plain, its perron has no lions, and the tops
  of Het Steen and the Oude Jan, and which way the Oude Jan leans, want checking against photos.
- Utrecht: the Domkerk's chapels are one flat-roofed block behind a parapet, its heights are a guess
  (eaves 29 m, ridge 42 m real), and the Domtoren's lantern is one open octagon under a crown of ribs.
  The Pieterskerk, the Janskerk and Paushuize are not done.
- Pisa: the map's outline of the Duomo is about 30% wider than the church, so its front is 46 m
  across where the real one is 35 m. Which half of the Baptistery's dome is tiled red and which is
  lead is from memory. The Camposanto's tracery is three bars an arch.
- Siena: only the Palazzo Pubblico's front on the Campo is dressed, and the Cortile del Podestà is
  not opened. The Duomo's area takes out the map's big platform under it (118 by 70 m, 13 m high),
  and with it the steps and the Baptistery under the choir. The Facciatone is its front wall and stair
  turret; the unfinished nave's arches stay the map's museum.
- Rotterdam: the Markthal's painting is a mosaic of coloured tiles, and the 37 cube houses stand on
  the grid where the map's roof faces meet, so a few may sit one place off. The Stadhuis is only its
  tower on the map's office block.
- New York: the Empire State and the Chrysler keep the map's setbacks (copied into their files) and
  add what it lacks on top. The towers round them keep the generic stone, which hides the Empire State
  from the street. St Patrick's spires are hidden from every view by Rockefeller Center, so they have
  not been seen whole. Grand Central's sculptures and the library's lions are rough figures.
- Istanbul: the map's parts had the mosques far too tall (the Blue Mosque's dome at 77.5 game metres
  against a real 43 m); the models follow the real heights. The Ayasofya's buttresses are plain
  stepped blocks, the Blue Mosque lacks its side galleries, the Yeni Cami lacks its royal pavilion,
  and the Hippodrome's monuments stand at street level rather than down in their pits.
- San Francisco: the map drew a ring of 30 m walls round the Transamerica's foot, which its `area`
  takes out. The Ferry Building's arcade is drawn on its wall, so riders cannot ride in under it. The
  Dragon Gate stands by Grant Avenue's start, 13 m from the data's point, and its dragons are blocks.

Next in line: St Peter's colonnade (an arc of Tuscan columns), the arcades round Piazza San Marco,
the Arena of Verona, the Roman theatre of Lecce, and from the sites' lists: Het Steen in Antwerp
(one outline of 57 points, round towers and all), the Koninklijk Paleis and Antwerp's cathedral tower
(both already stacked in the map from many parts, so less to gain). Waiting on a map fix:
- the Pont Saint-Bénezet in Avignon: the map has a footway along it at the water's level, so its deck
  would have to be lifted with it.
- the Ponte dei Sospiri in Venice: the map has the Palazzo Ducale and the prisons touching, with the
  Rio di Palazzo under them, so there is no gap for the bridge to cross.
- Børsen in Copenhagen is not in the map at all.
- the Erasmusbrug in Rotterdam: the map draws its deck flat at 0.2 m over the Maas; lifted to its
  real 12.5 m, the pylon and its stays would be quick to add.
- Grand Central's Park Avenue Viaduct in New York runs flat through the terminal's outline in the
  map, where the real one runs a floor up round it.
- the Maria van Jessekerk on Delft's Burgwal (around x 226, z −163): the map's parts of its two spires
  float above the church, in every view of the Markt.
