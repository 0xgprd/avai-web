// Entradas de texto. Cada tipo de bloque tiene su propio movimiento para no repetir el mismo efecto:
//   hero        líneas que suben tras una máscara, lento y con retardo escalonado
//   lines       titulares de sección: líneas con máscara, al entrar en pantalla
//   fade        párrafos y botones: aparición con un pequeño desplazamiento
//   list        listas de servicios: elementos que entran desde la izquierda, escalonados
//   principles  principios de «Nosotros»: enfoque desde desenfocado, más pausado
// Los textos son HTML real en todo momento: SplitText solo los envuelve en líneas para animarlos.

export function initReveals({ gsap, SplitText, reduced }) {
  const html = document.documentElement;
  if (reduced) { html.classList.remove('anim'); return; }

  const once = (el, start = 'top 86%') => ({ trigger: el, start, once: true });

  function splitLines(el, animate) {
    if (!SplitText) { gsap.set(el, { autoAlpha: 1 }); return; }
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'ln',
      autoSplit: true,
      onSplit(self) {
        // Margen para que la máscara no recorte los descendentes (g, p, j).
        self.masks.forEach(m => { m.style.paddingBottom = '.14em'; m.style.marginBottom = '-.14em'; });
        gsap.set(el, { autoAlpha: 1 });
        return animate(self.lines);
      },
    });
  }

  // Núcleo (primera pantalla): se anima al cargar, sin esperar a la escena 3D.
  const hero = document.querySelector('[data-reveal="hero"]');
  if (hero) {
    splitLines(hero, lines => gsap.from(lines, { yPercent: 112, duration: 1.3, ease: 'expo.out', stagger: 0.1, delay: 0.2 }));
  }
  const heroBits = gsap.utils.toArray('.hero [data-reveal="fade"]');
  gsap.fromTo(heroBits, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.55 });

  gsap.utils.toArray('[data-reveal="lines"]').forEach(el => {
    splitLines(el, lines => gsap.from(lines, { yPercent: 112, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: once(el) }));
  });

  gsap.utils.toArray('[data-reveal="fade"]').forEach(el => {
    if (el.closest('.hero')) return;
    gsap.fromTo(el, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.95, ease: 'power3.out', scrollTrigger: once(el, 'top 90%') });
  });

  gsap.utils.toArray('[data-reveal="list"]').forEach(list => {
    gsap.set(list, { autoAlpha: 1 });
    gsap.from(list.children, { autoAlpha: 0, x: -22, duration: 0.8, ease: 'power3.out', stagger: 0.09, scrollTrigger: once(list, 'top 84%') });
  });

  gsap.utils.toArray('[data-reveal="principles"]').forEach(list => {
    gsap.set(list, { autoAlpha: 1 });
    gsap.from(list.children, { autoAlpha: 0, y: 14, filter: 'blur(8px)', duration: 1.1, ease: 'power2.out', stagger: 0.14, clearProps: 'filter', scrollTrigger: once(list, 'top 84%') });
  });
}
