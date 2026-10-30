# Blog de AVAI Labs: cómo se escribe un artículo

Esta guía la siguen Claude y la rutina programada que propone, cada 2 semanas, **un artículo en español y otro en
francés**. Cada artículo es un fichero `contenido/blog/es/<slug>.html` o `contenido/blog/fr/<slug>.html`. Después se ejecuta `node tools/construir.js`, que genera `blog/`,
`sitemap.xml` y `llms.txt`, y luego `node tools/verificar-paginas.js`.

**Nada se publica sin el visto bueno de Gabriel.** La rutina deja el artículo en una rama y abre una pull request.
Gabriel la revisa y dice «publica».

## Línea editorial (decidida por Gabriel, 29-oct-2026)

- **Tema:** una noticia real y reciente (de las últimas 2-3 semanas) sobre inteligencia artificial y empresas:
  estudios, cifras de adopción, lanzamientos de las grandes tecnológicas o empresas que ya la usan.
- **Objetivo:** que el empresario sienta que no puede quedarse atrás (FOMO). Sus competidores ya la usan, y la IA
  mejora la productividad, los procesos y la competitividad.
- **El FOMO sale de los hechos:** cada cifra lleva su fuente enlazada. No hay alarmismo inventado ni cifras
  redondeadas a conveniencia.
- **NO enseñar a hacerlo solo.** Nada de tutoriales, de pasos de implantación ni de nombres de herramientas
  que el cliente pueda contratar y montar por su cuenta. Tampoco «cómo configurar X». Se explica **qué** está
  pasando y **por qué** importa, nunca **cómo** hacerlo uno mismo. La conclusión es que se hace bien con un
  equipo experto. Puede enlazar a una página de servicio de AVAI Labs.
- **Dos blogs, no traducciones (30-oct-2026):** el español cuenta noticias y estudios de España (Banco de España, INE,
  informes de pymes españolas); el francés, de Francia (Banque de France, Insee, baromètre France Num, Bpifrance).
  Las noticias internacionales (grandes tecnológicas) pueden ir en los dos, cada uno escrito para su lector.
- **Imagen internacional:** se habla de «empresas españolas» o de «entreprises françaises», nunca de Tenerife ni de Canarias.
- **Enlaces internos:** cada blog enlaza a las páginas de servicio de su idioma (`/agencia-inteligencia-artificial/`,
  `/fr/agence-intelligence-artificielle/`…).
- **Minimalista:** entre 400 y 600 palabras, 2 o 3 subtítulos y frases cortas. Quien tenga prisa lee el resumen.

## Formato del fichero

La primera línea es una cabecera JSON dentro de un comentario. Después va el cuerpo en HTML sencillo: `<p>`,
`<h2>`, `<ul>` y `<a>`. El cuerpo no lleva `<h1>`, porque el título lo pone la plantilla, y tampoco el
llamado final («¿Lo aplicamos en tu empresa?»), que también lo pone la plantilla.

```html
<!-- {
  "titulo": "Titular directo, con el dato principal",
  "descripcion": "Una frase de 140-160 caracteres para Google y para la lista del blog.",
  "fecha": "AAAA-MM-DD",
  "resumen": ["Idea 1, con la cifra clave.", "Idea 2.", "Idea 3: qué significa para tu empresa."],
  "fuentes": [{ "t": "Medio o institución: título de la noticia", "href": "https://..." }]
} -->
<p>Primer párrafo: la noticia en dos frases.</p>
<h2>Qué ha pasado</h2>
<p>...</p>
```

- **slug:** el nombre del fichero, en minúsculas, sin tildes y con guiones. Por ejemplo, `pymes-ia-ahorran-13-horas-semana`.
- **fecha:** la de publicación prevista. Si se corrige un artículo ya publicado, se añade `"modificado": "AAAA-MM-DD"`.
- **fuentes:** al menos una, y mejor la original (institución o empresa) que un blog que la cita.
