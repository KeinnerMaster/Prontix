// productos.js - Sistema de productos FlashBuy
// Conectado a Supabase para cargar productos desde admin

// ============================================
// CONFIGURACIÓN SUPABASE
// ============================================
const SUPABASE_URL = 'https://zoqgexabyljabqafqaaa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvcWdleGFieWxqYWJxYWZxYWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODQxMDAsImV4cCI6MjA4NTQ2MDEwMH0.1TgbafITIwwXaSgK3p19QtvciiaKusd1nNMyZXI5Xmg';

// Inicializar Supabase cuando esté disponible
let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// ============================================
// ARRAY DE PRODUCTOS (cargado desde Supabase)
// ============================================
let productos = [];

// Cargar productos desde Supabase
async function cargarProductosDesdeSupabase() {
  if (!supabaseClient) {
    console.error('⚠️ Supabase no disponible');
    return [];
  }

  try {
    const { data, error } = await supabaseClient
      .from('productos')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    
    productos = data || [];
    console.log(`✅ ${productos.length} productos cargados desde Supabase`);
    return productos;
  } catch (error) {
    console.error('❌ Error cargando productos:', error);
    return [];
  }
}

// ============================================
// FUNCIÓN PARA FORMATEAR BRL
// ============================================
function formatBRL(n) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ============================================
// FUNCIÓN AGREGAR AL CARRITO
// ============================================
function agregar(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) {
    alert('❌ Producto no encontrado');
    return;
  }

  if (producto.stock === 0) {
    alert('❌ Producto sin stock');
    return;
  }

  // Obtener carrito actual
  let carrito = JSON.parse(localStorage.getItem('flashbuy_cart') || '[]');
  
  // Buscar si ya existe
  const existe = carrito.find(item => item.id === id);
  
  if (existe) {
    if (existe.cantidad >= producto.stock) {
      alert('⚠️ No hay más stock disponible');
      return;
    }
    existe.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      categoria: producto.categoria,
      stock: producto.stock,
      cantidad: 1
    });
  }

  // Guardar carrito
  localStorage.setItem('flashbuy_cart', JSON.stringify(carrito));
  
  // Mostrar notificación
  mostrarNotificacion(`✅ "${producto.nombre}" agregado al carrito`);
}

// ============================================
// NOTIFICACIÓN VISUAL
// ============================================
function mostrarNotificacion(mensaje) {
  // Remover notificación anterior
  const anterior = document.querySelector('.cart-notification');
  if (anterior) anterior.remove();

  const notif = document.createElement('div');
  notif.className = 'cart-notification';
  notif.textContent = mensaje;
  notif.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: #25D366;
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 2500);
}

// ============================================
// RENDERIZAR PRODUCTOS
// ============================================
function renderizarProductos(container = document.getElementById('product-list'), productosAMostrar = productos) {
  if (!container) return;

  if (!productosAMostrar || productosAMostrar.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:60px;color:#999;font-size:18px;">No hay productos disponibles en este momento</p>';
    return;
  }

  container.innerHTML = '';
  
  productosAMostrar.forEach(p => {
    const div = document.createElement('div');
    div.className = 'producto';
    
    div.innerHTML = `
      <img src="${p.imagen || 'https://via.placeholder.com/300'}" alt="${p.nombre}" loading="lazy">
      <h4>${p.nombre}</h4>
      <p class="precio">${formatBRL(p.precio)}</p>
      <small style="color:#666;display:block;margin:8px 0;">Stock: ${p.stock > 0 ? p.stock + ' unidades' : 'Agotado'}</small>
      <button onclick="window.location.href='detalle-producto.html?id=${p.id}'" style="margin-bottom:8px;">Ver detalles</button>
      ${p.stock > 0 ? `<button onclick="agregar(${p.id})" class="btn-add-cart">🛒 Agregar al carrito</button>` : '<button disabled style="opacity:0.5;cursor:not-allowed;">Sin stock</button>'}
    `;
    
    container.appendChild(div);
  });
}

// ============================================
// FILTRAR POR CATEGORÍA
// ============================================
function filtrarPorCategoria(categoria) {
  const container = document.getElementById('product-list');
  if (!container) return;
  
  if (!categoria || categoria === 'todos') {
    renderizarProductos(container, productos);
  } else {
    const filtrados = productos.filter(p => p.categoria === categoria);
    renderizarProductos(container, filtrados);
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🔄 Inicializando FlashBuy...');
  
  // Esperar a que Supabase esté cargado
  let intentos = 0;
  while (!window.supabase && intentos < 10) {
    await new Promise(resolve => setTimeout(resolve, 100));
    intentos++;
  }
  
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    await cargarProductosDesdeSupabase();
    
    // Renderizar productos en la página
    const container = document.getElementById('product-list');
    if (container) {
      // Verificar si hay filtro por categoría en URL
      const urlParams = new URLSearchParams(window.location.search);
      const categoria = urlParams.get('categoria');
      
      if (categoria) {
        filtrarPorCategoria(categoria);
      } else {
        renderizarProductos(container, productos);
      }
    }
  } else {
    console.error('⚠️ No se pudo cargar Supabase');
  }
});

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================
window.agregar = agregar;
window.productos = productos;
window.formatBRL = formatBRL;
window.filtrarPorCategoria = filtrarPorCategoria;
window.cargarProductosDesdeSupabase = cargarProductosDesdeSupabase;