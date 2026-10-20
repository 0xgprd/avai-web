// Cámara: sigue los fotogramas clave de la historia, avanza junto al punto luminoso durante el proceso
// y reacciona levemente al cursor en escritorio. Nunca mueve el cursor ni captura eventos de la página.

import { PerspectiveCamera } from '../../assets/vendor/three-0.186.1.avai.min.js';

const FOV_DESKTOP = 36;
const FOV_MOBILE = 50;

export function createCameraRig({ mobile }) {
  const camera = new PerspectiveCamera(mobile ? FOV_MOBILE : FOV_DESKTOP, 1, 0.1, 120);
  camera.rotation.order = 'YXZ';
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  let listening = false;

  function onMove(e) {
    ptr.tx = (e.clientX / window.innerWidth) * 2 - 1;
    ptr.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }
  function setPointer(on) {
    if (on === listening) return;
    listening = on;
    if (on) window.addEventListener('pointermove', onMove, { passive: true });
    else { window.removeEventListener('pointermove', onMove); ptr.tx = ptr.ty = 0; }
  }
  function setMobile(m) {
    camera.fov = m ? FOV_MOBILE : FOV_DESKTOP;
    camera.updateProjectionMatrix();
  }

  function update(s, time, frozen) {
    ptr.x += (ptr.tx - ptr.x) * 0.045;
    ptr.y += (ptr.ty - ptr.y) * 0.045;
    // Durante el proceso la cámara acompaña al punto luminoso hacia el fondo de la trayectoria.
    const wProc = Math.max(0, 1 - Math.abs(s.stage - 4));
    const breath = frozen ? 0 : Math.sin(time * 0.21) * 0.06;
    camera.position.set(
      s.camX + ptr.x * 0.32 + s.proc * 1.1 * wProc,
      s.camY - ptr.y * 0.2 + breath + s.proc * 0.3 * wProc,
      s.camZ - s.proc * 3.2 * wProc,
    );
    camera.rotation.set(s.pitch + ptr.y * 0.025, s.yaw - ptr.x * 0.04, 0);
  }

  return { camera, update, setPointer, setMobile, dispose: () => setPointer(false) };
}
