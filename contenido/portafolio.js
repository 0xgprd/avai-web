// Mini-webs del portafolio de AVAI Labs (19-nov-2026). tools/construir-portafolio.js genera /portafolio/<slug>/.
//
// REGLAS
// - Marcas ficticias, inventadas para el portafolio: no son clientes y no deben coincidir con negocios reales.
// - Sin teléfonos, direcciones ni personas reales; sin reseñas, premios ni cifras de resultados.
// - Los formularios no envían nada: al pulsar, avisan de que la web es del portafolio de AVAI Labs.
// - El asistente muestra una conversación de ejemplo, no un chat real.
// - Todas llevan noindex y no van en el sitemap.
// Fotos: /assets/portafolio/ (Unsplash, créditos en assets/portafolio/CREDITOS.md).

module.exports = [
  {
    slug: 'nerelia', marca: 'Nerelia', tipo: 'Hotel & Spa', referencia: 'hotelaurelia.online',
    descripcion: 'Nerelia, hotel con spa y piscina infinita frente al mar.',
    fuentes: 'family=Bodoni+Moda:ital,wght@0,400;1,400&family=Jost:wght@300;400;500',
    tema: { fondo: '#f6f1ea', tinta: '#3b2a1f', suave: '#8a7565', acento: '#b08d57', sec: '#ebe2d6', oscuro: '#4a3426', display: "'Bodoni Moda',serif", cuerpo: "'Jost',sans-serif" },
    nav: [['#habitaciones', 'Habitaciones'], ['#experiencias', 'Experiencias'], ['#reserva', 'Reservar']],
    cta: 'Reservar estancia',
    secciones: [
      { tipo: 'hero', variante: 'imagen', img: 'hotel-piscina', titulo: '<em>La calma</em><br>frente al mar', sub: 'Hotel & Spa · Piscina infinita · Restaurante de temporada' },
      { tipo: 'intro', kicker: 'Bienvenidos', titulo: 'Pensado con calma, <em>cuidado al detalle.</em>', texto: 'Habitaciones luminosas, un spa para desconectar y atardeceres que se viven desde el agua. Nerelia es un refugio para quien busca descansar de verdad.', img: 'hotel-lobby' },
      { tipo: 'tarjetas', id: 'habitaciones', kicker: 'Habitaciones', titulo: 'Tu lugar <em>para quedarte.</em>', items: [
        { img: 'hotel-vista', t: 'Doble Vista Mar', p: 'Ventanal al mar, cama king size y terraza privada.', meta: 'Desde 180 € / noche' },
        { img: 'hotel-ventana', t: 'Suite Horizonte', p: 'Salón independiente y bañera frente al horizonte.', meta: 'Desde 260 € / noche' },
        { img: 'hotel-ocaso', t: 'Suite Piscina', p: 'Acceso directo a la piscina infinita al atardecer.', meta: 'Desde 320 € / noche' },
      ] },
      { tipo: 'marquesina', palabras: ['Spa', 'Piscina infinita', 'Desayuno de temporada', 'Atardeceres', 'Silencio'] },
      { tipo: 'galeria', id: 'experiencias', kicker: 'Experiencias', titulo: 'Pequeños rituales <em>de cada día.</em>', imgs: [['hotel-piscina', 'Piscina infinita'], ['lujo-atun', 'Cocina de temporada'], ['hotel-lobby', 'Salón principal'], ['hotel-ocaso', 'Atardecer']] },
      { tipo: 'reserva', id: 'reserva', kicker: 'Reservas', titulo: 'Reserva tu estancia <em>en Nerelia.</em>', campos: [['Llegada', 'date'], ['Salida', 'date'], ['Huéspedes', 'select', ['1 adulto', '2 adultos', '2 adultos y 1 niño', 'Familia']], ['Habitación', 'select', ['Doble Vista Mar', 'Suite Horizonte', 'Suite Piscina']], ['Nombre', 'text'], ['Email', 'email']], boton: 'Consultar disponibilidad' },
    ],
    chat: [['cli', '¿Hay habitación doble del 12 al 15 de marzo?'], ['ia', 'Sí, nos queda una doble con vistas al mar. ¿La reservo con desayuno?'], ['cli', 'Sí, con desayuno, por favor.'], ['ia', 'Perfecto. Te envío la confirmación por email.'], ['ok', '✓ Reserva confirmada']],
    css: `.hero h1{font-style:normal}.hero h1 em{font-style:italic}.m-cab .marca{font-style:italic;letter-spacing:.02em}`,
  },
  {
    slug: 'pintxonia', marca: 'Pintxonia', tipo: 'Tasca de pintxos', referencia: 'bar-topas.ch',
    descripcion: 'Pintxonia, tasca de pintxos para ir picando y quedarse.',
    fuentes: 'family=Archivo+Black&family=Barlow:wght@400;500;600&family=Kalam:wght@700',
    tema: { fondo: '#f4ead8', tinta: '#2a1a14', suave: '#6e5a4c', acento: '#b31237', sec: '#1f8c8f', oscuro: '#b31237', display: "'Archivo Black',sans-serif", cuerpo: "'Barlow',sans-serif" },
    nav: [['#carta', 'La carta'], ['#barra', 'La barra'], ['#reserva', 'Reservar']],
    cta: '¡Ven a probar!',
    aviso: '¡Hola! ¿Te guardo una mesa?',
    secciones: [
      { tipo: 'hero', variante: 'letras', img: 'tapas-barra', img2: 'tapas-pintxos', titulo: 'PINTXONIA', sub: 'Pintxos para picar, compartir y pedir otra ronda.' },
      { tipo: 'marquesina', palabras: ['Uno más y nos vamos', 'Un poco de todo', 'Mucho de bueno', 'Siempre otra ronda'], color: 'amarillo' },
      { tipo: 'intro', kicker: 'La tasca', titulo: 'Un pintxo, <em>es así de simple.</em>', texto: 'Llegas, pides algo para beber y la barra hace el resto. Pintxos recién hechos, cazuelitas calientes y ganas de quedarse un rato más.', img: 'tapas-bar' },
      { tipo: 'lista', id: 'carta', kicker: 'La carta', titulo: 'Mucho <em>de bueno.</em>', fondo: 'sec', items: [
        { t: 'Gilda clásica', p: 'Aceituna, guindilla y anchoa del Cantábrico.', precio: '2,50 €' },
        { t: 'Txaka con mahonesa', p: 'Sobre pan tostado, con un toque de cebollino.', precio: '3,00 €' },
        { t: 'Tortilla del día', p: 'Jugosa, como tiene que ser.', precio: '3,20 €' },
        { t: 'Croqueta de jamón', p: 'Cremosa por dentro, crujiente por fuera.', precio: '2,20 €' },
        { t: 'Cazuelita de setas', p: 'Setas de temporada salteadas al ajillo.', precio: '6,50 €' },
        { t: 'Txistorra al vino', p: 'Con pan para mojar.', precio: '4,00 €' },
      ] },
      { tipo: 'galeria', id: 'barra', kicker: 'La barra', titulo: 'Para picar <em>con los ojos.</em>', imgs: [['tapas-pintxos', '01'], ['tapas-barra', '02'], ['tapas-bar', '03'], ['tapas-pintxos', '04']] },
      { tipo: 'reserva', id: 'reserva', kicker: 'Reservar', titulo: '¿Te guardamos <em>sitio?</em>', campos: [['Día', 'date'], ['Hora', 'select', ['19:30', '20:00', '20:30', '21:00', '21:30', '22:00']], ['Personas', 'select', ['2', '3', '4', '5', '6 o más']], ['Nombre', 'text']], boton: 'Reservar mesa' },
    ],
    chat: [['cli', '¿Abrís el domingo por la noche?'], ['ia', '¡Sí! El domingo abrimos de 19:00 a 23:30. ¿Te guardo una mesa?'], ['cli', 'Para 2 a las 21:00.'], ['ia', 'Hecho: mesa para 2 a las 21:00. ¡Te esperamos!'], ['ok', '✓ Mesa reservada']],
    css: `.hero h1{font-size:clamp(3rem,12.5vw,13rem);letter-spacing:-.02em;line-height:.85;color:#f4ead8;white-space:nowrap}
      .hero{background:#b31237}.hero .sub{font-family:'Kalam',cursive;font-size:clamp(1.3rem,2.4vw,2rem);color:#f5c400}
      .intro h2 em,.lista h2 em,.galeria h2 em,.reserva h2 em{font-family:'Kalam',cursive;font-style:normal;color:#b31237}
      .lista h2 em{color:#f5c400}.lista{color:#fff}.lista .item p{color:rgba(255,255,255,.8)}.lista .precio{color:#f5c400}
      .marq.amarillo{background:#f5c400;color:#2a1a14}.btn{border-radius:999px}`,
  },
  {
    slug: 'marvesa', marca: 'Marvesa', tipo: 'Alta cocina', referencia: 'qissa.co.uk',
    descripcion: 'Marvesa, alta cocina de autor y menú degustación de temporada.',
    fuentes: 'family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Manrope:wght@300;400;500',
    tema: { fondo: '#0a1230', tinta: '#f3ead8', suave: '#a9a7b6', acento: '#d4b46a', sec: '#0f1a40', oscuro: '#070d24', display: "'Cormorant Garamond',serif", cuerpo: "'Manrope',sans-serif" },
    nav: [['#historia', 'Historia'], ['#menu', 'Menú'], ['#reserva', 'Reservas']],
    cta: 'Reservar mesa',
    secciones: [
      { tipo: 'hero', variante: 'imagen', img: 'lujo-plato', titulo: 'Marvesa', sub: 'Cocina de autor, a la luz de las velas.' },
      { tipo: 'intro', id: 'historia', kicker: 'Nuestra historia', titulo: 'Cada plato <em>cuenta algo.</em>', texto: 'Un menú degustación que cambia con cada estación, producto de cercanía y una sala pensada para que la cena dure lo que tenga que durar.', img: 'lujo-sala' },
      { tipo: 'marquesina', palabras: ['Textura', 'Temporada', 'Fuego', 'Origen', 'Celebración'], color: 'oro' },
      { tipo: 'tarjetas', id: 'menu', kicker: 'Menú degustación', titulo: 'Platos <em>con historia.</em>', items: [
        { img: 'lujo-atun', t: 'Atún, cítricos y hierbas', p: 'Ligero, fresco, para abrir el apetito.', meta: 'Primer tiempo' },
        { img: 'lujo-plato', t: 'Carne madurada y su jugo', p: 'Cocinada a baja temperatura y terminada al fuego.', meta: 'Segundo tiempo' },
        { img: 'lujo-chef', t: 'Postre de autor', p: 'Dulce, fino y con un final inesperado.', meta: 'Final' },
      ] },
      { tipo: 'reserva', id: 'reserva', kicker: 'Su mesa le espera', titulo: 'Dos formas <em>de vivir Marvesa.</em>', campos: [['Fecha', 'date'], ['Hora', 'select', ['20:00', '20:30', '21:00', '21:30', '22:00']], ['Comensales', 'select', ['2', '3', '4', '5', '6', 'Evento privado']], ['Nombre', 'text'], ['Email', 'email']], boton: 'Solicitar reserva' },
    ],
    chat: [['cli', '¿Tenéis mesa para 4 este sábado a las 21:00?'], ['ia', '¡Sí! Tenemos mesa a las 21:00. ¿A qué nombre la reservo?'], ['cli', 'A nombre de Laura, gracias.'], ['ia', 'Reservada. Te envío la confirmación por WhatsApp.'], ['ok', '✓ Reserva en la agenda']],
    css: `.hero h1{font-size:clamp(4rem,12vw,11rem);font-weight:400}.btn{background:linear-gradient(120deg,#c9a24f,#e8cf8d);color:#0a1230}
      .marq.oro{background:linear-gradient(90deg,#b8923f,#e2c47c,#b8923f);color:#0a1230;font-family:'Cormorant Garamond',serif;font-style:italic}`,
  },
  {
    slug: 'albaria', marca: 'Albaria', tipo: 'Clínica dental', referencia: 'Aventura Dental Arts (Awwwards)',
    descripcion: 'Albaria, clínica dental: odontología general, estética e implantes.',
    fuentes: 'family=Outfit:wght@300;400;500;600&family=Inter:wght@400;500',
    tema: { fondo: '#f5f9f8', tinta: '#0e2a2e', suave: '#5d7377', acento: '#0f8a86', sec: '#e4f1ef', oscuro: '#0e2a2e', display: "'Outfit',sans-serif", cuerpo: "'Inter',sans-serif" },
    nav: [['#tratamientos', 'Tratamientos'], ['#visita', 'Tu primera visita'], ['#reserva', 'Pedir cita']],
    cta: 'Pedir cita',
    aviso: '¡Hola! ¿Te ayudo a pedir cita?',
    secciones: [
      { tipo: 'hero', variante: 'partido', img: 'clinica-sillon', titulo: 'Tu sonrisa,<br><em>en buenas manos.</em>', sub: 'Odontología general, estética e implantes, con la tranquilidad de entenderlo todo antes de empezar.' },
      { tipo: 'lista', id: 'tratamientos', kicker: 'Tratamientos', titulo: 'Todo lo que <em>tu boca necesita.</em>', fondo: 'sec', items: [
        { t: 'Revisión y limpieza', p: 'Diagnóstico completo y limpieza profesional.' },
        { t: 'Ortodoncia invisible', p: 'Alineadores transparentes, a tu ritmo.' },
        { t: 'Implantes', p: 'Planificación digital y seguimiento cercano.' },
        { t: 'Estética dental', p: 'Blanqueamiento y carillas con resultado natural.' },
        { t: 'Odontopediatría', p: 'Primeras visitas pensadas para los más pequeños.' },
        { t: 'Urgencias', p: 'Te atendemos lo antes posible.' },
      ] },
      { tipo: 'pasos', id: 'visita', kicker: 'Tu primera visita', titulo: 'Sin sorpresas, <em>de principio a fin.</em>', items: [['Pides cita', 'Online o con nuestro asistente, a cualquier hora.'], ['Te escuchamos', 'Revisión completa y te explicamos lo que vemos.'], ['Plan claro', 'Opciones, tiempos y presupuesto por escrito.'], ['Seguimiento', 'Recordatorios y revisiones para que no te olvides.']], img: 'clinica-sala' },
      { tipo: 'galeria', kicker: 'La clínica', titulo: 'Un espacio <em>luminoso y tranquilo.</em>', imgs: [['clinica-sala', 'Gabinete'], ['clinica-naranja', 'Sala de tratamiento'], ['clinica-azul', 'Equipamiento']] },
      { tipo: 'reserva', id: 'reserva', kicker: 'Pedir cita', titulo: 'Elige día <em>y te confirmamos.</em>', campos: [['Tratamiento', 'select', ['Revisión y limpieza', 'Ortodoncia invisible', 'Implantes', 'Estética dental', 'Odontopediatría', 'Urgencia']], ['Día preferido', 'date'], ['Franja', 'select', ['Mañana', 'Tarde']], ['Nombre', 'text'], ['Teléfono', 'tel']], boton: 'Pedir cita', nota: 'Tus datos de salud se tratan con la máxima confidencialidad.' },
    ],
    chat: [['cli', 'Hola, ¿tenéis cita para una limpieza esta semana?'], ['ia', '¡Hola! El jueves tengo hueco a las 10:30 y a las 17:00. ¿Cuál prefieres?'], ['cli', 'El jueves a las 17:00.'], ['ia', 'Hecho. Te recordaré la cita por WhatsApp el día antes.'], ['ok', '✓ Cita en el calendario']],
    css: `.hero h1 em,.m h2 em{font-style:normal;color:#0f8a86}.btn{border-radius:999px}.hero .img{border-radius:220px 220px 24px 24px}`,
  },
  {
    slug: 'azurela', marca: 'Azurela', tipo: 'Excursiones en barco', referencia: 'Blue More Yachting (Awwwards)',
    descripcion: 'Azurela, excursiones en barco con snorkel, calas y atardeceres.',
    fuentes: 'family=Syne:wght@500;600;700;800&family=Manrope:wght@400;500',
    tema: { fondo: '#04202c', tinta: '#eafaff', suave: '#9fc3cd', acento: '#2ee6f0', sec: '#073547', oscuro: '#021820', display: "'Syne',sans-serif", cuerpo: "'Manrope',sans-serif" },
    nav: [['#excursiones', 'Excursiones'], ['#incluye', 'Qué incluye'], ['#reserva', 'Reservar']],
    cta: 'Reservar excursión',
    secciones: [
      { tipo: 'hero', variante: 'imagen', img: 'barco-aereo', titulo: 'AZURELA', sub: 'El mar, como nunca lo has visto.' },
      { tipo: 'tarjetas', id: 'excursiones', kicker: 'Excursiones', titulo: 'Elige <em>tu día de mar.</em>', items: [
        { img: 'barco-snorkel', t: 'Calas y snorkel', p: 'Aguas turquesas, equipo de snorkel y baño en calas escondidas.', meta: '3 h · Desde 45 €' },
        { img: 'barco-ocaso', t: 'Atardecer a vela', p: 'Navegamos hacia la puesta de sol con una copa en la mano.', meta: '2 h · Desde 55 €' },
        { img: 'barco-dos', t: 'Día completo', p: 'Ruta por la costa, comida a bordo y paradas para nadar.', meta: '7 h · Desde 110 €' },
      ] },
      { tipo: 'marquesina', palabras: ['Snorkel', 'Calas', 'Atardeceres', 'Grupos reducidos', 'Salidas diarias'] },
      { tipo: 'intro', id: 'incluye', kicker: 'Qué incluye', titulo: 'Tú solo <em>trae el bañador.</em>', texto: 'Patrón con experiencia, equipo de snorkel, bebidas a bordo y toallas. Grupos reducidos para que el día sea tuyo.', img: 'barco-cata' },
      { tipo: 'reserva', id: 'reserva', kicker: 'Reservar', titulo: 'Reserva <em>tu plaza.</em>', campos: [['Excursión', 'select', ['Calas y snorkel', 'Atardecer a vela', 'Día completo']], ['Fecha', 'date'], ['Personas', 'select', ['1', '2', '3', '4', '5', '6 o más']], ['Nombre', 'text'], ['Email', 'email']], boton: 'Ver disponibilidad' },
    ],
    chat: [['cli', 'Hi! Any seats left for tomorrow’s sunset trip?'], ['ia', 'Yes! 3 seats left on tomorrow’s sunset trip at 18:30. Shall I book them?'], ['cli', 'Two seats, please.'], ['ia', 'Done! Your tickets are on their way by WhatsApp.'], ['ok', '✓ Responde en el idioma del cliente']],
    css: `.hero h1{font-size:clamp(3rem,11.5vw,12rem);font-weight:800;letter-spacing:-.04em;white-space:nowrap}.m h2 em{font-style:normal;color:#2ee6f0}.btn{background:#2ee6f0;color:#04202c;border-radius:999px}`,
  },
  {
    slug: 'nolvea', marca: 'Nolvea', tipo: 'Residencias', referencia: 'Belgrade Arbor y Sobha Privy (Awwwards)',
    descripcion: 'Nolvea, residencias y villas con luz, jardín y piscina.',
    fuentes: 'family=Tenor+Sans&family=Inter:wght@300;400;500',
    tema: { fondo: '#f2efe9', tinta: '#1d1f1c', suave: '#6b6e66', acento: '#6f8a6c', sec: '#e6e2d8', oscuro: '#1d1f1c', display: "'Tenor Sans',sans-serif", cuerpo: "'Inter',sans-serif" },
    nav: [['#propiedades', 'Propiedades'], ['#vivir', 'Vivir en Nolvea'], ['#reserva', 'Agendar visita']],
    cta: 'Agendar visita',
    aviso: '¡Hola! ¿Quieres visitar alguna casa?',
    secciones: [
      { tipo: 'hero', variante: 'partido', img: 'inmo-villa', titulo: 'Casas con luz,<br><em>jardín y calma.</em>', sub: 'Villas y residencias seleccionadas, con visita guiada cuando te venga bien.' },
      { tipo: 'tarjetas', id: 'propiedades', kicker: 'Propiedades', titulo: 'Elige <em>dónde quedarte.</em>', items: [
        { img: 'inmo-villa', t: 'Villa Jardín', p: 'Piscina, jardín y porche orientado al sur.', meta: '4 hab · 3 baños · 320 m²' },
        { img: 'inmo-salon', t: 'Residencia Mirador', p: 'Salón con ventanales y vistas abiertas.', meta: '3 hab · 2 baños · 210 m²' },
        { img: 'inmo-chimenea', t: 'Casa Chimenea', p: 'Luz natural y espacios para estar en familia.', meta: '3 hab · 2 baños · 180 m²' },
      ] },
      { tipo: 'intro', id: 'vivir', kicker: 'Vivir en Nolvea', titulo: 'Más espacio, <em>más luz, más vida.</em>', texto: 'Cada propiedad con su ficha completa: fotos, planos y características. Y cuando quieras verla, te enseñamos la casa en persona.', img: 'inmo-salon' },
      { tipo: 'reserva', id: 'reserva', kicker: 'Agendar visita', titulo: '¿Cuándo <em>quieres verla?</em>', campos: [['Propiedad', 'select', ['Villa Jardín', 'Residencia Mirador', 'Casa Chimenea']], ['Día', 'date'], ['Franja', 'select', ['Mañana', 'Tarde']], ['Nombre', 'text'], ['Email', 'email']], boton: 'Agendar visita' },
    ],
    chat: [['cli', '¿La Villa Jardín sigue disponible?'], ['ia', 'Sí. ¿Quieres visitarla? Tengo hueco el martes a las 11:00 o el miércoles a las 17:00.'], ['cli', 'El miércoles a las 17:00.'], ['ia', 'Visita confirmada. Te envío la ubicación por WhatsApp.'], ['ok', '✓ Visita en la agenda']],
    css: `.hero h1 em,.m h2 em{font-style:normal;color:#6f8a6c}.tarjetas .meta{letter-spacing:.08em}`,
  },
];
