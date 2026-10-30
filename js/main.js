// Punto de entrada de la web.
//
// Orden de prioridades:
//   1. Navegación y contacto: funcionan siempre, sin librerías.
//   2. Historia de scroll y entradas de texto: necesitan GSAP + ScrollTrigger (cargados con defer).
//   3. Escena 3D: se descarga en diferido cuando el navegador está libre, solo si hay WebGL 2.
//      Mientras tanto (o si no hay WebGL) se ve la composición estática de .stage-fallback.

import { mq, detectQuality } from './config.js';
import { initNav } from './ui/nav.js';
import { initContact } from './ui/contact.js';
import { initReveals } from './ui/reveal.js';
import { initProcess } from './ui/process.js';
import { initCases } from './ui/cases.js';
import { createStory } from './scroll/story.js';
import { getKeyframes } from './scroll/keyframes.js';
import { hasWebGL2 } from './three/support.js';

const html = document.documentElement;
const stageEl = document.getElementById('stage');
const canvas = document.getElementById('scene');
const debug = { story: null, stage: null, quality: null, error: null };

// Capítulos de la página: las páginas de servicio y del blog marcan cada sección con data-escena="N"
// (fotograma de js/scroll/keyframes.js). Sin marcas, es la portada con su historia de 8 capítulos.
const marcadas = [...document.querySelectorAll('[data-escena][id]')];
const chapters = marcadas.length ? marcadas.map(el => el.id) : undefined;
const escenas = marcadas.length ? marcadas.map(el => Number(el.dataset.escena)) : undefined;
window.__avai = debug; // estado de la escena para depuración y pruebas (solo lectura)
window.__avaiReady = true;

initNav();
initContact({ reduced: () => mq.reduced.matches });

const { gsap, ScrollTrigger, SplitText } = window;
if (!gsap || !ScrollTrigger) {
  // Sin GSAP la web sigue completa y estática.
  html.classList.remove('anim');
} else {
  start();
}

function start() {
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);
  html.classList.add('gsap-ok');

  let reduced = mq.reduced.matches;
  // El proceso solo se «fija» en escritorio y con movimiento normal (ver .process en css/main.css).
  const pinned = () => !mq.mobile.matches && !mq.reduced.matches;
  const story = createStory({ gsap, ScrollTrigger, keyframes: getKeyframes(mq.mobile.matches, escenas), reduced, chapters });
  debug.story = story;

  initReveals({ gsap, SplitText, reduced });
  if (document.getElementById('proceso')) initProcess({ gsap, ScrollTrigger, story, pinned });
  if (document.getElementById('caseList')) initCases({ ScrollTrigger, story });

  let stage = null;

  mq.mobile.addEventListener('change', e => {
    story.setKeyframes(getKeyframes(e.matches, escenas));
    if (stage) stage.setLayout(e.matches);
    ScrollTrigger.refresh();
  });
  mq.reduced.addEventListener('change', e => {
    reduced = e.matches;
    html.classList.toggle('rm', reduced);
    html.classList.remove('anim');
    story.setReduced(reduced);
    if (stage) stage.setReduced(reduced);
    ScrollTrigger.refresh();
  });

  // Las fuentes cambian la altura de los textos: recalcular las posiciones de las secciones al cargarlas.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

  if (!hasWebGL2()) { html.classList.add('no-webgl'); return; }

  const boot3D = async () => {
    try {
      const quality = detectQuality();
      debug.quality = quality;
      const { createStage } = await import('./three/stage.js');
      stage = createStage({
        canvas, container: stageEl, story, quality, reduced, mobile: mq.mobile.matches,
        onReady: () => stageEl.classList.add('is-live'),
      });
      debug.stage = stage;
    } catch (err) {
      debug.error = String(err && err.message || err);
      if (window.console) console.warn('[AVAI 3D] escena no disponible, se muestra la versión estática:', err);
      html.classList.add('no-webgl');
    }
  };
  if ('requestIdleCallback' in window) requestIdleCallback(boot3D, { timeout: 1200 });
  else setTimeout(boot3D, 250);
}
