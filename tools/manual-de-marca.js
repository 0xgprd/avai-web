// Manual de marca de AVAI Labs en PDF (A4 apaisado), con el logo definitivo de noviembre de 2026.
//
//   node tools/manual-de-marca.js <salida.pdf>
//
// Necesita Chrome y la vista local `node server.js` (de ella salen los haces de luz y las capturas de la web).
// Todo lo que dice el manual sale de la web publicada y de sus estilos: colores de css/portada.css, tipografías,
// textos de la portada y reglas de AVAI (CLAUDE.md). Los logos salen de tools/construir-marca.js.
const fs = require('fs');
const os = require('os');
const path = require('path');
const url = require('url');
const M = require('./construir-marca.js');

const ROOT = path.join(__dirname, '..');
const BASE = process.env.VISTA || 'http://localhost:5500/';
const salida = process.argv[2];
if (!salida) { console.error('Uso: node tools/manual-de-marca.js <salida.pdf>'); process.exit(1); }

const archivo = p => url.pathToFileURL(p).href;
const svg = s => M.dataSvg(s);

// --- Logos -------------------------------------------------------------------------------------------------------
const L = {
  claras: svg(M.logo('oscuro')), oscuras: svg(M.logo('claro')),
  blanco: svg(M.logoMono('#ffffff')), negro: svg(M.logoMono('#0b0d12')),
  sim: svg(M.simboloSvg()), simB: svg(M.simboloMonoSvg('#ffffff')), simN: svg(M.simboloMonoSvg('#0b0d12')),
  // Uso incorrecto: el ojo relleno (en el logo es un hueco)
  ojoRelleno: svg(M.logo('oscuro').replace('<circle cx="262"', `<path d="${M.OJO}" fill="#ffffff" clip-path="url(#sc)"/><circle cx="262"`)),
};

// --- Colores (css/portada.css y los del símbolo, medidos en el original) -------------------------------------------
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(' · ');
const INTERFAZ = [
  ['Negro', '#000000', 'Fondo principal de la web y de las piezas oscuras.'],
  ['Tinta', '#F3F5FA', 'Texto y letras del logo sobre oscuro.'],
  ['Gris', '#8A90A3', 'Texto secundario, menú y «LABS».'],
  ['Tenue', '#4B5163', 'Texto atenuado, como la segunda línea del titular.'],
  ['Cian', '#5AD8FF', 'Acento sobre oscuro: el haz, las esquinas y la palabra en itálica.'],
  ['Azul', '#2F6BFF', 'Enlaces, botón azul y el haz sobre fondo claro.'],
  ['Crema', '#F3EFE7', 'Fondo de las secciones claras.'],
  ['Grafito', '#111318', 'Texto sobre crema.'],
  ['Oro', '#8B6A2B', 'Acento sobre crema: la palabra en itálica y los detalles.'],
];
const SIMBOLO = [
  ['Aguamarina', '#3CF2DC', 'Cresta de la ola'], ['Turquesa', '#14B4C4', 'Banda interior de la cresta'], ['Acero', '#157ABB', 'Borde de la cresta'],
  ['Celeste', '#33B5F1', 'Primera franja bajo el ojo'], ['Océano', '#2682DD', 'Franjas centrales'], ['Marino', '#114593', 'Fondo de la ola'],
  ['Abismo', '#082558', 'Sombra junto al ojo'],
];

// --- Capturas de la web local ----------------------------------------------------------------------------------------
async function capturas(dir, c) {
  const solo = 'body *{visibility:hidden!important}#gl{visibility:visible!important}';
  fs.writeFileSync(path.join(dir, 'haces.jpg'), await c.captura({ url: BASE, W: 1754, H: 1240, formato: 'jpeg', calidad: 92, espera: 5000, css: solo }));
  fs.writeFileSync(path.join(dir, 'web.jpg'), await c.captura({ url: BASE, W: 1440, H: 900, formato: 'jpeg', calidad: 90, espera: 6000 }));
  fs.writeFileSync(path.join(dir, 'pie.jpg'), await c.captura({ url: BASE, W: 1440, H: 900, formato: 'jpeg', calidad: 90, espera: 6000,
    antes: 'window.lenis?.scrollTo?.(document.documentElement.scrollHeight, { immediate: true }); window.scrollTo(0, document.documentElement.scrollHeight)' }));
  console.log('  capturas de la web');
}

// --- Piezas de maquetación ---------------------------------------------------------------------------------------------
let num = 0; const TOTAL = 16;
const pagina = (tema, seccion, cuerpo, { sinPie = false, clase = '' } = {}) => {
  num++;
  return `<section class="pag ${tema} ${clase}">${cuerpo}${sinPie ? '' : `<footer class="pp"><span>AVAI Labs · Manual de marca</span><span>${seccion}</span><span>${String(num).padStart(2, '0')} / ${TOTAL}</span></footer>`}</section>`;
};
const rot = t => `<p class="rot">[ ${t} ]</p>`;

function html(dir) {
  const og = archivo(path.join(ROOT, 'assets', 'og-avai.jpg'));
  const P = [];

  // 1 · Portada
  P.push(pagina('n', '', `<div class="fondo" style="background-image:url(haces.jpg)"></div><div class="velo"></div>
    <div class="portada"><img class="p-logo" src="${L.claras}" alt="AVAI Labs">
      <div><p class="rot">[ Versión 1.0 · Noviembre de 2026 ]</p><h1 class="gigante">Manual<br><span class="serif">de marca.</span></h1></div>
      <div class="p-pie"><span>Logotipo · Color · Tipografía · Voz</span><span>avai-labs.com</span></div></div>`, { sinPie: true }));

  // 2 · Contenido
  const indice = ['La marca', 'El símbolo', 'El logotipo', 'Versiones', 'Espacio y tamaño mínimo', 'Usos incorrectos', 'Color', 'Tipografía',
    'Elementos gráficos y movimiento', 'Voz y tono', 'Aplicaciones', 'Archivos'];
  P.push(pagina('n', 'Contenido', `${rot('Contenido')}<h2>Qué hay en <span class="serif">este manual.</span></h2>
    <p class="lead">Las reglas para usar la marca AVAI Labs igual en la web, en redes, en documentos y en papel. Sirve para el equipo y para cualquier proveedor que trabaje con la marca.</p>
    <ol class="indice">${indice.map((t, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${t}</li>`).join('')}</ol>`));

  // 3 · La marca
  P.push(pagina('c', '01 · La marca', `${rot('01 · La marca')}<h2>La inteligencia detrás <span class="serif">de cada web.</span></h2>
    <div class="dos"><div>
      <p class="lead">AVAI Labs es una agencia de diseño web e inteligencia artificial. Ayudamos a empresas de España y Francia a crecer con webs que impresionan, asistentes que atienden solos y automatizaciones que ahorran horas, todo bajo un mismo techo.</p>
      <p class="frase">Webs que venden.<br><span>IA que atiende.</span></p>
      <p class="nota">Es el titular de la portada y la promesa de la marca, en francés: «Des sites qui vendent. Une IA qui répond.»</p>
    </div><dl class="datos">
      <dt>El nombre</dt><dd>AVAI viene de <b>Atlantic Vision AI</b>: el Atlántico, la visión y la inteligencia artificial.</dd>
      <dt>Servicios principales</dt><dd>Diseño y desarrollo web · Chatbots 24/7 y citas · Automatizaciones a medida</dd>
      <dt>Complementos</dt><dd>Marketing digital · Producción audiovisual y eventos</dd>
      <dt>Idiomas</dt><dd>Español y francés, con la misma calidad en los dos.</dd>
      <dt>Dónde</dt><dd>Clientes en España y Francia; la base está en Tenerife.</dd>
    </dl></div>
    <div class="metodo"><p class="rot">[ Método · Del primer café a tu web publicada ]</p><ol>
      <li><span>01</span><b>Análisis</b>Entendemos tu negocio y a tus clientes.</li><li><span>02</span><b>Diseño</b>Una identidad y un recorrido a tu medida.</li>
      <li><span>03</span><b>Lanzamiento</b>Web, chatbot y agenda funcionando.</li><li><span>04</span><b>Mejora</b>Medimos y afinamos de forma continua.</li></ol></div>`));

  // 4 · El símbolo
  P.push(pagina('n', '02 · El símbolo', `<div class="dos simb"><div class="simb-g"><img src="${L.sim}" alt=""></div><div>
      ${rot('02 · El símbolo')}<h2>Una ola que se abre <span class="serif">en un ojo.</span></h2>
      <p class="lead">El símbolo dibuja el nombre. La ola es el Atlántico y el ojo es la visión: mirar el negocio del cliente antes de diseñar nada.</p>
      <ul class="puntos">
        <li><b>Todo es concéntrico.</b> La cresta aguamarina sigue el borde del círculo y las franjas azules siguen la curva del ojo, como una ola que rompe.</li>
        <li><b>El ojo es un hueco.</b> Deja ver el fondo: negro en la web oscura, crema en las secciones claras. Nunca se rellena.</li>
        <li><b>El iris mira hacia las letras.</b> Los dos brillos son blancos.</li>
        <li><b>Origen.</b> Es el símbolo original de AVAI, redibujado en vectorial en noviembre de 2026 sin cambiar su forma, para que se vea nítido a cualquier tamaño.</li>
      </ul></div></div>`));

  // 5 · El logotipo
  P.push(pagina('n', '03 · El logotipo', `${rot('03 · El logotipo')}<h2>El haz que <span class="serif">cruza la A.</span></h2>
    <div class="anat"><img src="${L.claras}" alt="">
      <span class="eti e1"><i></i>Símbolo</span><span class="eti e2"><i></i>El haz de luz: travesaño de la primera A</span>
      <span class="eti e3"><i></i>AVAI: trazo fino de grosor constante</span><span class="eti e4"><i></i>LABS, tras una línea fina</span></div>
    <div class="tres"><p><b>El haz sale del ojo</b> y hace de travesaño de la primera A. Es la misma luz que recorre el fondo de la web.</p>
      <p><b>La A y la V se solapan</b> y las letras se cortan en horizontal arriba y abajo. Son letras dibujadas, no una fuente: no se reescriben con el teclado.</p>
      <p><b>Proporción.</b> El símbolo mide 1,3 veces la altura de las letras y se centra con ellas. Las piezas no se separan ni se recolocan.</p></div>`));

  // 6 · Versiones
  const ver = (fondo, src, t, d, cls = '') => `<figure class="ver ${fondo} ${cls}"><div><img src="${src}" alt=""></div><figcaption><b>${t}</b>${d}</figcaption></figure>`;
  P.push(pagina('n', '04 · Versiones', `${rot('04 · Versiones')}<h2>Una marca, <span class="serif">seis versiones.</span></h2>
    <div class="vers">
      ${ver('fn', L.claras, 'Principal', 'Color con letras claras, sobre negro o fondos oscuros. Es la de la web.')}
      ${ver('fc', L.oscuras, 'Sobre claro', 'Color con letras oscuras, sobre crema, blanco o fondos claros.')}
      ${ver('fn', L.sim, 'Símbolo', 'Cuando el espacio es pequeño o cuadrado: favicon, avatar, sello.', 'cuad')}
      ${ver('fa', L.blanco, 'Una tinta, blanco', 'Sobre fotos o fondos de color, y para grabado o vinilo.')}
      ${ver('fb', L.negro, 'Una tinta, negro', 'Impresión a una tinta, sellos y documentos en blanco y negro.')}
      ${ver('fn', svg(M.simboloMonoSvg('#ffffff')), 'Símbolo a una tinta', 'Para bordar, grabar o estampar en un solo color.', 'cuad')}
    </div>`));

  // 7 · Espacio y tamaño mínimo
  P.push(pagina('c', '05 · Espacio y tamaño mínimo', `${rot('05 · Espacio y tamaño mínimo')}<h2>Aire alrededor <span class="serif">y un tamaño mínimo.</span></h2>
    <div class="dos esp"><div class="zona"><div class="caja"><img src="${L.oscuras}" alt=""><span class="x x1">x</span><span class="x x2">x</span><span class="x x3">x</span><span class="x x4">x</span><span class="radio"></span></div></div>
    <div><p class="lead">Alrededor del logo queda libre, como mínimo, un espacio igual al radio del símbolo (x). Ningún texto, borde ni imagen entra en esa zona.</p>
      <table class="tabla"><tr><th></th><th>Pantalla</th><th>Papel</th></tr>
        <tr><td>Logotipo completo</td><td>140 px de ancho</td><td>40 mm de ancho</td></tr>
        <tr><td>Símbolo solo</td><td>16 px</td><td>6 mm</td></tr></table>
      <p class="nota">Por debajo del mínimo, «LABS» deja de leerse: usa el símbolo solo. En la web la cabecera lo muestra a 36 px de alto (151 px de ancho).</p>
      <div class="minimos"><figure><img src="${L.oscuras}" style="width:40mm" alt=""><figcaption>40 mm</figcaption></figure><figure><img src="${L.sim}" style="width:6mm" alt=""><figcaption>6 mm</figcaption></figure></div>
    </div></div>`));

  // 8 · Usos incorrectos
  const mal = (fondo, src, estilo, t) => `<figure class="mal ${fondo}"><div><img src="${src}" style="${estilo}" alt=""><i class="no"></i></div><figcaption>${t}</figcaption></figure>`;
  P.push(pagina('c', '06 · Usos incorrectos', `${rot('06 · Usos incorrectos')}<h2>Lo que <span class="serif">no se hace.</span></h2>
    <div class="males">
      ${mal('fc', L.oscuras, 'transform:scaleX(1.45)', '<b>No deformarlo.</b> Se escala siempre en proporción.')}
      ${mal('fc', L.oscuras, 'filter:hue-rotate(150deg) saturate(1.5)', '<b>No cambiar sus colores.</b> Solo las versiones de este manual.')}
      ${mal('fn', L.ojoRelleno, '', '<b>No rellenar el ojo.</b> Es un hueco que deja ver el fondo.')}
      ${mal('fc', L.claras, '', '<b>No poner letras claras sobre fondo claro.</b> Sobre claro va la versión de letras oscuras.')}
      ${mal('fc', L.oscuras, 'filter:drop-shadow(5px 7px 4px rgba(0,0,0,.45)) drop-shadow(0 0 10px rgba(47,107,255,.6))', '<b>No añadir sombras ni efectos.</b> El único brillo es el del haz.')}
      ${mal('fc', L.oscuras, 'transform:rotate(-14deg)', '<b>No girarlo ni inclinarlo.</b> Va siempre en horizontal.')}
    </div>`));

  // 9 · Color de la marca
  const fichas = INTERFAZ.map(([n, h, u]) => `<div class="ficha"><i style="background:${h}"></i><b>${n}</b><span>${h} · RGB ${rgb(h)}</span><em>${u}</em></div>`).join('');
  P.push(pagina('n', '07 · Color', `${rot('07 · Color')}<h2>Negro, tinta <span class="serif">y un acento cian.</span></h2>
    <p class="lead corta">El negro domina. El cian es un acento y se usa poco: el haz, una palabra en itálica, una esquina. Las secciones claras cambian a crema, con grafito para el texto y oro como acento.</p>
    <div class="fichas">${fichas}</div>`));

  // 10 · Colores del símbolo
  P.push(pagina('n', '07 · Color', `<div class="dos simb"><div class="simb-g peq"><img src="${L.sim}" alt=""></div><div>
    ${rot('07 · Color del símbolo')}<h2>Los colores <span class="serif">de la ola.</span></h2>
    <p class="lead corta">El símbolo pasa del aguamarina de la cresta al azul abismo de la sombra. Sus colores son solo del símbolo: no se usan como fondos ni para texto.</p>
    <div class="ola">${SIMBOLO.map(([n, h, u]) => `<div><i style="background:${h}"></i><b>${n}</b><span>${h}</span><span>RGB ${rgb(h)}</span><em>${u}</em></div>`).join('')}</div>
    <p class="nota">Para imprimir, pide a la imprenta una prueba de color: los degradados del símbolo se ajustan mejor sobre papel con una prueba que con una conversión automática.</p></div></div>`));

  // 11 · Tipografía
  P.push(pagina('n', '08 · Tipografía', `${rot('08 · Tipografía')}<h2>Tres letras, <span class="serif">cada una con su papel.</span></h2>
    <div class="tipos">
      <div><p class="t-nom" style="font:300 30pt/1 'Inter Tight';letter-spacing:-.04em">Inter Tight</p><p class="t-mue" style="font:300 15pt/1.1 'Inter Tight';letter-spacing:-.03em">Webs que venden.</p>
        <p class="t-uso"><b>Titulares y texto.</b> Titulares en fina (300) con el espaciado cerrado; texto en normal (400). Pesos: 300, 400, 500 y 600.</p></div>
      <div><p class="t-nom" style="font:italic 400 32pt/1 'Instrument Serif'">Instrument Serif</p><p class="t-mue" style="font:italic 400 17pt/1.1 'Instrument Serif';color:#5ad8ff">un solo equipo.</p>
        <p class="t-uso"><b>El acento.</b> En itálica, solo para una o dos palabras dentro de un titular, en cian sobre oscuro y en oro sobre crema.</p></div>
      <div><p class="t-nom" style="font:500 21pt/1.15 'JetBrains Mono',ui-monospace,Consolas,monospace;letter-spacing:-.01em">JetBrains Mono</p><p class="t-mue" style="font:500 9pt/1.4 'JetBrains Mono',ui-monospace,Consolas,monospace;letter-spacing:.16em;text-transform:uppercase">[ 01 · Servicio ]</p>
        <p class="t-uso"><b>Etiquetas y botones.</b> En mayúsculas, con letras muy espaciadas: rótulos de sección, menú, botones y datos.</p></div>
    </div>
    <div class="combo"><p class="rot">[ Agencia de diseño web e inteligencia artificial ]</p><p class="combo-h">Cinco servicios, <span class="serif">un solo equipo.</span></p>
      <p class="combo-p">Ayudamos a empresas de España y Francia a crecer con webs que impresionan, asistentes que atienden solos y automatizaciones que ahorran horas.</p>
      <span class="btn-esq">Consulta gratuita →</span><span class="pill">Ver el servicio →</span></div>
    <p class="nota abajo">Las tres son de Google Fonts, gratuitas y con licencia para uso comercial. Si un programa no las tiene, se instalan desde fonts.google.com; no se sustituyen por otras.</p>`));

  // 12 · Elementos gráficos y movimiento
  P.push(pagina('n', '09 · Elementos gráficos y movimiento', `${rot('09 · Elementos gráficos y movimiento')}<h2>Luz, esquinas <span class="serif">y calma.</span></h2>
    <div class="dos elem"><div class="elems">
      <figure><div class="haces" style="background-image:url(haces.jpg)"></div><figcaption><b>Haces de luz.</b> Líneas de luz azul y cian sobre negro, el fondo de la web.</figcaption></figure>
      <figure><div class="cuadro"><span class="btn-esq">Consulta gratuita →</span></div><figcaption><b>Esquinas.</b> Cuatro esquinas finas en cian marcan los botones y los paneles.</figcaption></figure>
      <figure><div class="cuadro"><span class="rot sin">[ 01 · Servicio principal ]</span></div><figcaption><b>Corchetes.</b> Las etiquetas en mono van entre corchetes.</figcaption></figure>
      <figure><div class="cuadro hoja"><i></i></div><figcaption><b>La hoja crema.</b> Las secciones claras entran como una hoja con las esquinas de arriba redondeadas.</figcaption></figure>
    </div><div><p class="lead corta">El movimiento acompaña la lectura, nunca la interrumpe.</p><ul class="puntos">
      <li><b>El haz del logo</b> se enciende una vez al cargar, de izquierda a derecha, en 1,2 segundos y con una salida suave.</li>
      <li><b>Los haces del fondo</b> se mueven despacio con el scroll.</li>
      <li><b>Los titulares</b> aparecen línea a línea; los bloques suben un poco mientras se funden.</li>
      <li><b>Siempre:</b> si la persona tiene activado «reducir movimiento», todo queda quieto y visible.</li>
    </ul></div></div>`));

  // 13 · Voz y tono
  P.push(pagina('c', '10 · Voz y tono', `${rot('10 · Voz y tono')}<h2>Hablamos claro <span class="serif">y con datos reales.</span></h2>
    <div class="voz">
      <div><b>Frases cortas y concretas.</b><p>Un titular dice una cosa. «Webs que venden. IA que atiende.» «Del primer café a tu web publicada.»</p></div>
      <div><b>Tú en español, vous en francés.</b><p>«Cuéntanos tu negocio» y «Parlez-nous de votre activité». Cercanos, sin perder la profesionalidad.</p></div>
      <div><b>Solo datos reales.</b><p>Nada de testimonios, cifras, clientes ni logos de empresas inventados. Si no hay testimonios, esa sección no se hace.</p></div>
      <div><b>«Nuestro portafolio».</b><p>Las webs de muestra se presentan así, con marcas ficticias y sin cifras de resultados.</p></div>
      <div><b>Agencia de España y Francia.</b><p>Así nos presentamos en titulares y descripciones. Tenerife aparece en los datos de contacto, no en los titulares.</p></div>
      <div><b>Bilingües de verdad.</b><p>Cada idioma con su tipografía. En francés va un espacio fino antes de : ; ? ! y dentro de las comillas francesas.</p></div>
      <div><b>Sin jerga.</b><p>Explicamos lo que hace la tecnología por el negocio, no cómo está hecha por dentro.</p></div>
      <div><b>Imágenes con permiso.</b><p>Del cliente, propias o con licencia para uso comercial, con sus créditos guardados. Nunca copiadas de otra web.</p></div>
    </div>`));

  // 14 · Aplicaciones
  P.push(pagina('n', '11 · Aplicaciones', `${rot('11 · Aplicaciones')}<h2>La marca <span class="serif">en uso.</span></h2>
    <div class="apps">
      <figure class="a1"><img src="web.jpg" alt=""><figcaption><b>Web.</b> Cabecera con la versión principal sobre los haces de luz.</figcaption></figure>
      <figure class="a2"><img src="pie.jpg" alt=""><figcaption><b>Pie de la web.</b> Versión de letras oscuras sobre la sección clara.</figcaption></figure>
      <figure class="a3"><img src="${og}" alt=""><figcaption><b>Imagen para compartir.</b> La que se ve al enviar el enlace por WhatsApp o en redes, en español y en francés.</figcaption></figure>
      <figure class="a4"><div class="iconos"><img class="av" src="${archivo(path.join(ROOT, 'assets', 'apple-touch-icon.png'))}" alt=""><div class="pest"><img src="${L.sim}" alt=""><span>AVAI Labs · Agencia de diseño web e IA</span><i>×</i></div></div>
        <figcaption><b>Icono y avatar.</b> El símbolo solo: en la pestaña del navegador, en el móvil y como foto de perfil sobre negro.</figcaption></figure>
    </div>`));

  // 15 · Archivos
  const filas = [
    ['logo-color-letras-claras', 'Versión principal, sobre fondos oscuros'], ['logo-color-letras-oscuras', 'Sobre fondos claros'],
    ['logo-una-tinta-blanco / -negro', 'A una tinta, para impresión, grabado o vinilo'], ['simbolo-color', 'Símbolo solo, para espacios pequeños o cuadrados'],
    ['simbolo-una-tinta-blanco / -negro', 'Símbolo a una tinta'], ['avatar-simbolo-sobre-negro', 'Foto de perfil e icono de app'],
  ];
  P.push(pagina('c', '12 · Archivos', `${rot('12 · Archivos')}<h2>Dónde están <span class="serif">los archivos.</span></h2>
    <div class="dos"><div><p class="lead corta">Cada versión está en SVG (vectorial, para imprenta y diseño) y en PNG transparente de alta resolución (para documentos, redes y presentaciones).</p>
      <p class="ruta">Google Drive › 4.AVAI Labs › Marca › Logo definitivo (nov-2026)</p>
      <table class="tabla arch">${filas.map(([a, u]) => `<tr><td>${a}</td><td>${u}</td></tr>`).join('')}</table></div>
    <div><dl class="datos">
      <dt>En la web</dt><dd>avai-labs.com/assets/logo-avai.svg, logo-avai-claro.svg y simbolo-avai.svg</dd>
      <dt>Origen</dt><dd>Todos los archivos salen de tools/construir-marca.js, en el repositorio de la web. Un cambio se hace ahí y se regeneran todos a la vez, para que no haya versiones distintas sueltas.</dd>
      <dt>Versiones anteriores</dt><dd>Los logos antiguos de las carpetas «Logos AVAI Labs» e «historico» ya no se usan.</dd>
      <dt>Contacto</dt><dd>info@avai-labs.com · avai-labs.com</dd></dl></div></div>`));

  // 16 · Contraportada
  P.push(pagina('n', '', `<div class="fondo" style="background-image:url(haces.jpg)"></div><div class="velo v2"></div>
    <div class="contra"><img src="${L.sim}" alt=""><p class="frase">Webs que venden.<br><span>IA que atiende.</span></p><p class="rot">[ avai-labs.com · info@avai-labs.com ]</p></div>`, { sinPie: true }));

  if (num !== TOTAL) throw new Error(`el manual tiene ${num} páginas y TOTAL dice ${TOTAL}`);
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>AVAI Labs · Manual de marca</title>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>${P.join('\n')}</body></html>`;
}

const CSS = `
@page{size:297mm 210mm;margin:0}
*{box-sizing:border-box}
html,body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font:400 10pt/1.5 'Inter Tight',sans-serif}
.pag{width:297mm;height:210mm;position:relative;overflow:hidden;break-after:page;padding:15mm 18mm 20mm}
.n{background:#000;color:#f3f5fa}.c{background:#f3efe7;color:#111318}
.pp{position:absolute;left:18mm;right:18mm;bottom:8mm;display:flex;justify-content:space-between;padding-top:3mm;border-top:.3mm solid rgba(255,255,255,.12);
  font:500 6.5pt/1 'JetBrains Mono',ui-monospace,Consolas,monospace;letter-spacing:.16em;text-transform:uppercase;color:#4b5163}
.c .pp{border-color:rgba(17,19,24,.12);color:#8b8f99}
.rot{margin:0 0 5mm;font:500 7.5pt/1.3 'JetBrains Mono',ui-monospace,Consolas,monospace;letter-spacing:.16em;text-transform:uppercase;color:#5ad8ff}
.c .rot{color:#8b6a2b}.rot.sin{margin:0}
h2{margin:0 0 7mm;font:300 30pt/1.02 'Inter Tight';letter-spacing:-.045em;max-width:220mm}
.serif{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;letter-spacing:-.01em;color:#5ad8ff}
.c .serif{color:#8b6a2b}
p{margin:0}
.lead{font:400 11.5pt/1.5 'Inter Tight';color:#a7adbd;max-width:150mm;margin-bottom:6mm}.c .lead{color:#3a3d45}.lead.corta{max-width:120mm}
.nota{font:400 8.5pt/1.5 'Inter Tight';color:#6b7285;max-width:130mm}.c .nota{color:#6c6f78}.nota.abajo{margin-top:7mm}
b{font-weight:600}
.dos{display:grid;grid-template-columns:1fr 1fr;gap:14mm;align-items:start}
.tres{display:grid;grid-template-columns:repeat(3,1fr);gap:10mm;margin-top:8mm}.tres p{font-size:10.5pt;color:#a7adbd;line-height:1.55}.tres b{color:#f3f5fa}
.puntos{margin:0;padding:0;list-style:none}.puntos li{position:relative;padding-left:7mm;margin-bottom:3.2mm;font-size:10pt;color:#a7adbd;line-height:1.5}
.puntos li::before{content:"";position:absolute;left:0;top:2.6mm;width:3.5mm;height:.3mm;background:#5ad8ff}.puntos b{color:#f3f5fa}
/* Portada y contraportada */
.fondo{position:absolute;inset:0;background:center/cover}.velo{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.88),rgba(0,0,0,.45) 60%,rgba(0,0,0,.15))}
.velo.v2{background:radial-gradient(ellipse at center,rgba(0,0,0,.55),rgba(0,0,0,.85))}
.portada{position:absolute;inset:16mm 18mm 14mm;display:flex;flex-direction:column;justify-content:space-between}
.p-logo{height:17mm;width:auto;align-self:flex-start}
.gigante{margin:0;font:300 70pt/.92 'Inter Tight';letter-spacing:-.055em}
.p-pie{display:flex;justify-content:space-between;font:500 7.5pt/1 'JetBrains Mono',ui-monospace,Consolas,monospace;letter-spacing:.16em;text-transform:uppercase;color:#8a90a3}.p-pie span:last-child{color:#5ad8ff}
.contra{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:9mm}
.contra img{width:46mm}.contra .frase{font-size:26pt}
/* Contenido */
.indice{list-style:none;margin:4mm 0 0;padding:0;columns:2;column-gap:16mm;max-width:210mm}
.indice li{break-inside:avoid;display:flex;gap:6mm;align-items:baseline;padding:5.2mm 0;border-bottom:.3mm solid rgba(255,255,255,.1);font:300 19pt/1.1 'Inter Tight';letter-spacing:-.02em}
.indice span{font:500 7.5pt/1 'JetBrains Mono',ui-monospace,Consolas,monospace;letter-spacing:.14em;color:#5ad8ff}
/* La marca */
.frase{font:300 24pt/1 'Inter Tight';letter-spacing:-.045em;margin:2mm 0 4mm}.frase span{color:#4b5163}.c .frase span{color:#9a9ca3}
.datos{margin:0;display:grid;grid-template-columns:34mm 1fr;gap:3.2mm 6mm;font-size:9.5pt;line-height:1.45}
.datos dt{font:500 6.8pt/1.6 'JetBrains Mono',ui-monospace,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:#8b6a2b;padding-top:.6mm}.n .datos dt{color:#5ad8ff}
.datos dd{margin:0;padding-bottom:3.2mm;border-bottom:.3mm solid rgba(17,19,24,.1)}.n .datos dd{border-color:rgba(255,255,255,.1);color:#a7adbd}
.metodo{position:absolute;left:18mm;right:18mm;bottom:22mm}.metodo ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,1fr);gap:8mm}
.metodo li{border-top:.3mm solid rgba(17,19,24,.14);padding-top:3mm;font-size:9pt;color:#3a3d45;line-height:1.45}.metodo li span{display:block;font:500 6.8pt/1 'JetBrains Mono',ui-monospace,Consolas,monospace;letter-spacing:.14em;color:#8b6a2b;margin-bottom:2mm}
.metodo li b{display:block;font:300 15pt/1.1 'Inter Tight';letter-spacing:-.03em;color:#111318;margin-bottom:1mm}
/* Símbolo */
.simb{grid-template-columns:118mm 1fr;align-items:center;height:100%}
.simb-g{display:grid;place-items:center;height:160mm}.simb-g img{width:112mm}.simb-g.peq img{width:96mm}
/* Logotipo */
.anat{position:relative;height:96mm;margin:4mm 0 2mm;border:.3mm solid rgba(255,255,255,.08);display:grid;place-items:center}
.anat img{width:232mm}
.eti{position:absolute;font:500 6.8pt/1.3 'JetBrains Mono',ui-monospace,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase;color:#8a90a3}
.eti i{position:absolute;background:#5ad8ff}
.e1{left:11mm;top:6mm}.e1 i{left:14mm;top:5mm;width:.3mm;height:15mm}
.e2{left:84mm;bottom:6mm}.e2 i{left:12mm;bottom:5mm;width:.3mm;height:36mm}
.e3{left:150mm;top:6mm}.e3 i{left:10mm;top:5mm;width:.3mm;height:17mm}
.e4{right:16mm;bottom:6mm}.e4 i{right:20mm;bottom:5mm;width:.3mm;height:28mm}
/* Versiones */
.vers{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm}
.ver{margin:0}.ver>div{height:44mm;display:grid;place-items:center;border-radius:2mm}
.ver img{width:66mm}.ver.cuad img{width:28mm}
.fn>div{background:#0b0d12;border:.3mm solid rgba(255,255,255,.08)}.fc>div{background:#f3efe7}.fa>div{background:#2f6bff}.fb>div{background:#ffffff}
.ver figcaption,.mal figcaption{margin-top:2.5mm;font-size:8.5pt;line-height:1.45;color:#a7adbd}.ver figcaption b{display:block;color:#f3f5fa;margin-bottom:.5mm}
/* Espacio */
.esp{grid-template-columns:150mm 1fr;align-items:center}
.zona{background:#fff;border-radius:2mm;padding:24mm 0;display:grid;place-items:center}
.caja{position:relative;padding:12.5mm;border:.3mm dashed #8b6a2b}.caja img{display:block;width:115mm;outline:.3mm solid rgba(139,106,43,.35)}
.x{position:absolute;font:italic 400 13pt/1 'Instrument Serif';color:#8b6a2b}.x1{left:4.5mm;top:50%;transform:translateY(-50%)}.x2{right:4.5mm;top:50%;transform:translateY(-50%)}
.x3{left:50%;top:3.5mm}.x4{left:50%;bottom:3.5mm}
.tabla{border-collapse:collapse;width:100%;margin:2mm 0 5mm;font-size:9.5pt}.tabla th{text-align:left;font:500 6.8pt/1 'JetBrains Mono',ui-monospace,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:#8b6a2b;padding:0 0 2.5mm}
.tabla td{padding:2.6mm 0;border-top:.3mm solid rgba(17,19,24,.12)}.tabla td:first-child{font-weight:500}
.minimos{display:flex;gap:12mm;align-items:flex-end;margin-top:6mm}.minimos figure{margin:0}.minimos figcaption{font:500 6.5pt/1 'JetBrains Mono',ui-monospace,Consolas,monospace;letter-spacing:.14em;color:#8b6a2b;margin-top:2mm}
/* Usos incorrectos */
.males{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm}
.mal{margin:0}.mal>div{position:relative;height:42mm;display:grid;place-items:center;border-radius:2mm;overflow:hidden}
.mal.fc>div{background:#e9e4d9}.mal.fn>div{background:#0b0d12}.mal img{width:56mm}
.no{position:absolute;right:3mm;top:3mm;width:6mm;height:6mm;border-radius:50%;background:#d6453d}
.no::before,.no::after{content:"";position:absolute;left:1.5mm;top:2.85mm;width:3mm;height:.35mm;background:#fff;transform:rotate(45deg)}.no::after{transform:rotate(-45deg)}
.mal figcaption{color:#3a3d45}.mal figcaption b{color:#111318}
/* Color */
.fichas{display:grid;grid-template-columns:repeat(5,1fr);gap:5mm 5mm}
.ficha i{display:block;height:24mm;border-radius:1.5mm;margin-bottom:2.5mm;border:.3mm solid rgba(255,255,255,.14)}
.ficha b{display:block;font-size:10pt}.ficha span{display:block;font:500 6.4pt/1.5 'JetBrains Mono',ui-monospace,Consolas,monospace;letter-spacing:.06em;color:#8a90a3;margin:.6mm 0 1mm}
.ficha em{font-style:normal;font-size:7.8pt;line-height:1.4;color:#6b7285;display:block}
.ola{display:grid;grid-template-columns:repeat(7,1fr);gap:2.5mm;margin:2mm 0 6mm}
.ola i{display:block;height:30mm;border-radius:1.5mm;margin-bottom:2mm}.ola b{display:block;font-size:8.8pt}
.ola span{display:block;font:500 5.8pt/1.5 'JetBrains Mono',ui-monospace,Consolas,monospace;color:#8a90a3}.ola em{display:block;font-style:normal;font-size:7pt;line-height:1.35;color:#6b7285;margin-top:1mm}
/* Tipografía */
.tipos{display:grid;grid-template-columns:repeat(3,1fr);gap:9mm}
.tipos>div{border-top:.3mm solid rgba(255,255,255,.14);padding-top:5mm}
.t-mue{margin:6mm 0 4mm;color:#f3f5fa;zoom:1.35}.t-uso{font-size:9.6pt;line-height:1.5;color:#a7adbd}.t-uso b{color:#f3f5fa}
.combo{margin-top:12mm;padding:11mm 10mm;border-radius:2mm;background:#06070b;border:.3mm solid rgba(255,255,255,.08);display:grid;grid-template-columns:1fr auto auto;gap:2mm 8mm;align-items:center}
.combo .rot{grid-column:1/-1;margin:0 0 1mm}.combo-h{font:300 27pt/1 'Inter Tight';letter-spacing:-.045em}.combo-p{grid-column:1;font-size:9pt;color:#8a90a3;max-width:120mm}
.combo .btn-esq{grid-row:2/4;grid-column:2}.combo .pill{grid-row:2/4;grid-column:3}
.btn-esq{position:relative;display:inline-flex;padding:3mm 5mm;font:500 7.5pt/1 'JetBrains Mono',ui-monospace,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase;color:#f3f5fa;
  background:linear-gradient(#5ad8ff,#5ad8ff) 0 0/2.4mm .3mm no-repeat,linear-gradient(#5ad8ff,#5ad8ff) 0 0/.3mm 2.4mm no-repeat,
  linear-gradient(#5ad8ff,#5ad8ff) 100% 0/2.4mm .3mm no-repeat,linear-gradient(#5ad8ff,#5ad8ff) 100% 0/.3mm 2.4mm no-repeat,
  linear-gradient(#5ad8ff,#5ad8ff) 0 100%/2.4mm .3mm no-repeat,linear-gradient(#5ad8ff,#5ad8ff) 0 100%/.3mm 2.4mm no-repeat,
  linear-gradient(#5ad8ff,#5ad8ff) 100% 100%/2.4mm .3mm no-repeat,linear-gradient(#5ad8ff,#5ad8ff) 100% 100%/.3mm 2.4mm no-repeat}
.pill{display:inline-flex;padding:3.2mm 5mm;border-radius:99mm;background:#f3f5fa;color:#07080c;font:500 7.2pt/1 'JetBrains Mono',ui-monospace,Consolas,monospace;letter-spacing:.14em;text-transform:uppercase}
/* Elementos */
.elem{grid-template-columns:150mm 1fr}
.elems{display:grid;grid-template-columns:1fr 1fr;gap:5mm}.elems figure{margin:0}
.elems figure>div{height:50mm;border-radius:2mm;overflow:hidden}.haces{background:center/cover}
.cuadro{display:grid;place-items:center;background:#06070b;border:.3mm solid rgba(255,255,255,.08)}
.hoja{position:relative;background:#000}.hoja i{position:absolute;left:10mm;right:10mm;bottom:0;height:17mm;background:#f3efe7;border-radius:5mm 5mm 0 0}
.elems figcaption{margin-top:2mm;font-size:8.3pt;line-height:1.45;color:#a7adbd}.elems figcaption b{color:#f3f5fa}
/* Voz */
.voz{display:grid;grid-template-columns:repeat(2,1fr);gap:5.5mm 16mm}
.voz>div{border-top:.3mm solid rgba(17,19,24,.14);padding-top:3.5mm}.voz b{display:block;font-size:11.5pt;margin-bottom:1.2mm}.voz p{font-size:10pt;line-height:1.5;color:#3a3d45}
/* Aplicaciones */
.apps{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto;gap:5mm 7mm}
.apps figure{margin:0}.apps img{display:block;width:100%;border-radius:1.5mm;border:.3mm solid rgba(255,255,255,.1)}
.a1 img,.a2 img{height:60mm;object-fit:cover;object-position:top}.a2 img{object-position:bottom}.a3 img{height:60mm;object-fit:cover}
.apps figcaption{margin-top:2mm;font-size:8.3pt;line-height:1.45;color:#a7adbd}.apps figcaption b{color:#f3f5fa}
.iconos{height:60mm;border-radius:1.5mm;background:#0b0d12;border:.3mm solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;gap:9mm}
.iconos .av{width:24mm;height:24mm;border-radius:50%;border:0}
.pest{display:flex;align-items:center;gap:2.5mm;padding:2.6mm 3.5mm;background:#1d2029;border-radius:2mm 2mm 0 0;font-size:7.5pt;color:#d6d9e2}
.pest img{width:4.2mm;height:4.2mm;border:0;border-radius:0}.pest i{font-style:normal;color:#6b7285;margin-left:3mm}
/* Archivos */
.ruta{font:500 7.5pt/1.5 'JetBrains Mono',ui-monospace,Consolas,monospace;letter-spacing:.08em;color:#8b6a2b;margin:0 0 4mm}
.arch td:first-child{font:500 7.6pt/1.4 'JetBrains Mono',ui-monospace,Consolas,monospace;letter-spacing:.02em;width:62mm}
`;

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'avai-manual-'));
  const c = await M.chrome();
  try {
    await capturas(dir, c);
    const pagHtml = path.join(dir, 'manual.html');
    fs.writeFileSync(pagHtml, html(dir));
    fs.writeFileSync(salida, await c.pdf({ url: archivo(pagHtml), espera: 2500 }));
    if (process.argv.includes('--html')) fs.copyFileSync(pagHtml, salida.replace(/\.pdf$/, '.html'));
    console.log('  ' + salida);
  } finally { c.cerrar(); }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
