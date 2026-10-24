// A city map's game coordinates, from its <city>/area.json and map.js: game(lat, lon) ->
// [x, z] in game metres and latLon(x, z) the way back, plus the area, the map and the scale S.
//
// The builder projects lat/lon around the middle of the bbox, scales by S and shifts everything by
// (cx, cz) so the first route is centred. The map's zone is the zone points put through all that,
// which gives the shift away.
import fs from 'node:fs';
import path from 'node:path';

export function mapCoords(dir, city) {
  const area = JSON.parse(fs.readFileSync(path.join(dir, 'area.json'), 'utf8'));
  const S = area.scale ?? 1.25;
  const src = fs.readFileSync(path.join(dir, 'map.js'), 'utf8');
  const MAP = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
  const [bs, bw, bn, be] = area.bbox;
  const lat0 = (bs + bn) / 2, lon0 = (bw + be) / 2;
  const kx = 111320 * Math.cos((lat0 * Math.PI) / 180), kz = 110574;
  const scaled = (lat, lon) => [(lon - lon0) * kx * S, -(lat - lat0) * kz * S];
  const shift = (() => {
    const zp = area.zone_points.map(([la, lo]) => scaled(la, lo));
    const z = [MAP.zone[0], MAP.zone[1]];
    for (const p of zp) {
      const o = [p[0] - z[0], p[1] - z[1]];
      const hits = zp.filter(q => Array.from({ length: MAP.zone.length / 2 }, (_, i) => i)
        .some(i => Math.hypot(q[0] - o[0] - MAP.zone[2 * i], q[1] - o[1] - MAP.zone[2 * i + 1]) < 0.2)).length;
      if (hits >= Math.min(3, zp.length)) return o;
    }
    throw new Error('cannot place the map: its zone does not match the zone points of ' + city);
  })();
  const game = (lat, lon) => { const p = scaled(lat, lon); return [p[0] - shift[0], p[1] - shift[1]]; };
  const latLon = (gx, gz) => [lat0 - (gz + shift[1]) / S / kz, lon0 + (gx + shift[0]) / S / kx];
  return { area, MAP, S, game, latLon };
}
