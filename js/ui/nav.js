// Navegación: cabecera al hacer scroll, menú móvil accesible, sección activa en el menú y en el raíl
// de capítulos, y barra de progreso. No depende de GSAP: funciona aunque falle la carga de librerías.

const SECTIONS = ['inicio', 'servicios', 'proceso', 'casos', 'nosotros', 'contacto'];

export function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('navLinks');
  const bar = document.getElementById('progressBar');
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const railLinks = [...document.querySelectorAll('[data-rail]')];
  const desktop = window.matchMedia('(min-width: 961px)');
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      nav.classList.toggle('scrolled', window.scrollY > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    });
  }

  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('menu-open', open);
    if (open) menu.querySelector('a').focus({ preventScroll: true });
  }

  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); }
  });
  desktop.addEventListener('change', e => { if (e.matches) setMenu(false); });

  // Sección activa: la que cruza la franja central de la pantalla.
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      const mark = (a, on) => (on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
      navLinks.forEach(a => mark(a, a.dataset.nav === id));
      railLinks.forEach(a => mark(a, a.dataset.rail === id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  SECTIONS.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
}
