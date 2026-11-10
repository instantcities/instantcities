import * as THREE from 'three';
import { Kit, kitMat, monument, rect, room } from '../core/js/site-model.js';
import { game } from './frame.js';
function pyramid(width,height,casing=false) {
 const k=new Kit(), course=1.2;
 for(let y=0;y<height;y+=course) {
  const h=Math.min(course,height-y), b=width*(1-y/height),t=width*(1-(y+h)/height);
  const color=casing&&y>height*.77?'#e2d8b9':['#c2a273','#c9ac7d','#bca075','#d1b487'][Math.floor(y/course)%4];
  k.frustum(b,b,Math.max(0,t-.07),Math.max(0,t-.07),h-.035,color,0,y,0);
 }
 return k.mesh(kitMat(1));
}
function sphinx() {
 const k=new Kit(),sand='#bd9c6b';
 k.box(65,1.1,23,'#aa885c',0,.45,0);
 k.add(new THREE.SphereGeometry(1,16,10),sand,-7,7,0);
 // Long lion body, haunches and two extended paws, head at its eastern end.
 k.frustum(38,14,30,10,10,sand,-7,0,0);
 for(const z of [-5,5]) {k.box(24,3.2,4.2,'#c5a778',21,1.6,z);k.add(new THREE.SphereGeometry(4.5,10,8),sand,-22,4.5,z);}
 k.frustum(10,10,8,7,7,'#c8ac80',13,9,0);
 k.box(5,6.5,5.7,'#d2b78e',16,13.5,0);
 // Striped nemes headdress, ears and broad brow.
 for(const z of [-4.2,4.2]) k.frustum(6,3.8,3,2.5,8,sand,12,10,z);
 k.box(2,.55,6,'#8d704c',18.6,15.1,0);
 k.box(.5,.45,3.3,'#795f42',18.8,11.8,0);
 return k.mesh(kitMat(.98));
}
const main=[['khufu','Great Pyramid of Khufu',0,0,230.3,138.5,false],['khafre','Pyramid of Khafre',-360,350,215.3,136.4,true],['menkaure','Pyramid of Menkaure',-570,730,102.2,61,false]];
export const MONUMENTS=main.map(([id,name,x,z,w,h,cap])=>monument(game,id,name,x,z,()=>pyramid(w,h,cap),[rect(-w/2,-w/2,w/2,w/2)],{reach:2200,far:4}));
MONUMENTS.push(monument(game,'sphinx','Great Sphinx',250,440,sphinx,[rect(-33,-12,34,12)],{reach:1200}));
for(const [i,x,z] of [[0,157,10],[1,157,70],[2,157,130],[3,-570,830],[4,-510,830],[5,-450,830]]) MONUMENTS.push(monument(game,'queen-'+i,'Queens’ pyramid',x,z,()=>pyramid(42,24),[rect(-21,-21,21,21)],{reach:1100}));
MONUMENTS.push(monument(game,'valley-temple','Valley temple',295,485,()=>{const k=new Kit();room(k,0,0,44,32,4,50,'#ab8f6f');for(let i=-1;i<=1;i++) for(const z of [-7,7]) k.box(1.6,4.5,1.6,'#b99878',i*8,2.25,z);return k.mesh();},[rect(-22,-16,22,16)]));
