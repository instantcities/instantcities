# Performance: what the city costs, and what keeps it light

Phones (iPhones above all) kept reloading the game: the tab ran out of memory. This is what was
found, what was done about it, and what is still open. All numbers are from Chrome on a Mac with
phone emulation (375×812, `pointer: coarse`, so `LOW_POWER` is on), on `/ghent/`, a clear day.

## Where it went

- **Drawing all of it, all the time.** The city is built as a few hundred big meshes, each spanning
  all 7 km of it (every wall with the same facade, all the asphalt, every tree, every parked bike),
  so the renderer could never leave one out: every frame drew ~11.5M triangles wherever you were,
  and again for the shadows, though the fog hides everything past 620 m.
- **Textures.** ~830 canvas textures, ~190 MB of canvas pixels kept next to their GPU copies. Of
  them, 136 MB are the landmarks', the statues' and the hand-drawn house fronts' (their drawn walls),
  ~50 MB the houses' walls.
- **Geometry.** ~150 MB: the ground (streets, kerbs, parks, water) ~65 MB, the houses ~50 MB, the
  landmarks ~11 MB, each route's trees, cars, bikes and tram wires the rest.
- **Building it.** The JS heap peaked above 1 GB while the city was built (its batches were plain
  arrays of numbers), settling at ~420 MB.

## What was done

1. **Tiles, `core/js/tiles.js`: only what is near is drawn.** `tileUp()` cuts every mesh that never
   changes (`userData.still`, set by `Batch.mesh()`, `instanced()`, the parked bikes and the
   furniture) into 400 m tiles, each a `THREE.LOD` that shows nothing past the fog (`GONE`). The
   sitters are a crowd per tile (`tileOf()`), so only those in view move.
   **11.2–11.6M → 0.6–1.5M triangles a frame on a phone, ~15M → 0.9–2M on a computer.**
2. **Built when in sight, let go behind: `later()` and `lookAround()` in `tiles.js`.** The
   landmarks, the statues and the hand-drawn fronts (`addLandmarks(group, place)`,
   `addFronts(…, place)`) and the houses' walls and roofs, tile by tile (`osmBuildings` →
   `buildHouses`), are made when a camera first comes within sight of them and freed (geometry,
   materials, textures) once every camera is 200 m past that. `render()` calls `lookAround()` with
   the cameras every frame; it builds for at most 6 ms a frame, nearest first, but everything in
   sight at once after a jump (the first view, a teleport). What each house is (its walls, height,
   shop, roof) is still worked out with the city, and so are the shops' signs, awnings and terraces,
   because the sitters sit at their tables. The houses' wall textures are shared by the tiles that
   use them (`takeWall`/`dropWall`, counted) and drawn from a seed of their own, so a tile built
   again looks the same. The dev page (`dev.js`) still builds the landmarks straight away.
3. **Lighter while building.** `Batch` keeps its numbers in growing typed arrays (`Grow`): half
   the memory of plain arrays.
4. **Canvases let go.** The city's textures (`canvasTexture`, the dressed walls) shrink their canvas
   to 1×1 once uploaded (`letGo` in `scenery.js`): the city draws them once and never again.
5. **Half the parked cars and bikes** (`PARKED` in `device.js`; `?full` in the address parks them
   all, to compare). A phone parks half of those bikes again, as before.
6. **A phone sees less far**: its fog closes in at 70% of the distance (`SIGHT` in `device.js`).

7. **The trams' and the tram stops' signs shared.** Every tram had a canvas of its own for the
   destination display at each end (~17 MB for the fleet); now there is one texture per line and
   way, which every tram on it shows (`signFor` in `trams.js`). A stop's platforms share their sign
   face (`signTexture` in `tramplatform.js`), and both let their canvas go once uploaded. Canvases
   held round the Korenmarkt and the Graslei: 117–139 → 94–117 MB. (The departure boards keep theirs:
   they are drawn again every few seconds.)
8. **A phone lets go sooner:** `SLACK` (`tiles.js`) is 80 m on a phone, 200 m on a computer. Riding
   round the old centre (Kouter, Korenmarkt, Graslei, Vleeshuis, Gravensteen, Vrijdagmarkt, Belfort,
   Sint-Baafs and back), the GPU process ended at ~495 MB instead of ~535 MB.

**Memory, phone emulation, before → after (2):** geometry 149 → 88–100 MB, canvases 150–154 →
81–91 MB in town and 7–23 MB out of it, JS heap (as read, not collected) ~770 → 420–480 MB.

## Still open

- **A stutter when a tile is first built: mostly fixed.** The geometry was cheap (all 371 builds
  of the first view together ~250 ms); the time was the houses' wall textures, 15–45 ms each,
  because `noise()` reads each canvas's pixels back and a canvas kept on the GPU makes that wait
  for it. And `drop()` disposed the materials, which threw their compiled shaders away, so riding
  back compiled them again (50–100 ms each). Now `canvasTexture()` draws on the CPU
  (`willReadFrequently`) and `drop()` keeps the materials. Same ride (in from the far west, 3 m a
  frame), before → after: the first view's build 7.0 → 2.7–3.6 s, frames over 100 ms 12 → 0–3,
  the worst 251 → 78–212 ms; riding back through the same streets compiles no shaders. What is
  left: a shader compiled the first time something new comes into sight (a handful a session). If
  a phone still stalls on a tile, the next step is drawing its textures ahead, one per frame,
  while it is still out of sight, or fewer of them (one storey repeated up the wall).

  To measure: teleport out west (`__pr.teleport({ x: -2000, z: 300 })`), then step in 3 m at a
  time towards `{ x: 300, z: -200 }` with `__pr.teleport` + `ghent3d.step(0.016)` +
  `ghent3d.render()`, timing each `render()` (it also builds what came into sight), and watch
  `ghent3d.renderer.info.programs.length` for shader compiles. In a hidden browser tab the timers
  are throttled: step in synchronous chunks, and compare runs from the same session only.
- **The centre is the peak, not a leak.** Riding the centre and out west and back, three times, the
  GPU's geometry and texture counts come back to the same numbers each time (headless Chrome, iPhone
  13 emulation, Oct 2026): the tab ~900–980 MB, its GPU process ~340–550 MB, the JS heap ~300 MB
  (of it ~170 MB small plain arrays: the map's and the routes' outlines and points, `p`, `pts`), the
  geometry's arrays ~140 MB. Canvases still held in town: ~75–115 MB, nearly all the houses' walls
  and the drawn fronts built within sight but not yet drawn (their canvas goes once uploaded).
  Bigger steps from here: draw those canvases only when first uploaded (but a turn round would then
  draw many in one frame), or fewer pixels a metre on a phone (blurrier fronts up close).
- **The ground** (~65 MB, built all at once) is only tiled, not built when in sight: its water,
  quays, hollows and the steps people sit on hang together more than the houses do.
- **Each route's world** keeps its trees, cars and bikes for the whole city, and a route ridden
  before stays in memory: a phone could let go of the old one.
- **The map** is a 9 MB JS file of one object literal: as JSON (or binary) it would load faster and
  peak lower.
- Freeing the geometry's own arrays after upload would save more, but the game does not handle a
  lost WebGL context, which iOS does: meshes would come back empty.

## Startup time

Every start (a new tab, the app opened again after iOS closed it) builds the whole city again from
its map: nothing of it is kept between starts. The loading screen's steps time it: "Building the
city" is `getCity()` + the first route's `getWorld()`, "Drawing the first frame" is `lookAround()`
building what the menu's camera sees and the shaders compiling (only ~35 programs: not where it goes).

Measured with a CPU profile of headless Chrome (WebGL on the CPU, so slower than a phone's GPU but
the JavaScript in proportion), on the app's build (`app/www`):

| | before | after |
|---|---|---|
| "Building the city" | 11.0–12.1 s | 9.2–9.4 s |
| loading screen in all | 27.7–28.4 s | 24.8–24.9 s |

What was made quicker (the city it builds is the same, checked with a fingerprint of every still
mesh's geometry, placing, materials and textures):

- `fitToHills` → `cut()` (`terrain.js`): the ground's height at a corner is looked up only when a
  triangle needs it, and the index is read in place until a mesh is really cut. Most meshes lie where
  the ground hardly bends and come back as they were.
- `addFronts` (`fronts.js`): finds each hand-drawn house's building through a grid of the buildings'
  middles, instead of working out every building's middle again for every house (~1 s).
- `within` (`landmarks.js`, asked for every building of the map): each landmark ring's box first.
- `sunkenWater` (`scenery.js`): the water's edge test (`wet`) looks only at the edges of a
  water polygon in the point's band of z (`inside()`), and a body spanning many grid cells is kept
  aside instead of put in each.
- `cutMesh` (`tiles.js`): reads the positions straight from the array, with a number for a tile's key.

Where the rest goes, largest first (profile, ms, of the "after"): `buildCity` ~5400 (the ground
~1900, of it the quay walls ~500 and the street strips ~360; the furniture ~870, mostly `room()`
asking `ctx.free`/`ctx.clear` with `pointIn` on buildings; `osmBuildings` ~680; the tram stops
~350; the traffic network ~360), `fitToHills` ~1800 (the loop over every triangle in `cut()`),
`tileUp` ~600, and in the first frame `lookAround()` ~3000 (houses' wall textures, the drawn
fronts' `elevation()` canvases, the landmarks). Ideas for later:

- Work out at build time (`tools/`) what only depends on the map, e.g. which quay pieces get a wall,
  where lamps and benches stand, which buildings `covers()` leaves out, and ship it with the map.
- Keep what was built (geometry, canvas textures) in IndexedDB between starts, keyed by the
  version. The biggest win, but a large change: ~100 MB of geometry and ~160 MB of textures, and
  every builder's closures (`update`, `setNight`, the traffic) would need rebuilding round it.
- Drop the loading screen before `lookAround()` has built everything round the menu's camera,
  letting it pop in behind the menu.

## Lecce

Lecce costs Ghent nothing: it is its own page (`/lecce/`) with its own map, which `/ghent/` never
loads. All the two share is the engine, and of Lecce's own look only `core/js/italian.js` (6 KB).

## Measuring

In the dev console of a running game: `ghent3d.renderer.info` (set `info.autoReset = false`,
`info.reset()`, `ghent3d.render()`) for triangles and draw calls; `__pr.teleport({ x, z })` to
jump somewhere (e.g. `{ x: -2500, z: 1500 }` far out west). `ghent3d.render()` also builds what came into
sight, so call it after a teleport when the tab is in the background.
