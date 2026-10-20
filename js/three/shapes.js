// Geometría procedural de «The Intelligence Engine».
//
// Cada partícula tiene una posición en cada forma de la historia y el shader las mezcla según el capítulo:
//   sphere   núcleo: esfera orgánica (superficie + volumen interior)
//   cluster  tres sistemas: red neuronal por capas (IA), espiral de crecimiento (marketing),
//            encuadre con lente (web y audiovisual)
//   path     trayectoria del proceso (posición ordenada + desplazamiento «disperso»)
//   flow     red de flujos de los casos (se calcula en el shader a partir de curvas de Bézier)
//   calm     composición estable de «Nosotros»: núcleo pequeño y tres órbitas equilibradas
//   final    núcleo luminoso del contacto
// También se generan las líneas: red de nodos del núcleo, conexiones entre sistemas, estructuras,
// trayectoria, flujos y anillos. Semilla fija: la escena es idéntica en cada visita.

import { CatmullRomCurve3, Vector3 } from '../../assets/vendor/three-0.186.1.avai.min.js';
import { WORLD } from '../config.js';

const TAU = Math.PI * 2;

export function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = R => (R() + R() + R() + R() - 2) / 2;
const add = (p, c) => [p[0] + c[0], p[1] + c[1], p[2] + c[2]];
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const jitter = (p, R, s) => [p[0] + gauss(R) * s, p[1] + gauss(R) * s, p[2] + gauss(R) * s];
function unit(R) {
  const u = R() * 2 - 1, a = R() * TAU, s = Math.sqrt(1 - u * u);
  return [Math.cos(a) * s, u, Math.sin(a) * s];
}
function rotY(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; }
function rotX(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; }
function rotZ(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; }

// ---------- Sistema 1 · IA y automatización: red neuronal por capas ----------
function aiLattice() {
  const layers = [3, 5, 5, 3];
  const nodes = [];
  layers.forEach((n, l) => {
    const x = (l - (layers.length - 1) / 2) * 0.85;
    const r = 1.0 - Math.abs(l - 1.5) * 0.2;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU + l * 0.6;
      nodes.push({ p: [x, Math.cos(a) * r, Math.sin(a) * r * 0.75], l });
    }
  });
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) if (nodes[j].l === nodes[i].l + 1) edges.push([i, j]);
  }
  return { nodes: nodes.map(n => add(rotX(rotY(n.p, 0.55), -0.12), WORLD.ai)), edges };
}

// ---------- Sistema 2 · Marketing y crecimiento: espiral que se abre hacia arriba ----------
function mktPoint(strand, t) {
  const y = -1.35 + 2.7 * t;
  const rad = 0.18 + 1.08 * Math.pow(t, 1.25);
  const a = t * TAU * 2.1 + (strand * TAU) / 3;
  return add(rotX([Math.cos(a) * rad, y, Math.sin(a) * rad], 0.18), WORLD.mkt);
}

// ---------- Sistema 3 · Web y audiovisual: encuadre de pantalla con lente ----------
const FW = 2.7, FH = 1.5;
const LENS = [0.22, 0.4, 0.58];
const toDig = p => add(rotX(rotY(p, -0.38), 0.06), WORLD.dig);
function framePoint(s) {
  // s en [0,1) recorre el perímetro del encuadre
  const per = 2 * (FW + FH);
  let d = s * per;
  if (d < FW) return [-FW / 2 + d, FH / 2, 0];
  d -= FW; if (d < FH) return [FW / 2, FH / 2 - d, 0];
  d -= FH; if (d < FW) return [FW / 2 - d, -FH / 2, 0];
  d -= FW; return [-FW / 2, -FH / 2 + d, 0];
}
function bracketPoint(R) {
  const corner = Math.floor(R() * 4), sx = corner % 2 ? 1 : -1, sy = corner < 2 ? 1 : -1;
  const o = 0.16, L = 0.38, along = R() * L;
  const cx = sx * (FW / 2 + o), cy = sy * (FH / 2 + o);
  return R() < 0.5 ? [cx - sx * along, cy, 0.02] : [cx, cy - sy * along, 0.02];
}
function lensPoint(R) {
  const k = Math.floor(R() * LENS.length), a = R() * TAU;
  return [Math.cos(a) * LENS[k], Math.sin(a) * LENS[k], 0.12 - k * 0.06];
}
function gridPoint(R) {
  const gx = Math.floor(R() * 26), gy = Math.floor(R() * 14);
  return [-FW / 2 + ((gx + 0.5) * FW) / 26, -FH / 2 + ((gy + 0.5) * FH) / 14, -0.1];
}

// ---------- Trayectoria del proceso ----------
export function makePath() {
  const curve = new CatmullRomCurve3(WORLD.path.map(p => new Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.5);
  const pts = curve.getSpacedPoints(600).map(v => [v.x, v.y, v.z]);
  const at = t => {
    const f = Math.min(Math.max(t, 0), 1) * (pts.length - 1);
    const i = Math.floor(f);
    return lerp3(pts[i], pts[Math.min(i + 1, pts.length - 1)], f - i);
  };
  return { pts, at };
}

// ---------- Red de flujos de los casos: 5 entradas → sistema central → 3 salidas ----------
export function flowStrands() {
  const c = WORLD.flow;
  const S = [];
  [[1.75, 0.55], [0.88, -0.35], [0, 0.4], [-0.88, -0.45], [-1.75, 0.25]].forEach(([y, z]) => {
    S.push([add([-2.6, y * 0.85, z], c), add([-1.25, y * 0.4, z * 0.4], c), [...c]]);
  });
  [[1.15, -0.4], [0, 0.5], [-1.15, -0.2]].forEach(([y, z]) => {
    S.push([[...c], add([1.35, y * 0.4, z * 0.4], c), add([2.8, y, z], c)]);
  });
  return S;
}
const bez = (s, t) => {
  const u = 1 - t;
  return [0, 1, 2].map(k => u * u * s[0][k] + 2 * u * t * s[1][k] + t * t * s[2][k]);
};

// ---------- Composición estable (Nosotros) ----------
export const CALM_TILT = 0.42;
export const CALM_RINGS = [
  { r: 1.365, tx: 0, tz: 0 },
  { r: 1.833, tx: 0.1, tz: -0.12 },
  { r: 2.379, tx: -0.08, tz: 0.1 },
];
function calmRingPoint(ring, a) {
  const p = rotZ(rotX([Math.cos(a) * ring.r, 0, Math.sin(a) * ring.r], CALM_TILT + ring.tx), ring.tz);
  return add(p, WORLD.about);
}

// ---------- Partículas ----------
export function buildParticles(N) {
  const R = seeded(20261020);
  const A = {
    count: N,
    sphere: new Float32Array(N * 3), cluster: new Float32Array(N * 3),
    path: new Float32Array(N * 3), off: new Float32Array(N * 3),
    calm: new Float32Array(N * 3), fin: new Float32Array(N * 3),
    misc: new Float32Array(N * 4), flowT: new Float32Array(N), size: new Float32Array(N),
  };
  const ai = aiLattice();
  const path = makePath();
  const golden = Math.PI * (3 - Math.sqrt(5));
  const put = (arr, i, p) => { arr[i * 3] = p[0]; arr[i * 3 + 1] = p[1]; arr[i * 3 + 2] = p[2]; };

  for (let i = 0; i < N; i++) {
    const seed = R();

    // Núcleo: el orden de índices recorre la esfera de arriba abajo, así que al dividir en tercios la
    // esfera se «abre» en tres bandas que vuelan hacia sus sistemas.
    let s;
    if (R() < 0.2) {
      const d = unit(R), rad = 0.35 + 1.1 * Math.cbrt(R());
      s = [d[0] * rad, d[1] * rad, d[2] * rad];
    } else {
      const y = 1 - (2 * (i + 0.5)) / N, rr = Math.sqrt(1 - y * y), a = i * golden, rad = 1.55 + gauss(R) * 0.05;
      s = [Math.cos(a) * rr * rad, y * rad, Math.sin(a) * rr * rad];
    }
    put(A.sphere, i, s);

    // Sistemas de servicios
    const id = i < N / 3 ? 0 : i < (2 * N) / 3 ? 1 : 2;
    let c;
    if (id === 0) {
      if (R() < 0.28) c = jitter(ai.nodes[Math.floor(R() * ai.nodes.length)], R, 0.05);
      else { const e = ai.edges[Math.floor(R() * ai.edges.length)]; c = jitter(lerp3(ai.nodes[e[0]], ai.nodes[e[1]], R()), R, 0.014); }
    } else if (id === 1) {
      if (R() < 0.86) c = jitter(mktPoint(Math.floor(R() * 3), R()), R, 0.028);
      else { const t = R(), a = R() * TAU, rad = 0.14 * R(); c = add(rotX([Math.cos(a) * rad, -1.35 + 2.7 * t, Math.sin(a) * rad], 0.18), WORLD.mkt); }
    } else {
      const k = R();
      const local = k < 0.34 ? framePoint(R()) : k < 0.46 ? bracketPoint(R) : k < 0.76 ? lensPoint(R) : gridPoint(R);
      c = jitter(toDig(local), R, 0.008);
    }
    put(A.cluster, i, c);

    // Trayectoria: posición ordenada sobre la curva + dirección y distancia de «dispersión»
    const t = R();
    put(A.path, i, jitter(path.at(t), R, 0.05));
    const d = unit(R), far = 0.45 + R() * 1.5;
    put(A.off, i, [d[0] * far, d[1] * far, d[2] * far]);

    // Flujos: hebra (5 de entrada, 3 de salida) y fase sobre ella
    const strand = R() < 0.62 ? Math.floor(R() * 5) : 5 + Math.floor(R() * 3);
    A.flowT[i] = R();

    // Composición estable
    let q;
    if (R() < 0.26) { const u = unit(R), rad = 0.55 + gauss(R) * 0.02; q = add([u[0] * rad, u[1] * rad, u[2] * rad], WORLD.about); }
    else q = jitter(calmRingPoint(CALM_RINGS[Math.floor(R() * 3)], R() * TAU), R, 0.018);
    put(A.calm, i, q);

    // Núcleo final
    const k = R();
    let f;
    if (k < 0.62) { const u = unit(R), rad = 0.46 + gauss(R) * 0.02; f = add([u[0] * rad, u[1] * rad, u[2] * rad], WORLD.about); }
    else if (k < 0.8) { const u = unit(R), rad = 0.44 * Math.cbrt(R()); f = add([u[0] * rad, u[1] * rad, u[2] * rad], WORLD.about); }
    else f = jitter(calmRingPoint({ r: 0.95, tx: 0, tz: 0 }, R() * TAU), R, 0.012);
    put(A.fin, i, f);

    A.misc[i * 4] = seed;
    A.misc[i * 4 + 1] = id;
    A.misc[i * 4 + 2] = t;
    A.misc[i * 4 + 3] = strand;
    A.size[i] = 0.55 + Math.pow(R(), 3) * 1.6;
  }
  return { particles: A, path, strands: flowStrands(), ai };
}

// ---------- Líneas ----------
// Todas las líneas comparten formato: posición, dirección de separación (aDir), parámetro a lo largo de
// la línea (aU, para pulsos y tramos iluminados), desfase (aOff) y grupo (aGroup, para el realce).
class Segments {
  constructor() { this.pos = []; this.dir = []; this.u = []; this.off = []; this.grp = []; }
  seg(a, b, ua, ub, off = 0, grp = 0, da = [0, 0, 0], db = da) {
    this.pos.push(...a, ...b); this.dir.push(...da, ...db); this.u.push(ua, ub); this.off.push(off, off); this.grp.push(grp, grp);
  }
  polyline(pts, off = 0, grp = 0, closed = false) {
    const n = pts.length - (closed ? 0 : 1);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % pts.length;
      this.seg(pts[i], pts[j], i / n, (i + 1) / n, off, grp);
    }
  }
  arrays() {
    return {
      position: new Float32Array(this.pos), aDir: new Float32Array(this.dir), aU: new Float32Array(this.u),
      aOff: new Float32Array(this.off), aGroup: new Float32Array(this.grp), count: this.u.length,
    };
  }
}

// Red de nodos del núcleo: nodos sobre la esfera unidos a sus vecinos más cercanos.
export function buildNetwork(n) {
  const R = seeded(7);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const nodes = [];
  const dirs = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * (i + 0.5)) / n, rr = Math.sqrt(1 - y * y), a = i * golden, rad = 1.62 + gauss(R) * 0.06;
    nodes.push([Math.cos(a) * rr * rad, y * rad, Math.sin(a) * rr * rad]);
    dirs.push(unit(R));
  }
  const S = new Segments();
  const seen = new Set();
  for (let i = 0; i < n; i++) {
    const near = nodes.map((p, j) => [j, (p[0] - nodes[i][0]) ** 2 + (p[1] - nodes[i][1]) ** 2 + (p[2] - nodes[i][2]) ** 2])
      .filter(([j]) => j !== i).sort((a, b) => a[1] - b[1]).slice(0, 3);
    for (const [j] of near) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      S.seg(nodes[i], nodes[j], 0, 1, R(), 0, dirs[i], dirs[j]);
    }
  }
  return { lines: S.arrays(), nodes, dirs };
}

// Conexiones entre los tres sistemas: arcos con pulsos de luz que viajan de uno a otro.
export function buildEcoLinks() {
  const R = seeded(11);
  const S = new Segments();
  [[WORLD.ai, WORLD.mkt], [WORLD.mkt, WORLD.dig], [WORLD.ai, WORLD.dig]].forEach(([a, b], k) => {
    for (let lane = 0; lane < 3; lane++) {
      const mid = lerp3(a, b, 0.5);
      const ctrl = add(mid, [(lane - 1) * 0.35, 1.3 + lane * 0.3, (lane - 1) * 0.25]);
      const pts = [];
      for (let i = 0; i <= 48; i++) pts.push(bez([a, ctrl, b], i / 48));
      S.polyline(pts, R() + k * 0.31, k);
    }
  });
  return S.arrays();
}

// Líneas que dibujan cada sistema (para que se lean como estructuras, no como nubes).
export function buildStructures(ai) {
  const S = new Segments();
  ai.edges.forEach(([i, j], k) => S.seg(ai.nodes[i], ai.nodes[j], 0, 1, (k * 0.137) % 1, 0));
  for (let strand = 0; strand < 3; strand++) {
    const pts = [];
    for (let i = 0; i <= 160; i++) pts.push(mktPoint(strand, i / 160));
    S.polyline(pts, strand / 3, 1);
  }
  const rect = [[-FW / 2, FH / 2, 0], [FW / 2, FH / 2, 0], [FW / 2, -FH / 2, 0], [-FW / 2, -FH / 2, 0]].map(toDig);
  S.polyline(rect, 0, 2, true);
  LENS.forEach((r, k) => {
    const pts = [];
    for (let i = 0; i < 96; i++) { const a = (i / 96) * TAU; pts.push(toDig([Math.cos(a) * r, Math.sin(a) * r, 0.12 - k * 0.06])); }
    S.polyline(pts, k / 3, 2, true);
  });
  return S.arrays();
}

export function buildPathLine(path) {
  const S = new Segments();
  S.polyline(path.pts, 0, 0);
  return S.arrays();
}

export function buildStrandLines(strands) {
  const S = new Segments();
  strands.forEach((s, k) => {
    const pts = [];
    for (let i = 0; i <= 56; i++) pts.push(bez(s, i / 56));
    S.polyline(pts, (k * 0.29) % 1, k < 5 ? 0 : 1);
  });
  return S.arrays();
}

// Anillo de radio 1 en el plano XZ; cada anillo se escala, orienta y gira en js/three/world.js.
export function buildRing(segments = 220) {
  const S = new Segments();
  const pts = [];
  for (let i = 0; i < segments; i++) { const a = (i / segments) * TAU; pts.push([Math.cos(a), 0, Math.sin(a)]); }
  S.polyline(pts, 0, 0, true);
  return S.arrays();
}

export function buildDust(n) {
  const R = seeded(3);
  const pos = new Float32Array(n * 3);
  const seed = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (R() * 2 - 1) * 10;
    pos[i * 3 + 1] = (R() * 2 - 1) * 6;
    pos[i * 3 + 2] = 12 - R() * 60;
    seed[i] = R();
  }
  return { position: pos, aSeed: seed };
}
