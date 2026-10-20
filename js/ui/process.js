// «Cómo trabajamos». En escritorio la sección es alta y su contenido queda fijo (CSS sticky): el avance
// del scroll dentro de ella (0..1) mueve el punto luminoso por la trayectoria 3D y activa cada fase.
// En móvil y con «reducir movimiento» la sección es una lista normal y el avance se mide igualmente.

export function initProcess({ gsap, ScrollTrigger, story, pinned }) {
  const section = document.getElementById('proceso');
  const steps = [...section.querySelectorAll('.step')];
  const counter = document.getElementById('procNow');
  const meter = document.getElementById('procMeter');
  const setProc = gsap.quickTo(story.state, 'proc', { duration: 0.7, ease: 'power3.out' });
  let current = -1;

  function update(p) {
    setProc(p);
    meter.style.transform = `scaleY(${p.toFixed(4)})`;
    const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
    if (idx === current) return;
    current = idx;
    steps.forEach((s, i) => {
      s.classList.toggle('is-active', i === idx);
      s.classList.toggle('is-done', i < idx);
    });
    counter.textContent = String(idx + 1).padStart(2, '0');
  }

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: () => (pinned() ? 'top top' : 'top 70%'),
    end: () => (pinned() ? 'bottom bottom' : 'bottom 60%'),
    invalidateOnRefresh: true,
    onUpdate: self => update(self.progress),
    onRefresh: self => update(self.progress),
  });
  update(trigger.progress || 0);
  return { destroy: () => trigger.kill() };
}
