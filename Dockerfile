# Web Atlantic Vision AI / AVAI Labs — imagen para desplegar en EasyPanel (VPS).
# php:8.3-apache sirve el HTML estatico Y ejecuta enviar-lead.php (proxy del formulario -> Airtable).
# La extension curl (que usa enviar-lead.php) viene incluida por defecto en la imagen oficial de PHP.
FROM php:8.3-apache

# Apache sirve desde /var/www/html; index.html es la portada por defecto.
COPY index.html      /var/www/html/index.html
COPY enviar-lead.php /var/www/html/enviar-lead.php
COPY assets/         /var/www/html/assets/

# Traefik (el reverse proxy de EasyPanel) enruta el trafico a este puerto interno.
EXPOSE 80
