# Sites

A site is a famous place that is not a city: the Taj Mahal, Angkor Wat. It plays like a small city
(`taj-mahal/play/`), with a race, a tour and quests, but it has no streets of houses. What is there
is the monument, modelled by hand, and what OpenStreetMap has around it: paths, water, walls, trees.

## What a site has

The same files as a small city (see `docs/first-maps.md`), plus the monuments:

- `area.json`, `city.js`, `page.json`, `loader.html`, `races.js`, `tour.js`, `quests.js`: as for a city.
- one file per monument (`taj-mahal/taj.js`, `angkor-wat/temple.js`, ...), modelled on `core/js/arcade.js`
  and `core/js/kit.js` the way `rome/colosseo.js` is, in real metres and scaled by 1.25 at the end.
  Each is a monument in `city.js`'s `MONUMENTS` with its `area` (the map's pieces it replaces), its
  `foot` (what riders bump into) and a `reach`, the distance it is put up from.
- an entry in `_data/sites.yml`, a page `sites/<id>/index.html` (`layout: site`, `site: <id>`) and
  `<id>/index.html` (see the end of this page). The
  sites page and the site's page are in English only, like the art pages. The pictures are
  `assets/img/sites/<id>.jpg` (the page's top and its card).

## The map

`node tools/osm_map.mjs <id> --fetch` builds `map.js` like for a city, with a few more things in
`area.json` for places where OpenStreetMap has no named streets that join up:

- `streets`: paths drawn by hand, `{ name, points: [[x, z], ...] }`, in metres east and south of
  `origin` (`[lat, lon]`). Streets that share a point meet there. Races run along them by name, in
  `routes`, as along real streets. They are paved in slabs (`surface`, `paving_stones` unless said).
- `drop`: OpenStreetMap way ids to leave out (a park drawn over the moat of Angkor Wat).
- `only_named_buildings`: keep only the buildings that have a name, are part of one, are historic or
  are places of worship, which drops the sheds and huts.
- `ruins_as_buildings`: `{ max, skip }`: closed ways tagged `historic=archaeological_site` or `ruins`
  (Pompeii's houses) become buildings if they are at most `max` metres across and their name does not
  match `skip`.
- `geo`: puts where the map's middle is on Earth in `map.geo`, so a monument can be placed from its
  latitude and longitude (`pompeii/frame.js`).
- `default_surface`: the surface for streets that have none tagged or only a plain one (asphalt, gravel, ...) (`sett`: cobbles).
- `drop_ruins`: leaves out the ruins and tombs OpenStreetMap maps as buildings (Giza's), for the site's own monuments.
- `floors`: the most floors a building gets, for the few houses and halls that are left.

The map is centred on its first race route and scaled by 1.25, so a monument's position in game
metres depends on the route. `angkor-wat/frame.js` turns OpenStreetMap's metres into the map's;
`taj-mahal/` has them worked out in the monuments' files. If a route's reach changes, they move.

## Looking at a monument

`/<id>/play/dev.html#<monument id>` shows one monument on a turntable. `/<id>/play/?pos=<x>,<z>&yaw=<radians>`
puts you in the game at a point, looking that way.

## The links back to the website

The game's "Back to the website" link goes to `/<id>/`. For a site that is a small page that sends
the visitor on to `/sites/<id>/` (`<id>/index.html`, `layout: redirect`).
