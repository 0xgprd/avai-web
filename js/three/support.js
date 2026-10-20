// ¿Puede este navegador mostrar la escena? Three.js 0.186 necesita WebGL 2.
// Se comprueba antes de descargar Three.js, para no gastar datos en dispositivos que no lo soportan.
// failIfMajorPerformanceCaveat descarta los equipos que solo tienen renderizado por software: ahí la
// escena iría a tirones y se muestra la composición estática. Para pruebas, ?3d=forzar lo permite igualmente.
export function hasWebGL2() {
  const force = /[?&]3d=forzar\b/.test(window.location.search);
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', force ? {} : { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return true;
  } catch (e) {
    return false;
  }
}
