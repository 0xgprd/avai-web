// Contacto: «Solicitar una consulta gratuita» lleva al formulario y pone el cursor en el primer campo.
// Sin JS el enlace #leadForm hace lo mismo salvo el foco.

export function initContact({ reduced }) {
  const cta = document.getElementById('ctaForm');
  const form = document.getElementById('leadForm');
  if (!cta || !form) return;
  cta.addEventListener('click', e => {
    e.preventDefault();
    form.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
    const first = form.querySelector('input:not([type=hidden])');
    setTimeout(() => first && first.focus({ preventScroll: true }), reduced() ? 0 : 650);
  });
}
