
FlashBuy - Sitio estático para Netlify (ajustado)
Archivos principales:
- index.html, contacto.html, carrito.html, login.html
- css/style.css
- js/productos.js (aquí defines los productos)
- js/carrito.js, js/nav.js
- flashbuy-logo.svg
- assets/hero-banner.jpg, assets/hero-right.png

Cómo editar o agregar productos (pasos claros):
1) Abre el archivo js/productos.js (está en /js/productos.js).
2) Verás un arreglo `productos` con objetos. Cada objeto tiene estas propiedades:
   - id: número único (no repetir)
   - nombre: string (nombre del producto)
   - precio: number (en BRL, por ejemplo 49.90)
   - imagen: url de la imagen (puedes subir a /assets y poner 'assets/mi-imagen.jpg')
   - categoria: una de ["Tecnologia","Ropa","Accesorios","Utensilios"]
   - stock: número entero
3) Para agregar un producto nuevo, copia este ejemplo y pégalo en el arreglo:
   { id: 10, nombre: "Mi Producto Nuevo", precio: 59.90, imagen: "assets/mi-producto.jpg", categoria: "Accesorios", stock: 50 }
4) Guarda el archivo y recarga la página; el producto aparecerá automáticamente.
5) Para cambiar precios o imágenes, edita las propiedades correspondientes y recarga.
6) Recomendaciones: nombres cortos y una imagen 800x600 para consistencia visual.

Integración de pagos:
- Actualmente el botón "Agregar al carrito" guarda en localStorage.
- Para recibir pagos reales necesitamos integrar Mercado Pago (checkout) o un formulario que redirija a un pago.
- Puedo generar el código de checkout (ej. 'Pagar con Mercado Pago') y una función serverless para confirmar webhooks.

Despliegue en Netlify:
1) Crea un repo en GitHub y sube todo (o arrastra el ZIP en Netlify).
2) En Netlify, 'New site from Git' y conecta el repo. Publish dir: / .
3) Opcional: configura dominio y HTTPS.
