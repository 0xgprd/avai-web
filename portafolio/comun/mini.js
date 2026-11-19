// Mini-webs del portafolio de AVAI Labs (19-nov-2026): scroll suave, entradas, parallax, cabecera,
// formulario honesto (no envía nada) y asistente con una conversación de ejemplo.
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');

// Formularios: avisan de que la web es del portafolio y no se ha enviado nada
document.querySelectorAll('.form-demo').forEach(f => f.addEventListener('submit', e => {
  e.preventDefault();
  const aviso = f.querySelector('.aviso');
  aviso.hidden = false;
  f.querySelector('.btn').disabled = true;
}));

// Asistente: se abre y reproduce la conversación de ejemplo
const b = document.getElementById('asistB'), panel = document.getElementById('asist');
let vista = false;
function abrir(v) {
  panel.hidden = !v;
  b.setAttribute('aria-expanded', v);
  if (v && !vista && window.gsap && !reducido) {
    vista = true;
    const bs = panel.querySelectorAll('.burb');
    gsap.set(bs, { autoAlpha: 0, y: 8 });
    bs.forEach((x, i) => gsap.to(x, { autoAlpha: 1, y: 0, duration: .35, delay: .3 + i * .9, ease: 'power3.out' }));
  }
}
b.addEventListener('click', () => abrir(panel.hidden));
document.getElementById('asistX').addEventListener('click', () => abrir(false));
// A los pocos segundos, un aviso discreto junto al botón (la conversación solo se abre al pulsar)
const aviso = document.getElementById('asistAviso');
setTimeout(() => { if (panel.hidden) aviso.classList.add('on'); }, 3500);
aviso.addEventListener('click', () => { aviso.classList.remove('on'); abrir(true); });
b.addEventListener('click', () => aviso.classList.remove('on'));

addEventListener('DOMContentLoaded', () => {
  const { gsap, ScrollTrigger, SplitText } = window;
  const cab = document.querySelector('.m-cab');
  const solido = () => cab.classList.toggle('solido', scrollY > 60);
  addEventListener('scroll', solido, { passive: true }); solido();
  if (!gsap || !ScrollTrigger || reducido) { document.documentElement.classList.remove('js'); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);
  if (window.Lenis) {
    const lenis = new Lenis({ lerp: .09 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const id = a.getAttribute('href'); if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id); } }));
  }
  const vis = el => gsap.set(el, { visibility: 'visible' });
  document.querySelectorAll('[data-r="lineas"]').forEach(el => {
    vis(el);
    if (!SplitText) return;
    SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: s => gsap.from(s.lines, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: .09, scrollTrigger: { trigger: el, start: 'top 88%', once: true } }) });
  });
  document.querySelectorAll('[data-r="letras"]').forEach(el => {
    vis(el);
    if (!SplitText) return;
    SplitText.create(el, { type: 'chars', onSplit: s => gsap.from(s.chars, { yPercent: 120, rotate: () => gsap.utils.random(-14, 14), duration: 1.2, ease: 'back.out(1.4)', stagger: .04, delay: .2 }) });
  });
  document.querySelectorAll('[data-r="sube"]').forEach(el => gsap.fromTo(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
  document.querySelectorAll('[data-r="mascara"]').forEach(el => gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)', visibility: 'visible' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 85%', once: true } }));
  document.querySelectorAll('[data-par]').forEach(img => gsap.fromTo(img, { yPercent: -(+img.dataset.par) / 2 }, { yPercent: +img.dataset.par / 2, ease: 'none', scrollTrigger: { trigger: img.closest('section') || img, start: 'top bottom', end: 'bottom top', scrub: true } }));
  addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
});
