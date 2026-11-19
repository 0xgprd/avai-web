// verificar-paginas.js — control de las páginas generadas por construir.js (29-oct-2026; bilingüe desde el 30-oct).
//
//   node tools/verificar-paginas.js
//
// La portada española tiene su propio control: .claude/verificar-propuestas.js index.html --publicar.
// Aquí, por cada página generada (servicios y blog en los dos idiomas, y la portada francesa):
//   - un solo <h1>, canonical igual a su URL, description y og presentes, <html lang> correcto;
//   - JSON-LD legible; la página está en sitemap.xml;
//   - hreflang recíproco: si A dice que su versión francesa es B, B dice que su versión española es A;
//   - recorrido 3D: cada data-escena es un fotograma 0-7 en una sección con id, sin ids repetidos;
//   - enlaces internos que llevan a un fichero que existe;
//   - imagen internacional: ni title, ni H1, ni description dicen «Tenerife» o «Canarias»;
//   - el chat oficial (widget.js) y la función que lo abre.
// Para fr/index.html, además: mismos ids que la portada española y el formulario intacto (campos, origen,
// envío a /enviar-lead.php).
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://avai-labs.com';
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const enSitemap = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));

const paginas = [];
for (const [lang, fichero, base] of [['es', 'servicios.es.js', ''], ['fr', 'servicios.fr.js', 'fr/']]) {
  for (const s of require(path.join(ROOT, 'contenido', fichero))) paginas.push({ rel: `${base}${s.slug}/index.html`, lang });
  const blog = path.join(ROOT, base, 'blog');
  if (fs.existsSync(blog)) {
    paginas.push({ rel: `${base}blog/index.html`, lang });
    for (const d of fs.readdirSync(blog, { withFileTypes: true })) if (d.isDirectory()) paginas.push({ rel: `${base}blog/${d.name}/index.html`, lang });
  }
}
paginas.push({ rel: 'fr/index.html', lang: 'fr', portada: true });

const leer = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const urlDe = rel => SITE + '/' + rel.replace(/index\.html$/, '');
const relDe = url => url.replace(SITE + '/', '') + (url.endsWith('/') ? 'index.html' : '');
function existe(href) {
  const p = href.split('#')[0].split('?')[0];
  if (!p || p === '/') return true;
  const f = path.join(ROOT, decodeURI(p));
  return p.endsWith('/') ? fs.existsSync(path.join(f, 'index.html')) : fs.existsSync(f);
}
const enlacesRotos = html => [...new Set([...html.matchAll(/href="(\/[^"]*)"/g)].map(m => m[1]).filter(h => !existe(h)))];
const alternos = html => Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([a-z-]+)" href="([^"]+)">/g)].map(m => [m[1], m[2]]));
const ids = html => [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);

let fallos = 0;
for (const p of paginas) {
  const errores = [];
  if (!fs.existsSync(path.join(ROOT, p.rel))) { console.log(`✗ ${p.rel}: no existe (¿falta node tools/construir.js?)`); fallos++; continue; }
  const html = leer(p.rel);
  const url = urlDe(p.rel);
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g) || [];
  if (h1.length !== 1) errores.push(`hay ${h1.length} <h1> (debe ser 1)`);
  if (!html.includes(`<html lang="${p.lang}"`)) errores.push(`<html lang> no es «${p.lang}»`);
  if (!html.includes(`<link rel="canonical" href="${url}">`)) errores.push('canonical distinto de ' + url);
  if (!enSitemap.has(url)) errores.push('no está en sitemap.xml');
  for (const k of ['<meta name="description"', 'property="og:title"', 'property="og:image"']) if (!html.includes(k)) errores.push('falta ' + k);
  for (const m of html.matchAll(/<script type="application\/ld\+json">\n?([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { errores.push('JSON-LD ilegible: ' + e.message); }
  }
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  for (const [nombre, txt] of [['title', title], ['h1', h1.join(' ')], ['description', desc]]) {
    if (/tenerife|canarias|canaries/i.test(txt)) errores.push(`el ${nombre} menciona la región (imagen internacional)`);
  }
  if (!html.includes('https://app.avai-labs.com/widget.js')) errores.push('falta el chat oficial (widget.js)');
  if (!html.includes('window.abrirChatAVAI=function')) errores.push('falta la función abrirChatAVAI');

  // hreflang recíproco
  const alt = alternos(html);
  if (Object.keys(alt).length) {
    if (alt[p.lang] !== url) errores.push(`hreflang «${p.lang}» no apunta a sí misma`);
    if (!alt['x-default']) errores.push('falta hreflang x-default');
    for (const [l, u] of Object.entries(alt)) {
      if (l === 'x-default' || l === p.lang) continue;
      const otra = relDe(u);
      if (!fs.existsSync(path.join(ROOT, otra))) { errores.push(`hreflang «${l}» apunta a una página que no existe: ${u}`); continue; }
      if (alternos(leer(otra))[p.lang] !== url) errores.push(`${otra} no devuelve el hreflang «${p.lang}» a esta página`);
    }
  }

  // Recorrido 3D
  const lista = ids(html);
  const repetidos = lista.filter((x, i) => lista.indexOf(x) !== i);
  if (repetidos.length) errores.push('ids repetidos: ' + [...new Set(repetidos)].join(', '));
  if (!p.portada) {
    const escenas = [...html.matchAll(/<[a-z]+ [^>]*data-escena="([^"]*)"[^>]*>/g)];
    if (escenas.length < 3) errores.push('el recorrido 3D tiene menos de 3 secciones con data-escena');
    for (const m of escenas) {
      if (!/^[0-7]$/.test(m[1])) errores.push(`data-escena «${m[1]}» no es un fotograma 0-7`);
      if (!/\sid="[^"]+"/.test(m[0])) errores.push('una sección con data-escena no tiene id');
    }
    for (const k of ['id="stage"', 'id="scene"', 'id="progressBar"', 'src="/js/main.js']) if (!html.includes(k)) errores.push('falta ' + k);
  }

  // Portada francesa: mismas secciones que la española y formulario intacto
  if (p.portada) {
    const es = new Set(ids(leer('index.html')));
    const fr = new Set(lista);
    const faltan = [...es].filter(x => !fr.has(x));
    const sobran = [...fr].filter(x => !es.has(x));
    if (faltan.length || sobran.length) errores.push(`ids distintos de la portada española: faltan [${faltan}] sobran [${sobran}]`);
    for (const n of ['origen', 'name', 'email', 'phone', 'empresa', 'servicio', 'message', 'rgpd']) if (!html.includes(`name="${n}"`)) errores.push(`formulario: falta name="${n}"`);
    if (!html.includes('value="web-formulario"')) errores.push('formulario: el origen debe seguir siendo web-formulario');
    if (!html.includes("fetch('/enviar-lead.php', { method:'POST', body: new FormData(f) })")) errores.push('formulario: el envío no va a /enviar-lead.php');
    if (!/<option[^>]*>[^<]+<\/option>/.test(html) || (html.match(/<option/g) || []).length !== 7) errores.push('formulario: deben ser 7 opciones');
  }

  const rotos = enlacesRotos(html);
  if (rotos.length) errores.push('enlaces rotos: ' + rotos.join(', '));
  if (errores.length) { fallos++; console.log('✗ ' + p.rel); errores.forEach(e => console.log('   - ' + e)); }
  else console.log('✓ ' + p.rel);
}

// Mini-webs del portafolio (19-nov-2026): sin indexar, fuera del sitemap, formularios que no envían nada.
for (const w of require(path.join(ROOT, 'contenido', 'portafolio.js'))) {
  const rel = `portafolio/${w.slug}/index.html`;
  const errores = [];
  if (!fs.existsSync(path.join(ROOT, rel))) { console.log(`✗ ${rel}: no existe (¿falta node tools/construir-portafolio.js?)`); fallos++; continue; }
  const html = leer(rel);
  if (!html.includes('<meta name="robots" content="noindex')) errores.push('falta noindex');
  if (enSitemap.has(urlDe(rel))) errores.push('no debe estar en sitemap.xml');
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) errores.push('debe tener un solo <h1>');
  if (/<form[^>]*action=/.test(html) || html.includes('enviar-lead.php')) errores.push('el formulario no debe enviar datos');
  if (!html.includes('href="/#contacto"')) errores.push('falta el enlace «¿Quieres una web así?» al contacto de AVAI');
  const rotos = enlacesRotos(html);
  if (rotos.length) errores.push('enlaces rotos: ' + rotos.join(', '));
  if (errores.length) { fallos++; console.log('✗ ' + rel); errores.forEach(e => console.log('   - ' + e)); }
  else console.log('✓ ' + rel);
}

const rotosPortada = enlacesRotos(leer('index.html'));
if (rotosPortada.length) { fallos++; console.log('✗ index.html: enlaces rotos: ' + rotosPortada.join(', ')); }
else console.log('✓ index.html: enlaces internos');

process.exit(fallos ? 1 : 0);
