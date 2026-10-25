// Module hooks for the tools that read a city's data in Node (tools/todo.mjs): three.js and its
// addons are not installed, so each import of them gets a stand-in that takes any name, call, `new`
// or property and gives back another one. Only for reading where things stand, never for drawing.
// The bare name 'city' is the city's own city.js, as the page's import map has it, and the
// browser's globals (document, window, ...) get the same kind of stand-in.
//
//     import { standIns } from './nothree.mjs';
//     standIns('ghent');   // then import('../ghent/monuments.js') and the like
import fs from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ANY = `new Proxy(function () {}, { get: (t, k) => k === Symbol.toPrimitive ? () => 0 : k === 'then' ? undefined : any, apply: () => any, construct: () => any, set: () => true })`;
export function standIns(cityDir) {
  register(import.meta.url, { data: { city: pathToFileURL(path.resolve(fileURLToPath(new URL('..', import.meta.url)), cityDir, 'city.js')).href } });
  const any = eval(`(() => { const any = ${ANY}; return any; })()`);
  for (const g of ['document', 'window', 'navigator', 'localStorage', 'sessionStorage', 'location', 'Image', 'HTMLCanvasElement', 'OffscreenCanvas', 'requestAnimationFrame', 'matchMedia', 'addEventListener', 'devicePixelRatio', 'innerWidth', 'innerHeight']) {
    if (!(g in globalThis)) globalThis[g] = any;
  }
}

let cityUrl = null;
export function initialize(data) { cityUrl = data?.city ?? null; }

export async function resolve(specifier, context, next) {
  if (specifier === 'city' && cityUrl) return { url: cityUrl, shortCircuit: true };
  if (specifier !== 'three' && !specifier.startsWith('three/')) return next(specifier, context);
  // the names the importing file asks for, so the stand-in can export them
  let names = [];
  try {
    const src = fs.readFileSync(fileURLToPath(context.parentURL), 'utf8');
    const esc = specifier.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    for (const m of src.matchAll(new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*['"]${esc}['"]`, 'g'))) {
      names.push(...m[1].split(',').map(s => s.trim().split(/\s+as\s+/)[0]).filter(Boolean));
    }
    // import * as THREE from 'three': the names it uses as THREE.<name>
    for (const m of src.matchAll(new RegExp(`import\\s*\\*\\s*as\\s+(\\w+)\\s+from\\s*['"]${esc}['"]`, 'g'))) {
      for (const u of src.matchAll(new RegExp(`\\b${m[1]}\\.(\\w+)`, 'g'))) names.push(u[1]);
    }
  } catch {}
  return { url: `nothree:${specifier}?${[...new Set(names)].join(',')}`, shortCircuit: true };
}

export async function load(url, context, next) {
  if (!url.startsWith('nothree:')) return next(url, context);
  const names = url.split('?')[1].split(',').filter(n => /^[A-Za-z_$][\w$]*$/.test(n));
  const source = `const any = ${ANY};
export default any;
${names.map(n => `export const ${n} = any;`).join('\n')}`;
  return { format: 'module', source, shortCircuit: true };
}
