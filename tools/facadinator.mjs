#!/usr/bin/env node
// The Facadinator: colours a street's house fronts from real photos, in one go.
// Runs tools/street.mjs (fronts + Mapillary photos), then tools/looks.mjs (wall colours -> <city>/looks.js),
// then tools/todo.mjs (the to-do list), then tools/heightcheck.mjs (fronts much lower than the street
// around them, most likely wrong in the map: look at those in the photos).
//
//     node tools/facadinator.mjs ghent Malemstraat
//
// Needs MAPILLARY_TOKEN. Behind an HTTP(S) proxy (cloud sessions) it makes Node's fetch use it.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [city, ...rest] = process.argv.slice(2);
if (!city || !rest.length) { console.error('usage: node tools/facadinator.mjs <city> "<street>"'); process.exit(1); }
const street = rest.join(' ');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const env = { ...process.env };
if (env.HTTPS_PROXY || env.https_proxy) {
  env.NODE_USE_ENV_PROXY = '1';
  if (!env.NODE_EXTRA_CA_CERTS && env.SSL_CERT_FILE) env.NODE_EXTRA_CA_CERTS = env.SSL_CERT_FILE;
}
const run = (script, ...args) => {
  const r = spawnSync(process.execPath, [path.join(HERE, script), ...args], { stdio: 'inherit', env });
  if (r.status) process.exit(r.status);
};
const slug = street.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
run('street.mjs', city, street);
run('looks.mjs', city, slug);
run('todo.mjs', city);
run('heightcheck.mjs', city, street);
