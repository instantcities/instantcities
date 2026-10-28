import { Kit, kitMat, monument, rect, column, room } from '../core/js/site-model.js';
import { game } from './frame.js';
function temple(w,d,nx,nz,h,ruined=false) {
 const k=new Kit(),marble='#d8cdb4';
 for(let i=0;i<3;i++) k.box(w+3-i*.8,.35,d+3-i*.8,['#a99f8b','#bdb299',marble][i],0,.175+i*.35,0);
 const col=(x,z,i)=>column(k,x,z,ruined&&i%11===7?h*.45:h,.85,marble,1.05);
 for(let i=0;i<nx;i++) for(const z of [-d/2,d/2]) col(-w/2+i*w/(nx-1),z,i);
 for(let i=1;i<nz-1;i++) for(const x of [-w/2,w/2]) col(x,-d/2+i*d/(nz-1),i+3);
 // Surviving entablature and pediment fragments; the roof and central cella are open.
 for(const z of [-d/2,d/2]) k.box(w+2,1.4,2.1,marble,0,h+1.6,z);
 for(const x of [-w/2,w/2]) {k.box(2.1,1.4,d+2,marble,x,h+1.6,0);k.frustum(2.2,d+2,2.2,0,3.8,'#cec1a6',x,h+2.3,0);}
 room(k,0,0,w*.65,d*.55,ruined?3.5:6,42,'#c7bba2');
 return k.mesh(kitMat(.92));
}
function erechtheion() {
 const k=new Kit();room(k,0,0,22,12,5.5,70,'#d0c5ad');
 for(let i=0;i<6;i++) column(k,-10+i*4,-9,6,.5,'#d4c9b1');
 k.box(23,1,4,'#d7ccb4',0,6.6,-9);
 // Six Caryatids on the southern porch, modelled as draped figures supporting the roof.
 k.box(11,1.6,6,'#bfb49c',0,.8,9);
 for(const x of [-4,0,4]) for(const z of [7,11]) {
  k.frustum(1.1,.85,.6,.55,2.6,'#ded3b8',x,1.6,z);
  k.box(.65,.8,.55,'#ded3b8',x,4.45,z);k.box(.65,.7,.6,'#c4b89f',x,5.05,z);
 }
 k.box(12,.9,7,'#d2c5a8',0,5.9,9);return k.mesh();
}
export const MONUMENTS=[
 monument(game,'parthenon','Parthenon',0,0,()=>temple(69.5,30.9,17,8,10.4,true),[rect(-35,-16,35,16)],{turn:-.22}),
 monument(game,'erechtheion','Erechtheion',-20,-60,erechtheion,[rect(-12,-11,12,13)]),
 monument(game,'propylaea','Propylaea',-140,0,()=>temple(18,28,4,6,8),[rect(-10,-15,-4,15),rect(4,-15,10,15)]),
 monument(game,'athena-nike','Temple of Athena Nike',-153,36,()=>temple(8,5.5,4,2,4),[rect(-5,-4,5,4)]),
];
// Fallen drums and squared blocks around the Parthenon, with a low fortification along the rim.
MONUMENTS.push(monument(game,'summit-stone','Stone on the summit',0,0,()=>{
 const k=new Kit();
 for(const [x,z] of [[-47,24],[-43,27],[46,-26],[52,-25],[57,-23],[-38,-27]]) {
  k.box(2.2,.8,1.4,'#c1b59c',x,.4,z,0,x*.1);
  k.box(1.4,.5,.9,'#d1c6ad',x+.5,1.05,z+.2,0,z*.1);
 }
 for(const [x,z] of [[48,23],[53,27],[-48,-23]]) {
  k.rod([x-1,1,z],[x+1,1,z],1,'#c7baa0',16);
 }
 for(const [ax,az,bx,bz] of [[-205,-100,115,-100],[115,-100,130,90],[130,90,-195,95],[-195,95,-205,-100]]) {
  const len=Math.hypot(bx-ax,bz-az),n=Math.ceil(len/3),turn=Math.atan2(-(bz-az),bx-ax);
  for(let i=0;i<n;i++) {const t=(i+.5)/n;k.box(len/n+.03,2.4,1.8,i%3?'#a69b82':'#baad90',ax+(bx-ax)*t,1.2,az+(bz-az)*t,0,turn);}
 }
 return k.mesh(kitMat(.98));
},[],{reach:700}));
