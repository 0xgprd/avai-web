# Web Atlantic Vision AI / AVAI Labs — imagen para desplegar en EasyPanel (VPS).
# php:8.3-apache sirve el HTML estatico Y ejecuta enviar-lead.php (proxy del formulario -> Airtable).
# La extension curl (que usa enviar-lead.php) viene incluida por defecto en la imagen oficial de PHP.
FROM php:8.3-apache

# Apache sirve desde /var/www/html; index.html es la portada por defecto.
COPY index.html      /var/www/html/index.html
COPY privacidad.html /var/www/html/privacidad.html
COPY enviar-lead.php /var/www/html/enviar-lead.php
COPY robots.txt      /var/www/html/robots.txt
COPY sitemap.xml     /var/www/html/sitemap.xml
COPY assets/         /var/www/html/assets/
# Experiencia 3D (oct-2026): hoja de estilos y módulos JavaScript de la web. Three.js y GSAP van en assets/vendor/.
COPY css/            /var/www/html/css/
COPY js/             /var/www/html/js/

# EL HTML NO SE CACHEA; LOS ASSETS SÍ (20-ago-2026).
#
# Apache servía index.html SIN ninguna cabecera de caché, así que cada navegador aplicaba su propia
# regla (normalmente: guárdatelo un rato). Consecuencia real: se despliega un cambio, se entra en la
# web y se sigue viendo la versión vieja — con la conclusión lógica de que "el cambio no funciona"
# cuando en el servidor estaba perfectamente. Pasó con la apertura automática del chat.
#
# El HTML es pequeño y cambia; las imágenes y vídeos son grandes y no cambian: por eso las dos
# reglas son distintas. Sin la segunda, quitar la caché del HTML se llevaría por delante la de los
# assets y la web iría más lenta para todo el mundo.
#
# CSS Y JS DE LA WEB: SE REVALIDAN (21-oct-2026). Desde la experiencia 3D la web carga una hoja de
# estilos y unos 15 módulos JavaScript que se importan entre sí por su nombre (js/main.js → js/ui/nav.js…).
# Con 7 días de caché, tras un despliegue el navegador mezclaría módulos nuevos con viejos. Con
# "no-cache" el navegador conserva la copia pero pregunta si cambió (respuesta 304, sin descargar).
# assets/vendor/ (Three.js y GSAP) lleva la versión en el nombre del fichero: no cambia nunca, así que
# se cachea un año. La regla <If> se aplica después de las <FilesMatch> y por eso gana.
RUN a2enmod headers \
 && printf '%s\n' \
    '<FilesMatch "\.(html|php|css|js)$">' \
    '  Header set Cache-Control "no-cache, must-revalidate"' \
    '</FilesMatch>' \
    '<FilesMatch "\.(png|jpe?g|webp|svg|mp4|ico)$">' \
    '  Header set Cache-Control "public, max-age=604800"' \
    '</FilesMatch>' \
    '<If "%{REQUEST_URI} =~ m#^/assets/vendor/#">' \
    '  Header set Cache-Control "public, max-age=31536000, immutable"' \
    '</If>' \
    > /etc/apache2/conf-available/avai-cache.conf \
 && a2enconf avai-cache

# SEGURIDAD Y UN SOLO DOMINIO (30-sep-2026).
#
# - www.avai-labs.com respondía 200 con la misma web: Google veía dos copias. Ahora redirige (301)
#   a avai-labs.com conservando la ruta. Va en <Directory> porque las reglas de mod_rewrite puestas
#   a nivel global no las heredan los VirtualHost de Debian.
# - HSTS: el navegador recuerda que la web va siempre por HTTPS (sin includeSubDomains, para no
#   imponerlo a otros subdominios). nosniff y Referrer-Policy: buenas prácticas básicas; con esa
#   política enviar-lead.php sigue recibiendo la página completa como referer (mismo origen).
# - ServerTokens/ServerSignature: Apache deja de anunciar su versión. El fichero empieza por "zz-"
#   para cargarse DESPUÉS del security.conf de Debian, que si no vuelve a poner "ServerTokens OS".
RUN a2enmod rewrite \
 && printf '%s\n' \
    'ServerTokens Prod' \
    'ServerSignature Off' \
    'Header always set Strict-Transport-Security "max-age=31536000"' \
    'Header always set X-Content-Type-Options "nosniff"' \
    'Header always set Referrer-Policy "strict-origin-when-cross-origin"' \
    '<Directory /var/www/html>' \
    '  RewriteEngine On' \
    '  RewriteCond %{HTTP_HOST} ^www\.avai-labs\.com$ [NC]' \
    '  RewriteRule ^(.*)$ https://avai-labs.com/$1 [R=301,L]' \
    '</Directory>' \
    > /etc/apache2/conf-available/zz-avai-seguridad.conf \
 && a2enconf zz-avai-seguridad

# Traefik (el reverse proxy de EasyPanel) enruta el trafico a este puerto interno.
EXPOSE 80
