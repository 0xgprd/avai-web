// Narrativa de scroll.
//
// Convierte la posición de scroll en un «tiempo de historia» continuo (0 → 7) y lo aplica a una timeline
// maestra de GSAP que interpola el estado de la escena entre los fotogramas clave de js/scroll/keyframes.js.
// El estado es una función pura del scroll: se puede recorrer hacia delante y hacia atrás, y recargar a
// mitad de página, sin saltos. La inercia la da un quickTo sobre el tiempo, no sobre el scroll: el scroll
// nativo nunca se bloquea ni se secuestra.

export const CHAPTERS = ['inicio', 'area-ia', 'area-mkt', 'area-digital', 'proceso', 'casos', 'nosotros', 'contacto'];

export function createStory({ gsap, ScrollTrigger, keyframes, reduced }) {
  const els = CHAPTERS.map(id => document.getElementById(id));
  // proc (avance del proceso), caseIdx y casePulse los escriben js/ui/process.js y js/ui/cases.js.
  const state = Object.assign({ proc: 0, caseIdx: 0, casePulse: 0 }, keyframes[0]);
  const proxy = { t: 0 };
  const listeners = new Set();
  let master = null;
  let windows = [];
  let isReduced = reduced;
  let lastChapter = -1;

  function build(kf) {
    if (master) master.kill();
    // Cada tramo i → i+1 es un fromTo explícito: el resultado no depende del orden en que GSAP inicialice
    // los tweens (importante al recargar a mitad de página o al saltar con un enlace del menú).
    master = gsap.timeline({ paused: true, defaults: { duration: 1, ease: 'power2.inOut' } });
    for (let i = 0; i < kf.length - 1; i++) {
      master.fromTo(state, { ...kf[i] }, { ...kf[i + 1], immediateRender: false }, i);
    }
    Object.assign(state, kf[0]);
    master.time(0).time(proxy.t);
  }

  // Ventanas de transición: el capítulo i pasa al i+1 mientras la sección i+1 entra en pantalla
  // (de que su borde superior asoma por abajo a que llega casi arriba). Entre ventanas, el estado se mantiene.
  function measure() {
    const vh = window.innerHeight;
    const max = ScrollTrigger.maxScroll(window);
    windows = [];
    let prevEnd = 0;
    for (let i = 1; i < els.length; i++) {
      const top = els[i].getBoundingClientRect().top + window.scrollY;
      let s = Math.max(prevEnd, Math.min(top - vh * 0.92, max));
      let e = Math.max(s + 1, Math.min(top - vh * 0.12, max));
      windows.push({ s, e });
      prevEnd = e;
    }
  }

  function timeAt(y) {
    let t = 0;
    for (let i = 0; i < windows.length; i++) {
      const w = windows[i];
      if (y <= w.s) break;
      t = i + Math.min(1, (y - w.s) / (w.e - w.s));
      if (y < w.e) break;
    }
    return t;
  }

  function render() {
    master.time(proxy.t);
    const ch = Math.round(proxy.t);
    if (ch !== lastChapter) lastChapter = ch;
    listeners.forEach(fn => fn(state, proxy.t));
  }

  const quick = gsap.quickTo(proxy, 't', { duration: 1.05, ease: 'power3.out', onUpdate: render });

  function goTo(t, immediate) {
    // Con «reducir movimiento» la escena salta de un estado estable al siguiente, sin transiciones animadas.
    if (isReduced) t = Math.round(t);
    if (immediate || isReduced) {
      quick(t, t);
      proxy.t = t;
      render();
    } else {
      quick(t);
    }
  }

  build(keyframes);
  measure();

  const trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: self => goTo(timeAt(self.scroll())),
    onRefresh: self => { measure(); goTo(timeAt(self.scroll()), true); },
  });
  goTo(timeAt(window.scrollY), true);

  return {
    state,
    get time() { return proxy.t; },
    get target() { return timeAt(window.scrollY); },
    get windows() { return windows.map(w => [Math.round(w.s), Math.round(w.e)]); },
    get chapter() { return lastChapter; },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    setKeyframes(kf) { build(kf); render(); },
    setReduced(r) { isReduced = r; goTo(timeAt(window.scrollY), true); },
    destroy() { trigger.kill(); master.kill(); quick.tween && quick.tween.kill(); listeners.clear(); },
  };
}
