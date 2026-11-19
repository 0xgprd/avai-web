// Fondo WebGL a pantalla completa con un fragment shader (portada «Fusión», nov-2026; nació en propuestas/2026-11/).
// Sin Three.js: un triángulo que cubre la pantalla y un shader. Uniforms disponibles en los shaders:
//   u_res (px), u_t (s), u_scroll (0..1 de toda la página), u_mouse (0..1, suavizado), u_extra (libre, 0..1).
// Con «reducir movimiento» se pinta un solo fotograma. Sin WebGL devuelve null y la página sigue igual.

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

export function fondoGL(canvas, frag, { dpr = 1.5, escala = 1 } = {}) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return null;
  const sh = (tipo, src) => {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, 'precision highp float;uniform vec2 u_res;uniform float u_t,u_scroll,u_extra;uniform vec2 u_mouse;\n' + frag));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(prog, n);
  const u = { res: U('u_res'), t: U('u_t'), scroll: U('u_scroll'), mouse: U('u_mouse'), extra: U('u_extra') };

  const estado = { scroll: 0, extra: 0, mouse: [0.5, 0.5], objetivoMouse: [0.5, 0.5], pausado: false };
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function medir() {
    const r = Math.min(devicePixelRatio || 1, dpr) * escala;
    canvas.width = Math.round(innerWidth * r);
    canvas.height = Math.round(innerHeight * r);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  medir();
  addEventListener('resize', medir);
  addEventListener('pointermove', e => { estado.objetivoMouse = [e.clientX / innerWidth, 1 - e.clientY / innerHeight]; }, { passive: true });
  document.addEventListener('visibilitychange', () => { estado.pausado = document.hidden; if (!document.hidden) requestAnimationFrame(cuadro); });

  const t0 = performance.now();
  function cuadro(ahora) {
    if (estado.pausado) return;
    estado.mouse[0] += (estado.objetivoMouse[0] - estado.mouse[0]) * 0.05;
    estado.mouse[1] += (estado.objetivoMouse[1] - estado.mouse[1]) * 0.05;
    gl.uniform2f(u.res, canvas.width, canvas.height);
    gl.uniform1f(u.t, reducido ? 12 : (ahora - t0) / 1000);
    gl.uniform1f(u.scroll, estado.scroll);
    gl.uniform1f(u.extra, estado.extra);
    gl.uniform2f(u.mouse, estado.mouse[0], estado.mouse[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!reducido) requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);
  return estado;
}

// Haces de luz azul sobre negro (inspiración: TitanGate). Filamentos curvos con pulsos que los recorren,
// perspectiva hacia el fondo, viñeta y grano. u_extra: intensidad (0 apagado, 1 normal).
export const HACES = `
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*u_res)/u_res.y;
  float t=u_t*.35;
  vec2 m=(u_mouse-.5)*.35;
  uv+=m*.25;
  // ligera perspectiva: los haces se abren hacia la derecha
  float persp=1.+uv.x*.55;
  vec3 col=vec3(.0,.004,.012);
  for(int i=0;i<5;i++){
    float fi=float(i);
    float ph=fi*1.73+u_scroll*6.2831;
    float y=.22*sin(uv.x*(1.6+fi*.21)+t*(.6+fi*.07)+ph)
           +.10*sin(uv.x*(3.4-fi*.3)-t*.9+fi)
           +(fi-2.)*.07*persp - .16 + uv.x*.22 + m.y*.4;
    float d=abs(uv.y-y)/persp;
    float w=.0016+.0011*fi;
    float nucleo=w/(d+.0006);
    float halo=.012/(d*14.+.03);
    // pulso que recorre el filamento
    float s=fract(uv.x*.25-t*(.18+fi*.03)+fi*.37);
    float pulso=exp(-pow(s-.5,2.)*260.);
    vec3 c=mix(vec3(.10,.36,1.),vec3(.35,.86,1.),.5+.5*sin(fi*1.3));
    float desv=smoothstep(-1.1,.2,uv.x)*(1.-smoothstep(.75,1.25,uv.x));
    col+=c*(nucleo*.32+halo*.16+pulso*nucleo*2.2)*desv*u_extra;
  }
  // volumen tenue
  col+=vec3(.02,.06,.18)*exp(-dot(uv-vec2(.35,-.05),uv-vec2(.35,-.05))*2.6)*u_extra;
  float vin=smoothstep(1.25,.25,length(uv*vec2(.9,1.15)));
  col*=vin;
  col=1.-exp(-col*1.35);
  col+=(hash(gl_FragCoord.xy+fract(u_t)*91.)-.5)*.035;
  gl_FragColor=vec4(col,1.);
}`;

// Nebulosa en movimiento (inspiración: Psychoactive). Ruido fractal con distorsión de dominio, tonos noche,
// cian y un toque magenta. u_extra: mezcla hacia un tono más cálido al final de la página.
export const NEBULOSA = `
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<6;i++){v+=a*noise(p);p=r*p*2.02;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res.y;
  float t=u_t*.035;
  vec2 m=(u_mouse-.5)*.25;
  vec2 q=vec2(fbm(uv*1.4+t+m),fbm(uv*1.4-t*.8+3.1));
  vec2 r=vec2(fbm(uv*1.8+q*2.2+vec2(1.7,9.2)+t*1.3),fbm(uv*1.8+q*2.2+vec2(8.3,2.8)-t));
  float f=fbm(uv*1.6+r*2.4+u_scroll*1.5);
  vec3 noche=vec3(.035,.045,.075);
  vec3 cian=vec3(.10,.42,.62);
  vec3 magenta=vec3(.42,.12,.40);
  vec3 col=mix(noche,cian,smoothstep(.35,.85,f)*.75);
  col=mix(col,magenta,smoothstep(.55,.95,r.x)*.35*(.4+u_extra));
  col+=vec3(.6,.8,1.)*pow(smoothstep(.62,1.,f),3.)*.35;
  col*=.55+.45*smoothstep(1.4,.2,length((gl_FragCoord.xy/u_res-.5)*vec2(1.2,1.)));
  col+=(hash(gl_FragCoord.xy+fract(u_t)*57.)-.5)*.045;
  gl_FragColor=vec4(col,1.);
}`;
