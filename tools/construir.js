// construir.js — genera las páginas de servicio, la portada francesa, sitemap.xml y llms.txt.
//
//   node tools/construir.js
//
// Historia: 29-oct-2026 primeras páginas de servicio y blog; 30-oct-2026 todo inmersivo (mismo recorrido 3D
// que la portada) y bilingüe español/francés; 19-nov-2026 diseño «Fusión», el mismo de la portada, y fuera el blog
// (Gabriel no lo va a mantener: sus URL redirigen con un 301 desde el Dockerfile).
//
// Fuentes:
//   index.html                    portada española, hecha a mano (diseño «Fusión»)
//   contenido/i18n/portada.fr.js  traducción de la portada → fr/index.html
//   contenido/i18n/comun.js       textos de interfaz de las páginas generadas
//   contenido/servicios.es.js     5 páginas de servicio en español   → /<slug>/
//   contenido/servicios.fr.js     las mismas en francés              → /fr/<slug>/
// Salida (se sube a git tal cual: el Dockerfile copia lo generado): las carpetas anteriores, fr/index.html,
// sitemap.xml y llms.txt.
//
// Cada página generada usa el diseño de la portada «Fusión»: haces de luz (WebGL), cabecera, menú, cierre y pie de
// css/portada.css, lo propio en css/paginas.css y el movimiento en js/paginas.js. Las páginas de servicio de web y de
// chatbots enseñan además el portafolio (datos de js/portada/portafolio.js, los mismos de la portada).

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
const V = '20261120'; // versión de css/js en las URL (el servidor los revalida igualmente)
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

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = obj => '<script type="application/ld+json">\n' + JSON.stringify(obj).replace(/</g, '\\u003c') + '\n</script>';
const flecha = '<svg class="ic-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const n2 = i => String(i).padStart(2, '0');
const DEMO_ATTR = 'onclick="if(window.abrirChatAVAI){abrirChatAVAI();return false;}" data-umami-event="demo-agente"';

// Función que abre el chat oficial (la misma de la portada), en contenido/piezas/.
const pieza = f => fs.readFileSync(path.join(ROOT, 'contenido', 'piezas', f), 'utf8').replace(/\r\n/g, '\n').trim();
const ABRIR_CHAT = pieza('abrir-chat.html');
// Portafolio de la portada (módulo ES de la web; Node lo carga con require).
const PORT = require(path.join(ROOT, 'js', 'portada', 'portafolio.js'));
const CON_PORTAFOLIO = new Set(['web', 'chatbot']);

// ---------- Piezas comunes (diseño «Fusión», 19-nov-2026) ----------
// Cabecera, menú móvil, cierre y pie son los de la portada (css/portada.css); lo propio de estas páginas está en
// css/paginas.css y el movimiento en js/paginas.js (haces de luz, scroll suave y revelados).
// alternos: { es: url, fr: url } cuando la página existe en los dos idiomas.
function head(lang, { title, description, url, alternos, tipoOg = 'website', ld }) {
  const t = T[lang];
  const hreflang = alternos
    ? IDIOMAS.map(l => `<link rel="alternate" hreflang="${l}" href="${alternos[l]}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${alternos.es}">\n`
    : '';
  const otroLocale = lang === 'es' ? 'fr_FR' : 'es_ES';
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
${hreflang}<meta name="robots" content="index, follow">
<meta name="theme-color" content="#000000">
<link rel="icon" type="image/svg+xml" href="/assets/simbolo-avai.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<meta property="og:type" content="${tipoOg}">
<meta property="og:site_name" content="AVAI Labs">
<meta property="og:locale" content="${t.ogLocale}">
${alternos ? `<meta property="og:locale:alternate" content="${otroLocale}">\n` : ''}<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/${t.og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}/assets/${t.og}">
${ld.map(jsonLd).join('\n')}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/portada.css?v=${V}">
<link rel="stylesheet" href="/css/paginas.css?v=${V}">
<script defer src="/assets/vendor/gsap-3.15.0.min.js"></script>
<script defer src="/assets/vendor/ScrollTrigger-3.15.0.min.js"></script>
<script defer src="/assets/vendor/SplitText-3.15.0.min.js"></script>
<script defer src="/assets/vendor/lenis-1.3.27.min.js"></script>
<script type="module" src="/js/paginas.js?v=${V}"></script>
${UMAMI}
</head>
<body class="pg">
<a class="skip" href="#contenido">${esc(t.skip)}</a>
<canvas id="gl" aria-hidden="true"></canvas>
`;
}

// otraUrl: la página equivalente en el otro idioma (o su portada si no existe).
function nav(lang, otraUrl) {
  const t = T[lang];
  const home = `${t.base}/`;
  const otro = lang === 'es' ? 'fr' : 'es';
  const enlaces = `<a href="${home}#portafolio">${esc(t.nav.portafolio)}</a>
    <a href="${home}#servicios">${esc(t.nav.servicios)}</a>
    <a href="${home}#proceso">${esc(t.nav.proceso)}</a>
    <a href="${t.acceso}" rel="noopener">${esc(t.nav.acceso)}</a>
    <a href="${home}#contacto">${esc(t.nav.contacto)}</a>`;
  return `
<header class="cab-web">
  <a class="logo" href="${home}" aria-label="${esc(t.marcaAria)}"><img src="/assets/logo-avai.svg" alt="${esc(t.logoAlt)}" width="268" height="64"></a>
  <nav class="nav mono" aria-label="${esc(t.navAria)}">
    ${enlaces}
    <a href="${otraUrl}" class="lang" hreflang="${otro}" lang="${otro}" aria-label="${esc(t.otroIdioma.aria)}">${t.otroIdioma.corto}</a>
  </nav>
  <a class="btn-esq mono" href="${home}#contacto">${esc(t.nav.cta)} →</a>
  <button class="burger" id="burger" type="button" aria-label="${esc(t.menuAria)}" aria-expanded="false" aria-controls="menuMovil"><span></span><span></span></button>
</header>
<nav class="menu-movil" id="menuMovil" aria-label="${esc(t.menuMovilAria)}">
    ${enlaces}
  <a href="${otraUrl}" hreflang="${otro}" lang="${otro}">${t.otroIdioma.largo}</a>
  <a class="pill" href="${home}#contacto">${esc(t.nav.cta)}</a>
</nav>
`;
}

function migas(lang, items, enlazarUltimo = false) {
  const li = items.map((it, i) => i < items.length - 1 || enlazarUltimo
    ? `<li><a href="${it.href}">${esc(it.t)}</a></li>`
    : `<li aria-current="page">${esc(it.t)}</li>`).join('');
  return `<nav class="migas" aria-label="${esc(T[lang].migas)}"><ol class="mono">${li}</ol></nav>`;
}
const migasLd = items => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.t, item: SITE + it.href })),
});
const rotulo = (n, txt) => `<p class="mono pg-rot"><span>${n2(n)}</span>${esc(txt)}</p>`;

// Llamada final: el «AVAI» gigante de la portada, la consulta (formulario de la portada), el agente y WhatsApp.
function final(lang, { h, demo, rel = '' }) {
  const t = T[lang];
  const demoBtn = demo ? `\n        <a href="#contacto" class="pill linea" ${DEMO_ATTR}>${esc(t.demo)}</a>` : '';
  return `
<section class="cierre pg-final" id="contacto" aria-labelledby="final-t">
  <div class="gigante" id="gigante" aria-hidden="true">AVAI</div>
  <div class="pg-final-g">
    <div>
      <p class="mono">${esc(t.rotulos.contacto)}</p>
      <h2 id="final-t">${esc(h)}</h2>
      <p class="lead">${esc(t.final.lead)}</p>
      <div class="ctas">
        <a href="${t.base}/#contacto" class="pill">${esc(t.consulta)} ${flecha}</a>${demoBtn}
        <a data-umami-event="whatsapp" href="${WA}" class="pill linea" target="_blank" rel="noopener">${esc(t.final.wa)}</a>
      </div>
    </div>${rel}
  </div>
</section>`;
}

function pie(lang, otraUrl) {
  const t = T[lang];
  const home = `${t.base}/`;
  const otro = lang === 'es' ? 'fr' : 'es';
  const sol = SERV[lang].map(s => `<a href="${urlServ(lang, s.id)}">${esc(s.menu)}</a>`).join('');
  return `
</main>

<footer class="cierre pie">
  <div class="pie-top">
    <div class="pie-marca">
      <img src="/assets/logo-avai-claro.svg" alt="${esc(t.logoAlt)}" width="268" height="64" loading="lazy">
      <p>${esc(t.pie.marca)}</p>
    </div>
    <div class="pie-cols">
      <div class="pie-col"><h2>${esc(t.pie.soluciones)}</h2>${sol}</div>
      <div class="pie-col"><h2>${esc(t.pie.empresa)}</h2><a href="${home}#nosotros">${esc(t.pie.sobre)}</a><a href="${home}#portafolio">${esc(t.pie.portafolio)}</a><a href="${home}#proceso">${esc(t.pie.proceso)}</a><a href="${home}#casos">${esc(t.pie.casos)}</a><a href="${t.acceso}" rel="noopener">${esc(t.pie.acceso)}</a><a href="https://app.avai-labs.com/" rel="noopener">AVAI App</a><a href="${t.privacidad}">${esc(t.pie.privacidad)}</a></div>
      <div class="pie-col"><h2>${esc(t.pie.contacto)}</h2><a href="mailto:info@avai-labs.com">info@avai-labs.com</a><a href="tel:+34624504004">+34 624 50 40 04</a><a data-umami-event="whatsapp" href="${WA}" target="_blank" rel="noopener">WhatsApp</a><a href="https://www.instagram.com/avai.labs/" target="_blank" rel="noopener">Instagram</a><a href="https://www.youtube.com/@atlanticvisionai" target="_blank" rel="noopener">YouTube</a><a href="https://www.google.com/maps/search/?api=1&amp;query=C.C.+Radazul+Bajo+38109+El+Rosario+Tenerife" target="_blank" rel="noopener">C.C. Radazul Bajo, 38109 · El Rosario, Tenerife</a></div>
    </div>
  </div>
  <div class="pie-bajo"><span>${esc(t.pie.derechos)}</span><span><a href="${t.privacidad}">${esc(t.pie.privacidad)}</a> · <a href="${otraUrl}" hreflang="${otro}" lang="${otro}">${t.otroIdioma.largo}</a> · ${esc(t.pie.hecho)}</span></div>
</footer>

${ABRIR_CHAT}
${WIDGET}
</body>
</html>
`;
}

// Portafolio (servicios de web y de chatbots): la fila de mini-webs se desliza de lado al pasar.
function portafolio(lang) {
  const t = T[lang];
  const webs = PORT.PROYECTOS.map(p => `
      <a class="pg-pw" href="${PORT.urlProyecto(p)}" data-cursor data-umami-event="portafolio-${p.slug}"><span class="nb"><i></i><i></i><i></i></span><img src="${PORT.foto(p.img)}" alt="${esc(`${p.marca}, ${p[lang].tipo}`)}" loading="lazy" decoding="async"><span class="t"><b>${esc(p.marca)}</b><span class="mono">${esc(`${p[lang].sector} · ${p[lang].hace}`)}</span></span></a>`).join('');
  return `
<section class="pg-port" id="portafolio" aria-labelledby="port-t">
  <div class="cab"><h2 id="port-t">${esc(t.portafolio.h)} <span class="serif">${esc(t.portafolio.hs)}</span></h2><span class="mono">${esc(t.portafolio.pulsa)}</span></div>
  <div class="pg-port-g">${webs}
  </div>
</section>
`;
}

// ---------- Página de servicio ----------
function paginaServicio(lang, s) {
  const t = T[lang];
  const otro = lang === 'es' ? 'fr' : 'es';
  const url = SITE + urlServ(lang, s.id);
  const alternos = { es: SITE + urlServ('es', s.id), fr: SITE + urlServ('fr', s.id) };
  const ruta = [{ t: t.inicio, href: `${t.base}/` }, { t: s.menu, href: urlServ(lang, s.id) }];
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
  const area = s.area.items.map((it, i) => `
      <li><span class="mono">${n2(i + 1)}</span><h3>${enlace(it)}</h3><p>${esc(it.p)}</p></li>`).join('');
  const fases = s.proceso.fases.map((f, i) => `
      <li><span class="mono">${n2(i + 1)}</span><h3>${esc(f.t)}</h3><p>${esc(f.p)}</p></li>`).join('');
  const casos = s.casos.items.map((c, i) => `
      <li class="caso hud">
        <div class="caso-txt">
          <span class="mono caso-n">${n2(i + 1)}</span>
          <h3>${esc(c.t)}</h3>
          <p>${esc(c.p)}</p>${c.antes ? `
          <p class="cambio"><span>${esc(c.antes)}</span><span class="mono">→ ${esc(c.despues)}</span></p>` : ''}
        </div>
        <div class="caso-flujo" aria-hidden="true">
          <ul class="f-in mono">${c.in.map(x => `<li>${esc(x)}</li>`).join('')}</ul><span class="hilo"></span>
          <span class="f-hub">${esc(c.hub)}</span><span class="hilo"></span>
          <ul class="f-out mono">${c.out.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
      </li>`).join('');
  const faq = s.faq.map(f => `
      <details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
  const rel = `
    <nav class="pg-rel" aria-label="${esc(t.relacionados)}">
      <p class="mono">${esc(t.relacionados)}</p>
      ${s.relacionados.map(r => `<a href="${urlServ(lang, r)}">${esc(porId(lang)[r].menu)}</a>`).join('\n      ')}
    </nav>`;
  const ctaPrincipal = s.demo
    ? `<a href="#contacto" class="pill" ${DEMO_ATTR}>${esc(t.demo)} ${flecha}</a>
      <a href="${t.base}/#contacto" class="pill linea">${esc(t.consulta)}</a>`
    : `<a href="${t.base}/#contacto" class="pill">${esc(t.consulta)} ${flecha}</a>
      <a href="#que" class="pill linea">${esc(t.explorar)}</a>`;

  return head(lang, { title: s.title, description: s.description, url, alternos, ld }) + nav(lang, urlServ(otro, s.id)) + `
<main id="contenido">

<section class="pg-hero" id="inicio" aria-labelledby="h1">
  <div class="pg-hero-in">
    ${migas(lang, ruta)}
    <p class="kick mono">[ ${esc(s.kicker)} ]</p>
    <h1 id="h1">${esc(s.h1)} <span class="serif">${esc(s.h1grad)}</span></h1>
    <p class="pg-sub">${esc(s.sub)}</p>
    <div class="ctas">
      ${ctaPrincipal}
    </div>
  </div>
  <div class="hero-pie"><ul class="pg-tags mono" aria-label="${esc(t.tagsAria)}">${s.tags.map(x => `<li>${esc(x)}</li>`).join('')}</ul><a class="mono" href="#que">${esc(t.desliza)} ↓</a></div>
</section>

<section class="pg-que" id="que" aria-labelledby="que-t">
  <div class="pg-cab">
    ${rotulo(1, t.rotulos.que)}
    <h2 id="que-t">${esc(s.area.h)}</h2>
    <p class="pg-lead">${esc(s.area.lead)}</p>
  </div>
  <ol class="pg-items">${area}
  </ol>
</section>
${CON_PORTAFOLIO.has(s.id) ? portafolio(lang) : ''}
<section class="pg-casos" id="casos" aria-labelledby="casos-t">
  <div class="cab-c">
    ${rotulo(2, t.rotulos.casos)}
    <h2 id="casos-t">${esc(s.casos.h)}</h2>
    <p class="pg-lead">${esc(s.casos.lead)}</p>
  </div>
  <ol class="pg-casos-l">${casos}
  </ol>
</section>

<div class="claro">
  <section class="proc pg-proc" id="proceso" aria-labelledby="proc-t">
    <div class="cab"><div>${rotulo(3, t.rotulos.como)}<h2 id="proc-t">${esc(s.proceso.h)}</h2></div><p class="pg-lead">${esc(s.proceso.lead)}</p></div>
    <ol class="linea-t">${fases}
    </ol>
  </section>
  <section class="pg-faq" id="preguntas" aria-labelledby="faq-t">
    <div>${rotulo(4, t.rotulos.faq)}<h2 id="faq-t">${esc(t.faqH)}</h2></div>
    <div class="pg-faq-l">${faq}
    </div>
  </section>
</div>
${final(lang, { h: t.final.h, demo: s.demo, rel })}
` + pie(lang, urlServ(otro, s.id));
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
  s = s.split('https://avai-labs.com/assets/og-avai.jpg').join('https://avai-labs.com/assets/og-avai-fr.jpg'); // imagen para redes en francés
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
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.map(u => `  <url>\n    <loc>${u.loc}</loc>${u.alt}\n    <lastmod>${u.mod}</lastmod>\n    <priority>${u.pri}</priority>\n  </url>`).join('\n') +
    '\n</urlset>\n';
}

function llms() {
  const servicios = lang => SERV[lang].map(s => `- [${s.menu}](${SITE}${urlServ(lang, s.id)}): ${s.description}`).join('\n');
  return `# AVAI Labs

> Agencia de inteligencia artificial y marketing digital para empresas de España y Francia. / Agence d'intelligence artificielle et de marketing digital pour les entreprises en France et en Espagne.

AVAI Labs combina en un solo equipo la inteligencia artificial, el marketing digital y la producción audiovisual: automatizaciones con IA, chatbots de WhatsApp, estrategias de marketing digital, páginas web y foto y vídeo para marcas, bodas, fiestas y eventos. Trabaja con empresas de España y Francia, en remoto, y en persona en Canarias, donde está su base. Método en cuatro fases: análisis, desarrollo, implementación y optimización. La primera consulta es gratuita. Atiende en español y en francés.

## Español

- [Portada](${SITE}/)

### Servicios

${servicios('es')}

## Français

AVAI Labs réunit dans une seule équipe l'intelligence artificielle, le marketing digital et la production audiovisuelle, pour les entreprises en France et en Espagne. Première consultation gratuite.

- [Accueil](${SITE}/fr/)

### Services

${servicios('fr')}

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
// Tipografía francesa: espacio fino irrompible antes de : ; ? ! » y después de «, para que al partir la línea no
// quede el signo solo («On parle de votre projet / ?»). Solo en el texto visible: ni atributos ni scripts.
const fino = t => t.replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« ');
const tipografia = (lang, html) => lang !== 'fr' ? html : html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/)
  .map((parte, i) => i % 2 ? parte : parte.replace(/>([^<]+)</g, (m, t) => '>' + fino(t) + '<')).join('');

console.log('Generando:');
for (const lang of IDIOMAS) {
  const base = lang === 'es' ? '' : 'fr/';
  for (const s of SERV[lang]) escribir(`${base}${s.slug}/index.html`, tipografia(lang, paginaServicio(lang, s)));
}
escribir('fr/index.html', tipografia('fr', portadaFrancesa()));
escribir('sitemap.xml', sitemap());
escribir('llms.txt', llms());
console.log(`Listo: ${SERV.es.length} servicios × 2 idiomas y la portada francesa.`);
