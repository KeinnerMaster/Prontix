// ============================================
// CARGAR PRODUCTOS DESDE SUPABASE
// ============================================

const SUPABASE_URL = 'https://zoqgexabyljabqafqaaa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvcWdleGFieWxqYWJxYWZxYWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODQxMDAsImV4cCI6MjA4NTQ2MDEwMH0.1TgbafITIwwXaSgK3p19QtvciiaKusd1nNMyZXI5Xmg';

let productos = [];

// Inicializar Supabase
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Cargar productos desde Supabase
async function cargarProductos() {
  if (!supabaseClient) {
    console.error('Supabase no está disponible');
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from('productos')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    
    productos = data || [];
    console.log('Productos cargados desde Supabase:', productos.length);
    
    // Renderizar automáticamente si estamos en la página de productos
    if (document.getElementById('product-list')) {
      renderizarProductos(productos);
    }
    
    return productos;
  } catch (error) {
    console.error('Error cargando productos:', error);
    productos = [];
    return [];
  }
}

// Renderizar productos en la galería
function renderizarProductos(productosArray) {
  const container = document.getElementById('product-list');
  if (!container) return;

  if (!productosArray || productosArray.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">No hay productos disponibles</p>';
    return;
  }

  container.innerHTML = productosArray.map(p => `
    <div class="producto">
      <a href="detalle-producto.html?id=${p.id}">
        <img src="${p.imagen || 'https://via.placeholder.com/300'}" alt="${p.nombre}">
      </a>
      <h4>${p.nombre}</h4>
      <p class="precio">R$ ${parseFloat(p.precio).toFixed(2)}</p>
      <p class="categoria">${p.categoria}</p>
      ${p.stock === 0 ? '<p class="sin-stock">❌ Sin Stock</p>' : 
        p.stock < 20 ? '<p class="stock-bajo">⚠️ Stock Bajo</p>' : 
        '<p class="disponible">✅ Disponible</p>'}
      <button onclick="verDetalle(${p.id})">Ver Detalles</button>
      ${p.stock > 0 ? `<button onclick="agregarAlCarrito(${p.id})">🛒 Agregar</button>` : ''}
    </div>
  `).join('');
}

// Ver detalle del producto
function verDetalle(id) {
  window.location.href = `detalle-producto.html?id=${id}`;
}

// Obtener producto por ID
function obtenerProductoPorId(id) {
  return productos.find(p => p.id === parseInt(id));
}

// Filtrar por categoría
function filtrarPorCategoria(categoria) {
  if (!categoria || categoria === 'todos') {
    renderizarProductos(productos);
  } else {
    const filtrados = productos.filter(p => p.categoria === categoria);
    renderizarProductos(filtrados);
  }
}

// ============================================
// CARRITO DE COMPRAS
// ============================================

function obtenerCarrito() {
  const carrito = localStorage.getItem('flashbuy_carrito');
  return carrito ? JSON.parse(carrito) : [];
}

function guardarCarrito(carrito) {
  localStorage.setItem('flashbuy_carrito', JSON.stringify(carrito));
  actualizarContadorCarrito();
}

function agregarAlCarrito(id) {
  const producto = obtenerProductoPorId(id);
  if (!producto) {
    alert('❌ Producto no encontrado');
    return;
  }

  if (producto.stock === 0) {
    alert('❌ Este producto no tiene stock disponible');
    return;
  }

  const carrito = obtenerCarrito();
  const itemExistente = carrito.find(item => item.id === id);

  if (itemExistente) {
    if (itemExistente.cantidad >= producto.stock) {
      alert('⚠️ No hay más stock disponible');
      return;
    }
    itemExistente.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: 1,
      stock: producto.stock
    });
  }

  guardarCarrito(carrito);
  alert('✅ Producto agregado al carrito');
}

function actualizarContadorCarrito() {
  const carrito = obtenerCarrito();
  const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  
  const contadores = document.querySelectorAll('.cart-count');
  contadores.forEach(contador => {
    contador.textContent = total;
  });
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
  console.log('Inicializando carga de productos...');
  
  // Esperar a que Supabase esté disponible
  if (!window.supabase) {
    console.error('⚠️ Supabase no está cargado. Asegúrate de incluir el script de Supabase.');
    return;
  }

  await cargarProductos();
  actualizarContadorCarrito();

  // Si estamos en la página de productos, manejar filtros por categoría
  const urlParams = new URLSearchParams(window.location.search);
  const categoria = urlParams.get('categoria');
  if (categoria) {
    filtrarPorCategoria(categoria);
  }
});

// Exportar funciones globales
window.cargarProductos = cargarProductos;
window.obtenerProductoPorId = obtenerProductoPorId;
window.agregarAlCarrito = agregarAlCarrito;
window.verDetalle = verDetalle;
window.filtrarPorCategoria = filtrarPorCategoria;