// Desplazamiento suave (Lenis) sincronizado con GSAP ScrollTrigger. Con «reducir movimiento» no se activa:
// el scroll es el nativo y las animaciones de cada propuesta se saltan.
export const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function iniciarSuave() {
  const { gsap, ScrollTrigger, SplitText } = window;
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);
  if (reducido || !window.Lenis) return null;
  const lenis = new window.Lenis({ lerp: 0.085 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  // Los enlaces con onclick propio (abrir el chat) no desplazan: su href solo es la alternativa sin JavaScript.
  document.querySelectorAll('a[href^="#"]:not([onclick])').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id); }
  }));
  return lenis;
}

// Texto que se revela por líneas al entrar en pantalla.
export function revelarLineas(sel, opciones = {}) {
  const { gsap, SplitText } = window;
  if (reducido || !SplitText) return;
  document.querySelectorAll(sel).forEach(el => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: s => gsap.from(s.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 85%', once: true }, ...opciones }),
    });
  });
}
