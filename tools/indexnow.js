// indexnow.js — avisa a Bing (y a los buscadores de IndexNow) de las URL del sitemap publicado (29-oct-2026).
// ChatGPT busca sobre todo con Bing: así las páginas nuevas se rastrean en horas, no en semanas.
//
//   node tools/indexnow.js            todas las URL del sitemap
//   node tools/indexnow.js URL [...]  solo esas
//
// Lanzarlo DESPUÉS de desplegar: Bing comprueba la clave en https://avai-labs.com/<clave>.txt.
// La clave no es secreta (IndexNow la publica por diseño); el fichero está en la raíz del proyecto.
const fs = require('fs');
const path = require('path');

const KEY = '3fe78ac3b678ca541d621a2053282f0c';
const HOST = 'avai-labs.com';

const args = process.argv.slice(2);
const urls = args.length ? args
  : [...fs.readFileSync(path.join(__dirname, '..', 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
}).then(r => {
  console.log(`IndexNow: HTTP ${r.status} (${urls.length} URL)`);
  if (r.status >= 300) process.exitCode = 1;
}).catch(e => { console.error('IndexNow: ' + e.message); process.exitCode = 1; });
