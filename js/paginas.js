// Páginas de servicio y blog con el diseño «Fusión» (19-nov-2026): los mismos haces de luz, cabecera, menú y
// cursor que la portada, scroll suave y revelados al entrar en pantalla. Con «reducir movimiento» todo queda
// visible y quieto; sin JavaScript la página se lee entera (nada empieza oculto en el CSS).

import { fondoGL, HACES } from './portada/fondo-gl.js';
import { iniciarSuave, revelarLineas, reducido } from './portada/suave.js';
import { cabecera, menuMovil, cursorVer } from './portada/interfaz.js';

const lang = document.documentElement.lang === 'fr' ? 'fr' : 'es';
cabecera();
menuMovil(lang);
cursorVer(lang === 'fr' ? 'Voir le site' : 'Ver la web');

const fondo = (() => { try { return fondoGL(document.getElementById('gl'), HACES); } catch (e) { console.warn('[AVAI] sin WebGL:', e); return null; } })();
if (fondo) fondo.extra = 1;

addEventListener('DOMContentLoaded', () => {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  iniciarSuave();
  if (reducido) return;

  // Entrada del hero
  window.SplitText && SplitText.create('#h1', { type: 'lines', mask: 'lines', onSplit: s => gsap.from(s.lines, { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: .1, delay: .15 }) });
  gsap.from('.pg-hero .migas, .pg-hero .kick, .pg-sub, .pg-hero .ctas, .pg-hero .hero-pie, .pg-resumen', { autoAlpha: 0, y: 16, duration: 1, stagger: .08, delay: .45 });

  // Intensidad de los haces: plenos en el hero, tenues en la lectura, vuelven en los casos, apagados en lo claro
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { if (fondo) fondo.scroll = s.progress; } });
  const luz = (trigger, start, end, v) => fondo && document.querySelector(trigger) && gsap.to(fondo, { extra: v, ease: 'none', immediateRender: false, scrollTrigger: { trigger, start, end, scrub: true } });
  luz('.pg-hero', 'top top', 'bottom top', .2);
  luz('.pg-casos', 'top bottom', 'top 40%', .9);
  luz('.claro', 'top bottom', 'top top', 0);

  // Portafolio: en escritorio la fila se desliza de lado mientras se pasa por ella
  const fila = document.querySelector('.pg-port-g');
  if (fila) gsap.matchMedia().add('(min-width: 961px)', () => {
    fila.classList.add('desliza');
    gsap.fromTo(fila, { x: 0 }, { x: () => -Math.max(0, fila.scrollWidth - fila.clientWidth), ease: 'none',
      scrollTrigger: { trigger: '.pg-port', start: 'top 85%', end: 'bottom 15%', scrub: 1, invalidateOnRefresh: true } });
    return () => fila.classList.remove('desliza');
  });

  // Revelados
  revelarLineas('.pg-cab h2, .cab h2, .cab-c h2, .pg-faq h2, .pg-final h2');
  const piezas = gsap.utils.toArray('.pg-items li, .caso, .linea-t li, .pg-faq-l details, .pg-art, .pg-rel a');
  if (piezas.length) gsap.set(piezas, { autoAlpha: 0, y: 40 });
  if (piezas.length) ScrollTrigger.batch(piezas,{ start: 'top 94%', once: true, onEnter: b => gsap.to(b, { autoAlpha: 1, y: 0, stagger: .08, duration: 1, ease: 'expo.out', overwrite: true }) });
  if (document.querySelector('.claro')) gsap.from('.claro', { borderRadius: '120px 120px 0 0', ease: 'none', scrollTrigger: { trigger: '.claro', start: 'top bottom', end: 'top 40%', scrub: true } });
  gsap.from('#gigante', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.pg-final', start: 'top bottom', end: 'top 30%', scrub: true } });
  addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
});
