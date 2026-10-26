# First maps: twenty-five cities

Twenty-five cities got a first playable map, six, eight, two, one, two, three and then three at a time, each with a small piece of its centre
(about 1.5 by 2 km), one race and free riding. They were made the way Lecce was
(`docs/lecce-exercise.md`), from OpenStreetMap only, with no quests, sights, monuments or fronts yet.

| City      | Piece of the centre                                   | Race                                     | Buildings |
|-----------|--------------------------------------------------------|------------------------------------------|-----------|
| Rome      | Piazza Venezia, Via del Corso, Pantheon, Navona, up to the Colosseum | `romacentro`, loop, 3.0 km | 6,093 |
| Paris     | Île de la Cité, Hôtel de Ville, Rue de Rivoli, Louvre, and west along the Seine to the Eiffel Tower and the Champ de Mars | `cite`, loop, 2.8 km | 11,470 |
| Amsterdam | Dam, Singel, Spui, Rokin, Westerkerk to Nieuwmarkt     | `grachten`, loop, 1.7 km                 | 7,915 |
| Venice    | San Marco, Mercerie, Rialto                            | `mercerie`, open (start to finish), 0.9 km | 2,537 |
| Barcelona | Plaça de Catalunya, Rambla, Barri Gòtic, Colom         | `rambla`, loop, 4.2 km                   | 4,367 |
| London    | Trafalgar Square, Whitehall, Westminster, Embankment   | `westminster`, loop, 2.3 km              | 2,648 |
| Bruges    | Markt, Burg, Rozenhoedkaai, Dijver, Our Lady          | `brugge`, loop, 1.3 km                   | 8,390 (measured heights) |
| Antwerp   | Grote Markt, Het Steen, Scheldt, Groenplaats           | `antwerpen`, loop, 1.8 km                | 6,557 (measured heights) |
| Brussels  | Grand-Place, Bourse, Manneken Pis                      | `grandplace`, loop, 2.5 km               | 4,646 |
| Florence  | Duomo, Signoria, Ponte Vecchio, Santa Trinita          | `firenze`, loop, 1.9 km                  | 4,199 |
| Prague    | Old Town Square, Josefov, the river by Charles Bridge  | `staremesto`, loop, 1.7 km               | 1,861 |
| Vienna    | Stephansdom, Graben, Hofburg, Ring, Opera              | `innerestadt`, loop, 4.3 km              | 1,802 |
| Copenhagen| Kongens Nytorv, Nyhavn, Slotsholmen, Strøget           | `stroget`, loop, 4.2 km                  | 3,376 |
| Berlin    | Unter den Linden, Gendarmenmarkt, Holocaust Memorial   | `mitte`, loop, 3.0 km                    | 4,171 |
| Avignon   | Place de l’Horloge, Rue de la République, by the Palais des Papes | `intramuros`, loop, 1.4 km   | 4,334 |
| Madrid    | Puerta del Sol, Calle Mayor, Palacio Real, Callao      | `sol`, loop, 3.2 km                      | 3,848 |
| Salerno   | Duomo, Via dei Mercanti, Corso, Lungomare, Villa Comunale, Molo Manfredi | `salerno`, loop, 2.3 km      | 1,046 (whole blocks) |
| Siena     | Banchi di Sopra, Campo, Casato, Duomo, Santa Maria della Scala | `siena`, loop, 2.2 km     | 1,938 |
| Pisa      | Piazza dei Miracoli, Via Santa Maria, the Lungarni, Ponte di Mezzo | `pisa`, loop, 3.4 km     | 3,035 |
| Utrecht   | Janskerkhof, Kromme Nieuwegracht, Domplein, Vismarkt by the Oudegracht | `utrecht`, loop, 1.7 km | 6,481 |
| Rotterdam | Coolsingel, Blaak, Markthal, cube houses, Oude Haven, Laurenskerk | `rotterdam`, loop, 2.2 km | 3,333 (flat roofs) |
| Delft     | Markt, Voldersgracht, Oude Kerk, Oude Delft, Koornmarkt | `delft`, loop, 2.3 km      | 7,779 (534 stepped gables) |
| Istanbul  | Sultanahmet, Hagia Sophia, Divan Yolu, Grand Bazaar gate, Sirkeci, Eminönü on the Golden Horn | `sultanahmet`, loop, 4.0 km | 4,098 |
| New York  | Times Square, Bryant Park, Grand Central, Chrysler, Empire State, Rockefeller Center | `midtown`, loop, 5.6 km | 6,472 (flat roofs, real tower heights) |
| San Francisco | Grant Avenue, Dragon Gate, Financial District, Ferry Building, Embarcadero, Transamerica Pyramid | `sanfrancisco`, loop, 4.1 km | 4,112 (flat roofs) |

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

Bruges and Antwerp lie in Flanders, so their `area.json` has `"heights": "dhmv"` like Ghent's: every
roof at its measured height (the Belfry of Bruges stands its real 83 m). Prague and Vienna map their
old towns as few, big outlines, so they have fewer buildings than their size suggests.

Every city but Ghent also has a tour (`tour.js`): a flight along its race route over the roofs, made
from the route in `map.js`, with a stop and a card (English and Dutch) at three to five sights on the
way, and its own welcome line (`tour.welcomeSub` in its `WORDS`, as the shared one is Ghent's).

## What changed in the shared code

- **No stepped gables outside Flanders and Amsterdam**: old houses (heritage-tagged) got a Flemish
  stepped gable everywhere. `"gables": false` in `area.json` turns that off; Paris had 50 of them.
- **Traffic on the left**: `THEME.left` (London) puts the cars on the left of the street.
- **The sea** (Salerno): OpenStreetMap draws a coast as a line (`natural=coastline`, the land on
  its left), not as water. The builder now cuts each coastline that crosses the box to it and
  closes it round the box's edge on the water side, so the sea is one water area (`sea: 1`) with its
  quay along the shore, and riding into it puts you in a boat. Any city rebuilt with a coast in its
  download gets its sea this way. `LOOK.water` gives the water a colour of its own (Salerno's
  bluer sea; the canals' green otherwise).

## What each city is known for

“What do people think of when they think of this city?” Each city got some of it:

- **Vehicles** (`TRAFFIC` in `city.js`, the models in `core/js/cars.js`): London’s black cabs and red
  double-deckers (and traffic on the left), Vespas and old Fiat 500s in Rome, Florence and Lecce,
  Citroën 2CVs in Paris and Avignon, Trabants in Berlin, and each city’s own taxis (white in Rome
  and Madrid, black in Barcelona, cream in Berlin); `TRAFFIC.taxis` keeps them from crowding out
  the rest in the centre.
- **Boats** (`BOATS`): gondolas with their gondoliers on Venice’s canals; elsewhere the tour boats
  no longer carry Ghent’s name.
- **A quest each** (`quests.js`), from real stories where there are some: the Mona Lisa stolen from
  the Louvre (as in 1911), Michelangelo’s Madonna carried off from Bruges (as in 1944), the Manneken
  Pis stolen again, Brabo gone from his fountain, a coin in the Trevi before the coach leaves, Big
  Ben striking noon, the twelve grapes at the Puerta del Sol, the dance on the Pont d’Avignon.
- **Landmark pages** (`_data/landmarks/`) for the rest: gondolas, black cabs, fries, Sachertorte.

Still to come: horse carriages (Bruges, Vienna), Prague’s and Vienna’s trams, bateaux-mouches and
Amsterdam’s canal boats as models of their own, and the landmarks themselves as 3D models.

## Rough edges to pick up next

- The big landmarks are OpenStreetMap boxes: the Colosseum, Notre-Dame, St Mark's, Big Ben and the
  Sagrada Família (not on the map) need models or fronts, as Lecce's monuments did.
- Venice has no water traffic, and its calli are narrower than the race (`hw` 2.6), so some house
  corners along the Mercerie are cut back.
- Amsterdam's big buildings on the Dam get the grey stone look; its canal houses are fine.
- The traffic lights in London still stand for traffic on the right.
- No sight cards yet, and one quest per city (see below).
- Salerno climbs its hill in real life but lies flat in the game (the height models are Flanders-only), so the
  Castello di Arechi stays off the map; its old town is mapped as whole blocks, so it has few, big buildings.
- Siena lies flat in the game too, though every street of it climbs or falls; the Campo is level instead of
  sloping down to the Palazzo Pubblico.
- Pisa's tower stands upright in the game (OpenStreetMap's outline, at its 56 m); a leaning model is still to come.
- Utrecht's Oudegracht has its quays down at the water and cellars under the street; in the game it is a
  canal like any other, and its wharves are missing. The race leaves out the Oudegracht itself, which
  OpenStreetMap has in pieces.
- Rotterdam's landmarks are plain OpenStreetMap blocks: the Markthal has no arch, the cube houses are not
  tilted, and the Erasmusbrug has no pylon or cables.
- Delft's Oude Kerk tower stands straight in the game; it really leans about two metres.
- Istanbul's mosques and the Hagia Sophia are plain OpenStreetMap blocks with no domes or minarets, and the old city's
  seven hills are flat. The T1 tram along the Divan Yolu is missing (the download holds only bits of it). The builder
  closes each coastline on its own, so with two shores facing each other across the Golden Horn each would flood the
  other's land: the box stops short of Karaköy, so the Galata Tower is not on the map.
- New York's towers stand at their real heights but are plain blocks, all in the same pale stone (no glass, no
  crown on the Chrysler Building), and the buildings OSM gives no height come out low between them. The avenues
  are one-way, so the builder draws them no wider than any one-way street, though the real ones are about 18 m wide.
  OSM maps some subway stations as buildings underground; the builder now leaves those out (the Times Square one
  stood as a block over the square).
- San Francisco lies flat: Coit Tower stands on level ground, and the game has no fog for the fog. The cable car
  lines are drawn as tram tracks with no cable car on them, and the Transamerica Pyramid rises in steps.
