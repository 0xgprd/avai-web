// Interfaz común de la web «Fusión» (portada, páginas de servicio y blog), 19-nov-2026:
// cabecera que se oscurece al bajar, menú móvil y cursor «Ver la web» sobre los enlaces con data-cursor.

const $ = s => document.querySelector(s);

// Fondo oscuro al bajar, para que la cabecera se lea también sobre las zonas claras.
export function cabecera() {
  const cab = $('.cab-web');
  if (!cab) return;
  const poner = () => cab.classList.toggle('solido', scrollY > 60);
  addEventListener('scroll', poner, { passive: true });
  poner();
}

export function menuMovil(lang) {
  const burger = $('#burger');
  if (!burger) return;
  const abrir = v => {
    document.body.classList.toggle('menu-abierto', v);
    burger.setAttribute('aria-expanded', v);
    burger.setAttribute('aria-label', v ? (lang === 'fr' ? 'Fermer le menu' : 'Cerrar menú') : (lang === 'fr' ? 'Ouvrir le menu' : 'Abrir menú'));
  };
  burger.addEventListener('click', () => abrir(!document.body.classList.contains('menu-abierto')));
  document.querySelectorAll('#menuMovil a').forEach(a => a.addEventListener('click', () => abrir(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') abrir(false); });
}

// Solo con ratón: en táctil no hay cursor que transformar.
export function cursorVer(texto) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || !document.querySelector('[data-cursor]')) return;
  const cur = document.createElement('div');
  cur.className = 'cursor';
  cur.setAttribute('aria-hidden', 'true');
  cur.innerHTML = `<span>${texto}</span>`;
  document.body.append(cur);
  let x = 0, y = 0, cx = 0, cy = 0;
  addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; }, { passive: true });
  (function seguir() { cx += (x - cx) * .2; cy += (y - cy) * .2; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(seguir); })();
  document.addEventListener('pointerover', e => { if (e.target.closest('[data-cursor]')) cur.classList.add('on'); });
  document.addEventListener('pointerout', e => { const a = e.target.closest('[data-cursor]'); if (a && !a.contains(e.relatedTarget)) cur.classList.remove('on'); });
}
