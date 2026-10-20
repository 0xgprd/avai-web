// El «universo»: construye todos los objetos de la escena y los actualiza a partir del estado de la
// historia (js/scroll/story.js). No sabe nada del scroll ni del DOM: recibe el estado y el tiempo.

import {
  Group, Points, LineSegments, BufferGeometry, BufferAttribute, Sprite, SpriteMaterial, Color,
  AdditiveBlending, MathUtils,
} from '../../assets/vendor/three-0.186.1.avai.min.js';
import {
  buildParticles, buildNetwork, buildEcoLinks, buildStructures, buildPathLine, buildStrandLines,
  buildRing, buildDust, CALM_TILT, CALM_RINGS,
} from './shapes.js';
import { createParticleMaterial, createLineMaterial, createDotsMaterial, createGlowTexture } from './materials.js';
import { PALETTE, WORLD, PHASES } from '../config.js';

function lineGeometry(a) {
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(a.position, 3));
  g.setAttribute('aDir', new BufferAttribute(a.aDir, 3));
  g.setAttribute('aU', new BufferAttribute(a.aU, 1));
  g.setAttribute('aOff', new BufferAttribute(a.aOff, 1));
  g.setAttribute('aGroup', new BufferAttribute(a.aGroup, 1));
  return g;
}

// Orientaciones de los anillos: libres alrededor del núcleo (inicio) y alineadas en la composición estable.
const RING_RADII = [1.75, 2.35, 3.05];
const RING_FREE = [[1.18, 0.3], [-0.92, -0.25], [0.32, 1.12]];
const RING_SPIN = [0.16, -0.11, 0.07];

export function createWorld(quality) {
  const root = new Group();
  const disposables = [];
  const keep = (...o) => { disposables.push(...o); return o[0]; };
  const glowTex = keep(createGlowTexture());

  // Partículas principales (todas las formas)
  const data = buildParticles(quality.particles);
  const P = data.particles;
  const pGeo = keep(new BufferGeometry());
  pGeo.setAttribute('position', new BufferAttribute(P.sphere, 3));
  pGeo.setAttribute('aCluster', new BufferAttribute(P.cluster, 3));
  pGeo.setAttribute('aPath', new BufferAttribute(P.path, 3));
  pGeo.setAttribute('aOff', new BufferAttribute(P.off, 3));
  pGeo.setAttribute('aCalm', new BufferAttribute(P.calm, 3));
  pGeo.setAttribute('aFinal', new BufferAttribute(P.fin, 3));
  pGeo.setAttribute('aMisc', new BufferAttribute(P.misc, 4));
  pGeo.setAttribute('aFlowT', new BufferAttribute(P.flowT, 1));
  pGeo.setAttribute('aSize', new BufferAttribute(P.size, 1));
  const pMat = keep(createParticleMaterial(data.strands));
  const particles = new Points(pGeo, pMat);
  particles.frustumCulled = false; // las posiciones reales se calculan en el shader
  root.add(particles);

  // Red de nodos del núcleo: líneas + nodos brillantes; se separan al empezar el scroll.
  const net = buildNetwork(quality.nodes);
  const netMat = keep(createLineMaterial({ base: 0.42, pulse: 0.9, speed: 0.35, rep: 1, spin: 0.05, color: PALETTE.cyan, color2: PALETTE.blue }));
  const netLines = new LineSegments(keep(lineGeometry(net.lines)), netMat);
  const nodeGeo = keep(new BufferGeometry());
  nodeGeo.setAttribute('position', new BufferAttribute(new Float32Array(net.nodes.flat()), 3));
  nodeGeo.setAttribute('aDir', new BufferAttribute(new Float32Array(net.dirs.flat()), 3));
  nodeGeo.setAttribute('aSeed', new BufferAttribute(new Float32Array(net.nodes.map((_, i) => ((i * 0.618) % 1))), 1));
  const nodeMat = keep(createDotsMaterial({ color: PALETTE.ice, size: 2.6, spin: 0.05 }));
  const nodes = new Points(nodeGeo, nodeMat);
  [netLines, nodes].forEach(o => { o.frustumCulled = false; root.add(o); });

  // Conexiones entre sistemas, estructuras de cada sistema, trayectoria y red de flujos
  const ecoMat = keep(createLineMaterial({ base: 0.16, pulse: 1.2, speed: 0.22, rep: 1, color: PALETTE.cyan, color2: PALETTE.teal, focus: true }));
  const eco = new LineSegments(keep(lineGeometry(buildEcoLinks())), ecoMat);
  const structMat = keep(createLineMaterial({ base: 0.5, pulse: 0.6, speed: 0.12, rep: 2, color: PALETTE.cyan, color2: PALETTE.blue, focus: true }));
  const structures = new LineSegments(keep(lineGeometry(buildStructures(data.ai))), structMat);
  const pathMat = keep(createLineMaterial({ base: 0.55, pulse: 0.5, speed: 0.18, rep: 3, color: PALETTE.teal, color2: PALETTE.cyan, lit: true }));
  const pathLine = new LineSegments(keep(lineGeometry(buildPathLine(data.path))), pathMat);
  const strandMat = keep(createLineMaterial({ base: 0.22, pulse: 1.1, speed: 0.55, rep: 2, color: PALETTE.blue, color2: PALETTE.teal }));
  const strandLines = new LineSegments(keep(lineGeometry(buildStrandLines(data.strands))), strandMat);
  [eco, structures, pathLine, strandLines].forEach(o => { o.frustumCulled = false; root.add(o); });

  // Anillos orbitales
  const ringGeo = keep(lineGeometry(buildRing()));
  const rings = RING_RADII.map((r, i) => {
    const mat = keep(createLineMaterial({ base: 0.55, pulse: 0.8, speed: 0.05 + i * 0.02, rep: 2, dash: 90 + i * 30, color: i === 1 ? PALETTE.teal : PALETTE.cyan, color2: PALETTE.blue }));
    const ring = new LineSegments(ringGeo, mat);
    ring.frustumCulled = false;
    ring.rotation.order = 'ZXY';
    root.add(ring);
    return { ring, mat, r, i };
  });

  // Polvo de profundidad: da escala al viaje de la cámara
  const dust = buildDust(quality.dust);
  const dustGeo = keep(new BufferGeometry());
  dustGeo.setAttribute('position', new BufferAttribute(dust.position, 3));
  dustGeo.setAttribute('aSeed', new BufferAttribute(dust.aSeed, 1));
  const dustMat = keep(createDotsMaterial({ color: '#9fc7ff', size: 1.4, drift: 0.3 }));
  const dustPts = new Points(dustGeo, dustMat);
  dustPts.frustumCulled = false;
  root.add(dustPts);

  // Luces (sprites aditivos)
  const sprite = (color, scale) => {
    const mat = keep(new SpriteMaterial({ map: glowTex, color: new Color(color), blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
    const s = new Sprite(mat);
    s.scale.setScalar(scale);
    root.add(s);
    return s;
  };
  const halo = sprite(PALETTE.blue, 6);
  const coreGlow = sprite(PALETTE.ice, 1.6);
  const head = sprite(PALETTE.teal, 1.1);
  const phases = PHASES.map(t => { const s = sprite(PALETTE.cyan, 0.6); s.position.set(...data.path.at(t)); return s; });
  const hub = sprite(PALETTE.cyan, 2.2);
  hub.position.set(...WORLD.flow);

  const all = [particles, netLines, nodes, eco, structures, pathLine, strandLines, dustPts];
  const timeMats = [pMat, netMat, nodeMat, ecoMat, structMat, pathMat, strandMat, dustMat, ...rings.map(r => r.mat)];
  let pulse = 0;
  let lastCase = 0;

  function update(s, time, pr, intro = 1) {
    const A = s.alpha;
    const I = intro;
    timeMats.forEach(m => { m.uniforms.uTime.value = time; });

    const u = pMat.uniforms;
    u.uStage.value = s.stage; u.uPR.value = pr; u.uSize.value = s.size; u.uAlpha.value = A;
    u.uExposure.value = s.exposure; u.uProc.value = s.proc; u.uIntro.value = intro;
    u.uFocus.value.set(s.focusA, s.focusB, s.focusC);

    netMat.uniforms.uAlpha.value = s.net * A * I;
    netMat.uniforms.uSpread.value = s.netSpread;
    nodeMat.uniforms.uAlpha.value = s.net * 1.4 * A * I;
    nodeMat.uniforms.uSpread.value = s.netSpread;
    nodeMat.uniforms.uPR.value = pr;
    netLines.visible = nodes.visible = s.net > 0.004;

    ecoMat.uniforms.uAlpha.value = s.eco * A;
    ecoMat.uniforms.uFocus.value.set(1, 1, 1);
    eco.visible = s.eco > 0.004;
    structMat.uniforms.uAlpha.value = s.struct * A;
    structMat.uniforms.uFocus.value.set(s.focusA, s.focusB, s.focusC);
    structures.visible = s.struct > 0.004;
    pathMat.uniforms.uAlpha.value = s.path * A;
    pathMat.uniforms.uLit.value = s.proc;
    pathLine.visible = s.path > 0.004;
    strandMat.uniforms.uAlpha.value = s.strands * A;
    strandLines.visible = s.strands > 0.004;

    // Anillos: de planos libres alrededor del núcleo a órbitas alineadas en la composición final
    rings.forEach(({ ring, mat, r, i }) => {
      const calm = CALM_RINGS[i];
      const free = RING_FREE[i];
      ring.position.set(s.ringX, s.ringY, s.ringZ);
      ring.scale.setScalar(r * s.ringScale);
      ring.rotation.x = MathUtils.lerp(free[0], CALM_TILT + calm.tx, s.ringTilt);
      ring.rotation.z = MathUtils.lerp(free[1], calm.tz, s.ringTilt);
      ring.rotation.y = time * RING_SPIN[i];
      mat.uniforms.uAlpha.value = s.rings * A * I * (1 - i * 0.18);
      ring.visible = s.rings > 0.004;
    });

    dustMat.uniforms.uAlpha.value = s.dust * A;
    dustMat.uniforms.uPR.value = pr;

    halo.position.set(s.haloX, s.haloY, s.haloZ);
    halo.scale.setScalar(s.haloScale);
    halo.material.opacity = s.haloAlpha * A * I;
    // Brillo del centro del núcleo: presente al inicio y al final
    const coreW = Math.max(0, 1 - s.stage) + Math.max(0, s.stage - 6);
    coreGlow.position.set(s.haloX, s.haloY, s.haloZ);
    coreGlow.scale.setScalar(1.4 + (s.stage > 6 ? (s.stage - 6) * 0.9 : 0));
    coreGlow.material.opacity = Math.min(1, coreW) * 0.45 * A * I;

    // Proceso: el punto luminoso recorre la trayectoria y enciende cada fase al pasar
    const pathPos = data.path.at(s.proc);
    head.position.set(pathPos[0], pathPos[1], pathPos[2]);
    head.material.opacity = s.path * A;
    head.scale.setScalar(1.1 + Math.sin(time * 3) * 0.08);
    phases.forEach((ph, k) => {
      const on = s.proc >= PHASES[k] - 0.02;
      ph.material.opacity = s.path * A * (on ? 0.95 : 0.28);
      ph.scale.setScalar(on ? 0.85 : 0.5);
    });

    // Casos: pulso del centro de la red al cambiar de caso
    if (s.caseIdx !== lastCase) { lastCase = s.caseIdx; pulse = 1; }
    pulse *= 0.94;
    hub.material.opacity = s.hub * A * (0.75 + pulse * 0.6);
    hub.scale.setScalar(2.2 + pulse * 1.4);
  }

  function setDetail(fraction) {
    pGeo.setDrawRange(0, Math.floor(P.count * fraction));
    dustGeo.setDrawRange(0, Math.floor(dust.aSeed.length * fraction));
  }

  function pathPoint(t) { return data.path.at(t); }

  function dispose() {
    disposables.forEach(d => d.dispose && d.dispose());
    root.clear();
  }

  return { root, update, setDetail, pathPoint, dispose, objects: all, count: P.count };
}
