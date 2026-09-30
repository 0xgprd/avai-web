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
RUN a2enmod headers \
 && printf '%s\n' \
    '<FilesMatch "\.(html|php)$">' \
    '  Header set Cache-Control "no-cache, must-revalidate"' \
    '</FilesMatch>' \
    '<FilesMatch "\.(png|jpe?g|webp|svg|mp4|ico|css|js)$">' \
    '  Header set Cache-Control "public, max-age=604800"' \
    '</FilesMatch>' \
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
# - ServerTokens/ServerSignature: Apache deja de anunciar su versión.
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
    > /etc/apache2/conf-available/avai-seguridad.conf \
 && a2enconf avai-seguridad

# Traefik (el reverse proxy de EasyPanel) enruta el trafico a este puerto interno.
EXPOSE 80
