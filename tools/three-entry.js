// Clases de Three.js que usa la escena 3D (js/three/*). esbuild solo empaqueta lo que se exporta aquí,
// así que si la escena empieza a usar una clase nueva hay que añadirla y regenerar el fichero.
// Instrucciones en tools/README.md.
export {
  Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry, BufferAttribute, Float32BufferAttribute,
  Points, LineSegments, ShaderMaterial, AdditiveBlending, Color, Vector2, Vector3, CatmullRomCurve3,
  QuadraticBezierCurve3, Group, Sprite, SpriteMaterial, CanvasTexture, SRGBColorSpace, MathUtils,
} from 'three';
