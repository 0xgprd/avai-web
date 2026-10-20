// Materiales y shaders. Un solo material de partículas para todo el recorrido (la forma se decide en la
// GPU), un material de líneas compartido por todas las estructuras y un sprite de luz reutilizado.

import { ShaderMaterial, AdditiveBlending, Color, Vector3, CanvasTexture, SRGBColorSpace } from '../../assets/vendor/three-0.186.1.avai.min.js';
import { PALETTE, WORLD } from '../config.js';

const v3 = a => new Vector3(a[0], a[1], a[2]);

// ---------- Partículas ----------
const PARTICLE_VS = /* glsl */`
uniform float uTime, uStage, uPR, uSize, uAlpha, uExposure, uProc, uIntro;
uniform vec3 uFocus, uCA, uCB, uCC, uCalmC;
uniform vec3 uP0[8];
uniform vec3 uP1[8];
uniform vec3 uP2[8];
uniform vec3 uColA, uColB, uColC;
attribute vec3 aCluster, aPath, aOff, aCalm, aFinal;
attribute vec4 aMisc;      // x semilla · y sistema (0,1,2) · z posición en la trayectoria · w hebra de flujo
attribute float aFlowT, aSize;
varying vec3 vColor;
varying float vAlpha;

vec3 rotY(vec3 p, vec3 c, float a){ vec3 q = p - c; float s = sin(a), k = cos(a); return vec3(q.x*k + q.z*s, q.y, -q.x*s + q.z*k) + c; }
// Capítulo → forma: 0 núcleo · 1..3 sistemas · 4 trayectoria · 5 flujos · 6 calma · 7 núcleo final
float shapeOf(float c){ return c < .5 ? 0. : c < 3.5 ? 1. : c < 4.5 ? 2. : c < 5.5 ? 3. : c < 6.5 ? 4. : 5.; }

vec3 sphereT(float seed){
  vec3 p = position;
  float n = sin(uTime*.7 + seed*31.4)*.035 + sin(dot(p, vec3(2.1,1.7,2.9)) + uTime*.9)*.03;
  p *= 1. + n;
  if (seed > .93) {                           // partículas que entran y salen del sistema
    float k = .5 + .5*sin(uTime*.35 + seed*60.);
    p *= 1. + k*k*1.15;
  }
  return rotY(p, vec3(0.), uTime*.05);
}
vec3 clusterT(){
  float id = aMisc.y;
  vec3 c = id < .5 ? uCA : id < 1.5 ? uCB : uCC;
  float dir = id < .5 ? 1. : id < 1.5 ? -1. : .5;
  return rotY(aCluster, c, sin(uTime*.12 + id)*.18*dir);
}
float organized(){ return smoothstep(aMisc.z - .05, aMisc.z + .01, uProc); }
vec3 pathT(){
  float wob = 1. + sin(uTime*.6 + aMisc.x*40.)*.05;
  return aPath + aOff * mix(wob, .05, organized());
}
vec3 bez(vec3 a, vec3 b, vec3 c, float t){ float u = 1. - t; return u*u*a + 2.*u*t*b + t*t*c; }
vec3 flowT(){
  int s = int(aMisc.w + .5);
  float t = fract(aFlowT + uTime*(.045 + aMisc.x*.05));
  return bez(uP0[s], uP1[s], uP2[s], t) + aOff*.045;
}
vec3 calmT(){ return aCalm + aOff*.006*sin(uTime*.8 + aMisc.x*30.); }
vec3 finalT(float seed){
  vec3 q = (aFinal - uCalmC) * (1. + .05*sin(uTime*1.3 + seed*12.));
  return rotY(q + uCalmC, uCalmC, uTime*.12);
}
vec3 shape(float k, float seed){
  if (k < .5) return sphereT(seed);
  if (k < 1.5) return clusterT();
  if (k < 2.5) return pathT();
  if (k < 3.5) return flowT();
  if (k < 4.5) return calmT();
  return finalT(seed);
}

void main(){
  float seed = aMisc.x;
  float st = clamp(uStage, 0., 7.);
  float c0 = floor(st);
  float f = st - c0;
  if (c0 >= 7.) { c0 = 7.; f = 0.; }
  float ka = shapeOf(c0), kb = shapeOf(min(c0 + 1., 7.));
  // Cada partícula empieza su viaje con un retardo distinto: la forma se descompone y se reconstruye.
  float m = ka == kb ? 0. : smoothstep(seed*.4, seed*.4 + .6, f);
  vec3 p = shape(ka, seed);
  if (m > 0.) {
    p = mix(p, shape(kb, seed), m);
    p += normalize(aOff + 1e-4) * sin(3.14159*m) * (.5 + seed*1.1);
  }
  // Entrada: al cargar, las partículas llegan desde fuera y forman la figura.
  p += aOff * (1. - uIntro) * 2.6;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;

  // Realce del sistema activo en «Soluciones» y del tramo ya recorrido en «Proceso».
  float wc = (ka == 1. ? 1. - m : 0.) + (kb == 1. ? m : 0.);
  float id = aMisc.y;
  float focus = mix(1., id < .5 ? uFocus.x : id < 1.5 ? uFocus.y : uFocus.z, wc);
  float wp = (ka == 2. ? 1. - m : 0.) + (kb == 2. ? m : 0.);
  float lit = mix(1., .45 + .95*organized(), wp);

  gl_PointSize = clamp(aSize * uSize * uPR * (118. / depth) * (.75 + .35*focus), 0., 30.*uPR);
  // Mayoría azul, acentos cian y turquesa, y algunos destellos blancos: nunca un bloque de un solo color.
  float tone = fract(seed*7.31);
  vec3 col = mix(uColA, uColB, smoothstep(.35, 1., tone));
  col = mix(col, uColC, step(.93, tone)*.75);
  if (seed > .975) col = vec3(.9, .96, 1.);
  vColor = col * uExposure * lit;
  float fade = smoothstep(.4, 2.2, depth) * (1. - smoothstep(14., 30., depth));
  vAlpha = uAlpha * fade * (.3 + .7*focus) * uIntro * .62;
}
`;

const PARTICLE_FS = /* glsl */`
varying vec3 vColor;
varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - .5);
  float a = smoothstep(.5, 0., d);
  a = a*a*a*.42 + smoothstep(.13, 0., d)*.85;   // halo corto + centro nítido
  if (a < .01) discard;
  gl_FragColor = vec4(vColor, a * vAlpha);
}
`;

export function createParticleMaterial(strands) {
  return new ShaderMaterial({
    vertexShader: PARTICLE_VS,
    fragmentShader: PARTICLE_FS,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }, uStage: { value: 0 }, uPR: { value: 1 }, uSize: { value: 1 }, uAlpha: { value: 1 },
      uExposure: { value: 1 }, uProc: { value: 0 }, uIntro: { value: 0 },
      uFocus: { value: new Vector3(1, 1, 1) },
      uCA: { value: v3(WORLD.ai) }, uCB: { value: v3(WORLD.mkt) }, uCC: { value: v3(WORLD.dig) }, uCalmC: { value: v3(WORLD.about) },
      uP0: { value: strands.map(s => v3(s[0])) }, uP1: { value: strands.map(s => v3(s[1])) }, uP2: { value: strands.map(s => v3(s[2])) },
      uColA: { value: new Color(PALETTE.blue) }, uColB: { value: new Color(PALETTE.cyan) }, uColC: { value: new Color(PALETTE.teal) },
    },
  });
}

// ---------- Líneas ----------
const LINE_VS = /* glsl */`
uniform float uSpread, uSpin, uTime;
attribute vec3 aDir;
attribute float aU, aOff, aGroup;
varying float vU, vOff, vGroup, vDepth;
void main(){
  vec3 p = position * (1. + uSpread*.55) + aDir * uSpread * .9;
  float a = uTime * uSpin, s = sin(a), k = cos(a);
  p = vec3(p.x*k + p.z*s, p.y, -p.x*s + p.z*k);
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  vU = aU; vOff = aOff; vGroup = aGroup; vDepth = -mv.z;
}
`;

const LINE_FS = /* glsl */`
uniform vec3 uColor, uColor2, uFocus;
uniform float uAlpha, uTime, uPulse, uSpeed, uRep, uBase, uLit, uLitOn, uUseFocus, uDash;
varying float vU, vOff, vGroup, vDepth;
void main(){
  float ph = fract(vU*uRep - uTime*uSpeed + vOff);
  float pulse = exp(-pow((ph - .5)*10., 2.)) * uPulse;
  float lit = uLitOn > .5 ? mix(.16, 1., step(vU, uLit)) : 1.;
  float foc = uUseFocus > .5 ? (vGroup < .5 ? uFocus.x : vGroup < 1.5 ? uFocus.y : uFocus.z) : 1.;
  float dash = uDash > 0. ? step(.45, fract(vU*uDash)) : 1.;
  float fade = smoothstep(.4, 2., vDepth) * (1. - smoothstep(22., 40., vDepth));
  float a = (uBase*dash + pulse) * lit * foc * uAlpha * fade;
  if (a < .003) discard;
  gl_FragColor = vec4(mix(uColor, uColor2, vU), a);
}
`;

export function createLineMaterial(opts = {}) {
  const o = { color: PALETTE.cyan, color2: PALETTE.blue, base: 0.35, pulse: 0, speed: 0.25, rep: 1, spin: 0, lit: false, focus: false, dash: 0, ...opts };
  return new ShaderMaterial({
    vertexShader: LINE_VS,
    fragmentShader: LINE_FS,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }, uSpread: { value: 0 }, uSpin: { value: o.spin },
      uColor: { value: new Color(o.color) }, uColor2: { value: new Color(o.color2) },
      uAlpha: { value: 0 }, uBase: { value: o.base }, uPulse: { value: o.pulse }, uSpeed: { value: o.speed }, uRep: { value: o.rep },
      uLit: { value: 0 }, uLitOn: { value: o.lit ? 1 : 0 },
      uFocus: { value: new Vector3(1, 1, 1) }, uUseFocus: { value: o.focus ? 1 : 0 }, uDash: { value: o.dash },
    },
  });
}

// ---------- Puntos sueltos: nodos de la red y polvo de profundidad ----------
const DOTS_VS = /* glsl */`
uniform float uTime, uPR, uSpread, uSpin, uSize, uDrift;
attribute vec3 aDir;
attribute float aSeed;
varying float vA;
void main(){
  vec3 p = position * (1. + uSpread*.55) + aDir * uSpread * .9;
  p.x += cos(uTime*.08 + aSeed*20.) * uDrift;
  p.y += sin(uTime*.1 + aSeed*30.) * uDrift;
  float a = uTime * uSpin, s = sin(a), k = cos(a);
  p = vec3(p.x*k + p.z*s, p.y, -p.x*s + p.z*k);
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;
  gl_PointSize = clamp(uSize * (.8 + aSeed*1.4) * uPR * (100. / depth), 0., 24.*uPR);
  vA = smoothstep(.5, 3., depth) * (1. - smoothstep(22., 44., depth)) * (.35 + .65*aSeed);
}
`;
const DOTS_FS = /* glsl */`
uniform vec3 uColor;
uniform float uAlpha;
varying float vA;
void main(){
  float d = length(gl_PointCoord - .5);
  float a = smoothstep(.5, .0, d);
  a = a*a;
  if (a < .01) discard;
  gl_FragColor = vec4(uColor, a * vA * uAlpha);
}
`;

export function createDotsMaterial({ color = PALETTE.ice, size = 1, spin = 0, drift = 0 } = {}) {
  return new ShaderMaterial({
    vertexShader: DOTS_VS,
    fragmentShader: DOTS_FS,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }, uPR: { value: 1 }, uSpread: { value: 0 }, uSpin: { value: spin }, uSize: { value: size },
      uDrift: { value: drift }, uColor: { value: new Color(color) }, uAlpha: { value: 0 },
    },
  });
}

// ---------- Luz: textura radial reutilizada por halos, punto del proceso, fases y centro de flujos ----------
export function createGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.18, 'rgba(255,255,255,.55)');
  g.addColorStop(0.45, 'rgba(255,255,255,.14)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}
