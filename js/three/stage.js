// Escena 3D: renderizador, bucle de animación y ciclo de vida.
//
// Rendimiento:
//   - resolución limitada según el dispositivo (quality.maxDpr) y bajada automática si va lento
//   - un solo material de partículas y uno de líneas; ~12 llamadas de dibujo en total, sin postprocesado
//   - el bucle se detiene con la pestaña oculta y con «reducir movimiento» (entonces se dibuja solo al cambiar)
//   - destroy() libera geometrías, materiales, texturas, el contexto WebGL y todos los listeners

import { WebGLRenderer, Scene, Color } from '../../assets/vendor/three-0.186.1.avai.min.js';
import { createWorld } from './world.js';
import { createCameraRig } from './camera.js';
import { PALETTE, mq } from '../config.js';

const INTRO_SECONDS = 2.4;
// Para revisar la escena con calidad constante (capturas, renderizado por software): ?calidad=fija
const FIXED_QUALITY = /[?&]calidad=fija\b/.test(window.location.search);

export function createStage({ canvas, container, story, quality, reduced, mobile, onReady }) {
  const renderer = new WebGLRenderer({ canvas, antialias: quality.antialias, alpha: false, stencil: false, powerPreference: 'high-performance' });
  renderer.setClearColor(new Color(PALETTE.bg), 1);
  const scene = new Scene();
  const world = createWorld(quality);
  scene.add(world.root);
  const rig = createCameraRig({ mobile });

  let pr = Math.min(window.devicePixelRatio || 1, quality.maxDpr);
  let isReduced = reduced;
  let isMobile = mobile;
  let running = false;
  let raf = 0;
  let ready = false;
  let last = performance.now();
  let time = 0;
  let frames = 0, acc = 0, level = 0;
  let lastW = 0, lastH = 0, resizeTimer = 0;

  function size() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    rig.camera.aspect = w / h;
    rig.camera.updateProjectionMatrix();
    lastW = w; lastH = h;
  }

  // Los cambios de alto de la barra del navegador móvil no deben reconstruir el lienzo a cada paso.
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (w === lastW && Math.abs(h - lastH) < 120) return;
      size();
      if (isReduced) draw();
    }, 150);
  }

  function draw() {
    const t = isReduced ? 14 : time;
    const intro = isReduced ? 1 : Math.min(1, time / INTRO_SECONDS);
    world.update(story.state, t, pr, 1 - Math.pow(1 - intro, 3));
    rig.update(story.state, t, isReduced);
    renderer.render(scene, rig.camera);
    if (!ready) { ready = true; if (onReady) onReady(); }
  }

  // Calidad adaptativa: si la media de fotogramas pasa de ~38 fps hacia abajo, primero se baja la
  // resolución y después el número de partículas. Nunca vuelve a subir en la misma visita.
  function adapt(dt) {
    if (FIXED_QUALITY) return;
    frames++; acc += dt;
    if (frames < 120) return;
    const avg = acc / frames;
    frames = 0; acc = 0;
    if (avg <= 0.026 || level >= 2) return;
    level++;
    if (level === 1) { pr = Math.max(1, pr * 0.7); size(); }
    else world.setDetail(0.55);
    if (window.console) console.info(`[AVAI 3D] calidad reducida (nivel ${level}, ${Math.round(1 / avg)} fps)`);
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    time += dt;
    draw();
    adapt(dt);
  }
  function start() {
    if (running || isReduced || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  const onVisibility = () => { if (document.hidden) stop(); else if (isReduced) draw(); else start(); };
  const onLost = e => { e.preventDefault(); stop(); container.classList.remove('is-live'); };
  const onRestored = () => { ready = false; size(); if (isReduced) draw(); else start(); };
  const unsubscribe = story.onChange(() => { if (isReduced) draw(); });
  const pointerAllowed = () => !isReduced && !isMobile && mq.finePointer.matches;

  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);

  rig.setPointer(pointerAllowed());
  size();
  if (isReduced) draw(); else start();

  return {
    setLayout(m) { isMobile = m; rig.setMobile(m); rig.setPointer(pointerAllowed()); size(); if (isReduced) draw(); },
    setReduced(r) { isReduced = r; rig.setPointer(pointerAllowed()); if (r) { stop(); draw(); } else start(); },
    debug() {
      return {
        tier: quality.tier, particles: world.count, pixelRatio: +pr.toFixed(2), level, running, reduced: isReduced,
        stage: +story.state.stage.toFixed(3), proc: +story.state.proc.toFixed(3),
        cam: rig.camera.position.toArray().map(v => +v.toFixed(2)),
      };
    },
    destroy() {
      stop();
      clearTimeout(resizeTimer);
      unsubscribe();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      rig.dispose();
      world.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      container.classList.remove('is-live');
    },
  };
}
