// Páginas de servicio en ESPAÑOL (30-oct-2026). Su pareja francesa está en servicios.fr.js, con el mismo
// `id` y el mismo orden. tools/construir.js genera con los dos /<slug>/ y /fr/<slug>/.
//
// Cada página es un recorrido 3D como la portada: hero (núcleo) → área (su sistema: escena 1, 2 o 3) →
// proceso (trayectoria) → casos (flujos) → preguntas (calma) → llamada final (núcleo final).
//
// REGLAS DEL TEXTO
// - Solo hechos ya publicados en la portada o en la landing de AVAI App: nada de precios, plazos,
//   cifras ni clientes inventados. Los casos describen lo que hace el sistema, no resultados medidos.
// - Imagen internacional: ni título ni H1 hablan de Tenerife o Canarias; la zona va en «¿Dónde trabajáis?».
// - Pocas palabras: la página la cuenta el recorrido, no la longitud.

const DONDE = {
  q: '¿Dónde trabajáis?',
  a: 'Con empresas de España y Francia. Trabajamos en remoto y, en persona, en Canarias, donde tenemos nuestra base.',
};

const FASES = [
  { t: 'Análisis', p: 'Estudiamos tu negocio y detectamos las oportunidades con mayor impacto.' },
  { t: 'Desarrollo', p: 'Diseñamos y construimos la solución a medida de tus necesidades reales.' },
  { t: 'Implementación', p: 'La integramos en tus herramientas y formamos a tu equipo para usarla.' },
  { t: 'Optimización', p: 'Medimos resultados y mejoramos de forma continua.' },
];

module.exports = [
  {
    id: 'ia',
    slug: 'agencia-inteligencia-artificial',
    menu: 'Inteligencia artificial y automatización',
    title: 'Agencia de inteligencia artificial para empresas · AVAI Labs',
    description: 'Agencia de inteligencia artificial para empresas: automatizaciones con IA, automatización de procesos e integraciones a medida para ahorrar tiempo y ganar productividad.',
    servicio: 'Automatización con inteligencia artificial',
    kicker: 'Inteligencia artificial y automatización',
    h1: 'Agencia de inteligencia artificial',
    h1grad: 'para empresas.',
    sub: 'Diseñamos e implantamos sistemas de IA que trabajan por ti y se conectan con las herramientas que ya usas.',
    tags: ['Automatizaciones con IA', 'Procesos', 'Integraciones', 'Asistentes'],
    area: {
      h: 'Sistemas que trabajan por ti',
      lead: 'Menos tareas manuales y más tiempo para lo que de verdad importa.',
      items: [
        { t: 'Automatizaciones con IA', p: 'Flujos inteligentes que conectan tus herramientas y ejecutan tareas complejas sin intervención humana.' },
        { t: 'Automatización de procesos', p: 'Eliminamos las tareas manuales repetitivas: copiar, pegar, reenviar y teclear datos.' },
        { t: 'Integraciones y optimización', p: 'Conectamos tus sistemas existentes y afinamos cada proceso para exprimir el máximo rendimiento.' },
        { t: 'Chatbots y asistentes', p: 'Asistentes que atienden a tus clientes 24/7, cualifican leads y reservan citas.', href: 'chatbot' },
      ],
    },
    proceso: { h: 'Del problema a una solución que funciona', lead: 'Te acompañamos desde la primera reunión hasta la mejora continua.', fases: FASES },
    casos: {
      h: 'Lo que automatizamos',
      lead: 'Para empresas de cualquier sector que pierden horas cada semana en tareas que se repiten.',
      items: [
        { t: 'Gestión documental', p: 'Extracción, clasificación y archivado automático de facturas, contratos y formularios.', in: ['Facturas', 'Contratos', 'Formularios'], hub: 'Extracción con IA', out: ['Datos extraídos', 'Documento clasificado', 'Archivo ordenado'], antes: 'Antes: cada documento se teclea y se archiva a mano.', despues: 'Cero tareas manuales' },
        { t: 'Informes y seguimiento', p: 'Paneles e informes que se generan y envían solos, con todas tus fuentes de datos conectadas.', in: ['Ventas', 'Marketing', 'Operaciones'], hub: 'Datos conectados', out: ['Panel al día', 'Informe generado', 'Envío automático'], antes: 'Antes: los datos se copian de varias herramientas.', despues: 'Decisiones con datos al día' },
        { t: 'Tareas repetitivas', p: 'Lo que se repite cada día pasa a ejecutarse solo, y tu equipo dedica su tiempo a lo importante.', in: ['Copiar datos', 'Reenviar emails', 'Hojas de cálculo'], hub: 'Flujo automático', out: ['Tarea completada', 'Registro actualizado', 'Equipo libre'], antes: 'Antes: horas a la semana copiando y pegando.', despues: 'Más tiempo para lo importante' },
      ],
    },
    faq: [
      { q: '¿Qué puede automatizar la inteligencia artificial en mi empresa?', a: 'La atención al cliente, la cualificación de los contactos que llegan, la gestión de documentos como facturas, contratos y formularios, los informes y, en general, cualquier tarea que tu equipo repite cada día copiando datos de una herramienta a otra.' },
      { q: '¿Tengo que cambiar las herramientas que ya uso?', a: 'No. Integramos el sistema en tus herramientas actuales y formamos a tu equipo para usarlo.' },
      { q: '¿Las soluciones son a medida?', a: 'Sí. Nada de plantillas: diseñamos para tu negocio concreto y, una vez en marcha, medimos los resultados y mejoramos el sistema de forma continua.' },
      { q: '¿Por dónde empiezo?', a: 'Por una consulta gratuita y sin compromiso: analizamos tu negocio y te decimos exactamente qué automatizar primero.' },
      DONDE,
    ],
    relacionados: ['chatbot', 'mkt'],
  },
  {
    id: 'chatbot',
    slug: 'chatbot-whatsapp-empresas',
    menu: 'Chatbots de WhatsApp con IA',
    title: 'Chatbot de WhatsApp con IA para empresas · AVAI Labs',
    description: 'Chatbot de WhatsApp con inteligencia artificial: responde a tus clientes 24/7 en WhatsApp, Instagram, teléfono y tu web, agenda citas y rellena tu CRM solo.',
    servicio: 'Chatbot de WhatsApp con inteligencia artificial',
    kicker: 'Chatbots y asistentes inteligentes',
    h1: 'Chatbot de WhatsApp con IA',
    h1grad: 'para empresas.',
    sub: 'Un asistente que responde en segundos a cada cliente, a cualquier hora, con la información real de tu negocio.',
    tags: ['WhatsApp', 'Instagram', 'Teléfono', 'Tu web'],
    demo: true,
    area: {
      h: 'Un solo agente, todos tus canales',
      lead: 'Atiende, agenda y ordena tus contactos. Y avisa a tu equipo solo cuando hace falta.',
      items: [
        { t: 'Todos tus canales, 24/7', p: 'WhatsApp, Instagram, el teléfono con voz y el chat de tu web, con la información real de tu negocio.' },
        { t: 'Agenda que se llena sola', p: 'Da, cambia y cancela citas en tu calendario real, por profesional y servicio.' },
        { t: 'Recordatorios anti-plantón', p: 'Aviso por WhatsApp 24 h y 6 h antes de cada cita, con botón para confirmar o cancelar.' },
        { t: 'CRM que se rellena solo', p: 'Cada conversación se convierte en un contacto con su ficha, etiquetas y estado.' },
      ],
    },
    proceso: {
      h: 'Funcionando en tu negocio, sin tocar nada técnico',
      lead: 'La instalación la hacemos nosotros.',
      fases: [
        { t: 'Conectamos', p: 'Tu número, tus canales y tu agenda.' },
        { t: 'Adaptamos', p: 'El asistente aprende la información real de tu negocio.' },
        { t: 'Atiende', p: 'Responde, agenda y recuerda las citas, en el idioma de cada cliente.' },
        { t: 'Controlas', p: 'Desde un panel con conversaciones, citas y resultados.' },
      ],
    },
    casos: {
      h: 'Así trabaja por ti',
      lead: 'Para negocios que viven de las citas y las consultas: clínicas, peluquerías, restaurantes, servicios a domicilio y cualquier empresa que no puede contestar cada mensaje al momento.',
      items: [
        { t: 'Atención en todos los canales', p: 'Responde en segundos las dudas frecuentes y deriva a tu equipo solo lo importante.', in: ['WhatsApp', 'Instagram', 'Teléfono'], hub: 'Agente de IA', out: ['Respuesta al momento', 'Ficha en el CRM', 'Aviso al equipo'], antes: 'Antes: los mensajes esperan a que alguien conteste.', despues: 'Respuesta en segundos, 24/7' },
        { t: 'Citas sin llamadas', p: 'Tus clientes eligen hueco y el asistente lo reserva en tu calendario real, con recordatorios.', in: ['WhatsApp', 'Tu web', 'Teléfono'], hub: 'Agenda con IA', out: ['Cita en tu calendario', 'Recordatorio 24 h y 6 h', 'Hueco liberado si cancela'], antes: 'Antes: cada cita se gestiona a mano.', despues: 'Una agenda que se llena sola' },
        { t: 'Cada cliente, reconocido', p: 'Entiende notas de voz, responde en el idioma de cada cliente y recuerda su historial entre canales.', in: ['Notas de voz', 'Otros idiomas', 'Cliente habitual'], hub: 'Memoria de cliente', out: ['Respuesta en su idioma', 'Saludo por su nombre', 'Historial a mano'], antes: 'Antes: cada canal empezaba de cero.', despues: 'Atención personal, a escala' },
      ],
    },
    faq: [
      { q: '¿Qué pasa si el cliente necesita hablar con una persona?', a: 'El asistente resuelve las dudas frecuentes y deriva a tu equipo solo lo importante. Por teléfono, te pasa la llamada cuando hace falta.' },
      { q: '¿Entiende notas de voz y otros idiomas?', a: 'Sí. Transcribe y responde los audios de WhatsApp e Instagram, y contesta a cada cliente en su idioma.' },
      { q: '¿Tengo que instalar algo?', a: 'No. Conectamos tu número, tus canales y tu agenda, y lo adaptamos a tu negocio. La instalación la hacemos nosotros.' },
      { q: '¿Puedo probarlo antes?', a: 'Sí. Habla ahora con nuestro agente desde esta misma página: es el mismo sistema que montamos para nuestros clientes.' },
      DONDE,
    ],
    relacionados: ['ia', 'web'],
  },
  {
    id: 'mkt',
    slug: 'marketing-digital',
    menu: 'Marketing digital',
    title: 'Agencia de marketing digital con inteligencia artificial · AVAI Labs',
    description: 'Marketing digital potenciado con IA: estrategia a medida, campañas de publicidad, SEO y creación de contenido para redes que atraen clientes de verdad.',
    servicio: 'Marketing digital',
    kicker: 'Marketing y crecimiento digital',
    h1: 'Marketing digital potenciado',
    h1grad: 'con inteligencia artificial.',
    sub: 'Estrategias que atraen clientes de verdad: un plan a medida, campañas que llegan a quien te interesa y una marca presente en buscadores y redes.',
    tags: ['Estrategia', 'Campañas', 'SEO', 'Contenido'],
    area: {
      h: 'Un solo equipo para crecer',
      lead: 'Estrategia, publicidad y contenido, potenciados con IA y a medida de tu negocio.',
      items: [
        { t: 'Estrategia de marketing digital', p: 'Un plan potenciado con inteligencia artificial y diseñado a medida de tu negocio.' },
        { t: 'Campañas y publicidad', p: 'Campañas de publicidad pensadas para atraer a los clientes que te interesan.' },
        { t: 'SEO y captación de clientes', p: 'Posicionamiento en buscadores para que te encuentre quien ya busca lo que ofreces.' },
        { t: 'Creación de contenido', p: 'Contenido para redes sociales que mantiene tu marca presente y reconocible.', href: 'av' },
      ],
    },
    proceso: {
      h: 'Un plan, no publicaciones sueltas',
      lead: 'Cada acción responde a una estrategia y se mide.',
      fases: [
        { t: 'Análisis', p: 'Estudiamos tu negocio y dónde están tus clientes.' },
        { t: 'Estrategia', p: 'Diseñamos un plan a medida, potenciado con IA.' },
        { t: 'Lanzamiento', p: 'Ponemos en marcha campañas, SEO y contenido.' },
        { t: 'Optimización', p: 'Medimos resultados y mejoramos de forma continua.' },
      ],
    },
    casos: {
      h: 'Del primer clic al cliente',
      lead: 'Para empresas que quieren más clientes y una marca reconocible, con un solo equipo para la estrategia, la publicidad y el contenido.',
      items: [
        { t: 'Captación', p: 'Campañas y posicionamiento que llevan a tu web a quien ya busca lo que ofreces.', in: ['Buscadores', 'Redes sociales', 'Publicidad'], hub: 'Estrategia con IA', out: ['Visitas de calidad', 'Nuevos contactos', 'Marca presente'], antes: 'Antes: publicidad sin un plan detrás.', despues: 'Cada euro con un objetivo' },
        { t: 'Cualificación de leads', p: 'La IA filtra y prioriza los contactos que llegan de las campañas para que tu equipo hable con quien interesa.', in: ['Formulario', 'Chat', 'Campañas'], hub: 'Cualificación con IA', out: ['Lead prioritario', 'Ficha en el CRM', 'Seguimiento'], antes: 'Antes: el equipo revisa cada contacto uno a uno.', despues: 'Más conversiones, menos esfuerzo' },
        { t: 'Contenido constante', p: 'Producción audiovisual propia para que tu marca publique con calidad y regularidad.', in: ['Foto', 'Vídeo', 'Textos'], hub: 'Producción propia', out: ['Redes sociales', 'Tu web', 'Campañas'], antes: 'Antes: publicar solo cuando hay tiempo.', despues: 'Tu marca, siempre presente' },
      ],
    },
    faq: [
      { q: '¿Qué incluye una estrategia de marketing digital?', a: 'Un plan a medida de tu negocio que combina, según lo que necesites, publicidad, posicionamiento en buscadores y contenido para redes sociales.' },
      { q: '¿Cómo usáis la inteligencia artificial en el marketing?', a: 'La usamos para diseñar y afinar el plan, y la combinamos con nuestras automatizaciones: por ejemplo, para filtrar y priorizar los contactos que llegan de las campañas.' },
      { q: '¿Hacéis también las fotos y los vídeos?', a: 'Sí. Tenemos producción audiovisual propia: vídeo y fotografía para tu marca y contenido para redes.' },
      DONDE,
    ],
    relacionados: ['av', 'web'],
  },
  {
    id: 'web',
    slug: 'diseno-web',
    menu: 'Diseño de páginas web',
    title: 'Diseño de páginas web para empresas · AVAI Labs',
    description: 'Diseño y desarrollo de páginas web rápidas, atractivas y optimizadas para convertir, con SEO y tecnología de última generación, y asistente de IA si lo necesitas.',
    servicio: 'Diseño y desarrollo de páginas web',
    kicker: 'Experiencias digitales',
    h1: 'Páginas web que',
    h1grad: 'convierten visitas en clientes.',
    sub: 'Webs rápidas, atractivas y optimizadas para convertir, con el diseño y la tecnología de última generación. Como la que estás viendo.',
    tags: ['Diseño a medida', 'SEO', 'Conversión', 'IA integrada'],
    area: {
      h: 'Tu mejor comercial, abierto 24 horas',
      lead: 'Una web que se entiende en segundos y lleva a tus visitas a contactar.',
      items: [
        { t: 'Diseño a medida', p: 'Una web con la identidad de tu marca, pensada para que se entienda en segundos qué ofreces.' },
        { t: 'Rápida y lista para Google', p: 'Velocidad, títulos, descripciones y datos estructurados para que los buscadores te entiendan.' },
        { t: 'Pensada para convertir', p: 'Formulario, WhatsApp y llamadas a la acción en el sitio justo.' },
        { t: 'Conectada con IA', p: 'Un asistente que atiende a tus visitas y contactos que llegan solos a tu CRM.', href: 'chatbot' },
      ],
    },
    proceso: { h: 'De la idea a la web publicada', lead: 'Nos encargamos de todo, también de publicarla con su dominio.', fases: FASES },
    casos: {
      h: 'Una web que trabaja',
      lead: 'Para empresas que necesitan una web nueva o cuya web ya no les trae clientes.',
      items: [
        { t: 'Visitas que se convierten', p: 'Cada página guía a la visita hacia el contacto, sin distracciones.', in: ['Buscadores', 'Redes sociales', 'Campañas'], hub: 'Web optimizada', out: ['Formulario', 'WhatsApp', 'Llamada'], antes: 'Antes: una web que no trae clientes.', despues: 'Visitas convertidas en contactos' },
        { t: 'Atención desde la web', p: 'Un asistente con IA responde a tus visitas al momento y te pasa los contactos.', in: ['Chat web', 'Formulario', 'WhatsApp'], hub: 'Asistente con IA', out: ['Respuesta al momento', 'Ficha en el CRM', 'Aviso al equipo'], antes: 'Antes: las visitas se iban sin respuesta.', despues: 'Atención 24/7 desde tu web' },
        { t: 'Lista para buscadores e IA', p: 'Estructura, velocidad y datos estructurados para que Google y los asistentes de IA entiendan qué ofreces.', in: ['Velocidad', 'Datos estructurados', 'Contenido claro'], hub: 'SEO técnico', out: ['Google', 'Asistentes de IA', 'Redes sociales'], antes: 'Antes: una web invisible para los buscadores.', despues: 'Te encuentra quien te busca' },
      ],
    },
    faq: [
      { q: '¿Os encargáis de publicar la web?', a: 'Sí. La publicamos con su dominio y su certificado de seguridad, lista para recibir visitas.' },
      { q: '¿La web sale preparada para Google?', a: 'Sí. La entregamos rápida y con lo básico del SEO: títulos, descripciones, datos estructurados y un sitemap.' },
      { q: '¿Se puede añadir un chatbot con IA?', a: 'Sí. Podemos integrar un asistente que responde a tus visitas 24/7 y te pasa los contactos.' },
      DONDE,
    ],
    relacionados: ['mkt', 'chatbot'],
  },
  {
    id: 'av',
    slug: 'fotografia-video-eventos',
    menu: 'Producción audiovisual y eventos',
    title: 'Producción audiovisual: foto y vídeo de bodas y eventos · AVAI Labs',
    description: 'Producción audiovisual profesional: vídeo y fotografía para marcas, spots y contenido para redes, y cobertura de bodas, fiestas y eventos en España y Francia.',
    servicio: 'Producción audiovisual y cobertura de eventos',
    kicker: 'Producción audiovisual',
    h1: 'Foto y vídeo profesional',
    h1grad: 'para marcas y eventos.',
    sub: 'Vídeo y fotografía para tu marca y para los momentos que importan: bodas, fiestas y eventos.',
    tags: ['Marcas', 'Bodas', 'Fiestas', 'Eventos'],
    area: {
      h: 'Imágenes que se recuerdan',
      lead: 'Contenido visual que hace destacar tu marca y guarda tus mejores momentos.',
      items: [
        { t: 'Vídeo y foto para marcas', p: 'Spots y contenido para redes que te hacen destacar.' },
        { t: 'Bodas, fiestas y eventos', p: 'Cobertura completa en foto y vídeo de cada momento.' },
        { t: 'Contenido para redes', p: 'Piezas pensadas para publicar y mantener tu marca presente.', href: 'mkt' },
        { t: 'Tomas aéreas', p: 'Si el momento lo pide, también desde el aire con dron.' },
      ],
    },
    proceso: {
      h: 'Del encargo a la entrega',
      lead: 'Tú disfrutas del momento; nosotros nos ocupamos de todo lo demás.',
      fases: [
        { t: 'Nos cuentas', p: 'Qué necesitas, la fecha y el lugar.' },
        { t: 'Preparamos', p: 'La producción y el plan de grabación.' },
        { t: 'Grabamos', p: 'Foto y vídeo, el día del evento o de la sesión.' },
        { t: 'Entregamos', p: 'El material editado, listo para compartir.' },
      ],
    },
    casos: {
      h: 'Para cada historia',
      lead: 'Para marcas que necesitan contenido visual y para quienes quieren guardar un gran día.',
      items: [
        { t: 'Bodas', p: 'Cada momento del día, en foto y en vídeo.', in: ['Ceremonia', 'Celebración', 'Detalles'], hub: 'Foto y vídeo', out: ['Fotografías', 'Vídeo editado', 'Piezas para compartir'] },
        { t: 'Fiestas y eventos', p: 'Cobertura completa para revivirlo y compartirlo.', in: ['Invitados', 'Ambiente', 'Momentos clave'], hub: 'Cobertura completa', out: ['Fotografías', 'Vídeo resumen', 'Contenido para redes'] },
        { t: 'Contenido de marca', p: 'Spots y piezas que muestran lo que hace única a tu marca.', in: ['Producto', 'Equipo', 'Espacios'], hub: 'Producción audiovisual', out: ['Spot', 'Redes sociales', 'Tu web'] },
      ],
    },
    faq: [
      { q: '¿Dónde cubrís eventos?', a: 'En España y en Francia. Cubrimos bodas, fiestas y eventos en los dos países; nuestra base está en Canarias.' },
      { q: '¿Hacéis vídeo para redes sociales?', a: 'Sí: spots y contenido para redes, en foto y en vídeo.' },
      { q: '¿Cómo pido presupuesto?', a: 'Escríbenos por WhatsApp o desde el formulario con la fecha, el lugar y lo que necesitas, y te respondemos.' },
      { q: '¿Podéis combinarlo con el marketing de mi marca?', a: 'Sí. Somos también agencia de marketing digital: el contenido que grabamos puede formar parte de tu estrategia y tus campañas.' },
    ],
    relacionados: ['mkt', 'web'],
  },
];
