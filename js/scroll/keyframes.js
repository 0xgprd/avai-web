// Fotogramas clave de la historia: un estado completo de la escena por capítulo.
// La timeline maestra (js/scroll/story.js) interpola entre ellos según el scroll, hacia delante y hacia atrás.
//
// Campos:
//   cam*        posición de la cámara; mira siempre hacia -z (yaw/pitch en radianes para matizar)
//   stage       capítulo para el shader de partículas (0 núcleo · 1-3 sistemas · 4 trayectoria · 5 flujos
//               · 6 composición estable · 7 núcleo final)
//   alpha       opacidad global de la escena (menor en móvil, donde el texto va encima)
//   exposure    brillo de las partículas
//   net/netSpread  red de nodos del núcleo y cuánto se separan sus nodos
//   rings*      anillos orbitales: opacidad, escala, inclinación (0 planos libres, 1 alineados) y posición
//   struct      líneas de las estructuras de servicios · eco: conexiones entre sistemas
//   path        trayectoria del proceso · strands/hub: red de flujos de los casos
//   halo*       luz volumétrica simulada · focus*: realce de cada sistema de servicios
//   dust        partículas de profundidad · size: tamaño de partícula

import { WORLD } from '../config.js';

const [ax, ay, az] = WORLD.ai;
const [mx, my, mz] = WORLD.mkt;
const [dx, dy, dz] = WORLD.dig;
const [fx, fy, fz] = WORLD.flow;
const [bx, by, bz] = WORLD.about;

const BASE = {
  camX: 0, camY: 0, camZ: 8, yaw: 0, pitch: 0,
  stage: 0, alpha: 1, exposure: 1, size: 1,
  net: 0, netSpread: 0,
  rings: 0, ringScale: 1, ringTilt: 0, ringX: 0, ringY: 0, ringZ: 0,
  struct: 0, eco: 0, path: 0, strands: 0, hub: 0,
  haloX: 0, haloY: 0, haloZ: 0, haloScale: 6, haloAlpha: 0,
  focusA: 1, focusB: 1, focusC: 1,
  dust: 0.7,
};

function chapters(cam) {
  return [
    // 0 · THE CORE: esfera de partículas, red de nodos, anillos y halo
    { stage: 0, ...cam[0], net: 0.7, netSpread: 0, rings: 0.75, ringScale: 1, haloScale: 7, haloAlpha: 0.32, dust: 0.75 },
    // 1-3 · OUR INTELLIGENCE: el núcleo se descompone en tres sistemas conectados; la cámara visita cada uno
    { stage: 1, ...cam[1], netSpread: 1.7, rings: 0.12, ringScale: 2.6, struct: 0.55, eco: 0.3,
      haloX: ax, haloY: ay, haloZ: az, haloScale: 5, haloAlpha: 0.34, focusA: 1, focusB: 0.1, focusC: 0.1 },
    { stage: 2, ...cam[2], netSpread: 1.7, rings: 0.06, ringScale: 3, struct: 0.55, eco: 0.3,
      haloX: mx, haloY: my, haloZ: mz, haloScale: 5, haloAlpha: 0.34, focusA: 0.1, focusB: 1, focusC: 0.1 },
    { stage: 3, ...cam[3], netSpread: 1.7, rings: 0, ringScale: 3, struct: 0.55, eco: 0.3,
      ringX: bx, ringY: by, ringZ: bz,
      haloX: dx, haloY: dy, haloZ: dz, haloScale: 5, haloAlpha: 0.34, focusA: 0.1, focusB: 0.1, focusC: 1 },
    // 4 · CONNECT EVERYTHING: los sistemas se ordenan sobre una trayectoria que recorre un punto luminoso
    { stage: 4, ...cam[4], netSpread: 1.7, ringX: bx, ringY: by, ringZ: bz, ringScale: 0.78, ringTilt: 1, eco: 0.06, path: 1,
      haloX: 0.3, haloY: 0.75, haloZ: -20.1, haloScale: 7, haloAlpha: 0.2 },
    // 5 · REAL BUSINESS: varias entradas confluyen en un sistema central y salen hacia distintas herramientas
    { stage: 5, ...cam[5], netSpread: 1.7, ringX: bx, ringY: by, ringZ: bz, ringScale: 0.78, ringTilt: 1, path: 0.1, strands: 0.55, hub: 1,
      haloX: fx, haloY: fy, haloZ: fz, haloScale: 5.5, haloAlpha: 0.42 },
    // 6 · ABOUT: el ecosistema se estabiliza en una composición equilibrada
    { stage: 6, ...cam[6], netSpread: 1.7, rings: 0.85, ringScale: 0.78, ringTilt: 1, ringX: bx, ringY: by, ringZ: bz,
      haloX: bx, haloY: by, haloZ: bz, haloScale: 6.5, haloAlpha: 0.46 },
    // 7 · CONTACT: la cámara se aleja y todo converge en un núcleo luminoso
    { stage: 7, ...cam[7], netSpread: 1.7, rings: 0.9, ringScale: 0.42, ringTilt: 1, ringX: bx, ringY: by, ringZ: bz,
      haloX: bx, haloY: by, haloZ: bz, haloScale: 10, haloAlpha: 0.85, exposure: 1.15, size: 1.06, dust: 0.55 },
  ];
}

// Escritorio: el texto ocupa un lado y cada estructura se coloca en el contrario.
const DESKTOP = [
  { camX: -3.0, camY: 0.05, camZ: 11 },
  { camX: ax - 1.24, camY: ay, camZ: az + 5.6, yaw: 0.04 },
  { camX: mx + 1.24, camY: my, camZ: mz + 5.6, yaw: -0.04 },
  { camX: dx - 1.24, camY: dy, camZ: dz + 5.6, yaw: 0.04 },
  { camX: -2.2, camY: 0, camZ: -10.6, yaw: 0.02 },
  { camX: fx - 1.65, camY: fy, camZ: fz + 7.5 },
  { camX: bx - 2.6, camY: by, camZ: bz + 7.2 },
  { camX: bx - 2.65, camY: by - 0.35, camZ: bz + 12 },
];

// Móvil: estructuras centradas y en la parte alta de la pantalla, cámara más lejos y escena más tenue
// mientras hay texto encima. Movimientos más cortos y sin giros.
const MOBILE = [
  { camX: 0, camY: -1.8, camZ: 10.2 },
  { camX: ax, camY: ay - 1.3, camZ: az + 7.6, alpha: 0.5 },
  { camX: mx, camY: my - 1.3, camZ: mz + 7.6, alpha: 0.5 },
  { camX: dx, camY: dy - 1.3, camZ: dz + 7.6, alpha: 0.5 },
  { camX: 1.2, camY: -1.2, camZ: -8.6, alpha: 0.55 },
  { camX: fx, camY: fy - 1.2, camZ: fz + 9.5, alpha: 0.45 },
  { camX: bx, camY: by - 1.6, camZ: bz + 8.8, alpha: 0.5 },
  { camX: bx, camY: by - 2.3, camZ: bz + 13, alpha: 0.6 },
];

export function getKeyframes(mobile) {
  const cam = mobile ? MOBILE : DESKTOP;
  return chapters(cam).map(k => ({ ...BASE, ...k }));
}
