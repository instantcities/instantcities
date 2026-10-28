import * as THREE from 'three';
import { Kit, kitMat, monument, rect, room, rng } from '../core/js/site-model.js';
import { game } from './frame.js';
const houses=[];
// Groups of rooms leave the central plaza and the visitor circuit open.
for(const [x0,z0,nx,nz] of [[-44,0,3,5],[12,-130,3,4],[12,25,3,6],[-42,80,2,4]]) for(let i=0;i<nx;i++) for(let j=0;j<nz;j++) houses.push([x0+i*13,z0+j*14,8.5,10,2.8+(i+j)%3*.45]);
function quarter() {const k=new Kit();houses.forEach(([x,z,w,d,h],i)=>room(k,x,z,w,d,h,i+1));return k.mesh(kitMat(.98));}
function terraces() {
 const k=new Kit();
 for(let i=0;i<18;i++) {
  const x=100+i*6,y=(18-i)*1.4;
  k.box(6,y+1.5,190-i*3,'#959078',x,(y-1.5)/2,145);
  k.box(6,.2,190-i*3,i%3===0?'#94a466':'#83975c',x,y+.04,145);
  for(let j=0;j<35-i;j++) k.box(.14,1.1,1.3,'#b6b099',x-3.03,y-.65,53+j*5);
 }
 return k.mesh();
}
function mountain() {
 const k=new Kit();
 // Shared positions at each seam keep the rock watertight. These profiles are scenery,
 // with a rounded crown and ribs, rather than perfect cones or surveyed elevations.
 const peak=(x,z,width,height,seed,color)=>{
  const r=rng(seed),g=new THREE.LatheGeometry([[1,0],[.94,.12],[.79,.32],[.61,.55],[.38,.78],[.17,.94],[0,1]].map(([u,v])=>new THREE.Vector2(u*width,v*height)),24);
  const p=g.attributes.position,same=new Map();
  for(let i=0;i<p.count;i++) {
   const px=p.getX(i),y=p.getY(i),pz=p.getZ(i),key=[px,y,pz].map(v=>Math.round(v*1000)).join(',');
   if(!same.has(key))same.set(key,.9+r()*.17);
   const jitter=same.get(key);p.setX(i,px*jitter+y*.1);p.setZ(i,pz*jitter);
  }
  g.computeVertexNormals();k.add(g,color,x,-6,z);
 };
 peak(0,0,160,290,80,'#536f4b');
 peak(-195,30,130,190,81,'#62794f');
 peak(180,-80,160,220,82,'#667d54');
 return k.mesh(kitMat(1));
}
export const MONUMENTS=[
 monument(game,'residential','Residential quarter',0,0,quarter,houses.map(([x,z,w,d])=>rect(x-w/2,z-d/2,x+w/2,z+d/2))),
 monument(game,'sacred-plaza','Sacred Plaza',-35,-65,()=>{const k=new Kit();room(k,0,0,15,10,4.5,500,'#c2bba4');room(k,0,-17,18,8,3.8,501,'#b9b29c');return k.mesh();},[rect(-8,-5,8,5),rect(-10,-22,10,-12)]),
 monument(game,'terraces','Agricultural terraces',0,0,terraces,[]),
 monument(game,'huayna-picchu','Huayna Picchu',15,-410,mountain,[],{reach:1800,far:3}),
];
