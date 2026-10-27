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
