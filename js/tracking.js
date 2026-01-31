// tracking.js - Sistema de tracking con Umami Analytics integrado

(function() {
  'use strict';
  
  let analyticsData = JSON.parse(localStorage.getItem('flashbuy_analytics') || '{}');
  
  // Inicializar estructura si no existe
  if (!analyticsData.visitantes) analyticsData.visitantes = [];
  if (!analyticsData.productosVendidos) analyticsData.productosVendidos = [];
  if (!analyticsData.productosClickeados) analyticsData.productosClickeados = {};
  if (!analyticsData.carritoAgregados) analyticsData.carritoAgregados = {};
  if (!analyticsData.carritoRemovidos) analyticsData.carritoRemovidos = {};
  if (!analyticsData.ventasPorHora) analyticsData.ventasPorHora = Array(24).fill(0);
  
  // ============================================
  // VERIFICAR SI UMAMI ESTÁ CARGADO
  // ============================================
  
  function isUmamiLoaded() {
    return typeof umami !== 'undefined' && typeof umami.track === 'function';
  }
  
  function waitForUmami(callback, maxAttempts = 20) {
    let attempts = 0;
    const checkUmami = setInterval(() => {
      attempts++;
      if (isUmamiLoaded()) {
        clearInterval(checkUmami);
        callback();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkUmami);
        console.log('⚠️ Umami no se cargó, usando tracking interno');
        callback(); // Continuar sin Umami
      }
    }, 100);
  }
  
  // ============================================
  // DETECTAR SI ES BOT (Filtro Local Adicional)
  // ============================================
  
  function isBot() {
    const botPatterns = [
      /bot/i, /spider/i, /crawl/i, /slurp/i, /lighthouse/i,
      /headless/i, /phantom/i, /selenium/i, /webdriver/i
    ];
    
    const userAgent = navigator.userAgent || '';
    return botPatterns.some(pattern => pattern.test(userAgent));
  }
  
  // ============================================
  // DETECTAR INFORMACIÓN DEL VISITANTE
  // ============================================
  
  async function obtenerInfoVisitante() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        ip: data.ip || generarIPLocal(),
        pais: data.country_name || 'Desconocido',
        bandera: obtenerBandera(data.country_code || 'XX'),
        ciudad: data.city || 'Desconocida',
        fecha: new Date().toISOString(),
        paginasVistas: 1,
        isBot: isBot()
      };
    } catch (error) {
      console.log('Usando datos locales para visitante');
      return {
        ip: generarIPLocal(),
        pais: 'Brasil',
        bandera: '🇧🇷',
        ciudad: 'São Paulo',
        fecha: new Date().toISOString(),
        paginasVistas: 1,
        isBot: isBot()
      };
    }
  }
  
  function generarIPLocal() {
    const navegador = navigator.userAgent;
    const idioma = navigator.language;
    const pantalla = `${screen.width}x${screen.height}`;
    const fingerprint = btoa(`${navegador}${idioma}${pantalla}`).substring(0, 10);
    
    const segments = fingerprint.match(/.{1,2}/g) || [];
    return segments.slice(0, 4).map(seg => {
      const num = parseInt(seg, 36) % 256;
      return num;
    }).join('.');
  }
  
  function obtenerBandera(countryCode) {
    const flags = {
      'BR': '🇧🇷', 'CO': '🇨🇴', 'MX': '🇲🇽', 'AR': '🇦🇷', 'ES': '🇪🇸',
      'US': '🇺🇸', 'CL': '🇨🇱', 'PE': '🇵🇪', 'VE': '🇻🇪', 'EC': '🇪🇨',
      'UY': '🇺🇾', 'PY': '🇵🇾', 'BO': '🇧🇴', 'CR': '🇨🇷', 'PA': '🇵🇦',
      'XX': '🌍'
    };
    return flags[countryCode] || '🌍';
  }
  
  // ============================================
  // REGISTRAR VISITA (CON UMAMI)
  // ============================================
  
  async function registrarVisita() {
    // Verificar si ya se registró en esta sesión
    const sessionKey = 'flashbuy_session_' + new Date().toDateString();
    if (sessionStorage.getItem(sessionKey)) {
      console.log('✓ Visitante ya registrado hoy');
      return;
    }
    
    // Verificar si es bot
    if (isBot()) {
      console.log('🤖 Bot detectado, no se registra');
      return;
    }
    
    console.log('🔍 Registrando nuevo visitante...');
    const infoVisitante = await obtenerInfoVisitante();
    
    // Si es bot, no registrar
    if (infoVisitante.isBot) {
      console.log('🤖 Bot detectado por user agent');
      return;
    }
    
    // Agregar a analytics local
    analyticsData.visitantes.push(infoVisitante);
    
    // Registrar hora de visita
    const hora = new Date().getHours();
    analyticsData.ventasPorHora[hora]++;
    
    // Guardar local
    localStorage.setItem('flashbuy_analytics', JSON.stringify(analyticsData));
    sessionStorage.setItem(sessionKey, 'true');
    
    // Enviar a Umami (si está disponible)
    if (isUmamiLoaded()) {
      umami.track('page_view', {
        ip: infoVisitante.ip,
        country: infoVisitante.pais,
        city: infoVisitante.ciudad
      });
      console.log('✅ Visita registrada en Umami');
    }
    
    console.log('✅ Visita registrada:', infoVisitante);
  }
  
  // ============================================
  // TRACKING DE CLICKS EN PRODUCTOS (CON UMAMI)
  // ============================================
  
  function trackProductClick(productId) {
    if (isBot()) return;
    
    if (!analyticsData.productosClickeados[productId]) {
      analyticsData.productosClickeados[productId] = 0;
    }
    analyticsData.productosClickeados[productId]++;
    localStorage.setItem('flashbuy_analytics', JSON.stringify(analyticsData));
    
    // Enviar a Umami
    if (isUmamiLoaded()) {
      umami.track('product_click', { product_id: productId });
    }
    
    console.log(`📊 Click registrado en producto ${productId}`);
  }
  
  // ============================================
  // TRACKING DE CARRITO (CON UMAMI)
  // ============================================
  
  function trackCarritoAgregado(productId) {
    if (isBot()) return;
    
    if (!analyticsData.carritoAgregados[productId]) {
      analyticsData.carritoAgregados[productId] = 0;
    }
    analyticsData.carritoAgregados[productId]++;
    localStorage.setItem('flashbuy_analytics', JSON.stringify(analyticsData));
    
    // Enviar a Umami
    if (isUmamiLoaded()) {
      umami.track('add_to_cart', { product_id: productId });
    }
    
    console.log(`🛒 Producto ${productId} agregado al carrito`);
  }
  
  function trackCarritoRemovido(productId) {
    if (isBot()) return;
    
    if (!analyticsData.carritoRemovidos[productId]) {
      analyticsData.carritoRemovidos[productId] = 0;
    }
    analyticsData.carritoRemovidos[productId]++;
    localStorage.setItem('flashbuy_analytics', JSON.stringify(analyticsData));
    
    // Enviar a Umami
    if (isUmamiLoaded()) {
      umami.track('remove_from_cart', { product_id: productId });
    }
    
    console.log(`🗑️ Producto ${productId} removido del carrito`);
  }
  
  // ============================================
  // TRACKING DE VENTAS (CON UMAMI)
  // ============================================
  
  function trackVenta(productId, cantidad) {
    if (isBot()) return;
    
    analyticsData.productosVendidos.push({
      productoId: productId,
      cantidad: cantidad,
      fecha: new Date().toISOString()
    });
    localStorage.setItem('flashbuy_analytics', JSON.stringify(analyticsData));
    
    // Enviar a Umami
    if (isUmamiLoaded()) {
      umami.track('purchase', { 
        product_id: productId,
        quantity: cantidad
      });
    }
    
    console.log(`💰 Venta registrada: Producto ${productId}, Cantidad ${cantidad}`);
  }
  
  // ============================================
  // TRACKING DE BÚSQUEDAS (NUEVO)
  // ============================================
  
  function trackBusqueda(termino) {
    if (isBot()) return;
    
    if (isUmamiLoaded()) {
      umami.track('search', { term: termino });
    }
    
    console.log(`🔍 Búsqueda: ${termino}`);
  }
  
  // ============================================
  // INTEGRAR CON FUNCIONES EXISTENTES
  // ============================================
  
  window.addEventListener('load', function() {
    // Esperar a que Umami se cargue
    waitForUmami(() => {
      // Registrar visita al cargar cualquier página
      registrarVisita();
      
      // Si estamos en detalle de producto, registrar click
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id');
      if (productId && window.location.pathname.includes('detalle-producto')) {
        trackProductClick(parseInt(productId));
      }
      
      // Monitorear clicks en tarjetas de productos
      setTimeout(() => {
        const productCards = document.querySelectorAll('.producto');
        productCards.forEach(card => {
          card.addEventListener('click', function(e) {
            const button = this.querySelector('button[onclick*="agregar"]');
            if (button) {
              const match = button.getAttribute('onclick').match(/agregar\((\d+)\)/);
              if (match) {
                const prodId = parseInt(match[1]);
                trackProductClick(prodId);
              }
            }
          });
        });
      }, 1000);
    });
  });
  
  // ============================================
  // SOBRESCRIBIR FUNCIONES EXISTENTES
  // ============================================
  
  const agregarInterval = setInterval(() => {
    if (window.agregar) {
      const originalAgregar = window.agregar;
      window.agregar = function(id) {
        trackCarritoAgregado(id);
        return originalAgregar(id);
      };
      clearInterval(agregarInterval);
      console.log('✅ Tracking de carrito activado (agregar)');
    }
  }, 100);
  
  const removeInterval = setInterval(() => {
    if (window.removeItem) {
      const originalRemoveItem = window.removeItem;
      window.removeItem = function(index) {
        const carrito = JSON.parse(localStorage.getItem('flashbuy_cart') || '[]');
        if (carrito[index]) {
          trackCarritoRemovido(carrito[index].id);
        }
        return originalRemoveItem(index);
      };
      clearInterval(removeInterval);
      console.log('✅ Tracking de carrito activado (remover)');
    }
  }, 100);
  
  // ============================================
  // API PÚBLICA
  // ============================================
  
  window.flashbuyTracking = {
    trackProductClick: trackProductClick,
    trackCarritoAgregado: trackCarritoAgregado,
    trackCarritoRemovido: trackCarritoRemovido,
    trackVenta: trackVenta,
    trackBusqueda: trackBusqueda,
    registrarVisita: registrarVisita,
    isUmamiLoaded: isUmamiLoaded
  };
  
  console.log('🚀 FlashBuy Tracking System con Umami cargado');
  
})();

// ============================================
// INSTRUCCIONES DE USO
// ============================================

/*
EVENTOS AUTOMÁTICOS TRACKEADOS EN UMAMI:

✅ page_view - Vista de página (sin bots)
✅ product_click - Click en producto
✅ add_to_cart - Agregar al carrito
✅ remove_from_cart - Remover del carrito
✅ purchase - Compra completada (manual)
✅ search - Búsqueda (si implementas buscador)

PARA TRACKEAR VENTAS MANUALMENTE:
window.flashbuyTracking.trackVenta(productoId, cantidad);

PARA TRACKEAR BÚSQUEDAS:
window.flashbuyTracking.trackBusqueda('termino de busqueda');

VERIFICAR SI UMAMI ESTÁ FUNCIONANDO:
window.flashbuyTracking.isUmamiLoaded() // true o false
*/