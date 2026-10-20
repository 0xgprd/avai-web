# Herramientas de la web

La web no tiene paso de compilación: el HTML, el CSS (`css/`) y los módulos JavaScript (`js/`) se sirven tal cual.
La única pieza generada es el fichero de Three.js reducido.

## Regenerar `assets/vendor/three-<versión>.avai.min.js`

El paquete de Three.js 0.186 ya no incluye una versión minificada y completo pesa 2,1 MB. Por eso se genera un
fichero con solo las clases que usa la escena (`tools/three-entry.js`), minificado: ~540 KB, ~140 KB con gzip.

```bash
mkdir /tmp/three-build && cd /tmp/three-build
npm init -y && npm i three@0.186.1 esbuild@0.25.10
cp "<ruta del proyecto>/tools/three-entry.js" entry.js
npx esbuild entry.js --bundle --format=esm --minify --target=es2020 --legal-comments=inline \
  --outfile="<ruta del proyecto>/assets/vendor/three-0.186.1.avai.min.js"
```

Si cambias de versión, cambia también el nombre del fichero y la importación en `js/three/stage.js`: los ficheros de
`assets/vendor/` se cachean 7 días y el nombre con versión es lo que fuerza la descarga de la nueva.

## Librerías incluidas

| Fichero | Versión | Licencia |
|---|---|---|
| `three-0.186.1.avai.min.js` | Three.js 0.186.1 | MIT |
| `gsap-3.15.0.min.js`, `ScrollTrigger-3.15.0.min.js`, `SplitText-3.15.0.min.js` | GSAP 3.15.0 | GSAP Standard "no charge" license, uso comercial permitido |
