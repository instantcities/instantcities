// Small modelling helpers for the archaeological sites. Dimensions are real metres;
// the returned monuments use the map's usual 1.25 game scale.
import * as THREE from 'three';
import { Kit, kitMat } from './kit.js';
import { onMap, rect } from './arcade.js';
export { Kit, kitMat, rect };
export const rng = seed => () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
export function monument(game, id, name, x, z, build, feet = [], options = {}) {
  const [gx, gz] = game(x, z), s = 1.25, turn = options.turn ?? 0;
  const rings = feet.map(p => onMap(gx, gz, turn, p.map(([a,b]) => [a*s,b*s])));
  return { id, name, x: gx, z: gz, turn, reach: 1000, area: rings, foot: rings,
    ...options, make: () => { const m = build(); m.scale.setScalar(s); return m; } };
}
// A chipped, leaning block rather than a perfectly rectangular standing stone.
export function roughStone(kit, x, z, w, d, h, hex, seed, y = 0) {
  const r = rng(seed), vertices = [];
  for (const level of [0, 0.52, 1]) for (const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]]) {
    vertices.push([x + a*w/2*(.88+r()*.2) + level*.18, y + h*level + (level ? (r()-.5)*.25 : 0), z+b*d/2*(.88+r()*.2)]);
  }
  const pos=[];
  const tri=(a,b,c)=>pos.push(...vertices[a],...vertices[c],...vertices[b]);
  for(let j=0;j<2;j++) for(let i=0;i<4;i++) { const a=j*4+i,b=j*4+(i+1)%4;tri(a,b,b+4);tri(a,b+4,a+4); }
  tri(8,9,10);tri(8,10,11);tri(0,2,1);tri(0,3,2);
  kit.add(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(pos,3)),hex);
}
export function column(kit,x,z,h,r,color,y=0) {
  kit.add(new THREE.CylinderGeometry(r*.78,r,h,16),color,x,y+h/2,z);
  kit.box(r*2.7,.38,r*2.7,color,x,y+h-.05,z);
  // Separate drums and a broad abacus make the order readable from the path.
  for(let i=1;i<6;i++) kit.add(new THREE.CylinderGeometry(r*(1-i*.035)+.025,r*(1-i*.035)+.025,.045,16),'#a89b83',x,y+h*i/6,z);
}
// Roofless dry-stone room with a real gap for the door on its south side.
export function room(kit,x,z,w,d,h,seed,color='#a29982') {
  const rand=rng(seed), course=.42, block=1.05;
  const wall=(ax,az,bx,bz)=>{
    const len=Math.hypot(bx-ax,bz-az),n=Math.ceil(len/block);
    for(let row=0;row<Math.ceil(h/course);row++) for(let i=0;i<n;i++) {
      const t=(i+.5)/n, y=(row+.5)*course;
      if(az===bz && az>z && Math.abs((t-.5)*len)<.85 && y<2) continue;
      const c=new THREE.Color(color).multiplyScalar(.85+rand()*.25);
      kit.box(az===bz?len/n-.025:.65,course-.025,az===bz?.65:len/n-.025,c,ax+(bx-ax)*t,y,az+(bz-az)*t);
    }
  };
  wall(x-w/2,z-d/2,x+w/2,z-d/2);wall(x-w/2,z+d/2,x+w/2,z+d/2);
  wall(x-w/2,z-d/2,x-w/2,z+d/2);wall(x+w/2,z-d/2,x+w/2,z+d/2);
  kit.box(2.5,.4,.8,color,x,2.15,z+d/2);
}
