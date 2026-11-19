// construir-portafolio.js — genera las mini-webs del portafolio (19-nov-2026).
//
//   node tools/construir-portafolio.js
//
// Fuente: contenido/portafolio.js. Salida: portafolio/<slug>/index.html (se sube a git; el Dockerfile copia portafolio/).
// Estilos y animaciones comunes: portafolio/comun/mini.css y mini.js. Cada web trae su tema (colores y tipografías)
// y su CSS propio, de modo que cada una tiene su personalidad.
// Todas llevan noindex, no van en el sitemap y los formularios no envían nada: avisan de que la web es del portafolio.

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const WEBS = require(path.join(ROOT, 'contenido', 'portafolio.js'));

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const foto = n => `/assets/portafolio/${n}.webp`;
const n2 = i => String(i + 1).padStart(2, '0');

const SECCION = {
  hero(s, w) {
    if (s.variante === 'letras') return `
<section class="hero hero-letras" id="inicio">
  <h1 data-r="letras">${s.titulo}</h1>
  <div class="flotan" aria-hidden="true"><img src="${foto(s.img)}" alt="" data-par="-12"><img src="${foto(s.img2)}" alt="" data-par="10"></div>
  <p class="sub" data-r="sube">${s.sub}</p>
  <a class="btn" href="#reserva" data-r="sube">${esc(w.cta)}</a>
</section>`;
    if (s.variante === 'partido') return `
<section class="hero hero-partido" id="inicio">
  <div class="txt"><p class="kicker" data-r="sube">${esc(w.tipo)}</p><h1 data-r="lineas">${s.titulo}</h1><p class="sub" data-r="sube">${s.sub}</p><a class="btn" href="#reserva" data-r="sube">${esc(w.cta)}</a></div>
  <div class="img" data-r="mascara"><img src="${foto(s.img)}" alt="" data-par="8"></div>
</section>`;
    return `
<section class="hero hero-imagen" id="inicio">
  <div class="fondo"><img src="${foto(s.img)}" alt="" data-par="14"></div>
  <div class="txt"><p class="kicker" data-r="sube">${esc(w.tipo)}</p><h1 data-r="lineas">${s.titulo}</h1><p class="sub" data-r="sube">${s.sub}</p><a class="btn" href="#reserva" data-r="sube">${esc(w.cta)}</a></div>
  <span class="baja" aria-hidden="true">↓</span>
</section>`;
  },
  intro: s => `
<section class="m intro"${s.id ? ` id="${s.id}"` : ''}>
  <div class="intro-g">
    <div><p class="kicker">${s.kicker}</p><h2 data-r="lineas">${s.titulo}</h2><p class="texto" data-r="sube">${s.texto}</p></div>
    <div class="img" data-r="mascara"><img src="${foto(s.img)}" alt="" loading="lazy" data-par="8"></div>
  </div>
</section>`,
  tarjetas: s => `
<section class="m tarjetas"${s.id ? ` id="${s.id}"` : ''}>
  <p class="kicker">${s.kicker}</p><h2 data-r="lineas">${s.titulo}</h2>
  <div class="tarj-g">${s.items.map(it => `
    <article class="tarj" data-r="sube"><div class="img"><img src="${foto(it.img)}" alt="" loading="lazy"></div><h3>${it.t}</h3><p>${it.p}</p><span class="meta">${it.meta}</span></article>`).join('')}
  </div>
</section>`,
  lista: s => `
<section class="m lista${s.fondo ? ' fondo-' + s.fondo : ''}"${s.id ? ` id="${s.id}"` : ''}>
  <div class="lista-g">
    <div><p class="kicker">${s.kicker}</p><h2 data-r="lineas">${s.titulo}</h2></div>
    <ol>${s.items.map((it, i) => `
      <li class="item" data-r="sube"><span class="n">${n2(i)}</span><div><h3>${it.t}</h3><p>${it.p}</p></div>${it.precio ? `<span class="precio">${it.precio}</span>` : ''}</li>`).join('')}
    </ol>
  </div>
</section>`,
  pasos: s => `
<section class="m pasos"${s.id ? ` id="${s.id}"` : ''}>
  <div class="intro-g">
    <div><p class="kicker">${s.kicker}</p><h2 data-r="lineas">${s.titulo}</h2>
      <ol class="pasos-l">${s.items.map(([t, p], i) => `<li data-r="sube"><span class="n">${n2(i)}</span><div><h3>${t}</h3><p>${p}</p></div></li>`).join('')}</ol></div>
    <div class="img" data-r="mascara"><img src="${foto(s.img)}" alt="" loading="lazy" data-par="8"></div>
  </div>
</section>`,
  marquesina: s => `
<div class="marq${s.color ? ' ' + s.color : ''}" aria-hidden="true"><div class="marq-in">${Array(4).fill(s.palabras.map(p => `<span>${p}</span><i>✦</i>`).join('')).join('')}</div></div>`,
  galeria: s => `
<section class="m galeria"${s.id ? ` id="${s.id}"` : ''}>
  <p class="kicker">${s.kicker}</p><h2 data-r="lineas">${s.titulo}</h2>
  <div class="gal-g">${s.imgs.map(([img, pie], i) => `<figure data-r="mascara" style="--r:${[-3, 2, -1.5, 3][i % 4]}deg"><img src="${foto(img)}" alt="" loading="lazy"><figcaption>${pie}</figcaption></figure>`).join('')}</div>
</section>`,
  reserva: (s, w) => `
<section class="m reserva"${s.id ? ` id="${s.id}"` : ''}>
  <div class="reserva-g">
    <div><p class="kicker">${s.kicker}</p><h2 data-r="lineas">${s.titulo}</h2>${s.nota ? `<p class="texto">${s.nota}</p>` : ''}</div>
    <form class="form-demo" novalidate>
      ${s.campos.map(([etq, tipo, ops], i) => `<label class="campo"><span>${etq}</span>${tipo === 'select'
        ? `<select name="c${i}">${ops.map(o => `<option>${o}</option>`).join('')}</select>`
        : `<input name="c${i}" type="${tipo}"${tipo === 'email' ? ' autocomplete="off"' : ''}>`}</label>`).join('\n      ')}
      <button class="btn" type="submit">${esc(s.boton)}</button>
      <p class="aviso" role="status" hidden>Esta web forma parte del <a href="/#portafolio">portafolio de AVAI Labs</a>: no se ha enviado ninguna reserva. ¿Quieres una web así para tu negocio? <a href="/#contacto">Hablemos →</a></p>
    </form>
  </div>
</section>`,
};

function pagina(w) {
  const t = w.tema;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(w.marca)} · ${esc(w.tipo)} — Portafolio AVAI Labs</title>
<meta name="description" content="${esc(w.descripcion)} Web diseñada por AVAI Labs.">
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="https://avai-labs.com/portafolio/${w.slug}/">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${w.fuentes}&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/portafolio/comun/mini.css?v=20261119">
<style>
:root{--fondo:${t.fondo};--tinta:${t.tinta};--suave:${t.suave};--acento:${t.acento};--sec:${t.sec};--oscuro:${t.oscuro};--display:${t.display};--cuerpo:${t.cuerpo}}
${w.css.replace(/\n\s*/g, '\n')}
</style>
<script defer src="/assets/vendor/gsap-3.15.0.min.js"></script>
<script defer src="/assets/vendor/ScrollTrigger-3.15.0.min.js"></script>
<script defer src="/assets/vendor/SplitText-3.15.0.min.js"></script>
<script defer src="/assets/vendor/lenis-1.3.27.min.js"></script>
<script type="module" src="/portafolio/comun/mini.js?v=20261119"></script>
<script defer src="https://avai-umami.ig2tl9.easypanel.host/avai.js" data-website-id="144366c2-f015-485c-bd7f-9285b163c8cc" data-domains="avai-labs.com"></script>
</head>
<body class="w-${w.slug}">
<header class="m-cab">
  <a class="marca" href="#inicio">${esc(w.marca)}</a>
  <nav>${w.nav.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</nav>
  <a class="btn btn-sm" href="#reserva">${esc(w.cta)}</a>
</header>
<main>${w.secciones.map(s => SECCION[s.tipo](s, w)).join('\n')}
</main>
<footer class="m-pie">
  <div class="m-pie-g">
    <div><p class="marca-g">${esc(w.marca)}</p><p class="suave">${esc(w.tipo)}</p></div>
    <nav>${w.nav.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</nav>
  </div>
  <div class="credito"><span>Web diseñada y desarrollada por <a href="/" data-umami-event="mini-volver-${w.slug}">AVAI Labs</a></span><a class="btn btn-sm" href="/#contacto" data-umami-event="mini-quiero-${w.slug}">¿Quieres una web así? →</a></div>
</footer>

<!-- Asistente: conversación de ejemplo de lo que hace el chatbot con IA de AVAI Labs para este sector -->
<button class="asist-aviso" id="asistAviso" type="button">${esc(w.aviso || '¡Hola! ¿Te ayudo a reservar?')}</button>
<button class="asist-b" id="asistB" type="button" aria-expanded="false" aria-controls="asist"><span class="punto"></span>Asistente</button>
<div class="asist" id="asist" hidden>
  <div class="asist-cab"><span class="punto"></span>Asistente de ${esc(w.marca)}<button type="button" id="asistX" aria-label="Cerrar">✕</button></div>
  <div class="asist-cuerpo" id="asistC">${w.chat.map(([tipo, txt]) => `<div class="burb ${tipo}">${txt}</div>`).join('')}</div>
  <p class="asist-pie">Conversación de ejemplo · Asistente con IA de <a href="/chatbot-whatsapp-empresas/">AVAI Labs</a></p>
</div>
</body>
</html>
`;
}

for (const w of WEBS) {
  const f = path.join(ROOT, 'portafolio', w.slug, 'index.html');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, pagina(w));
  console.log('  portafolio/' + w.slug + '/index.html');
}
console.log(`Listo: ${WEBS.length} mini-webs.`);
