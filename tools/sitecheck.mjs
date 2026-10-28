#!/usr/bin/env node
// Brief, sequential browser checks and game screenshots for the archaeological sites.
// node tools/sitecheck.mjs [site ...] --base=http://127.0.0.1:4000 [--pictures]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const require=createRequire(import.meta.url);
const { chromium }=require(path.join(execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim(),'playwright'));
const args=process.argv.slice(2),base=args.find(a=>a.startsWith('--base='))?.slice(7)??'http://127.0.0.1:4000';
const ids=args.filter(a=>!a.startsWith('--'));
if(!ids.length) ids.push('taj-mahal','angkor-wat','pompeii','stonehenge','giza','acropolis','machu-picchu');
const shots={
 'stonehenge': {from:[48,24,67],look:[0,2,0]},
 'giza': {from:[340,165,300],look:[-170,40,250]},
 'acropolis': {from:[130,82,150],look:[-25,4,-10]},
 'machu-picchu': {from:[210,170,270],look:[0,65,-110]},
 'taj-mahal': {camera:[-130,42,-65],look:[-91,32,-254]},
 'angkor-wat': {camera:[50,58,160],look:[378,45,88]},
 'pompeii': {camera:[-220,40,310],look:[-137,6,125]},
};
fs.mkdirSync('tools/cache/sitecheck',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--ignore-gpu-blocklist']});
process.on('SIGINT',async()=>{await browser.close();process.exit(130);});
let failed=false;
try {
 for(const id of ids) {
  const page=await browser.newPage({viewport:args.includes('--mobile')?{width:1024,height:576}:{width:1440,height:810},deviceScaleFactor:1,isMobile:args.includes('--mobile'),hasTouch:args.includes('--mobile')});
  const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(id+': '+e.message);});
  page.on('requestfailed',r=>console.error(id+': request failed '+r.url()+' '+r.failure()?.errorText));
  page.on('response',r=>{if(r.status()>=400&&new URL(r.url()).origin===new URL(base).origin)errors.push(`${r.status()} ${r.url()}`);});
  try {
   await page.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>raf(t=>{if(!window.__sitecheckFreeze)fn(t);});});
   await page.goto(`${base}/${id}/play/?watch`,{waitUntil:'load'});
   await page.waitForFunction(()=>window.ghent3d?.tour&&!document.body.classList.contains('booting'),null,{timeout:45000});
   const stats=await page.evaluate(async({id,shot})=>{
    const g=window.ghent3d;window.__sitecheckFreeze=true;
    const C=await import(`/${id}/city.js`);
    const route=C.MAP.routes[0].route;
    const length=route.reduce((n,p,i)=>i?n+Math.hypot(p[0]-route[i-1][0],p[1]-route[i-1][1]):0,0);
    if(!(length>100)||!route.flat().every(Number.isFinite)) throw Error('Invalid race route');
    const {inPolygon}=await import('/core/js/collide.js');
    const feet=C.MONUMENTS.flatMap(m=>m.foot??[]);
    if(['stonehenge','giza','acropolis','machu-picchu'].includes(id)&&route.some(([x,z])=>feet.some(p=>inPolygon(x,z,p))))throw Error('Race route crosses a monument');
    if(!C.MONUMENTS.length||!C.QUESTS.length||!C.TOUR.path.length)throw Error('Missing site content');
    g.tour.skies=[];g.tour.busRun=null;g.tour.fallRun=null;g.setSky('day:clear',false);g.renderer.setPixelRatio(1);
    for(let i=0;i<3;i++)g.step(1/30);
    let from=shot.camera,look=shot.look;
    if(shot.from) {const {game}=await import(`/${id}/frame.js`);const [x,z]=game(shot.from[0],shot.from[2]);from=[x,shot.from[1],z];const [lx,lz]=game(look[0],look[2]);look=[lx,look[1],lz];}
    g.menuCam.far=3200;g.menuCam.updateProjectionMatrix();g.menuCam.position.set(...from);g.menuCam.lookAt(...look);g.menuLook.set(look[0],0,look[2]);g.render();
    const visitors=g.world.people.walkers.length;
    if(C.BUSY&&visitors<=64)throw Error('Busy visitor paths were not populated');
    if(g.world.people.paths.some(p=>!Number.isFinite(p.length)||p.length<=0))throw Error('Invalid visitor path');
    return {visitors,textures:g.renderer.info.memory.textures,route:Math.round(length),monuments:C.MONUMENTS.length,sights:C.SIGHTS.length,geometries:g.renderer.info.memory.geometries,triangles:g.renderer.info.render.triangles};
   },{id,shot:shots[id]});
   const data=await page.evaluate(()=>{const g=window.ghent3d;g.render();return g.renderer.domElement.toDataURL('image/jpeg',.91).split(',')[1];});
   fs.writeFileSync(`tools/cache/sitecheck/${id}.jpg`,Buffer.from(data,'base64'));
   if(args.includes('--pictures'))fs.copyFileSync(`tools/cache/sitecheck/${id}.jpg`,`assets/img/sites/${id}.jpg`);
   // Exercise changing from the tour to a normal race and advancing the simulation.
   await page.evaluate(()=>{const g=window.ghent3d;g.toMenu();g.setKind('race');g.startRace();for(let i=0;i<8;i++)g.step(1/30);g.render();g.toMenu();g.setKind('mission');g.game.mission=1;g.startRace();for(let i=0;i<4;i++)g.step(1/30);if(!g.quest)throw Error('Quest did not start');g.render();});
   if(errors.length)throw Error(errors.join('\n'));
   console.log(`${id}: PASS ${JSON.stringify(stats)}`);
  }catch(e){failed=true;console.error(`${id}: FAIL ${e.stack} ${errors.join('; ')}`);await page.screenshot({path:`tools/cache/sitecheck/${id}-error.png`}).catch(()=>{});}
  finally{await page.close();}
 }
}finally{await browser.close();}
if(failed)process.exitCode=1;
