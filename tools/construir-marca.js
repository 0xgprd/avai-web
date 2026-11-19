// Logo definitivo de AVAI Labs (19-nov-2026, elegido por Gabriel): el símbolo original, la ola con el ojo de
// «Atlantic Vision AI», redibujado en vectorial, y las letras «AVAI» de la propuesta 02 · Haz, con el haz de luz
// como travesaño de la primera A.
//
//   node tools/construir-marca.js          → assets/simbolo-avai.svg, assets/logo-avai.svg, assets/logo-avai-claro.svg
//   node tools/construir-marca.js --png    → además los PNG/WebP del logo y los favicons (necesita Chrome)
//   node tools/construir-marca.js --og     → además las imágenes para redes, og-avai.jpg y og-avai-fr.jpg (necesita
//                                            Chrome y la vista local `node server.js`, de la que toma los haces de luz)
//
// El símbolo se calcó del original (el antiguo assets/favicon-ojo.png) midiendo sus bandas en radios desde el centro:
// todo es concéntrico, la cresta aguamarina sigue el borde del círculo y los azules siguen la curva de abajo del ojo.
// El ojo es un hueco que deja ver el fondo, como en el original; los brillos del iris pasan a ser blancos (en el
// original eran huecos y sobre fondo oscuro parecían manchas).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets');

// =================================================================================================================
// Símbolo: círculo de centro (256,256) y radio 219, en un lienzo de 512
// =================================================================================================================
const C = 256, R = 219, FUERA = R + 8;
const rad = g => g * Math.PI / 180;
const P = (g, r) => [C + r * Math.cos(rad(g)), C + r * Math.sin(rad(g))];
const f1 = n => Math.round(n * 10) / 10;

// r(θ) por interpolación cúbica (Hermite) sobre muestras [θ, r]; θ en grados, ascendente y sin dar la vuelta
function curva(m) {
  return g => {
    if (g <= m[0][0]) return m[0][1];
    if (g >= m[m.length - 1][0]) return m[m.length - 1][1];
    let i = 0; while (m[i + 1][0] < g) i++;
    const p0 = m[Math.max(0, i - 1)], p1 = m[i], p2 = m[i + 1], p3 = m[Math.min(m.length - 1, i + 2)];
    const t = (g - p1[0]) / (p2[0] - p1[0]);
    const m1 = (p2[1] - p0[1]) / (p2[0] - p0[0]) * (p2[0] - p1[0]);
    const m2 = (p3[1] - p1[1]) / (p3[0] - p1[0]) * (p2[0] - p1[0]);
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2;
  };
}
// Polilínea → trazo suave (Catmull-Rom a Bézier cúbicas)
function suave(pts) {
  let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f1(c1[0])},${f1(c1[1])} ${f1(c2[0])},${f1(c2[1])} ${f1(p2[0])},${f1(p2[1])}`;
  }
  return d;
}
// Puntos de r(θ) cada `paso` grados, con una media móvil del radio que borra el ruido de la medición
function muestras(f, g0, g1, paso = 4, V = 3) {
  const n = Math.ceil(Math.abs(g1 - g0) / paso); const gs = [], rs = [];
  for (let k = 0; k <= n; k++) { const g = g0 + (g1 - g0) * k / n; gs.push(g); rs.push(f(g)); }
  const sm = rs.map((r, k) => { const v = Math.min(V, k, n - k); let t = 0; for (let j = -v; j <= v; j++) t += rs[k + j]; return t / (2 * v + 1); });
  return gs.map((g, k) => P(g, sm[k]));
}
// Cuña desde el centro hasta r(θ). Las capas se pintan de fuera hacia dentro y cada una tapa el interior de la
// anterior; el centro queda dentro del ojo, que la máscara recorta.
const cuna = (f, g0, g1) => { const pts = muestras(f, g0, g1); return `M${C},${C}L${f1(pts[0][0])},${f1(pts[0][1])}` + suave(pts).replace(/^M[^C]+/, '') + 'Z'; };

// Bordes medidos en el original (θ: 0 = derecha, 90 = abajo, 180 = izquierda, 270 = arriba)
const ojo = curva([[-22, 219], [-20, 215], [-15, 204], [0, 172], [15, 142], [30, 122], [45, 110], [60, 104], [75, 102], [90, 102], [105, 106],
  [120, 110], [135, 117], [150, 124], [160, 126], [170, 128], [180, 126], [190, 122], [200, 114], [210, 111], [225, 108], [240, 113],
  [255, 121], [270, 139], [285, 164], [300, 192], [305, 200], [310, 208], [315, 214], [317, 219]]);
const rA = curva([[180, FUERA], [186, 219], [190, 215], [200, 212], [210, 206], [225, 202], [240, 196], [255, 196], [270, 196], [285, 200], [300, 210], [305, 216], [309, 219], [312, FUERA]]);
const rB = curva([[140, FUERA], [145, 221], [150, 212], [155, 206], [160, 198], [165, 188], [170, 182], [175, 174], [180, 166], [190, 154], [195, 150],
  [200, 146], [210, 140], [225, 136], [240, 140], [255, 148], [270, 164], [285, 186], [300, 210], [305, 216], [310, 219], [314, FUERA]]);
const rD = curva([[38, FUERA], [45, 216], [60, 210], [75, 206], [90, 204], [105, 204], [120, 204], [126, 206], [131, 216], [135, 216], [140, 210],
  [145, 202], [150, 192], [155, 181], [160, 169], [165, 159], [170, 149], [175, 141], [180, 134], [186, 124]]);
const r3 = curva([[8, FUERA], [42, FUERA], [45, 216], [60, 199], [75, 181], [90, 165], [105, 152], [120, 144], [130, 140], [140, 136], [150, 134], [155, 132], [160, 124]]);
const r2 = curva([[-6, FUERA], [14, FUERA], [18, 214], [30, 180], [45, 163], [60, 148], [75, 138], [90, 130], [105, 126], [120, 126], [135, 126], [145, 128], [152, 125]]);
const r1 = curva([[-28, FUERA], [2, FUERA], [6, 200], [15, 172], [30, 150], [45, 134], [60, 124], [75, 118], [90, 116], [105, 116], [120, 118], [130, 121], [135, 123], [140, 118]]);

// Contorno del ojo: el borde medido de θ=-22 a 317 y, por la abertura de la derecha, por fuera del círculo
const OJO = (() => { const pts = muestras(ojo, -22, 317); const a = P(317, FUERA + 4), b = P(-22, FUERA + 4);
  return suave(pts) + `L${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}Z`; })();

function simbolo(pref = 's') {
  const id = k => pref + k;
  const lg = (n, x1, y1, x2, y2, stops) => `<linearGradient id="${id(n)}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  const capa = (f, g0, g1, n) => `<path d="${cuna(f, g0, g1)}" fill="url(#${id(n)})"/>`;
  return `<defs>
    <clipPath id="${id('c')}"><circle cx="${C}" cy="${C}" r="${R}"/></clipPath>
    <mask id="${id('m')}" maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512"><rect width="512" height="512" fill="#fff"/><path d="${OJO}" fill="#000"/></mask>
    ${lg('a', 330, 40, 60, 250, [[0, '#3cf2dc'], [.6, '#2fe2d2'], [1, '#22c3c8']])}
    ${lg('b', 330, 50, 60, 420, [[0, '#2be2d1'], [.55, '#18aec0'], [1, '#0a85af']])}
    ${lg('i', 360, 70, 120, 440, [[0, '#0abcc6'], [.6, '#0b8fb1'], [1, '#176aa2']])}
    ${lg('r', 430, 390, 110, 410, [[0, '#3a6fd8'], [.45, '#2555b9'], [1, '#0f2f7a']])}
    ${lg('d', 110, 250, 330, 450, [[0, '#031a4e'], [.45, '#082a78'], [1, '#143f99']])}
    ${lg('c3', 470, 320, 140, 330, [[0, '#2595e3'], [.5, '#1f68d2'], [1, '#0b46aa']])}
    ${lg('c2', 470, 290, 150, 340, [[0, '#33bcf1'], [.55, '#2283de'], [1, '#1c70d4']])}
    ${lg('c1', 460, 180, 160, 330, [[0, '#3bd2f5'], [.6, '#31a8ea'], [1, '#3394de']])}
    ${lg('ia', 220, 170, 310, 300, [[0, '#0a4f7c'], [1, '#2ccbe4']])}
    ${lg('ib', 210, 175, 300, 290, [[0, '#0a2f5e'], [1, '#1f80cc']])}
    ${lg('ic', 245, 170, 245, 286, [[0, '#06456e'], [.45, '#0a2650'], [1, '#0a2a55']])}
  </defs>
  <g clip-path="url(#${id('c')})" mask="url(#${id('m')})">
    <circle cx="${C}" cy="${C}" r="${R}" fill="#0d3384"/>
    ${capa(() => FUERA, 178, 314, 'a')}
    ${capa(rA, 138, 312, 'b')}
    ${capa(rB, 126, 318, 'i')}
    ${capa(() => FUERA, 36, 134, 'r')}
    ${capa(rD, 36, 188, 'd')}
    ${capa(r3, 6, 162, 'c3')}
    ${capa(r2, -8, 154, 'c2')}
    ${capa(r1, -30, 142, 'c1')}
  </g>
  <circle cx="262" cy="241" r="76" fill="url(#${id('ia')})"/>
  <circle cx="252" cy="233" r="68" fill="url(#${id('ib')})"/>
  <circle cx="245" cy="228" r="58" fill="url(#${id('ic')})"/>
  <circle cx="250" cy="224" r="34" fill="#071a3d" opacity=".7"/>
  <circle cx="287" cy="204" r="17" fill="#fff"/>
  <circle cx="270" cy="231" r="7" fill="#fff"/>`;
}

// =================================================================================================================
// Letras (propuesta 02 · Haz): trazo 4 y altura 44; la A y la V se solapan; el travesaño de la primera A es el haz.
// «LABS» va dibujado a trazo, sin depender de ninguna fuente.
// =================================================================================================================
const TEMAS = {
  oscuro: { tinta: '#f3f5fa', acento: '#5ad8ff', caliente: '#ffffff', gris: '#8a90a3' }, // sobre fondo oscuro
  claro: { tinta: '#0b0d12', acento: '#2f6bff', caliente: '#0d2fa8', gris: '#6c6f78' },  // sobre fondo claro
};

function labs(x0, gris) {
  const a = 13.4, w = 8.4, t = 16, b = 28; let x = x0; const d = [];
  d.push(`M${x} ${t}V${b}H${x + 8}`); x += a;
  d.push(`M${x} ${b}L${x + w / 2} ${t}L${x + w} ${b}M${x + 1.65} 23.6H${x + w - 1.65}`); x += a;
  d.push(`M${x} ${t}H${x + 5}A3 3 0 0 1 ${x + 5} ${t + 6}H${x}M${x + 5.2} ${t + 6}A3 3 0 0 1 ${x + 5.2} ${b}H${x}V${t}`); x += a;
  d.push(`M${x + 8} ${t + 1.9}C${x + 7.1} ${t + .6} ${x + 5.8} ${t} ${x + 4.2} ${t}C${x + 2} ${t} ${x + .5} ${t + 1.2} ${x + .5} ${t + 3}C${x + .5} ${t + 5} ${x + 2.3} ${t + 5.6} ${x + 4.2} ${t + 6}C${x + 6.4} ${t + 6.4} ${x + 8.1} ${t + 7.1} ${x + 8.1} ${t + 9}C${x + 8.1} ${t + 10.9} ${x + 6.5} ${b} ${x + 4.2} ${b}C${x + 2.4} ${b} ${x + 1} ${b - .5} ${x} ${b - 2}`);
  return `<path d="${d.map(s => s.replace(/(\d+\.\d{2})\d+/g, '$1')).join('')}" fill="none" stroke="${gris}" stroke-width="1.7" stroke-miterlimit="10"/>`;
}

function palabra(T, pref = 'w') {
  const id = k => pref + k;
  const letras = ['M-1.36 47L20 0L41.36 47', 'M27.7 -3L48 44L68.3 -3', 'M55.64 47L77 0L98.36 47', 'M109 -3V47'];
  return `<defs><clipPath id="${id('c')}"><rect x="-6" y="0" width="124" height="44"/></clipPath>
    <linearGradient id="${id('h')}" gradientUnits="userSpaceOnUse" x1="-14" y1="0" x2="37" y2="0"><stop offset="0" stop-color="${T.acento}" stop-opacity="0"/><stop offset=".38" stop-color="${T.acento}" stop-opacity=".55"/><stop offset=".8" stop-color="${T.caliente}"/><stop offset=".9" stop-color="${T.acento}" stop-opacity=".9"/><stop offset="1" stop-color="${T.acento}" stop-opacity="0"/></linearGradient>
    <filter id="${id('f')}" x="-10%" y="-300%" width="120%" height="700%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>
  <g clip-path="url(#${id('c')})" fill="none" stroke="${T.tinta}" stroke-width="4" stroke-miterlimit="10">${letras.map(d => `<path d="${d}"/>`).join('')}</g>
  <path d="M62.1 28H91.9" stroke="${T.tinta}" stroke-width="4"/>
  <rect class="haz" x="-14" y="25.6" width="51" height="4.8" fill="url(#${id('h')})" filter="url(#${id('f')})" opacity=".8"/>
  <rect class="haz" x="-14" y="26.4" width="51" height="3.2" fill="url(#${id('h')})"/>
  <path d="M126 7V37" stroke="${T.gris}" stroke-width="1.2"/>${labs(137, T.gris)}`;
}

// Logotipo horizontal: el símbolo (58 de diámetro) centrado con las letras; el haz sale del ojo hacia la A.
// Con `anima`, el haz se enciende una vez al cargar (salvo con «reducir movimiento»).
const ANCHO = 268, ALTO = 64, S = 58 / (2 * R);
const ANIMA = `<style>@media (prefers-reduced-motion:no-preference){.haz{transform-box:fill-box;transform-origin:0 50%;animation:haz 1.2s .3s cubic-bezier(.16,1,.3,1) both}}@keyframes haz{from{opacity:0;transform:scaleX(0)}}</style>`;
const logo = (tema, { anima = false } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ANCHO} ${ALTO}" width="${ANCHO}" height="${ALTO}">
  <title>AVAI Labs</title>${anima ? '\n  ' + ANIMA : ''}
  <g transform="translate(${f1(32 - C * S)} ${f1(32 - C * S)}) scale(${S.toFixed(6)})">${simbolo('s')}</g>
  <g transform="translate(78 10)">${palabra(TEMAS[tema], 'w')}</g>
</svg>
`;
const simboloSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${C - R - 1} ${C - R - 1} ${2 * R + 2} ${2 * R + 2}" width="512" height="512">
  <title>AVAI Labs</title>
  ${simbolo('s')}
</svg>
`;

// =================================================================================================================
// Rasterizado con Chrome sin ventana
// =================================================================================================================
async function chrome() {
  const { spawn } = require('child_process'); const os = require('os');
  const exe = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const puerto = 9300 + Math.floor(Math.random() * 200);
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'avai-marca-'));
  const ch = spawn(exe, ['--headless=new', `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`, '--hide-scrollbars', '--no-first-run',
    '--force-color-profile=srgb', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank']);
  const dormir = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 80; i++) { try { await fetch(`http://127.0.0.1:${puerto}/json/version`); break; } catch { await dormir(250); } }
  const tab = (await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json()).find(t => t.type === 'page');
  const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = new Map();
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const evalua = async e => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;
  await send('Page.enable');
  // Captura `html` (o `url`) a W×H px; formato png, webp o jpeg; con `transparente`, el fondo queda vacío.
  async function captura({ html, url, W, H, formato = 'png', calidad = 92, transparente = false, espera = 600, css = '' }) {
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    await send('Emulation.setDefaultBackgroundColorOverride', transparente ? { color: { r: 0, g: 0, b: 0, a: 0 } } : {});
    if (url) {
      await send('Page.navigate', { url }); await dormir(espera);
      if (css) await evalua(`(() => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(css)}; document.head.append(s); })()`);
      await dormir(400);
    } else {
      await send('Page.navigate', { url: 'about:blank' }); await dormir(150);
      const marco = (await send('Page.getFrameTree')).result.frameTree.frame.id;
      await send('Page.setDocumentContent', { frameId: marco, html });
      await evalua('document.fonts.ready.then(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))))');
      await dormir(espera);
    }
    const r = await send('Page.captureScreenshot', { format: formato, quality: formato === 'png' ? undefined : calidad, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
    return Buffer.from(r.result.data, 'base64');
  }
  const cerrar = () => { ch.kill(); setTimeout(() => { try { fs.rmSync(perfil, { recursive: true, force: true }); } catch {} }, 500); };
  return { captura, cerrar };
}
const dataSvg = svg => 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
// El dibujo centrado en un lienzo W×H, con `ancho` px de ancho (o `alto` px de alto)
const lienzo = (svg, W, H, { ancho, alto, fondo = 'transparent' }) => `<!doctype html><html><body style="margin:0;width:${W}px;height:${H}px;display:grid;place-items:center;background:${fondo}">
<img src="${dataSvg(svg)}" style="${ancho ? `width:${ancho}px` : `height:${alto}px`};display:block"></body></html>`;

async function rasterizar() {
  const { captura, cerrar } = await chrome();
  const logoO = logo('oscuro'), logoC = logo('claro'), sim = simboloSvg();
  const sale = async (nombre, opciones) => { fs.writeFileSync(path.join(ASSETS, nombre), await captura(opciones)); console.log('  assets/' + nombre); };
  try {
    // Mismos nombres y medidas que antes, para no romper nada de lo que ya los usa (letras claras, para fondo oscuro)
    await sale('logo-avai.png', { html: lienzo(logoO, 810, 324, { ancho: 760 }), W: 810, H: 324, transparente: true });
    await sale('logo-avai-sm.png', { html: lienzo(logoO, 320, 128, { ancho: 300 }), W: 320, H: 128, transparente: true });
    await sale('logo-avai.webp', { html: lienzo(logoO, 320, 128, { ancho: 300 }), W: 320, H: 128, transparente: true, formato: 'webp', calidad: 95 });
    // Letras oscuras, para fondo blanco: es el que se declara a Google en los datos estructurados
    await sale('logo-avai-claro.png', { html: lienzo(logoC, 1072, 256, { ancho: 1072 }), W: 1072, H: 256, transparente: true });
    await sale('favicon-ojo.png', { html: lienzo(sim, 512, 512, { ancho: 512 }), W: 512, H: 512, transparente: true });
    await sale('favicon-192.png', { html: lienzo(sim, 192, 192, { ancho: 192 }), W: 192, H: 192, transparente: true });
    await sale('favicon-32.png', { html: lienzo(sim, 32, 32, { ancho: 32 }), W: 32, H: 32, transparente: true });
    await sale('apple-touch-icon.png', { html: lienzo(sim, 180, 180, { ancho: 148, fondo: '#05070c' }), W: 180, H: 180 });
  } finally { cerrar(); }
}

// =================================================================================================================
// Imágenes para redes (1200×630): los haces de luz de la portada, el logo y el titular de la portada
// =================================================================================================================
const OG = {
  es: { archivo: 'og-avai.jpg', h1: 'Webs que venden.<br><span>IA que atiende.</span>', linea: 'Diseño web · Chatbots · Automatizaciones' },
  fr: { archivo: 'og-avai-fr.jpg', h1: 'Des sites qui vendent.<br><span>Une IA qui répond.</span>', linea: 'Sites web · Chatbots · Automatisations' },
};
async function imagenesOg(base = 'http://localhost:5500/') {
  const { captura, cerrar } = await chrome();
  try {
    const haces = await captura({ url: base, W: 1200, H: 630, formato: 'jpeg', calidad: 95, espera: 4500,
      css: 'body *{visibility:hidden!important}#gl{visibility:visible!important}' });
    for (const lang of ['es', 'fr']) {
      const o = OG[lang];
      const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#000}
.f{position:absolute;inset:0;background:url(data:image/jpeg;base64,${haces.toString('base64')}) center/cover}
.v{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.86),rgba(0,0,0,.5) 62%,rgba(0,0,0,.15))}
.c{position:absolute;inset:0;padding:60px 72px 56px;display:flex;flex-direction:column;justify-content:space-between;color:#f3f5fa}
.c img{height:66px;width:auto;align-self:flex-start}
h1{margin:0;font:300 96px/.95 'Inter Tight',sans-serif;letter-spacing:-.05em}
h1 span{color:#6b7285}
.p{display:flex;justify-content:space-between;font:500 16px/1 'JetBrains Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:#8a90a3}
.p b{font-weight:500;color:#5ad8ff}</style></head>
<body><div class="f"></div><div class="v"></div><div class="c"><img src="${dataSvg(logo('oscuro'))}" alt=""><h1>${o.h1}</h1><div class="p"><span>${o.linea}</span><b>avai-labs.com</b></div></div></body></html>`;
      fs.writeFileSync(path.join(ASSETS, o.archivo), await captura({ html, W: 1200, H: 630, formato: 'jpeg', calidad: 88, espera: 800 }));
      console.log('  assets/' + o.archivo);
    }
  } finally { cerrar(); }
}

// =================================================================================================================
(async () => {
  fs.writeFileSync(path.join(ASSETS, 'simbolo-avai.svg'), simboloSvg());
  fs.writeFileSync(path.join(ASSETS, 'logo-avai.svg'), logo('oscuro', { anima: true }));
  fs.writeFileSync(path.join(ASSETS, 'logo-avai-claro.svg'), logo('claro', { anima: true }));
  console.log('  assets/simbolo-avai.svg, logo-avai.svg, logo-avai-claro.svg');
  if (process.argv.includes('--png')) await rasterizar();
  if (process.argv.includes('--og')) await imagenesOg();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
