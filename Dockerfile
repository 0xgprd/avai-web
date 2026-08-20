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

# Traefik (el reverse proxy de EasyPanel) enruta el trafico a este puerto interno.
EXPOSE 80
