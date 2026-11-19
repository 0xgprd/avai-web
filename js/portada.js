// Portada «Fusión» (19-nov-2026). Un solo recorrido con el scroll:
//   1. hero sobre haces de luz (WebGL, js/portada/fondo-gl.js)
//   2. de la luz salen las webs del portafolio y flotan (nube)
//   3. la nube se ordena en un muro en perspectiva; cada miniatura abre su mini-web
//   4. la cámara entra en una web y su chatbot atiende; el sector se puede cambiar y cambia solo
//   5. vuelven los haces para las automatizaciones; después servicios, portafolio, nosotros, proceso y contacto.
// El formulario de contacto tiene su propio script en línea en index.html y no depende de este módulo.
// Con «reducir movimiento» todo queda visible y quieto.

import { fondoGL, HACES } from './portada/fondo-gl.js';
import { PROYECTOS, DEMOS, TEXTOS, foto, urlProyecto } from './portada/portafolio.js';
import { iniciarSuave, revelarLineas, reducido } from './portada/suave.js';
import { cabecera, menuMovil, cursorVer } from './portada/interfaz.js';

const lang = document.documentElement.lang === 'fr' ? 'fr' : 'es';
const T = TEXTOS[lang];
const porSlug = Object.fromEntries(PROYECTOS.map(p => [p.slug, p]));
const $ = s => document.querySelector(s);

// ---------- Contenido generado ----------
// 12 miniaturas (4 × 3). La 5 es Marvesa: en ella entra la cámara.
const TILES = [['nerelia', 'img'], ['pintxonia', 'img'], ['azurela', 'img'], ['albaria', 'img2'],
  ['nolvea', 'img'], ['marvesa', 'img'], ['nerelia', 'img2'], ['pintxonia', 'img2'],
  ['albaria', 'img'], ['azurela', 'img2'], ['marvesa', 'img2'], ['nolvea', 'img2']]
  .map(([s, k]) => ({ p: porSlug[s], f: porSlug[s][k] }));
const ZOOM = 5;
const NUBE = [[12, 18], [31, 9], [70, 13], [88, 27], [8, 54], [22, 82], [92, 60], [78, 86], [46, 91], [58, 7], [20, 38], [80, 42]];

const plano = $('#plano');
plano.innerHTML = TILES.map(({ p, f }) => `<a class="tile" href="${urlProyecto(p)}" data-cursor aria-label="${p.marca}, ${p[lang].tipo}" data-umami-event="portafolio-${p.slug}">
  <span class="flota"><span class="nb"><i></i><i></i><i></i></span><img src="${foto(f)}" alt="" loading="lazy" decoding="async"><b>${p.marca}</b></span></a>`).join('');
$('#bento').innerHTML = PROYECTOS.map(p => `<a class="b" href="${urlProyecto(p)}" data-cursor data-umami-event="portafolio-${p.slug}">
  <img src="${foto(p.img)}" alt="${p.marca}, ${p[lang].tipo}" loading="lazy" decoding="async"><img class="dos" src="${foto(p.img2)}" alt="" loading="lazy" decoding="async">
  <span class="t"><b>${p.marca}</b><span class="mono">${p[lang].sector} · ${p[lang].hace}</span></span></a>`).join('');

// ---------- Escena del chatbot por sector ----------
const chips = $('#chips');
chips.innerHTML = DEMOS.map((d, i) => `<button type="button" class="chip${i ? '' : ' on'}" data-i="${i}">${d[lang].chip}</button>`).join('');
let actual = 0, reproduccion = null, autoTimer = 0, automatico = true, activa = false;
function pintar(i) {
  const d = DEMOS[i], t = d[lang], p = porSlug[d.slug];
  actual = i;
  chips.querySelectorAll('.chip').forEach((c, k) => c.classList.toggle('on', k === i));
  $('#web').href = urlProyecto(p);
  $('#webImg').src = foto(d.img);
  $('#webMarca').textContent = p.marca;
  $('#webNav').innerHTML = t.nav.map(n => `<span>${n}</span>`).join('');
  $('#webH').innerHTML = t.h;
  $('#webP').textContent = t.p;
  $('#webCta').textContent = t.cta;
  $('#widgetNombre').textContent = `${T.asistente} ${p.marca}`;
  $('#burbujas').innerHTML = t.chat.map(([tipo, txt]) => `<div class="burbuja ${tipo}">${txt}</div>`).join('');
}
function conversar() {
  const { gsap } = window;
  clearTimeout(autoTimer);
  if (reproduccion) reproduccion.kill();
  const bs = document.querySelectorAll('#burbujas .burbuja');
  if (reducido || !gsap) { bs.forEach(b => { b.style.opacity = 1; b.style.transform = 'none'; }); return; }
  gsap.set(bs, { autoAlpha: 0, y: 8 });
  reproduccion = gsap.timeline({ onComplete: () => { if (automatico && activa) autoTimer = setTimeout(() => { pintar((actual + 1) % DEMOS.length); conversar(); }, 2800); } });
  bs.forEach((b, k) => reproduccion.to(b, { autoAlpha: 1, y: 0, duration: .35, ease: 'power3.out' }, .3 + k * .95));
}
chips.addEventListener('click', e => {
  const c = e.target.closest('.chip');
  if (!c) return;
  automatico = false;
  pintar(+c.dataset.i);
  conversar();
});
pintar(0);

// ---------- Cabecera, menú móvil y cursor «Ver la web» (js/portada/interfaz.js) ----------
cabecera();
menuMovil(lang);
cursorVer(T.verWeb);

// ---------- Código de tiempo del visor (panel de producción audiovisual), solo mientras se ve ----------
const tc = $('#servTc');
if (tc && !reducido && 'IntersectionObserver' in window) {
  let f = 0, visible = false;
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(tc);
  const d2 = n => String(n).padStart(2, '0');
  setInterval(() => { if (!visible) return; f++; const s = Math.floor(f / 25); tc.textContent = `00:${d2(Math.floor(s / 60) % 60)}:${d2(s % 60)}:${d2(f % 25)}`; }, 40);
}

// ---------- Fondo ----------
const fondo = (() => { try { return fondoGL($('#gl'), HACES); } catch (e) { console.warn('[AVAI] sin WebGL:', e); return null; } })();
if (fondo) fondo.extra = 1;

// ---------- Geometría de la nube y del muro (px del plano) ----------
function geo() {
  const vw = innerWidth, vh = innerHeight, PW = vw * 1.6, PH = vh * 1.6;
  const W = Math.max(PW * 0.23, vw < 900 ? vw * 0.55 : 0), H = W * 0.625, gap = PW * 0.018;
  const x0 = (PW - (4 * W + 3 * gap)) / 2, y0 = (PH - (3 * H + 2 * gap)) / 2;
  const muro = TILES.map((_, i) => ({ x: x0 + (i % 4) * (W + gap), y: y0 + Math.floor(i / 4) * (H + gap) }));
  const escalaNube = Math.min(1, (vw < 900 ? vw * 0.26 : vw * 0.085) / W);
  const nube = NUBE.map(([cx, cy]) => ({ x: vw * 0.3 + cx / 100 * vw - W / 2, y: vh * 0.3 + cy / 100 * vh - H / 2 }));
  const z = muro[ZOOM];
  return { vw, vh, W, H, muro, nube, escalaNube, zc: { x: z.x + W / 2, y: z.y + H / 2 } };
}

addEventListener('DOMContentLoaded', () => {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) { document.documentElement.classList.add('sin-anim'); return; }
  iniciarSuave();
  const tiles = gsap.utils.toArray('.tile');
  let G = geo();
  const medir = () => { G = geo(); tiles.forEach(t => { t.style.width = G.W + 'px'; t.style.height = G.H + 'px'; }); gsap.set(plano, { transformOrigin: `${G.zc.x}px ${G.zc.y}px` }); };
  medir();
  let anchoPrevio = innerWidth;
  addEventListener('resize', () => { if (Math.abs(innerWidth - anchoPrevio) < 2) return; anchoPrevio = innerWidth; medir(); ScrollTrigger.refresh(); });

  // Precarga (una vez por sesión)
  const pre = $('#pre');
  let visto = false;
  try { visto = !!sessionStorage.getItem('avai-pre'); } catch (_) { /* sin almacenamiento */ }
  if (reducido || visto) pre.remove();
  else {
    const o = { n: 0 };
    gsap.to(o, { n: 100, duration: 1.4, ease: 'power2.inOut', onUpdate: () => {
      $('#preN').textContent = String(Math.round(o.n)).padStart(3, '0');
      $('#preBar').style.width = o.n + '%';
    }, onComplete: () => { try { sessionStorage.setItem('avai-pre', '1'); } catch (_) { /* nada */ } gsap.to(pre, { autoAlpha: 0, duration: .6, onComplete: () => pre.remove() }); } });
  }
  const retraso = reducido || visto ? .2 : 1.5;

  // La escena del chatbot se activa al llegar a ella (también sin animaciones)
  ScrollTrigger.create({ trigger: '.viaje', start: () => `top+=${innerHeight * 6 * .77} top`, end: 'bottom bottom',
    onToggle: s => { activa = s.isActive; if (activa) conversar(); else { clearTimeout(autoTimer); } } });

  if (reducido) {
    tiles.forEach((t, i) => gsap.set(t, { x: G.muro[i].x, y: G.muro[i].y }));
    gsap.set(plano, { rotateX: 24, rotateZ: -10 });
    gsap.set(['#txtA', '#txtC', '#web'], { autoAlpha: 0 });
    return;
  }

  // Servicios: en escritorio la pista se desliza de lado mientras se baja (se crea antes que los demás
  // disparadores de más abajo para que cuenten con el espacio que añade al fijarse). En móvil, paneles apilados.
  const serv = $('.serv'), pista = $('#pista'), servPin = $('.serv-pin'), servN = $('#servN'), servBarra = $('#servBarra');
  const paneles = gsap.utils.toArray('.sv');
  gsap.matchMedia().add({ ancho: '(min-width: 961px)', estrecho: '(max-width: 960px)' }, ctx => {
    if (ctx.conditions.estrecho) {
      paneles.forEach(p => gsap.from(p, { y: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 88%' } }));
      return;
    }
    serv.classList.add('h');
    const distancia = () => { const g = parseFloat(getComputedStyle(servPin).paddingLeft) || 0; return Math.max(0, pista.scrollWidth - (servPin.clientWidth - 2 * g)); };
    const paso = gsap.to(pista, { x: () => -distancia(), ease: 'none', scrollTrigger: { trigger: serv, pin: true, start: 'top top', end: () => '+=' + distancia(), scrub: 1, invalidateOnRefresh: true,
      onUpdate: st => { servN.textContent = String(Math.round(st.progress * (paneles.length - 1)) + 1).padStart(2, '0'); servBarra.style.transform = `scaleX(${st.progress})`; } } });
    paneles.forEach(p => gsap.fromTo(p.querySelector('.sv-vis'), { xPercent: 12 }, { xPercent: -12, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: paso, start: 'left right', end: 'right left', scrub: true } }));
    return () => serv.classList.remove('h');
  });

  window.SplitText && SplitText.create('#h1', { type: 'lines', mask: 'lines', onSplit: s => gsap.from(s.lines, { yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: .12, delay: retraso }) });
  gsap.from('.hero .kick, .hero-nav, .hero-pie', { autoAlpha: 0, y: 14, duration: 1, stagger: .12, delay: retraso + .4 });

  // Intensidad de los haces según la parte de la página
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { if (fondo) fondo.scroll = s.progress; } });
  const luz = (trigger, start, end, v) => fondo && gsap.to(fondo, { extra: v, ease: 'none', immediateRender: false, scrollTrigger: { trigger, start, end, scrub: true } });
  luz('.viaje', 'top bottom', 'top top', .45);
  luz('.viaje', '30% top', '45% top', 0);
  luz('.auto', 'top bottom', 'top 30%', 1);
  luz('.serv', 'top 60%', 'bottom top', .35);
  luz('.claro', 'top bottom', 'top top', 0);

  // Viaje: nube → muro → web con chatbot
  tiles.forEach((t, i) => gsap.set(t, { x: G.nube[i].x, y: G.nube[i].y, scale: G.escalaNube, autoAlpha: 0, z: -600 }));
  gsap.set(['#txtA', '#txtB', '#txtC', '#web', '#widget'], { autoAlpha: 0 });
  tiles.forEach((t, i) => gsap.to(t.querySelector('.flota'), { y: (i % 2 ? -1 : 1) * 14, duration: 3 + (i % 3), repeat: -1, yoyo: true, ease: 'sine.inOut' }));
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: '.viaje', start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true } });
  tl.to(tiles, { autoAlpha: 1, z: 0, duration: 1, stagger: .06, ease: 'power3.out' }, 0)
    .to('#txtA', { autoAlpha: 1, duration: .6 }, .3)
    .to('#txtA', { autoAlpha: 0, y: -30, duration: .5 }, 2.1)
    .to(tiles, { x: i => G.muro[i].x, y: i => G.muro[i].y, scale: 1, duration: 1.6, stagger: .03 }, 2.2)
    .to(plano, { rotateX: 24, rotateZ: -10, y: () => -G.vh * 0.04, duration: 1.6 }, 2.2)
    .to('#velo', { opacity: 1, duration: .8 }, 3)
    .to('#txtB', { autoAlpha: 1, duration: .6 }, 3.3)
    .to(plano, { y: () => -G.vh * 0.14, duration: 1.4, ease: 'none' }, 3.9)
    .to('#txtB', { autoAlpha: 0, duration: .4 }, 5.3)
    .to('#velo', { opacity: 0, duration: .4 }, 5.3)
    .to(plano, { rotateX: 0, rotateZ: 0, scale: () => G.vw / G.W * 1.05, x: () => G.vw * 0.8 - G.zc.x, y: () => G.vh * 0.8 - G.zc.y, duration: 1.4, ease: 'power3.inOut' }, 5.4)
    .to(tiles.filter((_, i) => i !== ZOOM), { autoAlpha: 0, duration: .8 }, 5.8)
    .to('#web', { autoAlpha: 1, duration: .5 }, 6.6)
    .to(plano, { autoAlpha: 0, duration: .4 }, 6.9)
    .fromTo('#web', { scale: 1.6, xPercent: -14 }, { scale: 1, xPercent: 0, duration: 1, ease: 'power3.inOut' }, 6.9)
    .to('#txtC', { autoAlpha: 1, duration: .5 }, 7.6)
    .fromTo('#widget', { scale: .2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .4, ease: 'back.out(1.6)' }, 7.9)
    .to({}, { duration: 2 });

  // Resto de la página
  gsap.from('#cadena > *', { autoAlpha: 0, y: 30, stagger: .1, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: '#cadena', start: 'top 85%' } });
  revelarLineas('.auto h2, .cab h2, .cierre h2, .nos h2');
  gsap.from('.claro', { borderRadius: '120px 120px 0 0', ease: 'none', scrollTrigger: { trigger: '.claro', start: 'top bottom', end: 'top 40%', scrub: true } });
  gsap.utils.toArray('.b').forEach((b, i) => gsap.from(b, { clipPath: 'inset(100% 0 0 0 round 16px)', duration: 1.3, ease: 'expo.out', delay: (i % 3) * .08, scrollTrigger: { trigger: b, start: 'top 90%' } }));
  gsap.from('.linea-t li, .hechos div', { y: 30, autoAlpha: 0, stagger: .08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.nos', start: 'top 80%' } });
  gsap.from('#gigante', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.cierre', start: 'top bottom', end: 'top 30%', scrub: true } });
  addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
});
