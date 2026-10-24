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
- **The ground** (~65 MB, built all at once) is only tiled, not built when in sight: its water,
  quays, hollows and the steps people sit on hang together more than the houses do.
- **Each route's world** keeps its trees, cars and bikes for the whole city, and a route ridden
  before stays in memory: a phone could let go of the old one.
- **The map** is a 9 MB JS file of one object literal: as JSON (or binary) it would load faster and
  peak lower.
- Freeing the geometry's own arrays after upload would save more, but the game does not handle a
  lost WebGL context, which iOS does: meshes would come back empty.

## Lecce

Lecce costs Ghent nothing: it is its own page (`/lecce/`) with its own map, which `/ghent/` never
loads. All the two share is the engine, and of Lecce's own look only `core/js/italian.js` (6 KB).

## Measuring

In the dev console of a running game: `ghent3d.renderer.info` (set `info.autoReset = false`,
`info.reset()`, `ghent3d.render()`) for triangles and draw calls; `__pr.teleport({ x, z })` to
jump somewhere (e.g. `{ x: -2500, z: 1500 }` far out west). `ghent3d.render()` also builds what came into
sight, so call it after a teleport when the tab is in the background.
