// The surviving stone setting, rather than a reconstruction of a complete ring.
import { Kit, kitMat, roughStone, monument, rect } from '../core/js/site-model.js';
import * as THREE from 'three';
import { game } from './frame.js';
const feet=[], stones=[];
const standing=[0,1,2,3,4,5,6,7,10,12,15,18,22,25,28,29];
for(const i of standing) {
  const a=i*Math.PI/15, x=15*Math.sin(a),z=15*Math.cos(a);
  stones.push({x,z,w:2.1,d:1.3,h:4.1,seed:i+1});feet.push(rect(x-1.2,z-.8,x+1.2,z+.8));
}
export function circle() {
  const k=new Kit();
  for(const s of stones) roughStone(k,s.x,s.z,s.w,s.d,s.h,'#918f7c',s.seed);
  for(const i of [0,1,2,3,5]) {
    const a=(i+.5)*Math.PI/15;
    k.box(3.8,.85,1.25,'#a4a18b',15*Math.sin(a),4.4,15*Math.cos(a),0,a,0);
  }
  // The five inner trilithons: the tall south-west pair has only one upright standing.
  for(const [i,x,z,h] of [[0,-7,-3,5.4],[1,-5,5,6],[2,0,8,6.7],[3,5,5,6],[4,7,-3,5.4]]) {
    for(const side of [-1,1]) {
      if(i===2&&side===1) continue;
      roughStone(k,x+side*1.65,z,1.7,1.6,h,'#8c8b77',50+i*3+side);
    }
    if(i!==2) k.box(5.1,.95,1.7,'#a4a18b',x,h+.4,z);
    else roughStone(k,2.5,4,4.5,1.8,.95,'#9c9986',88);
  }
  for(let i=0;i<20;i++) {const a=i*Math.PI/10;roughStone(k,10*Math.sin(a),10*Math.cos(a),.65,.6,1.1+(i%3)*.2,'#727f80',100+i);}
  for(const [x,z,w,d] of [[-18,6,4,1.5],[9,-11,4,1.6],[-7,12,3,1.4]]) roughStone(k,x,z,w,d,.8,'#92907c',Math.round(x*x));
  return k.mesh(kitMat(.98));
}
// Add a low earthwork, open at the north-east approach. No collider blocks the visitor walk.
function earthwork() {
 const k=new Kit();
 for(let i=0;i<90;i++) {const a=i*Math.PI*2/96;if(a>2.25&&a<2.8)continue;
  k.box(3.4,.5,3.5,'#7e9057',49*Math.sin(a),.1,49*Math.cos(a),0,a);
  k.box(3.4,.08,2,'#b2a88a',46*Math.sin(a),.025,46*Math.cos(a),0,a);
 }
 return k.mesh();
}
export const MONUMENTS=[
 monument(game,'stone-circle','Stone circle',0,0,circle,[...feet,...[[-7,-3],[-5,5],[0,8],[5,5],[7,-3]].map(([x,z])=>rect(x-2.7,z-1,x+2.7,z+1))]),
 monument(game,'heel-stone','Heel Stone',40,-70,()=>{const k=new Kit();roughStone(k,0,0,2.4,2.1,4.7,'#918a71',280);return k.mesh();},[rect(-1.4,-1.3,1.4,1.3)]),
 monument(game,'earthwork','Bank and ditch',0,0,earthwork,[],{reach:600}),
];
