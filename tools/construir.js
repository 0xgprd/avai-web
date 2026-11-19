// construir.js — genera las páginas de servicio, el blog, la portada francesa, sitemap.xml y llms.txt.
//
//   node tools/construir.js
//
// Historia: 29-oct-2026 primeras páginas de servicio y blog; 30-oct-2026 todo inmersivo (mismo recorrido 3D
// que la portada) y bilingüe español/francés.
//
// Fuentes:
//   index.html                    portada española, hecha a mano (la experiencia 3D original)
//   contenido/i18n/portada.fr.js  traducción de la portada → fr/index.html
//   contenido/i18n/comun.js       textos de interfaz de las páginas generadas
//   contenido/servicios.es.js     5 páginas de servicio en español   → /<slug>/
//   contenido/servicios.fr.js     las mismas en francés              → /fr/<slug>/
//   contenido/blog/es|fr/*.html   artículos (formato en contenido/blog/LEEME.md) → /blog/ y /fr/blog/
// Salida (se sube a git tal cual: el Dockerfile copia lo generado): las carpetas anteriores, fr/index.html,
// sitemap.xml y llms.txt.
//
// Cada página generada es un recorrido 3D: sus secciones llevan data-escena="N" (fotograma de
// js/scroll/keyframes.js) y js/main.js arma con ellas la historia de scroll. Se reutilizan las piezas de la
// portada tal cual (hero, área, proceso fijo, casos con diagrama de flujo, contacto), y el respaldo SVG y el
// diagrama se copian de index.html para que sean idénticos.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://avai-labs.com';
const PORTADA_MODIFICADA = '2026-11-19';
const WIDGET = '<script src="https://app.avai-labs.com/widget.js" data-tenant="336b854a-a359-4369-94bf-66030ed87ee6" async></script>';
const WA = 'https://wa.me/34624504004';
// Analítica sin cookies (Umami en nuestro VPS): solo cuenta en avai-labs.com, no en local ni en vistas previas.
const UMAMI = '<script defer src="https://avai-umami.ig2tl9.easypanel.host/avai.js" data-website-id="144366c2-f015-485c-bd7f-9285b163c8cc" data-domains="avai-labs.com"></script>';
const ORG_ID = SITE + '/#organizacion';
const V = '20261030'; // versión de css/js en las URL (el servidor los revalida igualmente)
const IDIOMAS = ['es', 'fr'];

const T = require(path.join(ROOT, 'contenido', 'i18n', 'comun.js'));
const PORTADA_FR = require(path.join(ROOT, 'contenido', 'i18n', 'portada.fr.js'));
const SERV = { es: require(path.join(ROOT, 'contenido', 'servicios.es.js')), fr: require(path.join(ROOT, 'contenido', 'servicios.fr.js')) };
const portadaEs = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace(/\r\n/g, '\n');

// Las dos lenguas tienen que tener las mismas páginas, en el mismo orden y con la misma estructura.
SERV.es.forEach((s, i) => {
  const f = SERV.fr[i];
  if (!f || f.id !== s.id) throw new Error(`servicios.fr.js no sigue el orden de servicios.es.js (posición ${i}: ${s.id})`);
  for (const k of ['area', 'proceso', 'casos']) {
    const a = k === 'area' ? s.area.items.length : k === 'proceso' ? s.proceso.fases.length : s.casos.items.length;
    const b = k === 'area' ? f.area.items.length : k === 'proceso' ? f.proceso.fases.length : f.casos.items.length;
    if (a !== b) throw new Error(`${s.id}: «${k}» tiene ${a} elementos en español y ${b} en francés`);
  }
});
const porId = lang => Object.fromEntries(SERV[lang].map(s => [s.id, s]));
const urlServ = (lang, id) => `${T[lang].base}/${porId(lang)[id].slug}/`;
const ESCENA = { ia: 1, chatbot: 1, mkt: 2, web: 3, av: 3 }; // sistema 3D de cada servicio
const LADO = { 1: 'left', 2: 'right', 3: 'left' };            // el texto, en el lado contrario a la estructura

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = obj => '<script type="application/ld+json">\n' + JSON.stringify(obj).replace(/</g, '\\u003c') + '\n</script>';
const flecha = '<svg class="ic-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const n2 = i => String(i).padStart(2, '0');
const DEMO_ATTR = 'onclick="if(window.abrirChatAVAI){abrirChatAVAI();return false;}" data-umami-event="demo-agente"';

// Piezas comunes de las páginas generadas (escena 3D de respaldo, diagrama de flujo, estado inicial y función que
// abre el chat). Hasta el 19-nov-2026 se copiaban de la portada; desde la portada «Fusión» están en contenido/piezas/.
const pieza = f => fs.readFileSync(path.join(ROOT, 'contenido', 'piezas', f), 'utf8').replace(/\r\n/g, '\n').trim();
const STAGE = pieza("escena-3d.html");
const FLOW_SVG = pieza("flujo.svg");
const HEAD_ANIM = pieza("estado-inicial.html");
const ABRIR_CHAT = pieza("abrir-chat.html");

// ---------- Artículos del blog ----------
function leerArticulos(lang) {
  const dir = path.join(ROOT, 'contenido', 'blog', lang);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.html')).map(f => {
    const txt = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n');
    const m = txt.match(/^<!--\s*(\{[\s\S]*?\})\s*-->\n?/);
    if (!m) throw new Error(`${lang}/${f}: falta la cabecera <!-- {json} --> (ver contenido/blog/LEEME.md)`);
    const meta = JSON.parse(m[1]);
    for (const k of ['titulo', 'descripcion', 'fecha', 'resumen', 'fuentes']) if (!meta[k]) throw new Error(`${lang}/${f}: falta «${k}»`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.fecha)) throw new Error(`${lang}/${f}: la fecha debe ser AAAA-MM-DD`);
    if (!meta.fuentes.length) throw new Error(`${lang}/${f}: cada artículo necesita al menos una fuente enlazada`);
    return { ...meta, lang, slug: f.replace(/\.html$/, ''), cuerpo: txt.slice(m[0].length).trim() };
  }).sort((a, b) => b.fecha.localeCompare(a.fecha) || a.slug.localeCompare(b.slug));
}
const ART = { es: leerArticulos('es'), fr: leerArticulos('fr') };
const hayBlog = lang => ART[lang].length > 0;
const fechaLarga = (lang, f) => { const [a, m, d] = f.split('-').map(Number); return T[lang].blog.fecha(d, T[lang].blog.meses[m - 1], a); };

// ---------- Piezas comunes ----------
// alternos: { es: url, fr: url } cuando la página existe en los dos idiomas.
function head(lang, { title, description, url, alternos, tipoOg = 'website', ld }) {
  const t = T[lang];
  const hreflang = alternos
    ? IDIOMAS.map(l => `<link rel="alternate" hreflang="${l}" href="${alternos[l]}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${alternos.es}">\n`
    : '';
  const otroLocale = lang === 'es' ? 'fr_FR' : 'es_ES';
  return `<!DOCTYPE html>
<html lang="${lang}" class="no-js">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
${hreflang}<meta name="robots" content="index, follow">
<meta name="theme-color" content="#050914">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<meta property="og:type" content="${tipoOg}">
<meta property="og:site_name" content="AVAI Labs">
<meta property="og:locale" content="${t.ogLocale}">
${alternos ? `<meta property="og:locale:alternate" content="${otroLocale}">\n` : ''}<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/og-avai.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}/assets/og-avai.jpg">
${ld.map(jsonLd).join('\n')}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/main.css?v=${V}">
<link rel="stylesheet" href="/css/paginas.css?v=${V}">
${HEAD_ANIM}
<script defer src="/assets/vendor/gsap-3.15.0.min.js"></script>
<script defer src="/assets/vendor/ScrollTrigger-3.15.0.min.js"></script>
<script defer src="/assets/vendor/SplitText-3.15.0.min.js"></script>
<script type="module" src="/js/main.js?v=${V}"></script>
${UMAMI}
</head>
<body class="pg">

<a class="skip" href="#contenido">${esc(t.skip)}</a>
`;
}

// otraUrl: la página equivalente en el otro idioma (o su portada si no existe).
function nav(lang, otraUrl) {
  const t = T[lang];
  const home = `${t.base}/`;
  const otro = lang === 'es' ? 'fr' : 'es';
  return `
<header class="nav" id="nav">
  <div class="nav-in">
    <a href="${home}" class="brand" aria-label="${esc(t.marcaAria)}">
      <picture><source srcset="/assets/logo-avai.webp" type="image/webp"><img src="/assets/logo-avai-sm.png" alt="${esc(t.logoAlt)}" class="logo-img" width="320" height="128"></picture>
    </a>
    <nav class="nav-links" id="navLinks" aria-label="${esc(t.navAria)}">
      <div class="nav-drop">
        <a href="${home}#servicios" class="nav-drop-t">${esc(t.nav.soluciones)}</a>
        <div class="nav-sub">
          ${SERV[lang].map(x => `<a href="${urlServ(lang, x.id)}">${esc(x.menu)}</a>`).join('\n          ')}
        </div>
      </div>
      <a href="${home}#proceso">${esc(t.nav.proceso)}</a>
      <a href="${home}#casos">${esc(t.nav.casos)}</a>
      <a href="${home}#nosotros">${esc(t.nav.nosotros)}</a>
      ${hayBlog(lang) ? `<a href="${t.base}/blog/">${esc(t.nav.blog)}</a>` : ""}
      <a href="${home}#contacto">${esc(t.nav.contacto)}</a>
      <a href="${otraUrl}" class="nav-lang" hreflang="${otro}" lang="${otro}" aria-label="${esc(t.otroIdioma.aria)}">${t.otroIdioma.corto}</a>
      <a href="https://app.avai-labs.com/" rel="noopener" class="nav-app">AVAI App</a>
      <a href="${home}#contacto" class="btn btn-sm nav-cta">${esc(t.nav.cta)}</a>
    </nav>
    <button class="burger" id="burger" type="button" aria-label="${esc(t.menuAria)}" aria-expanded="false" aria-controls="navLinks"><span></span><span></span></button>
  </div>
</header>

${STAGE}

<div class="progress" aria-hidden="true"><span id="progressBar"></span></div>
`;
}

function migas(lang, items, enlazarUltimo = false) {
  const li = items.map((it, i) => i < items.length - 1 || enlazarUltimo
    ? `<li><a href="${it.href}">${esc(it.t)}</a></li>`
    : `<li aria-current="page">${esc(it.t)}</li>`).join('');
  return `<nav class="pg-migas" aria-label="${esc(T[lang].migas)}"><ol>${li}</ol></nav>`;
}
const migasLd = items => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.t, item: SITE + it.href })),
});

// Llamada final: núcleo luminoso (fotograma 7).
function final(lang, { h, n, demo, rel = '' }) {
  const t = T[lang];
  const demoBtn = demo ? `\n        <a href="#contacto" class="btn btn-ghost" ${DEMO_ATTR}>${esc(t.demo)}</a>` : '';
  return `
<section class="contact pg-final" id="contacto" data-escena="7" aria-labelledby="contact-title">
  <div class="wrap">
    <div class="contact-head">
      <p class="label"><span class="label-n">${n2(n)}</span>${esc(t.rotulos.contacto)}</p>
      <h2 id="contact-title" class="h2 h2-xl" data-reveal="lines">${esc(h)}</h2>
      <p class="lead" data-reveal="fade">${esc(t.final.lead)}</p>
      <div class="contact-ctas" data-reveal="fade">
        <a href="${t.base}/#contacto" class="btn">${esc(t.consulta)}${flecha}</a>${demoBtn}
        <a data-umami-event="whatsapp" href="${WA}" class="btn btn-ghost" target="_blank" rel="noopener">${esc(t.final.wa)}</a>
      </div>
    </div>${rel}
  </div>
</section>`;
}

function pie(lang, otraUrl) {
  const t = T[lang];
  const home = `${t.base}/`;
  const otro = lang === 'es' ? 'fr' : 'es';
  const sol = SERV[lang].map(s => `<a href="${urlServ(lang, s.id)}">${esc(s.menu)}</a>`).join('\n          ');
  return `
</main>

<footer class="footer">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brand">
        <picture><source srcset="/assets/logo-avai.webp" type="image/webp"><img src="/assets/logo-avai-sm.png" alt="${esc(t.logoAlt)}" class="logo-img" width="320" height="128" loading="lazy"></picture>
        <p>${esc(t.pie.marca)}</p>
      </div>
      <div class="foot-cols">
        <div class="foot-col">
          <h2 class="foot-h">${esc(t.pie.soluciones)}</h2>
          ${sol}
        </div>
        <div class="foot-col">
          <h2 class="foot-h">${esc(t.pie.empresa)}</h2>
          <a href="${home}#nosotros">${esc(t.pie.sobre)}</a>
          <a href="${home}#proceso">${esc(t.pie.proceso)}</a>
          <a href="${home}#casos">${esc(t.pie.casos)}</a>
          ${hayBlog(lang) ? `<a href="${t.base}/blog/">${esc(t.pie.blog)}</a>\n          ` : ''}<a href="${home}#contacto">${esc(t.pie.contactar)}</a>
          <a href="https://app.avai-labs.com/" rel="noopener">AVAI App</a>
          <a href="${t.privacidad}">${esc(t.pie.privacidad)}</a>
        </div>
        <div class="foot-col">
          <h2 class="foot-h">${esc(t.pie.contacto)}</h2>
          <a href="mailto:info@avai-labs.com">info@avai-labs.com</a>
          <a href="tel:+34624504004">+34 624 50 40 04</a>
          <a data-umami-event="whatsapp" href="${WA}" target="_blank" rel="noopener">WhatsApp +34 624 50 40 04</a>
          <a href="https://www.google.com/maps/search/?api=1&amp;query=C.C.+Radazul+Bajo+38109+El+Rosario+Tenerife" target="_blank" rel="noopener">C.C. Radazul Bajo, 38109 · El Rosario, Tenerife</a>
        </div>
      </div>
    </div>
    <div class="foot-bottom">
      <span>${esc(t.pie.derechos)}</span>
      <span><a href="${t.privacidad}">${esc(t.pie.privacidad)}</a> · <a href="${otraUrl}" hreflang="${otro}" lang="${otro}">${t.otroIdioma.largo}</a> · ${esc(t.pie.hecho)}</span>
    </div>
  </div>
</footer>

${ABRIR_CHAT}
${WIDGET}
</body>
</html>
`;
}

// ---------- Página de servicio ----------
function paginaServicio(lang, s) {
  const t = T[lang];
  const otro = lang === 'es' ? 'fr' : 'es';
  const url = SITE + urlServ(lang, s.id);
  const alternos = { es: SITE + urlServ('es', s.id), fr: SITE + urlServ('fr', s.id) };
  const ruta = [{ t: t.inicio, href: `${t.base}/` }, { t: s.menu, href: urlServ(lang, s.id) }];
  const escena = ESCENA[s.id];
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'Service', name: s.servicio, serviceType: s.servicio,
      description: s.description, url, inLanguage: lang,
      provider: { '@type': 'ProfessionalService', '@id': ORG_ID, name: 'AVAI Labs', url: SITE + '/' },
      areaServed: [{ '@type': 'Country', name: lang === 'es' ? 'España' : 'Espagne' }, { '@type': 'Country', name: lang === 'es' ? 'Francia' : 'France' }],
      availableLanguage: ['es', 'fr'],
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang,
      mainEntity: s.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    migasLd(ruta),
  ];
  const enlace = it => it.href ? `<a href="${urlServ(lang, it.href)}">${esc(it.t)}</a>` : esc(it.t);
  const area = s.area.items.map(it => `
          <li><h3>${enlace(it)}</h3><p>${esc(it.p)}</p></li>`).join('');
  const fases = s.proceso.fases.map((f, i) => `
          <li class="step${i === 0 ? ' is-active' : ''}"><span class="step-n">${n2(i + 1)}</span><div><h3>${esc(f.t)}</h3><p>${esc(f.p)}</p></div></li>`).join('');
  const casos = s.casos.items.map((c, i) => `
        <li class="case${i === 0 ? ' is-active' : ''}" data-in="${esc(c.in.join('|'))}" data-hub="${esc(c.hub)}" data-out="${esc(c.out.join('|'))}">
          <span class="case-n">${n2(i + 1)}</span>
          <h3>${esc(c.t)}</h3>
          <p>${esc(c.p)}</p>${c.antes ? `
          <p class="case-shift"><span class="case-before">${esc(c.antes)}</span><span class="case-after">${esc(c.despues)}</span></p>` : ''}
        </li>`).join('');
  const c0 = s.casos.items[0];
  const faq = s.faq.map(f => `
        <details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
  const rel = `
    <nav class="pg-rel" aria-label="${esc(t.relacionados)}">
      <span>${esc(t.relacionados)}</span>
      ${s.relacionados.map(r => `<a href="${urlServ(lang, r)}">${esc(porId(lang)[r].menu)} ${flecha}</a>`).join('\n      ')}
    </nav>`;
  const ctaPrincipal = s.demo
    ? `<a href="#contacto" class="btn" ${DEMO_ATTR}>${esc(t.demo)}${flecha}</a>
      <a href="${t.base}/#contacto" class="btn btn-ghost">${esc(t.consulta)}</a>`
    : `<a href="${t.base}/#contacto" class="btn">${esc(t.consulta)}${flecha}</a>
      <a href="#que" class="btn btn-ghost">${esc(t.explorar)}</a>`;

  return head(lang, { title: s.title, description: s.description, url, alternos, ld }) + nav(lang, urlServ(otro, s.id)) + `
<main id="contenido">

<section class="hero" id="inicio" data-escena="0" aria-labelledby="hero-title">
  <div class="wrap hero-in">
    ${migas(lang, ruta)}
    <p class="kicker" data-reveal="fade"><span class="kicker-dot"></span>${esc(s.kicker)}</p>
    <h1 id="hero-title" class="hero-title pg-hero-title" data-reveal="hero">${esc(s.h1)} <span class="grad">${esc(s.h1grad)}</span></h1>
    <p class="hero-sub" data-reveal="fade">${esc(s.sub)}</p>
    <div class="hero-ctas" data-reveal="fade">
      ${ctaPrincipal}
    </div>
    <ul class="hero-tags" data-reveal="fade" aria-label="${esc(t.tagsAria)}">
      ${s.tags.map(x => `<li>${esc(x)}</li>`).join('')}
    </ul>
  </div>
  <a class="scroll-cue" href="#que" data-reveal="fade"><span>${esc(t.desliza)}</span><i aria-hidden="true"></i></a>
</section>

<article class="area" id="que" data-escena="${escena}" data-side="${LADO[escena]}" aria-labelledby="que-t">
  <div class="wrap area-in">
    <div class="area-copy">
      <p class="label"><span class="label-n">01</span>${esc(t.rotulos.que)}</p>
      <h2 id="que-t" class="h3" data-reveal="lines">${esc(s.area.h)}</h2>
      <p class="area-lead" data-reveal="fade">${esc(s.area.lead)}</p>
      <ul class="svc-list" data-reveal="list">${area}
      </ul>
    </div>
  </div>
</article>

<section class="process" id="proceso" data-escena="4" aria-labelledby="proc-title">
  <div class="process-pin">
    <div class="wrap process-in">
      <div class="process-head">
        <p class="label"><span class="label-n">02</span>${esc(t.rotulos.como)}</p>
        <h2 id="proc-title" class="h2" data-reveal="lines">${esc(s.proceso.h)}</h2>
        <p class="lead" data-reveal="fade">${esc(s.proceso.lead)}</p>
      </div>
      <div class="process-body">
        <div class="process-meter" aria-hidden="true"><i id="procMeter"></i></div>
        <ol class="steps" id="steps">${fases}
        </ol>
      </div>
      <p class="process-count" aria-hidden="true">${esc(t.fase)} <span id="procNow">01</span> / ${n2(s.proceso.fases.length)}</p>
    </div>
  </div>
</section>

<section class="cases" id="casos" data-escena="5" aria-labelledby="cases-title">
  <div class="wrap">
    <div class="cases-head">
      <p class="label"><span class="label-n">03</span>${esc(t.rotulos.casos)}</p>
      <h2 id="cases-title" class="h2" data-reveal="lines">${esc(s.casos.h)}</h2>
      <p class="lead" data-reveal="fade">${esc(s.casos.lead)}</p>
    </div>
    <div class="cases-grid">
      <ol class="case-list" id="caseList">${casos}
      </ol>

      <figure class="flow" id="flow" aria-hidden="true">
        <div class="flow-top"><span class="flow-tag"><i></i>${esc(t.flujo.tag)}</span><span class="flow-case" id="flowCase">01 · ${esc(c0.t)}</span></div>
        <div class="flow-body">
          ${FLOW_SVG}
          <ul class="flow-nodes flow-in">${c0.in.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
          <div class="flow-hub"><span class="flow-hub-ring"></span><span id="flowHub">${esc(c0.hub)}</span></div>
          <ul class="flow-nodes flow-out">${c0.out.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
        <figcaption class="flow-cap"><span>${esc(t.flujo.entradas)}</span><span>${esc(t.flujo.sistema)}</span><span>${esc(t.flujo.resultados)}</span></figcaption>
      </figure>
    </div>
  </div>
</section>

<section class="about pg-faq" id="preguntas" data-escena="6" aria-labelledby="faq-t">
  <div class="wrap pg-faq-in">
    <div class="pg-faq-head">
      <p class="label"><span class="label-n">04</span>${esc(t.rotulos.faq)}</p>
      <h2 id="faq-t" class="h2" data-reveal="lines">${esc(t.faqH)}</h2>
    </div>
    <div class="pg-faq-list" data-reveal="fade">${faq}
    </div>
  </div>
</section>
${final(lang, { h: t.final.h, n: 5, demo: s.demo, rel })}
` + pie(lang, urlServ(otro, s.id));
}

// ---------- Blog ----------
function paginaArticulo(a) {
  const lang = a.lang;
  const t = T[lang];
  const otro = lang === 'es' ? 'fr' : 'es';
  const url = `${SITE}${t.base}/blog/${a.slug}/`;
  const ruta = [{ t: t.inicio, href: `${t.base}/` }, { t: t.nav.blog, href: `${t.base}/blog/` }, { t: a.titulo, href: `${t.base}/blog/${a.slug}/` }];
  const ld = [{
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: a.titulo, description: a.descripcion,
    datePublished: a.fecha, dateModified: a.modificado || a.fecha, inLanguage: lang, url, mainEntityOfPage: url,
    image: SITE + '/assets/og-avai.jpg',
    author: { '@type': 'Organization', '@id': ORG_ID, name: 'AVAI Labs', url: SITE + '/' },
    publisher: { '@type': 'Organization', '@id': ORG_ID, name: 'AVAI Labs', logo: { '@type': 'ImageObject', url: SITE + '/assets/logo-avai.png' } },
    citation: a.fuentes.map(f => f.href),
  }, migasLd(ruta)];
  const resumen = a.resumen.map(r => `<li>${esc(r)}</li>`).join('');
  const fuentes = a.fuentes.map(f => `<li><a href="${esc(f.href)}" target="_blank" rel="noopener">${esc(f.t)}</a></li>`).join('');
  const otraUrl = `${T[otro].base}/${hayBlog(otro) ? 'blog/' : ''}`;
  return head(lang, { title: `${a.titulo} · AVAI Labs`, description: a.descripcion, url, tipoOg: 'article', ld }) + nav(lang, otraUrl) + `
<main id="contenido">

<section class="hero pg-hero-art" id="inicio" data-escena="0" aria-labelledby="hero-title">
  <div class="wrap hero-in">
    ${migas(lang, ruta.slice(0, 2), true)}
    <p class="kicker" data-reveal="fade"><span class="kicker-dot"></span><time datetime="${a.fecha}">${fechaLarga(lang, a.fecha)}</time></p>
    <h1 id="hero-title" class="hero-title pg-h1-art" data-reveal="hero">${esc(a.titulo)}</h1>
    <aside class="pg-resumen" data-reveal="fade" aria-label="${esc(t.blog.resumen)}"><h2>${esc(t.blog.resumen)}</h2><ul>${resumen}</ul></aside>
  </div>
</section>

<section class="pg-lectura" id="articulo" data-escena="6" aria-label="${esc(t.blog.articulo)}">
  <div class="wrap">
    <article class="pg-panel pg-cuerpo">
${a.cuerpo}
      <footer class="pg-fuentes"><h2>${esc(t.blog.fuentes)}</h2><ul>${fuentes}</ul></footer>
    </article>
  </div>
</section>
${final(lang, { h: t.blog.final, n: 1 })}
` + pie(lang, otraUrl);
}

function indiceBlog(lang) {
  const t = T[lang];
  const otro = lang === 'es' ? 'fr' : 'es';
  const url = `${SITE}${t.base}/blog/`;
  const ambos = hayBlog('es') && hayBlog('fr');
  const alternos = ambos ? { es: `${SITE}/blog/`, fr: `${SITE}/fr/blog/` } : undefined;
  const ruta = [{ t: t.inicio, href: `${t.base}/` }, { t: t.nav.blog, href: `${t.base}/blog/` }];
  const items = ART[lang].map(a => `
        <li><a href="${t.base}/blog/${a.slug}/"><time datetime="${a.fecha}">${fechaLarga(lang, a.fecha)}</time><h3>${esc(a.titulo)}</h3><p>${esc(a.descripcion)}</p><span class="pg-leer">${esc(t.blog.leer)} ${flecha}</span></a></li>`).join('');
  const ld = [{
    '@context': 'https://schema.org', '@type': 'Blog', name: t.blog.nombre, url, inLanguage: lang, description: t.blog.description,
    publisher: { '@type': 'Organization', '@id': ORG_ID, name: 'AVAI Labs' },
  }, migasLd(ruta)];
  const otraUrl = `${T[otro].base}/${hayBlog(otro) ? 'blog/' : ''}`;
  return head(lang, { title: t.blog.title, description: t.blog.description, url, alternos, ld }) + nav(lang, otraUrl) + `
<main id="contenido">

<section class="hero pg-hero-blog" id="inicio" data-escena="0" aria-labelledby="hero-title">
  <div class="wrap hero-in">
    ${migas(lang, ruta)}
    <p class="kicker" data-reveal="fade"><span class="kicker-dot"></span>${esc(t.blog.kicker)}</p>
    <h1 id="hero-title" class="hero-title" data-reveal="hero">${esc(t.blog.h1)} <span class="grad">${esc(t.blog.h1grad)}</span></h1>
    <p class="hero-sub" data-reveal="fade">${esc(t.blog.lead)}</p>
  </div>
</section>

<section class="pg-lectura" id="articulos" data-escena="6" aria-labelledby="lista-t">
  <div class="wrap">
    <div class="pg-panel">
      <p class="label"><span class="label-n">01</span>${esc(t.blog.lista)}</p>
      <h2 id="lista-t" class="sr-only">${esc(t.blog.lista)}</h2>
      <ul class="pg-lista">${items}
      </ul>
    </div>
  </div>
</section>
${final(lang, { h: t.blog.final, n: 2 })}
` + pie(lang, otraUrl);
}

// ---------- Portada francesa ----------
function portadaFrancesa() {
  let s = portadaEs;
  const P = PORTADA_FR;
  const sustituir = (a, b, nombre) => {
    const c = s.split(a).length - 1;
    if (!c) throw new Error(`portada francesa: no encuentro en index.html «${nombre || a.slice(0, 80)}». ¿Cambió el texto español? Actualiza contenido/i18n/portada.fr.js`);
    s = s.split(a).join(b);
  };
  for (const [a, b] of P.pares) sustituir(a, b);

  // Cabecera
  s = s.replace('<html lang="es"', '<html lang="fr"');
  s = s.replace(/<title>[^<]*<\/title>/, `<title>${esc(P.head.title)}</title>`);
  s = s.replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(P.head.description)}"`);
  s = s.replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(P.head.title)}"`);
  s = s.replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${esc(P.head.title)}"`);
  s = s.replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(P.head.social)}"`);
  s = s.replace(/(<meta name="twitter:description" content=")[^"]*"/, `$1${esc(P.head.social)}"`);
  s = s.replace(/(<meta property="og:image:alt" content=")[^"]*"/, `$1${esc(P.head.imageAlt)}"`);
  sustituir('<link rel="canonical" href="https://avai-labs.com/">', '<link rel="canonical" href="https://avai-labs.com/fr/">');
  sustituir('<meta property="og:url" content="https://avai-labs.com/">', '<meta property="og:url" content="https://avai-labs.com/fr/">');
  sustituir('<meta property="og:locale" content="es_ES">\n<meta property="og:locale:alternate" content="fr_FR">', '<meta property="og:locale" content="fr_FR">\n<meta property="og:locale:alternate" content="es_ES">');

  // JSON-LD: la misma entidad (@id), descrita en francés y con el catálogo de las páginas francesas.
  const ini = s.indexOf('<script type="application/ld+json">\n') + '<script type="application/ld+json">\n'.length;
  const fin = s.indexOf('\n</script>', ini);
  const j = JSON.parse(s.slice(ini, fin));
  const org = j['@graph'][0];
  org.description = P.head.jsonDescription;
  org.areaServed = [{ '@type': 'Country', name: 'France' }, { '@type': 'Country', name: 'Espagne' }, { '@type': 'AdministrativeArea', name: 'Canaries' }];
  org.hasOfferCatalog = {
    '@type': 'OfferCatalog', name: 'Services d’AVAI Labs',
    itemListElement: SERV.fr.map(x => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: x.servicio, url: SITE + urlServ('fr', x.id) } })),
  };
  j['@graph'][1] = { ...j['@graph'][1], '@id': SITE + '/fr/#web', url: SITE + '/fr/', inLanguage: 'fr' };
  s = s.slice(0, ini) + JSON.stringify(j) + s.slice(fin);

  // Enlaces a las páginas de servicio francesas y rutas absolutas (la página vive en /fr/)
  for (const x of SERV.es) s = s.split(`href="${urlServ('es', x.id)}"`).join(`href="${urlServ('fr', x.id)}"`);
  s = s.replace(/\b(href|src|srcset)="(?!https?:|\/|#|mailto:|tel:|data:)([^"]+)"/g, '$1="/$2"');

  // Control: ningún texto visible puede seguir igual que en español (salvo los de `mismos`).
  const textos = html => {
    const cuerpo = html.slice(html.indexOf('<body')).replace(/<script[\s\S]*?<\/script>/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<!--[\s\S]*?-->/g, '');
    const out = new Set();
    for (const m of cuerpo.matchAll(/>([^<]+)</g)) { const x = m[1].trim(); if (/[A-Za-zÀ-ÿ]{2}/.test(x)) out.add(x); }
    for (const m of cuerpo.matchAll(/(?:alt|aria-label|placeholder|data-in|data-hub|data-out)="([^"]+)"/g)) out.add(m[1]);
    return out;
  };
  const es = textos(portadaEs);
  const sinTraducir = [...textos(s)].filter(x => es.has(x) && !P.mismos.includes(x));
  if (sinTraducir.length) throw new Error('portada francesa: textos sin traducir:\n  - ' + sinTraducir.join('\n  - '));
  return s;
}

// ---------- sitemap.xml y llms.txt ----------
function sitemap() {
  const urls = [];
  const par = (es, fr, mod, pri) => {
    const alt = `\n    <xhtml:link rel="alternate" hreflang="es" href="${es}"/>\n    <xhtml:link rel="alternate" hreflang="fr" href="${fr}"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="${es}"/>`;
    urls.push({ loc: es, mod, pri, alt }, { loc: fr, mod, pri, alt });
  };
  par(`${SITE}/`, `${SITE}/fr/`, PORTADA_MODIFICADA, '1.0');
  for (const s of SERV.es) par(SITE + urlServ('es', s.id), SITE + urlServ('fr', s.id), PORTADA_MODIFICADA, '0.8');
  for (const lang of IDIOMAS) {
    if (!hayBlog(lang)) continue;
    const base = `${SITE}${T[lang].base}/blog/`;
    if (hayBlog('es') && hayBlog('fr')) {
      if (lang === 'es') par(`${SITE}/blog/`, `${SITE}/fr/blog/`, [ART.es[0].fecha, ART.fr[0].fecha].sort().pop(), '0.6');
    } else urls.push({ loc: base, mod: ART[lang][0].fecha, pri: '0.6', alt: '' });
    for (const a of ART[lang]) urls.push({ loc: `${base}${a.slug}/`, mod: a.modificado || a.fecha, pri: '0.5', alt: '' });
  }
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.map(u => `  <url>\n    <loc>${u.loc}</loc>${u.alt}\n    <lastmod>${u.mod}</lastmod>\n    <priority>${u.pri}</priority>\n  </url>`).join('\n') +
    '\n</urlset>\n';
}

function llms() {
  const servicios = lang => SERV[lang].map(s => `- [${s.menu}](${SITE}${urlServ(lang, s.id)}): ${s.description}`).join('\n');
  const blog = lang => hayBlog(lang) ? `\n### ${lang === 'es' ? 'Blog' : 'Blog (français)'}\n\n${ART[lang].map(a => `- [${a.titulo}](${SITE}${T[lang].base}/blog/${a.slug}/): ${a.descripcion}`).join('\n')}\n` : '';
  return `# AVAI Labs

> Agencia de inteligencia artificial y marketing digital para empresas de España y Francia. / Agence d'intelligence artificielle et de marketing digital pour les entreprises en France et en Espagne.

AVAI Labs combina en un solo equipo la inteligencia artificial, el marketing digital y la producción audiovisual: automatizaciones con IA, chatbots de WhatsApp, estrategias de marketing digital, páginas web y foto y vídeo para marcas, bodas, fiestas y eventos. Trabaja con empresas de España y Francia, en remoto, y en persona en Canarias, donde está su base. Método en cuatro fases: análisis, desarrollo, implementación y optimización. La primera consulta es gratuita. Atiende en español y en francés.

## Español

- [Portada](${SITE}/)

### Servicios

${servicios('es')}
${blog('es')}
## Français

AVAI Labs réunit dans une seule équipe l'intelligence artificielle, le marketing digital et la production audiovisuelle, pour les entreprises en France et en Espagne. Première consultation gratuite.

- [Accueil](${SITE}/fr/)

### Services

${servicios('fr')}
${blog('fr')}
## Producto / Produit

- [AVAI App](https://app.avai-labs.com/): agente de IA que atiende WhatsApp, Instagram, teléfono y la web 24/7, agenda citas, envía recordatorios y rellena el CRM.

## Contacto / Contact

- Web: ${SITE}/ · ${SITE}/fr/
- Email: info@avai-labs.com
- Teléfono y WhatsApp / Téléphone et WhatsApp: +34 624 50 40 04
- Dirección / Adresse: C.C. Radazul Bajo, 38109 El Rosario (Tenerife), España
- Horario / Horaires: lunes a viernes, 9:00 a 19:00 (hora de Canarias)
`;
}

// ---------- Escritura ----------
function escribir(rel, contenido) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, contenido);
  console.log('  ' + rel);
}
function vaciar(rel) {
  // Borra solo lo que genera este script (páginas de servicio y blog), para que no queden páginas viejas.
  const d = path.join(ROOT, rel);
  if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
}

console.log('Generando:');
for (const lang of IDIOMAS) {
  const base = lang === 'es' ? '' : 'fr/';
  for (const s of SERV[lang]) escribir(`${base}${s.slug}/index.html`, paginaServicio(lang, s));
  vaciar(`${base}blog`);
  if (hayBlog(lang)) {
    escribir(`${base}blog/index.html`, indiceBlog(lang));
    for (const a of ART[lang]) escribir(`${base}blog/${a.slug}/index.html`, paginaArticulo(a));
  }
}
escribir('fr/index.html', portadaFrancesa());
escribir('sitemap.xml', sitemap());
escribir('llms.txt', llms());
console.log(`Listo: ${SERV.es.length} servicios × 2 idiomas, ${ART.es.length} artículos en español y ${ART.fr.length} en francés.`);
