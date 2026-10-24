# Ghent Theft Auto: what we can borrow

[Ghent Theft Auto](https://medium.com/ghent-theft-auto) was Lucas Selfslagh's pet project to rebuild
Ghent as a multiplayer open-world game, first in Unreal Engine 4, later in Unity. He wrote four
posts about it on Medium between January 2019 and May 2020:

| Post | Date | About |
|---|---|---|
| [with Python](https://medium.com/ghent-theft-auto/making-ghent-theft-auto-with-python-ce9771220502) | 25 Jan 2019 | Scripts that turned a day of clicking in Blender/QGIS into a 2-minute command |
| [with Git](https://medium.com/ghent-theft-auto/making-ghent-theft-auto-with-git-5ad1fe732555) | 28 Jan 2019 | Issues, milestones, feature branches, submodules |
| [with Open Data](https://medium.com/ghent-theft-auto/making-ghent-theft-auto-with-open-data-cab03cdb5c36) | 2 Feb 2019 | Data from data.stad.gent and OpenStreetMap that drives the world and the gameplay |
| [with heightmaps](https://medium.com/ghent-theft-auto/making-ghent-theft-auto-with-height-maps-5b7400f6ce56) | 1 May 2020 | Turning the "Gent in 3D" terrain meshes into heightmaps, and painting the ground from GIS data |

(Medium blocks scrapers; the text came from the publication's RSS feed at
`https://medium.com/feed/ghent-theft-auto`. A later post on real airplanes flying over the game
was announced but never published. An older, unrelated "Ghent Theft Auto" was a GTA IV mod
started in 2012.)

The Python and Git posts hold nothing new for us: we already build maps with one command
(`tools/osm_map.mjs`). The Open Data and heightmap posts do.

## Ideas worth taking, best first

### 1. Respawn at the nearest doctor

His best idea. When a player dies, the game looks up the nearest doctor from Ghent's open data
list of GPs and respawns the player at that doctor's front door. Open data turns into a game rule.

**For us:** a horse that falls in the water, or loses its way in free roam, comes back at the
nearest **vet** (OSM `amenity=veterinary`), or a riding school / stable (`leisure=horse_riding`)
when there is one nearby. The street sign could say "Dierenkliniek Brugse Poort". Cheap to do:
one more Overpass tag and a nearest-point lookup.

### 2. Real city rhythms as obstacles and scenery

He wanted the world to run on the city's real schedules: shops open and close at their real
hours, postmen empty real post boxes at the posted times, the right kind of rubbish is out in the
right streets on collection day and a bin lorry picks it up in the morning, trams run on time.

**For us, as Mario Kart obstacles:**
- **Collection day**: on the real IVAGO day for a street (or just a fixed weekday per street), its
  pavements fill with bin bags and blue PMD bags to jump. A bin lorry slowly drives a street as a
  moving obstacle.
- **Opening hours**: OSM `opening_hours` on shops and cafés. After closing time the shutters come
  down and the café terraces we already draw are stacked away; it pairs with a night mode.
- **Post boxes** (`amenity=post_box`) and **trams** that keep to their stops are small extras.

### 3. A day/night cycle tied to the real clock (and live data)

His dream was a timelapse of Ghent with day and night driven by live data. He already showed
live underground-parking occupancy in game ("because I can").

**For us:** the sun follows the real time and date in Ghent (sunrise/sunset is a short formula,
no API). At night the street lights, shop windows and the floodlit Belfort come on. Optional live
extras from data.stad.gent, which has open APIs without keys: parking occupancy on the car-park
signs, or real rain from a weather API turning on our rain cloud weather.

### 4. Paint the ground from land use instead of meshes

He never paints a "splatmap" by hand. He rasterises GIS polygons (forest, grass, wheat, gravel,
river bed) straight into the terrain's texture masks, and scatters trees inside every `forest`
polygon automatically.

**For us:** we draw parks, grass and water as separate polygons. Rasterising OSM land use into one
canvas texture per tile (grass, gravel, cobbles, sand, mud) would give one draw call for the whole
ground and let us show surfaces we skip now (`surface=sett` cobbles on the Korenmarkt,
`surface=gravel` paths in the Citadelpark). The same mask could slow horses on mud and sand.
We already fill `landuse=forest` / `natural=wood` with trees (`WOODED` in `tools/osmbuild.mjs`).

### 5. Real trees from the city's tree inventory

He placed every street tree from Ghent's open tree dataset, each with its species, planting
date and height.

**For us:** we use OSM `natural=tree`, which is patchy. Ghent publishes its own tree inventory
(bomeninventaris) on data.stad.gent with species and size. Merging it in would put trees in the
streets where OSM has none and let a plane tree look like a plane tree and a birch like a birch.

### 6. Ground height from a heightmap, sampled, not raycast

His argument: store terrain as a 16-bit image, not as meshes. Asking for the height at (x, z) is
then a lookup with bilinear interpolation between neighbouring pixels: far cheaper than a raycast,
and it works outside the engine too, so every 2D point (trees, signs, the route) hugs the ground.
His heightmaps took a quarter of the space of the meshes.

**For us:** this is item 5 in [new-maps.md](new-maps.md#whats-next). His post says which data to
use for Flanders: the **DHM Vlaanderen** LIDAR model (1 m in DHMV II, free from Digitaal
Vlaanderen) instead of the coarser Terrarium tiles. Bake it per map in `tools/osm_map.mjs` into a
small greyscale PNG and sample it in `js/relief.js`. Ghent is flat, but the Blandijnberg, the
Citadelpark and the slopes up to the bridges would show.

### 7. A city that its players build

His long-term goal: a multiplayer digital twin that writes changes back to OpenStreetMap, so
players building the world also improve the map, like friends building in Minecraft.

**For us:** too big as such, but a small version fits: players drop items or obstacles on a map
and share it (ties in with "sharing a map" in [new-maps.md](new-maps.md#whats-next)).

## What he did that we already do

- One automated build of the city from OpenStreetMap, rerunnable in minutes.
- OSM as the main source. He shows why it suits Ghent: the reopened Nederschelde had water on OSM
  the day it opened, while Google Maps still lacked it four months later.
- Trees, roads and points of interest placed from data instead of by hand.

## What he warns against

- **Gent in 3D** (the city's own 3D model) comes as Autodesk `.dwg` files with flipped normals,
  64 needless meshes per tile and origins off by metres. Not worth the trouble for a browser game.
- Don't ship redundant data: every vertex or object saved at build time is saved on every load,
  forever. Relevant to the R40 map (5.5 MB) if we ever tile it for phones.
