import * as THREE from 'three';

// The tour flown yourself (the menu's Fly card): the player rides the city's golden dragon (TOUR.ride)
// and flies it through hoops hung along the tour's path, at the height the tour's camera
// flies there. The hoops are taken in order; one flown past (or skipped, by going through a later
// one) counts as missed, so there is never any need to turn back for it.

const SPACING = 180; // metres along the path between two hoops
const FIRST = 60, LAST = 40; // metres from the start to the first hoop, and from the last one to the end
export const HOOP_R = 5.5; // the hoop's opening, in metres from its middle
const CLEAR = 2; // metres a hoop's bottom stays clear of the ground

// The hoops along the tour (core/js/tour.js), each { x, y, z, nx, ny, nz }: its middle and the way
// through it. ground(x, z) is the street's height there.
export function hoopsAlong(tour, ground) {
  const point = s => {
    const p = tour.at(s), g = ground(p.x, p.z);
    return { x: p.x, z: p.z, y: Math.max(g + p.y + tour.soar(s), g + HOOP_R + CLEAR) };
  };
  const hoops = [];
  for (let s = FIRST; s <= tour.length - LAST; s += SPACING) {
    const p = point(s), a = point(s - 4), b = point(s + 4);
    const d = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) || 1;
    hoops.push({ ...p, s, nx: (b.x - a.x) / d, ny: (b.y - a.y) / d, nz: (b.z - a.z) / d });
  }
  return hoops;
}

// Which hoops have been flown through: pass(from, to) with where the dragon was and is now says
// which hoop it went through or past this frame (a hoop is crossed where the line between the two
// goes through its plane, so even a fast frame can't jump over one).
export class Course {
  constructor(hoops) {
    this.hoops = hoops;
    this.reset();
  }
  reset() {
    this.next = 0;
    this.hits = 0;
    this.result = new Array(this.hoops.length).fill(0); // 0 ahead, 1 through it, -1 missed
  }
  get done() { return this.next >= this.hoops.length; }
  get target() { return this.hoops[this.next]; }
  // returns { hit, hoop } for the hoop crossed, or null
  pass(from, to) {
    // the next few: where the path loops back near itself, a later one may be crossed first
    for (let i = this.next; i < Math.min(this.hoops.length, this.next + 4); i++) {
      const h = this.hoops[i];
      const a = (from.x - h.x) * h.nx + (from.y - h.y) * h.ny + (from.z - h.z) * h.nz;
      const b = (to.x - h.x) * h.nx + (to.y - h.y) * h.ny + (to.z - h.z) * h.nz;
      if (a > 0 || b <= 0) continue; // not across its plane, the right way through
      const k = a / (a - b);
      const off = Math.hypot(from.x + (to.x - from.x) * k - h.x, from.y + (to.y - from.y) * k - h.y, from.z + (to.z - from.z) * k - h.z);
      if (off > HOOP_R * 4) continue; // across its plane, but nowhere near it
      for (let j = this.next; j < i; j++) this.result[j] = -1;
      const hit = off <= HOOP_R;
      this.result[i] = hit ? 1 : -1;
      if (hit) this.hits++;
      this.next = i + 1;
      return { hit, hoop: h };
    }
    return null;
  }
}

// The hoops themselves: thick rings, only the next one to fly through yellow (glowing a little, so it
// reads at night too, and pulsing), the ones after it grey, the missed ones faint, the ones flown
// through gone.
export function hoopMeshes(hoops) {
  const geo = new THREE.TorusGeometry(HOOP_R, 0.38, 8, 48);
  const ahead = new THREE.MeshStandardMaterial({ color: 0x8c9096, roughness: 0.6, metalness: 0.2 });
  const next = new THREE.MeshStandardMaterial({ color: 0xffe066, emissive: 0xffb800, roughness: 0.3, metalness: 0.2 });
  const missed = new THREE.MeshBasicMaterial({ color: 0x9a9a9a, transparent: true, opacity: 0.3, depthWrite: false });
  const root = new THREE.Group();
  const z = new THREE.Vector3(0, 0, 1), n = new THREE.Vector3();
  const rings = hoops.map(h => {
    const m = new THREE.Mesh(geo, ahead);
    m.position.set(h.x, h.y, h.z);
    m.quaternion.setFromUnitVectors(z, n.set(h.nx, h.ny, h.nz));
    root.add(m);
    return m;
  });
  // course: its results and which is next; t: seconds, for the pulse
  function update(course, t) {
    rings.forEach((m, i) => {
      const r = course.result[i];
      m.visible = r !== 1;
      m.material = r < 0 ? missed : i === course.next ? next : ahead;
      m.scale.setScalar(i === course.next ? 1 + Math.sin(t * 5) * 0.06 : 1);
    });
  }
  return { root, update };
}
