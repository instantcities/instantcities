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
 const k=new Kit(),r=rng(80);
 // A steep irregular mountain silhouette; this is scenery, not a surveyed elevation model.
 const g=new THREE.LatheGeometry([[160,0],[145,30],[120,80],[95,140],[65,205],[30,260],[0,290]].map(([x,y])=>new THREE.Vector2(x,y)),20);const p=g.attributes.position;
 const same=new Map();
 for(let i=0;i<p.count;i++) {const x=p.getX(i),y=p.getY(i),z=p.getZ(i),key=[x,y,z].map(v=>v.toFixed(3)).join(',');if(!same.has(key))same.set(key,.9+r()*.18);const jitter=same.get(key);p.setX(i,x*jitter+y*.12);p.setZ(i,z*jitter);}
 g.computeVertexNormals();k.add(g,'#536f4b',0,-6,0);
 k.add(new THREE.ConeGeometry(130,220,13,5),'#62794f',-210,80,30);
 k.add(new THREE.ConeGeometry(160,260,13,5),'#667d54',180,95,-80);
 return k.mesh(kitMat(1));
}
export const MONUMENTS=[
 monument(game,'residential','Residential quarter',0,0,quarter,houses.map(([x,z,w,d])=>rect(x-w/2,z-d/2,x+w/2,z+d/2))),
 monument(game,'sacred-plaza','Sacred Plaza',-35,-65,()=>{const k=new Kit();room(k,0,0,15,10,4.5,500,'#c2bba4');room(k,0,-17,18,8,3.8,501,'#b9b29c');return k.mesh();},[rect(-8,-5,8,5),rect(-10,-22,10,-12)]),
 monument(game,'terraces','Agricultural terraces',0,0,terraces,[]),
 monument(game,'huayna-picchu','Huayna Picchu',15,-410,mountain,[],{reach:1800,far:3}),
];
