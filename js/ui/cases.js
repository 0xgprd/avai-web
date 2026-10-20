// Casos de uso. Cada caso declara en el HTML sus entradas, su sistema central y sus resultados
// (data-in, data-hub, data-out). El caso que cruza el centro de la pantalla se activa: el diagrama
// de flujo cambia sus etiquetas y la escena 3D lanza un pulso desde el centro de la red.
// En móvil, donde no hay sitio para el diagrama fijo, cada caso muestra su propio flujo en miniatura.

export function initCases({ ScrollTrigger, story }) {
  const items = [...document.querySelectorAll('#caseList .case')];
  const flow = document.getElementById('flow');
  const flowCase = document.getElementById('flowCase');
  const flowHub = document.getElementById('flowHub');
  const ins = [...flow.querySelectorAll('.flow-in li')];
  const outs = [...flow.querySelectorAll('.flow-out li')];
  const data = items.map(li => ({
    n: li.querySelector('.case-n').textContent.trim(),
    title: li.querySelector('h3').textContent.trim(),
    in: li.dataset.in.split('|'),
    hub: li.dataset.hub,
    out: li.dataset.out.split('|'),
  }));

  // Flujo en miniatura (decorativo: el texto del caso ya lo explica).
  items.forEach((li, i) => {
    const d = data[i];
    const mini = document.createElement('div');
    mini.className = 'case-mini';
    mini.setAttribute('aria-hidden', 'true');
    const chip = (tag, text) => { const el = document.createElement(tag); el.textContent = text; return el; };
    d.in.forEach(t => mini.append(chip('span', t)));
    mini.append(document.createElement('i'), chip('b', d.hub), document.createElement('i'));
    d.out.forEach(t => mini.append(chip('span', t)));
    li.append(mini);
  });

  let active = 0;
  let swapTimer = 0;
  function setCase(i) {
    if (i === active) return;
    active = i;
    items.forEach((li, k) => li.classList.toggle('is-active', k === i));
    story.state.caseIdx = i;
    story.state.casePulse = 1;
    const d = data[i];
    flow.classList.add('is-switching');
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => {
      flowCase.textContent = `${d.n} · ${d.title}`;
      flowHub.textContent = d.hub;
      ins.forEach((li, k) => { li.textContent = d.in[k] || ''; });
      outs.forEach((li, k) => { li.textContent = d.out[k] || ''; });
      flow.classList.remove('is-switching');
    }, 280);
  }

  const triggers = items.map((li, i) => ScrollTrigger.create({
    trigger: li,
    start: 'top 58%',
    end: 'bottom 58%',
    onToggle: self => { if (self.isActive) setCase(i); },
  }));
  return { destroy: () => triggers.forEach(t => t.kill()) };
}
