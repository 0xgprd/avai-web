// Portafolio de la portada (19-nov-2026), en español y francés.
// Marcas ficticias inventadas para el portafolio de AVAI Labs: no son clientes ni deben coincidir con negocios reales.
// Sin testimonios ni cifras de resultados. Cada una tiene su mini-web en /portafolio/<slug>/ (tools/construir-portafolio.js).
// Fotos: Unsplash (licencia Unsplash), créditos en assets/portafolio/CREDITOS.md.

export const foto = n => `/assets/portafolio/${n}.webp`;
export const urlProyecto = p => `/portafolio/${p.slug}/`;

export const PROYECTOS = [
  { slug: 'nerelia', marca: 'Nerelia', img: 'hotel-piscina', img2: 'hotel-lobby',
    es: { tipo: 'Hotel & Spa', sector: 'Hotel', hace: 'Web + reservas directas' },
    fr: { tipo: 'Hôtel & Spa', sector: 'Hôtel', hace: 'Site + réservations directes' } },
  { slug: 'pintxonia', marca: 'Pintxonia', img: 'tapas-barra', img2: 'tapas-bar',
    es: { tipo: 'Tasca de pintxos', sector: 'Restaurante', hace: 'Web + carta interactiva' },
    fr: { tipo: 'Bar à pintxos', sector: 'Restaurant', hace: 'Site + carte interactive' } },
  { slug: 'marvesa', marca: 'Marvesa', img: 'lujo-plato', img2: 'lujo-chef',
    es: { tipo: 'Alta cocina', sector: 'Restaurante', hace: 'Web + reservas de mesa' },
    fr: { tipo: 'Haute cuisine', sector: 'Restaurant', hace: 'Site + réservation de table' } },
  { slug: 'albaria', marca: 'Albaria', img: 'clinica-sillon', img2: 'clinica-sala',
    es: { tipo: 'Clínica dental', sector: 'Clínica', hace: 'Web + cita online' },
    fr: { tipo: 'Clinique dentaire', sector: 'Clinique', hace: 'Site + rendez-vous en ligne' } },
  { slug: 'azurela', marca: 'Azurela', img: 'barco-aereo', img2: 'barco-cata',
    es: { tipo: 'Excursiones en barco', sector: 'Turismo', hace: 'Web + venta de excursiones' },
    fr: { tipo: 'Excursions en bateau', sector: 'Tourisme', hace: 'Site + vente d’excursions' } },
  { slug: 'nolvea', marca: 'Nolvea', img: 'inmo-villa', img2: 'inmo-salon',
    es: { tipo: 'Residencias', sector: 'Inmobiliaria', hace: 'Web + fichas de propiedades' },
    fr: { tipo: 'Résidences', sector: 'Immobilier', hace: 'Site + fiches de biens' } },
];

// Escena del chatbot: cómo atiende el asistente de cada sector (conversaciones de ejemplo).
export const DEMOS = [
  { slug: 'marvesa', img: 'lujo-plato',
    es: { chip: 'Restaurante', nav: ['Carta', 'Reservas', 'Contacto'], h: 'Cocina de autor,<br>a la luz de las velas.', p: 'Un menú degustación que cambia con cada estación.', cta: 'Reservar mesa',
      chat: [['cli', '¿Tenéis mesa para 4 este sábado a las 21:00?'], ['ia', '¡Sí! Tenemos mesa a las 21:00. ¿A qué nombre la reservo?'], ['cli', 'A nombre de Laura, gracias.'], ['ia', 'Reservada. Te envío la confirmación por WhatsApp.'], ['ok', '✓ Reserva en la agenda']] },
    fr: { chip: 'Restaurant', nav: ['Carte', 'Réservations', 'Contact'], h: 'Cuisine d’auteur,<br>à la lueur des bougies.', p: 'Un menu dégustation qui change à chaque saison.', cta: 'Réserver une table',
      chat: [['cli', 'Vous avez une table pour 4 samedi à 21 h ?'], ['ia', 'Oui ! Une table est libre à 21 h. À quel nom je la réserve ?'], ['cli', 'Au nom de Laura, merci.'], ['ia', 'C’est réservé. Je vous envoie la confirmation sur WhatsApp.'], ['ok', '✓ Réservation dans l’agenda']] } },
  { slug: 'albaria', img: 'clinica-sillon',
    es: { chip: 'Clínica', nav: ['Tratamientos', 'Cita', 'Contacto'], h: 'Tu sonrisa,<br>en buenas manos.', p: 'Odontología general, estética e implantes.', cta: 'Pedir cita',
      chat: [['cli', 'Hola, ¿tenéis cita para una limpieza esta semana?'], ['ia', '¡Hola! El jueves tengo hueco a las 10:30 y a las 17:00. ¿Cuál prefieres?'], ['cli', 'El jueves a las 17:00.'], ['ia', 'Hecho. Te recordaré la cita por WhatsApp el día antes.'], ['ok', '✓ Cita en el calendario']] },
    fr: { chip: 'Clinique', nav: ['Soins', 'Rendez-vous', 'Contact'], h: 'Votre sourire,<br>entre de bonnes mains.', p: 'Dentisterie générale, esthétique et implants.', cta: 'Prendre rendez-vous',
      chat: [['cli', 'Bonjour, vous avez un créneau pour un détartrage cette semaine ?'], ['ia', 'Bonjour ! Jeudi, j’ai de la place à 10 h 30 et à 17 h. Lequel vous convient ?'], ['cli', 'Jeudi à 17 h.'], ['ia', 'C’est noté. Je vous rappelle le rendez-vous sur WhatsApp la veille.'], ['ok', '✓ Rendez-vous au calendrier']] } },
  { slug: 'nerelia', img: 'hotel-piscina',
    es: { chip: 'Hotel', nav: ['Habitaciones', 'Spa', 'Reservar'], h: 'Despierta<br>frente al mar.', p: 'Un hotel con spa y piscina infinita sobre el mar.', cta: 'Reservar estancia',
      chat: [['cli', '¿Hay habitación doble del 12 al 15 de marzo?'], ['ia', 'Sí, nos queda una doble con vistas al mar. ¿La reservo con desayuno?'], ['cli', 'Sí, con desayuno, por favor.'], ['ia', 'Perfecto. Te envío la confirmación por email.'], ['ok', '✓ Reserva confirmada']] },
    fr: { chip: 'Hôtel', nav: ['Chambres', 'Spa', 'Réserver'], h: 'Réveillez-vous<br>face à la mer.', p: 'Un hôtel avec spa et piscine à débordement sur la mer.', cta: 'Réserver un séjour',
      chat: [['cli', 'Vous avez une chambre double du 12 au 15 mars ?'], ['ia', 'Oui, il nous reste une double vue mer. Je la réserve avec petit-déjeuner ?'], ['cli', 'Oui, avec petit-déjeuner.'], ['ia', 'Parfait. Je vous envoie la confirmation par e-mail.'], ['ok', '✓ Réservation confirmée']] } },
  { slug: 'azurela', img: 'barco-aereo',
    es: { chip: 'Excursiones', nav: ['Excursiones', 'Horarios', 'Reservar'], h: 'El mar,<br>como nunca lo has visto.', p: 'Excursiones en barco con snorkel y atardeceres.', cta: 'Reservar excursión',
      chat: [['cli', 'Hi! Any seats left for tomorrow’s sunset trip?'], ['ia', 'Yes! 3 seats left on tomorrow’s sunset trip at 18:30. Shall I book them?'], ['cli', 'Two seats, please.'], ['ia', 'Done! Your tickets are on their way by WhatsApp.'], ['ok', '✓ Responde en el idioma del cliente']] },
    fr: { chip: 'Excursions', nav: ['Excursions', 'Horaires', 'Réserver'], h: 'La mer<br>comme jamais vue.', p: 'Excursions en bateau, snorkeling et couchers de soleil.', cta: 'Réserver une excursion',
      chat: [['cli', 'Hi! Any seats left for tomorrow’s sunset trip?'], ['ia', 'Yes! 3 seats left on tomorrow’s sunset trip at 18:30. Shall I book them?'], ['cli', 'Two seats, please.'], ['ia', 'Done! Your tickets are on their way by WhatsApp.'], ['ok', '✓ Il répond dans la langue du client']] } },
];

export const TEXTOS = {
  es: { verWeb: 'Ver la web', asistente: 'Asistente de', ejemplo: 'Conversación de ejemplo' },
  fr: { verWeb: 'Voir le site', asistente: 'Assistant de', ejemplo: 'Exemple de conversation' },
};
