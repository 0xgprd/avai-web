// Portada en FRANCÉS (portada «Fusión», 19-nov-2026). tools/construir.js genera fr/index.html a partir de
// index.html (la portada española) aplicando:
//   1. `head`: título, descripciones y textos para redes;
//   2. `pares`: cada [español exacto, francés]. Si un texto español cambia en index.html y su par deja de
//      encontrarse, la construcción falla: así las dos portadas no se desincronizan nunca;
//   3. rutas absolutas, enlaces a las páginas francesas y JSON-LD en francés (los hace construir.js).
// Después, construir.js comprueba que no queda ningún texto visible en español (salvo `mismos`).
// Los textos que pinta js/portada.js (miniaturas, chips y conversaciones) se traducen en js/portada/portafolio.js.
// Las palabras cortas llevan su contexto HTML (>Proceso<) para no tocar ids ni otras frases.

module.exports = {
  head: {
    title: 'AVAI Labs · Agence de création de sites web et d’intelligence artificielle',
    description: 'Agence de création de sites web et d’intelligence artificielle pour les entreprises en France et en Espagne : sites sur mesure en motion design, chatbots qui répondent 24h/24 et prennent les rendez-vous, et automatisations sur mesure.',
    social: 'Sites sur mesure en motion design, chatbots IA qui répondent 24h/24 et automatisations pour les entreprises en France et en Espagne.',
    imageAlt: 'AVAI Labs · Des sites qui vendent. Une IA qui répond.',
    jsonDescription: 'Agence de création de sites web et d’intelligence artificielle pour les entreprises en France et en Espagne : sites sur mesure en motion design, chatbots IA qui répondent 24h/24 et prennent les rendez-vous, automatisations sur mesure, et marketing digital et production audiovisuelle en complément.',
  },

  // Textos que se quedan igual en francés (marcas, datos de contacto, palabras idénticas).
  mismos: ['AVAI App', 'WhatsApp', 'Instagram', 'YouTube', 'Blog', 'Marketing digital', 'AVAI Labs', 'Base', 'AVAI', 'Marvesa',
    'info@avai-labs.com', '+34 624 50 40 04', 'C.C. Radazul Bajo, 38109 · El Rosario, Tenerife',
    'Web', 'SEO', 'Motion', 'CRM', 'Principal', 'ES', 'Español', 'Contact', 'Menu', 'Services', 'Documents', 'Agenda'],

  pares: [
    // Cabecera y menús
    ['>Saltar al contenido<', '>Aller au contenu<'],
    ['<span>Iniciando sistema</span>', '<span>Démarrage du système</span>'],
    ['aria-label="AVAI Labs, volver al inicio"', 'aria-label="AVAI Labs, retour à l’accueil"'],
    ['alt="AVAI Labs — Agencia de diseño web e inteligencia artificial"', 'alt="AVAI Labs — Agence de création de sites web et d’intelligence artificielle"'],
    ['aria-label="Abrir menú"', 'aria-label="Ouvrir le menu"'],
    ['aria-label="Menú"', 'aria-label="Menu"'],
    ['aria-label="Nuestro trabajo"', 'aria-label="Notre travail"'],
    ['<a href="/fr/" class="lang" hreflang="fr" lang="fr" aria-label="Version française">FR</a>', '<a href="/" class="lang" hreflang="es" lang="es" aria-label="Versión en español">ES</a>'],
    ['<a href="/fr/" hreflang="fr" lang="fr">Français</a>', '<a href="/" hreflang="es" lang="es">Español</a>'],
    ['>Portafolio<', '>Portfolio<'],
    ['>Servicios<', '>Services<'],
    ['>Proceso<', '>Méthode<'],
    ['>Contacto<', '>Contact<'],
    ['Consulta gratuita →', 'Consultation gratuite →'],
    ['>Consulta gratuita<', '>Consultation gratuite<'],
    ['>Diseño de páginas web<', '>Création de sites web<'],
    ['>Chatbots de WhatsApp con IA<', '>Chatbots WhatsApp avec IA<'],
    ['>Inteligencia artificial y automatización<', '>Intelligence artificielle et automatisation<'],
    ['>Producción audiovisual y eventos<', '>Production audiovisuelle et événements<'],

    // 1 · Hero
    ['[ Agencia de diseño web e inteligencia artificial ]', '[ Agence de création de sites web et d’intelligence artificielle ]'],
    ['Webs que venden.<br><span class="dim">IA que atiende.</span>', 'Des sites qui vendent.<br><span class="dim">Une IA qui répond.</span>'],
    ['Diseño, desarrollo e inteligencia artificial para empresas de España y Francia.', 'Design, développement et intelligence artificielle pour les entreprises en France et en Espagne.'],
    ['Desliza ↓', 'Faites défiler ↓'],

    // 2-4 · Viaje
    ['Restaurantes · Hoteles · Clínicas · Turismo · Inmobiliarias', 'Restaurants · Hôtels · Cliniques · Tourisme · Immobilier'],
    ['Webs para negocios<br><span class="serif">que quieren destacar.</span>', 'Des sites pour les entreprises<br><span class="serif">qui veulent se démarquer.</span>'],
    ['Cada proyecto, con su propia identidad. Ninguna plantilla.', 'Chaque projet a sa propre identité. Aucun modèle tout fait.'],
    ['Webs que se recuerdan.<span class="serif">Y que atienden solas.</span>', 'Des sites qu’on retient.<span class="serif">Et qui répondent seuls.</span>'],
    ['Pulsa cualquier web para verla. Las diseñamos a medida, con motion design, y les integramos inteligencia artificial.', 'Cliquez sur un site pour le découvrir. Nous les concevons sur mesure, en motion design, et y intégrons l’intelligence artificielle.'],
    ['>La inteligencia<', '>L’intelligence<'],
    ['Que atiende <span class="serif">mientras duermes.</span>', 'Qui répond <span class="serif">pendant que vous dormez.</span>'],
    ['Su asistente con IA responde, reserva y confirma por WhatsApp, a cualquier hora y en el idioma del cliente.', 'Son assistant IA répond, réserve et confirme sur WhatsApp, à toute heure et dans la langue du client.'],
    ['>Elige un sector<', '>Choisissez un secteur<'],

    // 5 · Automatizaciones
    ['>Lo que no se ve<', '>Ce qu’on ne voit pas<'],
    ['Y detrás, automatizaciones <span class="serif">que trabajan por ti.</span>', 'Et derrière, des automatisations <span class="serif">qui travaillent pour vous.</span>'],
    ['Conectamos tus herramientas para que las tareas repetitivas se hagan solas. Un sistema diseñado para tu empresa, no una plantilla.', 'Nous connectons vos outils pour que les tâches répétitives se fassent toutes seules. Un système conçu pour votre entreprise, pas un modèle.'],
    ['<span class="mono">Entrada</span><div>Solicitud del cliente</div>', '<span class="mono">Entrée</span><div>Demande du client</div>'],
    ['<span class="mono">Cálculo</span><div>Oferta con su tarifa</div>', '<span class="mono">Calcul</span><div>Offre selon son tarif</div>'],
    ['<span class="mono">Documento</span><div>PDF listo para enviar</div>', '<span class="mono">Document</span><div>PDF prêt à envoyer</div>'],
    ['<span class="mono">Registro</span><div>Archivo y CRM</div>', '<span class="mono">Suivi</span><div>Archivage et CRM</div>'],
    ['Caso real · Empresa industrial · Ofertas que se generan solas', 'Cas réel · Entreprise industrielle · Des offres qui se génèrent seules'],

    // 6 · Servicios
    ['Tres servicios, <span class="serif">un solo equipo.</span>', 'Trois services, <span class="serif">une seule équipe.</span>'],
    ['>España · Francia<', '>France · Espagne<'],
    ['<h3>Diseño y desarrollo web</h3><p>Webs a medida con motion design, rápidas, preparadas para Google y publicadas con tu dominio.</p>', '<h3>Création et développement web</h3><p>Des sites sur mesure en motion design, rapides, prêts pour Google et publiés avec votre nom de domaine.</p>'],
    ['<li>Diseño</li>', '<li>Design</li>'],
    ['<li>Reservas</li>', '<li>Réservations</li>'],
    ['>Ver servicio →<', '>Voir le service →<'],
    ['<h3>Chatbots 24/7 y citas</h3><p>Un asistente en tu web, WhatsApp e Instagram que responde, agenda en tu calendario y recuerda las citas.</p>', '<h3>Chatbots 24h/24 et rendez-vous</h3><p>Un assistant sur votre site, WhatsApp et Instagram qui répond, prend les rendez-vous dans votre agenda et les rappelle.</p>'],
    ['<h3>Automatizaciones a medida</h3><p>Documentos, ofertas, CRM e informes que se generan y se mueven solos entre tus herramientas.</p>', '<h3>Automatisations sur mesure</h3><p>Documents, offres, CRM et rapports qui se génèrent et circulent tout seuls entre vos outils.</p>'],
    ['<li>Ofertas</li><li>Documentos</li><li>Informes</li>', '<li>Offres</li><li>Documents</li><li>Rapports</li>'],
    ['También hacemos', 'Nous faisons aussi'],
    ['AVAI App, nuestro agente de IA ↗', 'AVAI App, notre agent IA ↗'],

    // 7 · Portafolio, nosotros, proceso
    ['Nuestro <span class="serif">portafolio.</span>', 'Notre <span class="serif">portfolio.</span>'],
    ['>Pulsa una web para verla<', '>Cliquez sur un site pour le découvrir<'],
    ['>Sobre AVAI Labs<', '>À propos d’AVAI Labs<'],
    ['La inteligencia <span class="serif">detrás de cada web.</span>', 'L’intelligence <span class="serif">derrière chaque site.</span>'],
    ['AVAI Labs es tu agencia de <strong>diseño web e inteligencia artificial</strong>. Ayudamos a empresas de España y Francia a crecer con webs que impresionan, asistentes que atienden solos y automatizaciones que ahorran horas: todo bajo un mismo techo.', 'AVAI Labs est votre agence de <strong>création de sites web et d’intelligence artificielle</strong>. Nous aidons les entreprises en France et en Espagne à grandir avec des sites qui marquent, des assistants qui répondent seuls et des automatisations qui font gagner des heures : tout sous un même toit.'],
    ['<dd>Tenerife, Canarias</dd>', '<dd>Tenerife, Canaries (Espagne)</dd>'],
    ['<dt>Idiomas</dt><dd>Español y francés</dd>', '<dt>Langues</dt><dd>Français et espagnol</dd>'],
    ['<dt>Método</dt><dd>4 fases, de principio a fin</dd>', '<dt>Méthode</dt><dd>4 phases, du début à la fin</dd>'],
    ['<dt>Horario</dt><dd>Lunes a viernes, 9:00 a 19:00</dd>', '<dt>Horaires</dt><dd>Du lundi au vendredi, de 9 h à 19 h (heure des Canaries)</dd>'],
    ['Del primer café <span class="serif">a tu web publicada.</span>', 'Du premier café <span class="serif">à votre site en ligne.</span>'],
    ['<h3>Análisis</h3><p>Entendemos tu negocio y a tus clientes.</p>', '<h3>Analyse</h3><p>Nous comprenons votre activité et vos clients.</p>'],
    ['<h3>Diseño</h3><p>Una identidad y un recorrido a tu medida.</p>', '<h3>Design</h3><p>Une identité et un parcours à votre mesure.</p>'],
    ['<h3>Lanzamiento</h3><p>Web, chatbot y agenda funcionando.</p>', '<h3>Lancement</h3><p>Site, chatbot et agenda en service.</p>'],
    ['<h3>Mejora</h3><p>Medimos y afinamos de forma continua.</p>', '<h3>Amélioration</h3><p>Nous mesurons et affinons en continu.</p>'],

    // 8 · Contacto
    ['Hagamos <span class="serif">la tuya.</span>', 'Créons <span class="serif">le vôtre.</span>'],
    ['Cuéntanos tu negocio y te decimos qué web y qué automatizaciones te conviene hacer primero. Respondemos en español y en francés.', 'Parlez-nous de votre activité et nous vous dirons quel site et quelles automatisations lancer en premier. Nous répondons en français et en espagnol.'],
    ['Solicitar una consulta gratuita', 'Demander une consultation gratuite'],
    ['Contactar por WhatsApp', 'Nous écrire sur WhatsApp'],
    ['<dt>Email</dt>', '<dt>E-mail</dt>'],
    ['<dt>Teléfono / WhatsApp</dt>', '<dt>Téléphone / WhatsApp</dt>'],
    ['<dt>Dónde estamos</dt>', '<dt>Où nous trouver</dt>'],
    ['<dt>Horario</dt><dd>Lunes a Viernes · 9:00 – 19:00</dd>', '<dt>Horaires</dt><dd>Lundi – vendredi · 9 h – 19 h (heure des Canaries)</dd>'],
    ['Consulta gratuita y sin compromiso. ¿Prefieres hablar ahora?', 'Consultation gratuite et sans engagement. Vous préférez parler maintenant ?'],
    ['>Abre el chat<', '>Ouvrir le chat<'],

    // Formulario (el valor oculto «web-formulario» no se toca: lo espera el CRM)
    ['<label for="f-name">Nombre completo</label>', '<label for="f-name">Nom complet</label>'],
    ['placeholder="Tu nombre y apellidos"', 'placeholder="Vos prénom et nom"'],
    ['<label for="f-email">Email</label>', '<label for="f-email">E-mail</label>'],
    ['placeholder="tucorreo@empresa.com"', 'placeholder="vous@entreprise.fr"'],
    ['<label for="f-phone">Teléfono</label>', '<label for="f-phone">Téléphone</label>'],
    ['placeholder="+34 600 00 00 00"', 'placeholder="+33 6 00 00 00 00"'],
    ['<label for="f-empresa">Empresa <span style="opacity:.6">(opcional)</span>', '<label for="f-empresa">Entreprise <span style="opacity:.6">(facultatif)</span>'],
    ['placeholder="Nombre de tu empresa"', 'placeholder="Nom de votre entreprise"'],
    ['¿Qué te gustaría automatizar o mejorar?', 'Que souhaitez-vous automatiser ou améliorer ?'],
    ['Elige una opción…', 'Choisissez une option…'],
    ['<option>Atención al cliente (chatbot / WhatsApp)</option>', '<option>Service client (chatbot / WhatsApp)</option>'],
    ['<option>Automatización de procesos con IA</option>', '<option>Automatisation des processus par l’IA</option>'],
    ['<option>Página web / Landing</option>', '<option>Site web / Landing page</option>'],
    ['<option>Producción audiovisual (foto, vídeo, eventos)</option>', '<option>Production audiovisuelle (photo, vidéo, événements)</option>'],
    ['<option>Otro / No lo sé todavía</option>', '<option>Autre / Je ne sais pas encore</option>'],
    ['<label for="f-message">Cuéntanos más <span style="opacity:.6">(opcional)</span>', '<label for="f-message">Dites-nous-en plus <span style="opacity:.6">(facultatif)</span>'],
    ['placeholder="Detalles de tu caso, objetivos, plazos..."', 'placeholder="Votre besoin, vos objectifs, vos délais..."'],
    ['<span>Acepto la <a href="/privacidad.html" target="_blank">política de privacidad</a> y el tratamiento de mis datos para que AVAI Labs me contacte.</span>', '<span>J’accepte la <a href="/fr/confidentialite.html" target="_blank">politique de confidentialité</a> et le traitement de mes données pour qu’AVAI Labs me recontacte.</span>'],
    ['>Enviar solicitud<', '>Envoyer ma demande<'],
    ['También puedes escribirnos directamente a', 'Vous pouvez aussi nous écrire directement à'],
    ["btn.textContent = 'Enviando…';", "btn.textContent = 'Envoi…';"],
    ["btn.textContent = '✓ ¡Gracias! Te contactamos pronto';", "btn.textContent = '✓ Merci ! Nous vous recontactons vite';"],
    ["btn.textContent = 'No se pudo enviar — reinténtalo';", "btn.textContent = 'Échec de l’envoi — réessayez';"],
    ["fetch('enviar-lead.php'", "fetch('/enviar-lead.php'"],

    // Pie
    ['Agencia de diseño web e inteligencia artificial para empresas de España y Francia. Webs, chatbots y automatizaciones a medida.', 'Agence de création de sites web et d’intelligence artificielle pour les entreprises en France et en Espagne. Sites, chatbots et automatisations sur mesure.'],
    ['<h2>Soluciones</h2>', '<h2>Solutions</h2>'],
    ['<h2>Empresa</h2>', '<h2>Entreprise</h2>'],
    ['>Sobre nosotros<', '>À propos<'],
    ['>Casos de uso<', '>Cas d’usage<'],
    ['>Política de privacidad<', '>Politique de confidentialité<'],
    ['href="/privacidad.html"', 'href="/fr/confidentialite.html"'],
    ['© 2026 AVAI Labs. Todos los derechos reservados.', '© 2026 AVAI Labs. Tous droits réservés.'],
    ['· Hecho con IA', '· Fait avec l’IA'],
    ['href="/blog/"', 'href="/fr/blog/"'],
  ],
};
