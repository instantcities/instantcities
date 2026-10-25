# Instant Cities (BETA)

> Still in development: expect rough edges, and saved settings may reset between versions.

The historic centres of European cities in 3D in the browser (Three.js), rebuilt from
OpenStreetMap: ride a bike, walk or gallop through them, race along their streets or play quests. Alone, or two players split-screen
on one keyboard. There are nineteen cities to play: Ghent and Lecce in full, and a small first piece
of the centre of Rome, Paris, Amsterdam, Venice, Barcelona, London, Bruges, Antwerp, Brussels,
Florence, Prague, Vienna, Copenhagen, Berlin, Avignon, Madrid and Salerno, each with a race and a
tour (see docs/first-maps.md).
The site is in English, the game in English and Dutch.

Forked from [Instant Gent](https://github.com/woutersmet/instant-gent) (October 2026), which keeps
the Dutch, French and Spanish site, the game in French and Spanish, the Ghent guide pages and the iOS
app. The game and Ghent were last brought up to date with Instant Gent at its commit
`67b3780` (23 October 2026): to do so again, apply its changes since then to `core/`, `ghent/`,
`ghentinside/`, `lecce/` and `tools/` (its `<city>/index.html` are made here as `<city>/play/index.html`
by `node tools/pages.mjs`).

## Run locally

Every city has the same two addresses: its page at `/<id>/` (`/ghent/`) and its game at
`/<id>/play/` (`/ghent/play/`). Each is a folder of its own, `ghent/` and `lecce/`, with the game's
pages in its `play/`; what the cities share, the game itself, is in `core/`. Around them is a small
Jekyll site: the home page (`/`, `_layouts/home.html`, its words in `_data/home.yml`), the cities
page listing every city (`/cities/`, `_layouts/cities.html`) and a page per city (`/ghent/`,
`_layouts/city.html`, their words in `_data/cities.yml`). The old city pages at `/cities/ghent/` and
`/cities/lecce/` send visitors on to the new ones. Screenshots are in `assets/img/`.

The home page plays **website preview tours**: separate 18-second silent MP4s, rotating Ghent →
Rome → Paris → London → Barcelona → Ghent. It loads one video at a time, with no game engine,
city map or WebGL on the home page. Playback pauses offscreen or in a hidden tab; reduced motion
and data saving keep the poster. The caption and “Watch the tour” link follow the current city.

Each city's `<city>/website-preview.json` is its preview edit: three six-second shots with a
name, an `at` point on the full tour's path, `before` (metres before that point), `seconds`, and
`speed`. Optional `cameraFrom`, `cameraTo`, and `look` ([x, y, z]) define an independent
camera move when a wider view works better for the website. These select highlights without changing the full in-game tour. To compile the clips:

```bash
node tools/website-preview.mjs                # all five, sequentially in one Chrome window
node tools/website-preview.mjs paris         # rebuild only Paris after map or shot changes
```

Requires Chrome, `playwright` or `playwright-core` (local or global), and `ffmpeg`. The compiler
renders fixed steps at 960×540 / 24 fps and writes silent H.264 videos and posters to
`assets/previews/`. Commit those outputs: normal Jekyll builds simply copy them, and visitors
never render them themselves. Temporary frames stay in ignored `tools/cache/website-preview/`.
Use `--headless` only if needed; the default Chrome window uses the GPU to avoid slow CPU WebGL.
The compiler rejects previews outside 10–20 seconds. Recompile a city when its map or full tour
path changes. Playback order lives in `_data/home.yml` (`preview_cities`).

City-page heroes still play their live tour in watch mode (`/<id>/play/?watch`: no menu, buttons
or cards, nothing saved) in an iframe, `_includes/live.html`, paused while scrolled out of sight.
`?watch=cards` is the whole tour with its cards, starting straight away: the “Watch the tour” button.
The map of Europe on the
home and cities pages is `_includes/europe.html`, drawn from `_data/europe.json`, which
`node tools/europe.mjs` makes from Natural Earth's outlines and each city's `lat` and `lon`.

Every city's page lists its places, elements and landmarks (not only buildings: Venice's gondolas,
London's black cabs, Brussels' fries), each with a page of its own at `/<id>/landmark/<landmark>/`:
its story, a map from OpenStreetMap and a link that drops you right there in the game. They are in
`_data/landmarks/<id>.json`; `node tools/landmarks.mjs` writes their pages (`<id>/landmark/`).
Ghent's texts and pictures come from the sight pages of Instant Gent. Each landmark's photo (its
`photo`: the file in `assets/img/photos/<id>/`, a square `-s.jpg` for its card, and its author,
licence and source) comes from Wikimedia Commons, freely licensed (CC BY, CC BY-SA, CC0 or public
domain) and credited on its page; a landmark's `icon` names one of `_includes/icon.html`'s.

The famous art in the buildings you can go into (the Mona Lisa in the Louvre, the Night Watch in
the Rijksmuseum, the Ghent Altarpiece in Sint-Baafs: 31 paintings, statues and treasures in 13
buildings, and Michelangelo's David out on Florence's Piazza della Signoria) has a page of its own
too: all of them at `/art/` and each at `/art/<id>/`, its story, its facts and a link that drops you
right in front of it in the game (`/<id>/play/?inside=<building>&view=x,z,tx,tz`, or for one out in
the open `?pos=x,z&yaw=`). They are in `_data/art.json`; `node tools/art.mjs`
writes their pages (`art/`) and `node tools/art.mjs photos` fetches their photos from Wikimedia
Commons into `assets/img/art/`, credited in `_data/art_photos.json`. In the game the paintings'
real photos are painted over their drawings once they have loaded (`core/js/inside/photo.js`).

The art, its museums and the cities link to each other. A museum in `_data/art.json` whose
`landmark` is the id of a landmark page in `_data/landmarks/<city>.json` (`"landmark": "louvre"`) gets
that page linked from its pieces and from `/art/`, and the landmark page lists its pieces. A piece's
and a landmark's story link the first mention of the city, of the museum and of the pieces in it
(`_includes/link-first.html`), and the "This is <city>" bullets link the landmarks and pieces they
name (`_includes/link-landmarks.html`). A museum without a landmark page (give it one, then its
`landmark`) links to its city only. A landmark's `inside` (a building's id in `<city>/inside.js`) makes
its "See it in 3D" open the game inside the building: the British Museum, the Sistine Chapel, the
Rijksmuseum and the Prado lie off their city's map, so they have no place on it to drop you at.

Every city also has a guide: a "This is <city>" section on its page, a page about the city at
`/<id>/about-the-city/` (what it is known for, its facts, where it lies in its country, its centre
on a map, its history and official links) and a page of all its places at
`/<id>/places-and-landmarks/` (all its landmarks, and its key streets, squares and waterways on the
map of the centre; the city's page shows only the first nine landmarks and links there). The guides
are in `_data/about/<id>.json`; `node tools/about.mjs` writes their pages, draws each centre from
the game's own map (`assets/maps/<id>.svg`, the pins in `_data/maps/<id>.json`) and the country
maps (`_data/countries.json`). `node tools/about.mjs where <id> "<street>"` says where a street of
the game's map lies.

```bash
python3 serve.py        # just the games: http://localhost:8321/ghent/play/ and /lecce/play/
bundle install && bundle exec jekyll serve   # the whole site: http://localhost:4000/
```

Every pull request also gets a preview of the whole site on Netlify (`netlify.toml`): its link
comes as a comment on the PR.

It needs a local server because the game uses ES modules, and an internet connection for Three.js
and the fonts from their CDNs. GitHub Pages builds the Jekyll site itself on every push. Ruby 3.x
runs `jekyll serve` fine; Ruby 4 needs `RUBYOPT=-r<file defining Object#tainted? as false>` for the
old Liquid that GitHub Pages pins.

The site lives at https://instantcities.net (GitHub Pages, `CNAME`); its address is also
`url` in `_config.yml`.

### Where things are

```
core/            the game, the same for every city
  js/            the engine: riders, tracks, scenery, quests, sound (no city in it)
  sounds/        the recorded loops
  style.css
  game.html      the page, a template: tools/pages.mjs makes each city's play/index.html from it
  dev.html, facade-lab.html, sw.js
ghent/, lecce/   a city: its page and everything about it
  index.html     the city's page on the site (/ghent/): only `layout: city`, its words in _data/cities.yml
  play/          the game (/ghent/play/), made by tools/pages.mjs (also dev.html, sw.js), do not edit by hand
  page.json      what the game's page says: the game's name, the title, what shares and search engines show
  city.js        what the city is: its map, routes, quests, sights, look; see its header for the rest
ghentinside/     the inside of Sint-Baafs, Sint-Niklaas and the Stadhuis, a map of its own that Ghent's
                 doors and sight cards lead into (/ghentinside/play/; /ghentinside/ sends you to /ghent/)
rome/, paris/ …  the same, smaller: a first map, a race and a tour, no quests or sights yet (docs/first-maps.md)
cities/          the cities page (/cities/), and the old city pages that send visitors on
tools/           making the maps and the pages (not on the site)
```

The engine reads the city from `core/js/city.js`, which takes it from the bare name `city`: each
city's page maps that to its own `city.js` in its import map. A new city is a new folder with an
`area.json` (for `tools/osm_map.mjs`), a `city.js`, a `page.json` (its words and colours) and a
`loader.html` (the scene on its loading screen), and `node tools/pages.mjs` for its game pages; on
the site, a block in `_data/cities.yml` and an `<id>/index.html` with `layout: city` and `city: <id>`.
A city's id is also its address, so it cannot be one of the site's own folders (`core`, `assets`,
`cities`, `docs`, `tools`).

## Controls

One or two players, split screen, on one keyboard and/or gamepads (gamepad 1 plays for player 1, gamepad 2 for player 2).

| | Player 1 | Player 2 |
|---|---|---|
| Ride | W A S D | Arrow keys |
| Jump | Space | Right Shift |
| Use item | E | Enter |
| Throw a bunny backwards | hold S + E | hold ↓ + Enter |

Gamepad: A runs, B brakes, X or RB jumps, Y or LB uses the item, Start pauses.

In 1-player mode either side of the keyboard works. M toggles music, N toggles sound effects,
Esc pauses, and the ⌂ Menu button goes straight back to the menu. On the title screen, ↑ ↓ pick a
row and ← → change it; on the Animals row every player picks with their own left/right keys.

The game speaks English (default) and Dutch.

### Phones and tablets

Touch screens get on-screen controls (1 player): your animal runs by itself, drag on the left
half of the screen to steer, and tap Jump, Item and Brake on the right. Hold Brake while tapping
Item to throw a bunny backwards. Landscape works best.

## What you ride, and who you are

Each player picks two things on their card: what they ride (‹ › beside the picture: a bike, on
foot, a horse, a cow, a tiger, a pig or a unicorn; a bike to start with) and their colours (‹ ›
below it). With two players each types their name into the header of their card (remembered on
that device). Everything is equally fast and strong. In a race the computer rides horses, in the
colours nobody picked.

## Items

Ride through the items on the track to collect them (you carry up to 3, used in order). The
computer riders collect and use them too, but only ever on each other, never on a player.

- 🐰 **Bunny** hops after the horse ahead of you and spins it out.
- 🦔 **Hedgehog** is dropped behind you; whoever rides into it rears up and stops.
- 🌧️ **Rain cloud** flies to the race leader, zaps them and soaks them so they run slower.

Jumping clears hedgehogs and low bunnies too.

## The city and its routes

There is one map: all of Ghent inside the R40 ring road and a bit beyond it, out to
Gent-Sint-Pieters, the Watersportbaan, Dampoort and the Keizerpark, rebuilt from OpenStreetMap with
every building at its measured height (about 40,000 of them). It is made for desktops. Every race
runs through this one city, on one of its routes:

- **Gent Centrum**: past the Belfort, Sint-Baafskathedraal and Sint-Niklaaskerk at their real
  height: Sint-Baafsplein → Lange Kruisstraat → Henegouwenstraat → Voldersstraat → Veldstraat →
  Korenmarkt → Cataloniëstraat → Emile Braunplein. A long lap.
- **Brugse Poort**: Cederstraat → Sparrestraat → Meibloemstraat → Boerderijstraat →
  Kastanjestraat. The streets are narrow, so it is a canter rather than a gallop.
- **Sint-Pieters → Dampoort**: from one station to the other, right across the city (5 km):
  Kortrijksepoortstraat → Nederkouter → Veldstraat → Korenmarkt → Vrijdagmarkt → Steendam →
  Hagelandkaai → Kasteellaan.
- **Overpoort → S.M.A.K.**: Sint-Pietersplein → Overpoortstraat → along the lanes of the
  Citadelpark to the S.M.A.K. on the Jan Hoetplein.

The last two are open routes, ridden once from a START gate to a FINISH gate instead of in laps;
the HUD shows how far it still is to the finish. A route in `area.json` becomes open when it has
`from` and/or `to` ([lat, lon]): it starts on its first street nearest `from` and ends on its last
street nearest `to`.

Each route has road works across the whole street plus parked cars and flower planters blocking
part of it. Crash into one and your animal stumbles.

Cars drive about the streets off the race routes (js/traffic.js): only a few in the old centre,
mostly taxis, and busier further out. They stop for whoever is in the way. To stay light, only
the streets round the camera have traffic: a pool of at most 60 cars, one instanced mesh per car
type, full models close by and boxes further off.

The city is built once at the start and shared by all routes; each route only adds what lines it
(parked cars, bikes, trees, tram poles), so switching routes is quick.

The fictional tracks (Rondje Blok, Molenweide, Tulpenlus, Duinderby, Kerstbos, Beekjesbaan,
Snoepland) and the in-game map maker for any town are gone; the git tag `multi-track-final` keeps
the game as it was with them.

### A second city: Lecce

`/lecce/play/` plays in the baroque old town of Lecce (Puglia) instead, from `lecce/`, in sand and brown
rather than Ghent's blue. It has two routes (**Lecce
Centro**, a loop past the Duomo, Porta Rudiae, Porta Napoli and Santa Croce, and **Stazione →
Sant'Oronzo**), its own quests and sights, and its own look (`LOOK` in its `city.js`: pietra
leccese, shutters, flat roof terraces). It was made to find out what in the game was Ghent-only;
`docs/lecce-exercise.md` lists what had to change.

## Free roam

**Vrij rijden** is the first option on the title screen and the default: ride about the city
freely, alone or with two players and no computer riders, starting where the last chosen race
route starts. There is no race: ride anywhere, between the
real buildings, over the bridges or through the water (slowly). The street sign shows where you are
and the minimap moves with you. Click the minimap (or press K) for the big map: click a spot on it to
teleport there, or open its **Plekkenindex** tab to look up a sight, a square or any street by
name and teleport there with one click.

The city has its everyday life too: the Kouter's Sunday flower market with its bandstand and the
blue kiosk's full terrace, flower stalls on the Vrijdagmarkt, the two rival neuzekes carts on the
Groentenmarkt, the bus canopies at Zuid, someone always at the grand piano under the Stadshal and
SGOL's terrace down on the sunken forecourt below it, and out at
the Blaarmeersen a beach full of sunbathers and runners doing laps round the Watersportbaan
(`ghent/pavilions.js`, `stadshal.js`, `blaarmeersen.js`; the stall itself is `core/js/stall.js`).

## Going inside

Some buildings can be entered: Sint-Baafs (with Het Lam Gods), the Stadhuis and the Sint-Niklaaskerk
in Ghent; the Louvre, Notre-Dame and the Sainte-Chapelle in Paris; the Uffizi and the Duomo in
Florence; the British Museum, Westminster Abbey and the National Gallery in London; the Pantheon and
the Sistine Chapel in Rome; St Stephen's Cathedral and the Kunsthistorisches Museum in Vienna; St
Vitus Cathedral in Prague; St Mark's Basilica in Venice; the Neues Museum and the Pergamon Museum
in Berlin; the Rijksmuseum in Amsterdam; and the Prado in Madrid. By the door a card names the building: ride into the door,
click the card or press the item key (E / Enter, Y on a gamepad) to go in. Inside everybody goes on
foot and at a walk, and the door inside takes you back to the street on what you rode in on. The big
map shows each door as 🚪 and its index lists the buildings under *Go inside*, so the ones that lie
just off their maps (the British Museum, the Sistine Chapel, St Vitus, the Rijksmuseum, the Prado)
are reached from there; their doors out let you into the city on the way to them. A sight's card
with a *Go inside* button (Ghent's) takes you in too. `/<city>/play/?inside=<id>` goes straight in. Not during a
quest.

A big museum is a few of its key rooms joined by doorways, not its real plan: the Louvre is the Hall
Napoléon under the pyramid, the Venus de Milo, the Daru stair with the Winged Victory, the Grande
Galerie and the Mona Lisa's room. Each room has cards for what is in it, and in the two buildings
that are about their ceilings (the Sistine Chapel, the Pantheon, the Duomo, San Marco) the camera
looks up when you stand still.

How it works (`core/js/interiors.js`): a city lists its buildings in `<city>/inside.js` (`INSIDE`:
each its rooms' builder, its size, its door in the street, its cards, its light) and builds the rooms
in `<city>/inside/`. Every building stands on the city's own map, in a row 2 km east of it where
nobody sees it from the streets, so going in is a teleport, with nothing to load, and two players can
be one inside and one out. Their light is put on per player's view: always daylight under a roof, no
rain. What the rooms are built from is shared, in `core/js/inside/`: `gothic.js` (walls, vaults,
stained glass, a cruciform church from a plan), `rooms.js` (halls with doorways, skylights, painted
vaults, frames, plinths, ropes, glass cases, visitors), `church.js` (pews, altars, rose windows, the
floor a cruciform plan covers), `art.js` (the famous pictures, drawn after the real ones),
`statues.js`, `props.js` and `pictures.js`. Instant Gent's `ghentinside/` page is still there, but
the game no longer links to it.

## Missions

**Missions**, next to Race, lists the missions as cards. The first, **Vrij verkennen**, is riding
about freely (above); the others put you at the start of a short quest against the clock. A quest
shows what it is about, and off you go when you press START. The arrow under the timer points at
where you have to go, and the minimap shows it too. The big map is closed during a quest, so no
teleporting your way out of it.

- 🖼️ **Het Lam Gods is gestolen!** (2:30): a thief runs off from Sint-Baafs with the Mystic Lamb
  held high. Catch them. The thief runs away from you along the streets, sprints when you get
  close, slows down when you fall far behind, and every so often bursts off nearly as fast as you.
- ⛴️ **Het laatste bootje** (1:00): from Jacob van Artevelde on the Vrijdagmarkt to the last boat
  waiting at the Graslei.
- 🚆 **De trein naar Brugge** (4:00): wrong station! From Gent-Dampoort right across town to
  Gent-Sint-Pieters.
- 🧟 **Student zombies** (3:00): September in the Overpoort. Find 10 lost student caps among the
  students, back from the cantus in white lab coats and sashes, without one of them throwing up
  on you. An arrow on the street in front of you points at the nearest cap.
- 🏃 **De Stadsloop** (3:30): thousands of runners stream from the Nederkouter over the Veldstraat
  and the Korenmarkt to past the Gravensteen. Get from Sint-Baafs to the Graslei without running
  into one: find a way round them. The map shows the course as an orange dotted line.

The quests live in `<city>/quests.js` with their words, how each kind plays in
`js/quests.js`. The thief, the runners and the start of every quest use the city's streets as a
graph, from the map's roads.

## Tour

**Tour**, next to Missions and Race, flies the camera through the old town with nobody riding:
from the Sint-Michielshelling over the bridge (with a look to the left, down the Leie to the
Graslei) and the Korenmarkt, past Sint-Niklaas to the Sint-Baafsplein (looking up at the cathedral's
spire), up round the Belfort's spire level with its golden dragon, down low over the Botermarkt past
a wedding at the Stadhuis, on to the Vrijdagmarkt and the Dulle Griet, down the Langemunt, right
onto the Groentenmarkt where it stops close by the neuzekes carts, by the Gravensteen, and back on
the Leie between the Graslei and the Korenlei, behind one of the Bootjes van Gent, to where it set off. It sets off on a snowy night with a big welcome, which fades into the day as it
sets off. It flies fast and low through the streets, climbs high over the
roofs between the stops, swoops down to each one and banks into the bends. The street below shows at the top as you go; at each of the ten
stops the flight slows down, turns to the sight and a card tells you what it is, with a link to
read more on visit.gent.be. The sky goes round as it flies: day from the bridge, night from
the Stadhuis to the Dulle Griet, day again after it, and a snowy night on the boat along the Graslei. Two ways
to take it:

- 🎬 **Automatisch**: it never stops: each card comes up as the flight slows down past its sight,
  and goes again. With the mouse on a card (or a tap on it) the flight waits until you move away
  or click on. At the end it starts over.
- 👆 **Interactief**: the flight waits at each card until you click on (Space / Enter too).

Esc or ⌂ Menu goes back to the menu. The route and its stops are `<city>/tour.js` (`ghent/tour.js`:
the path a little over the roofs, what each stop looks at, the street names), the flight itself
`js/tour.js`; a city without a `TOUR` has no Tour button.

## Building the map

The map is made with `tools/osm_map.mjs` (the builder itself is `tools/osmbuild.mjs`), from
the city's `area.json` (`ghent/area.json`): the town, the bounding box, the corners of the zone to keep, and the
routes, each an id and its street names in riding order.

```bash
node tools/osm_map.mjs ghent --fetch   # download the area (cached in tools/cache/) and build ghent/map.js
node tools/osm_map.mjs ghent           # rebuild from the cached download, e.g. after adding a route
```

`node tools/routecheck.mjs <city> --route <id>` helps when a route won't build: which streets meet,
and which are in unconnected pieces. A new route goes in the area file, then in the city's `races.js` (made into a track by `realTrack()`, `core/js/realtrack.js`),
which places the items and obstacles to suit the one-way stretches. Towers and churches keep their
real height (OSM `height` and `building:part`), so the Belfort stands 95 m tall.

### Landmarks in real 3D

A few landmarks are drawn from their real 3D model instead of a box on their outline:
`tools/gent3d.mjs` takes the ones listed in `ghent/landmarks.json` (each given by its OSM outlines)
from Stad Gent's [Gent in 3D](https://data.stad.gent/explore/dataset/gent-in-3d/) (LOD2 meshes,
roofs from a 2009 LiDAR scan) and writes `ghent/landmarks.js`. The Gravensteen comes from
there; the Stadshal, built after that scan, has its roof made from the DHMV II heights instead
(`"source": "dhmv"`), on four pillars: riders go in under it. The Boekentoren, a plain tower whose
LiDAR roof comes out ragged, is upright walls to a flat top (`"source": "flat"`, `"height"` in metres). It needs `dwg2dxf` (`brew install libredwg`); run it again after rebuilding
the map, as the models are placed in the map's game coordinates.

```bash
node tools/gent3d.mjs   # downloads the 1 km² tiles it needs into tools/cache/gent3d/
```

### Hills

Ghent is not flat: from the Leie (8 m above sea level at the Korenmarkt) the streets climb some
20 m up the Blandijnberg to the Boekentoren. Only that hill shows in the game, the rest of the city
lies flat (the waterways and sunken squares like the Emile Braunplein are hollows of their own).
`tools/terrain.mjs` takes the bare ground from Digitaal Vlaanderen's 5 m terrain model (DHMV I),
lets the canals and rivers lie level with their quays and smooths it. Then it keeps only what lies
within the outline of the `hill` in `ghent/area.json` and higher than its foot (`from`, metres
above sea level), makes that `up` times as high (twice, or the climb barely shows) and writes
`ghent/terrain.js`. The game itself stays flat: `core/js/terrain.js`
lifts what is drawn, in every vertex shader, by how much higher the ground lies there than under
the camera's rider, and cuts the city's big flat surfaces up where the ground bends under them.
Riding uphill is slower, downhill faster. A city without a `terrain.js` stays flat. Run it again
after rebuilding the map.

```bash
node tools/terrain.mjs ghent   # downloads the terrain model once into tools/cache/
```

### Photos to draw the fronts from

The landmarks' walls and the houses' fronts (`<city>/facades.js` and `fronts.js`) are
drawn by hand from photos. `tools/photos.mjs` fetches them into `tools/cache/photos/<id>/`: from
Wikimedia Commons (by name, by category and taken nearby) and from Mapillary (street-level photos
whose camera looks straight at it), with a `sources.json` of authors and licences.

```bash
node tools/photos.mjs ghent belfort graslei-15        # a landmark or a front, by its id
node tools/photos.mjs ghent korenmarkt-7 --at 51.05473,3.72083 --search "Korenmarkt 7 Gent"
```

Mapillary needs a free access token (mapillary.com/dashboard/developers) in `MAPILLARY_TOKEN`;
without it only Commons is asked.

A whole street at once: `tools/street.mjs` finds every building along it in the map, the edge of
each that looks onto the street (width, floors, which way it faces) and pulls the Mapillary photos
that look straight at each into `tools/streets/<city>/<street>/`, with a `street.json`. They are
checked in: each photo once per street, 512 px, about 22 MB for the 20 spots of `spots.json`.

```bash
node tools/street.mjs ghent Sint-Baafsplein --dry     # only list the fronts
node tools/street.mjs ghent Veldstraat --n 3
```

The cities are drawn in three tiers: landmarks fully by hand (`landmarks.json`, `facades.js`), the
streets that matter drawn from their photos front by front (`fronts.js`), and the rest of the map
built from the OSM outline and height.

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, available under
the Open Database License. 3D models: Stad Gent, Gent in 3D; heights: Digitaal Vlaanderen, DHMV II;
both under the Modellicentie Gratis Hergebruik.
Police siren (`core/sounds/siren.wav`, cut to a loop): [Work With Sounds](https://commons.wikimedia.org/wiki/File:WWS_Policecarsiren.ogg) / Konrad Gutkowski,
CC BY 4.0.

