// Configuración compartida: paleta, geometría del «universo» 3D y capacidad del dispositivo.

// Colores de la escena, ajustados al logotipo (azul #225bcb, cian #36d2f8, turquesa #33edd5).
export const PALETTE = {
  bg: '#050914',
  blue: '#2a6cf6',
  cyan: '#45d6f7',
  teal: '#33edd5',
  ice: '#e6f6ff',
};

// Centros de cada estructura. La cámara recorre el espacio hacia -z a medida que se baja por la página:
// núcleo → tres sistemas de servicios → trayectoria del proceso → red de casos → composición final.
export const WORLD = {
  core: [0, 0, 0],
  ai: [3.0, 0.3, -3.6],
  mkt: [-3.2, -0.15, -8.2],
  dig: [3.0, 0.1, -12.8],
  path: [
    [-1.75, -0.95, -16.1],
    [-0.8, -0.2, -18.1],
    [0.3, 0.75, -20.1],
    [1.4, -0.15, -22.1],
    [2.75, 1.3, -24.6],
  ],
  flow: [1.9, 0.0, -30.0],
  about: [0, 0, -37.0],
};

// Posición (0..1) de cada fase del proceso sobre la trayectoria: Análisis, Desarrollo, Implementación, Optimización.
export const PHASES = [0.125, 0.375, 0.625, 0.875];

export const mq = {
  mobile: window.matchMedia('(max-width: 960px)'),
  reduced: window.matchMedia('(prefers-reduced-motion: reduce)'),
  finePointer: window.matchMedia('(hover: hover) and (pointer: fine)'),
};

// Nivel de detalle según el dispositivo. Navegadores que no informan de memoria o núcleos (Safari, Firefox)
// se tratan como equipos medios; el ajuste adaptativo de js/three/stage.js corrige si luego va lento.
export function detectQuality() {
  const touch = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const mobile = mq.mobile.matches || touch;
  const cores = navigator.hardwareConcurrency || 8;
  const mem = navigator.deviceMemory || 8;
  let tier = 'medium';
  if (mobile || cores <= 4 || mem <= 4) tier = 'low';
  else if (cores >= 8 && mem >= 8 && Math.min(screen.width, screen.height) >= 900) tier = 'high';
  const levels = {
    high: { particles: 9000, dust: 900, nodes: 150, maxDpr: 1.75, antialias: true },
    medium: { particles: 6500, dust: 650, nodes: 130, maxDpr: 1.5, antialias: true },
    low: { particles: 3200, dust: 280, nodes: 96, maxDpr: 1.25, antialias: false },
  };
  return { tier, mobile, ...levels[tier] };
}
