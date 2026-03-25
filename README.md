#  Estanco Ortega - Aplicación Web Modular

Proyecto educativo para el desarrollo de una aplicación web modularizada aplicando Vanilla JavaScript, HTML5 y CSS3, sin el uso de frameworks externos.

##  Requisitos de Ejecución

Debido a que este proyecto utiliza la **API Fetch** y **ES Modules** para cargar de manera dinámica los fragmentos HTML (`header`, `footer`, `sidebar`) y los datos del catálogo (`products.json`), **ES OBLIGATORIO ejecutar el proyecto en un servidor local**.


### 1. Modularización y Fragmentos Reactivos
La modularización divide la interfaz en pedazos pequeños, reutilizables y fáciles de mantener. En este proyecto se crearon archivos HTML individuales dentro de la carpeta `components/` (header, sidebar, footer) los cuales son cargados asíncronamente vía JavaScript (`fetch()`) y depositados en el DOM principal. Esto evita la duplicación de código en múltiples páginas.

### 2. Plantillas `<template>`
El elemento nativo `<template>` permite declarar fragmentos de marcado HTML que no se renderizan inmediatamente al cargar la página. Son clonados mediante JavaScript usando `template.content.cloneNode(true)` y luego insertados en el DOM con los datos obtenidos del archivo `JSON`.

### 3. Web Components (Shadow DOM)
Se creó el componente personalizado `<product-card>` heredando de `HTMLElement`. Utiliza **Shadow DOM** (`mode: 'open'`) para encapsular completamente sus estilos CSS y estructura interna, garantizando que ninguna regla de diseño externa afecte la tarjeta del producto, y viceversa. Los datos se envían a través de atributos HTML (`name`, `price`, `description`, `image`).

### 4. Funcionalidad de Inicio de Sesión
El archivo `login.html` implementa un formulario que se valida desde `js/login.js`. **Nota Académica:** Por requerimiento de la actividad, las credenciales están "quemadas" (*hardcoded*) en el código (`Jaider` / `ortega123`).En caso de fallo, alerta por pantalla; en caso de éxito, redirige al `index.html`.
