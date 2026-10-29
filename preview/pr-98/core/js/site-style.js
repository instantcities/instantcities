// Light and weathered materials for the seven sites. Kept opt-in so the cities keep their look.
import * as THREE from 'three';
const LIGHT = {
  'taj-mahal': [0x579ac2,0xeee3cf,0xffe2bd,2.1,[-160,115,90],[0xe9f0ff,0x9b866a,1.25]],
  'angkor-wat': [0x438cb5,0xc9dbd3,0xffebcd,2.2,[-130,145,110],[0xdae8e3,0x5f694b,1.25]],
  'pompeii': [0x468bc5,0xe4dac6,0xffe0b3,2.2,[-140,145,70],[0xedf3fa,0x9e8565,1.15]],
  'stonehenge': [0x4c97c6,0xdce6da,0xfff2d7,1.9,[-120,95,80],[0xe8f2fa,0x788564,1.35]],
  'giza': [0x498fc1,0xefdcba,0xffdc9c,2.2,[-150,105,90],[0xe9f1f9,0xa88d63,1.1]],
  'acropolis': [0x368fce,0xe8dfcc,0xffe3b8,2.2,[-110,145,80],[0xe8f2ff,0x9c8b6c,1.2]],
  'machu-picchu': [0x559eb8,0xd9e4d8,0xfff0ce,1.75,[-100,145,60],[0xdceae0,0x6c7352,1.45]],
};
export function siteTheme(id, base) {
  const [sky,horizon,color,intensity,pos,hemi]=LIGHT[id];
  return {...base,sky,horizon,hemi,sun:{color,intensity,pos}};
}
const textures=new Map(),materials=new WeakMap();
function texture(kind) {
  if(textures.has(kind))return textures.get(kind);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const g=canvas.getContext('2d');let seed=17;
  const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  g.fillStyle=kind==='marble'?'#faf9f6':'#eeece5';g.fillRect(0,0,256,256);
  // Fine mineral grain, with larger worn patches. Neutral colours multiply the models' colours.
  for(let i=0;i<10500;i++) {
    const v=kind==='marble'?210+rand()*40:175+rand()*65;
    g.fillStyle=`rgba(${v},${v},${v},${.06+rand()*.16})`;
    const r=.35+rand()*1.1;g.fillRect(rand()*256,rand()*256,r,r);
  }
  if(kind==='marble') {
    for(let i=0;i<9;i++) {
      g.beginPath();g.moveTo(-10,i*34-12);
      g.bezierCurveTo(70,i*34+36,110,i*34-36,266,i*34+20);
      g.strokeStyle='rgba(120,126,119,.14)';g.lineWidth=.3+rand()*.8;g.stroke();
    }
  } else {
    for(let i=0;i<90;i++) {
      g.fillStyle=kind==='moss'?'rgba(83,109,62,.10)':'rgba(112,107,92,.08)';
      g.beginPath();g.ellipse(rand()*256,rand()*256,2+rand()*9,1+rand()*5,rand()*6.28,0,6.28);g.fill();
    }
    // Hairline weathering; no regular mortar grid across curved stone or carved details.
    for(let i=0;i<18;i++) {
      const x=rand()*256,y=rand()*256;
      g.beginPath();g.moveTo(x,y);g.lineTo(x+3+rand()*8,y+rand()*10);g.lineTo(x+8+rand()*8,y+12+rand()*10);
      g.strokeStyle='rgba(95,90,77,.13)';g.lineWidth=.55;g.stroke();
    }
  }
  const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;t.userData.shared=true;
  textures.set(kind,t);return t;
}
function material(base,kind) {
  let cache=materials.get(base);if(!cache){cache=new Map();materials.set(base,cache);}
  if(!cache.has(kind)) {
    const m=base.clone();m.map=texture(kind);m.bumpMap=m.map;
    m.bumpScale=kind==='marble'?.025:.075;m.roughness=kind==='marble'?.64:.96;
    cache.set(kind,m);
  }
  return cache.get(kind);
}
// Kit models have no UVs. Project each triangle along its dominant normal in local metres,
// keeping a consistent scale on walls, columns, domes and rough standing stones.
function stoneUV(geometry) {
  const p=geometry.attributes.position,n=geometry.attributes.normal,uv=new Float32Array(p.count*2);
  for(let i=0;i<p.count;i++) {
    const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));
    uv[i*2]=(ax>ay&&ax>az?p.getZ(i):p.getX(i))/2.8;
    uv[i*2+1]=(ay>ax&&ay>az?p.getZ(i):p.getY(i))/2.8;
  }
  geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
}
export function dressMonuments(monuments,id) {
  return monuments.map(m=>({...m,make:()=>{
    const model=m.make();
    // Distant mountains and plaster casts keep their existing finish.
    if(/vesuv|huayna|cast/.test(m.id))return model;
    const kind=id==='taj-mahal'&&m.id==='taj-mahal'?'marble':id==='angkor-wat'?'moss':'stone';
    model.traverse(o=>{
      if(!o.isMesh||!o.geometry?.attributes.normal)return;
      // Preserve any textures already drawn for a monument, and glass or metal.
      if([o.material].flat().some(mat=>!mat?.isMeshStandardMaterial||mat.map||mat.metalness>.3))return;
      stoneUV(o.geometry);
      o.material=Array.isArray(o.material)?o.material.map(mat=>material(mat,kind)):material(o.material,kind);
    });
    return model;
  }}));
}
