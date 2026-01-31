// admin-analytics.js - Sistema completo de analytics y tracking

// ============================================
// VARIABLES GLOBALES Y CONFIGURACIÓN
// ============================================

let productosAdmin = [];
let analyticsData = {
  visitantes: [],
  productosVendidos: [],
  productosClickeados: {},
  carritoAgregados: {},
  carritoRemovidos: {},
  ventasPorHora: Array(24).fill(0)
};

let charts = {};
let currentFilter = 'todos';

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  cargarDatos();
  inicializarCharts();
  actualizarDashboard();
  renderizarProductos();
  
  // Actualizar dashboard cada 30 segundos
  setInterval(actualizarDashboard, 30000);
});

// ============================================
// GESTIÓN DE TABS
// ============================================

function switchTab(tabName) {
  // Ocultar todos los tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Ocultar todos los botones activos
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Mostrar tab seleccionado
  document.getElementById(`tab-${tabName}`).classList.add('active');
  event.target.classList.add('active');
  
  // Actualizar datos si es necesario
  if (tabName === 'dashboard') {
    actualizarDashboard();
  } else if (tabName === 'productos') {
    renderizarProductos();
  }
}

window.switchTab = switchTab;

// ============================================
// CARGAR Y GUARDAR DATOS
// ============================================

function cargarDatos() {
  // Cargar productos
  const savedProducts = localStorage.getItem('flashbuy_productos');
  productosAdmin = savedProducts ? JSON.parse(savedProducts) : [];
  
  // Cargar analytics
  const savedAnalytics = localStorage.getItem('flashbuy_analytics');
  if (savedAnalytics) {
    analyticsData = JSON.parse(savedAnalytics);
  }
  
  // Inicializar analytics de productos si no existen
  productosAdmin.forEach(p => {
    if (!analyticsData.productosClickeados[p.id]) {
      analyticsData.productosClickeados[p.id] = 0;
    }
    if (!analyticsData.carritoAgregados[p.id]) {
      analyticsData.carritoAgregados[p.id] = 0;
    }
    if (!analyticsData.carritoRemovidos[p.id]) {
      analyticsData.carritoRemovidos[p.id] = 0;
    }
  });
}

function guardarAnalytics() {
  localStorage.setItem('flashbuy_analytics', JSON.stringify(analyticsData));
}

// ============================================
// ACTUALIZAR DASHBOARD
// ============================================

function actualizarDashboard() {
  cargarDatos();
  
  // Estadísticas generales
  const visitantesUnicos = analyticsData.visitantes.length;
  const productosVendidos = analyticsData.productosVendidos.length;
  const totalAgregados = Object.values(analyticsData.carritoAgregados).reduce((a, b) => a + b, 0);
  const totalRemovidos = Object.values(analyticsData.carritoRemovidos).reduce((a, b) => a + b, 0);
  
  // Calcular ventas totales
  let ventasTotal = 0;
  analyticsData.productosVendidos.forEach(venta => {
    const producto = productosAdmin.find(p => p.id === venta.productoId);
    if (producto) {
      ventasTotal += producto.precio * venta.cantidad;
    }
  });
  
  // Productos activos (con stock)
  const productosActivos = productosAdmin.filter(p => p.stock > 0).length;
  
  // Tasa de conversión
  const tasaConversion = visitantesUnicos > 0 
    ? ((productosVendidos / visitantesUnicos) * 100).toFixed(1)
    : 0;
  
  // Valor promedio
  const valorPromedio = productosVendidos > 0
    ? (ventasTotal / productosVendidos).toFixed(2)
    : 0;
  
  // Actualizar cards
  document.getElementById('stat-visitantes').textContent = visitantesUnicos;
  document.getElementById('stat-vendidos').textContent = productosVendidos;
  document.getElementById('stat-agregados').textContent = totalAgregados;
  document.getElementById('stat-removidos').textContent = totalRemovidos;
  document.getElementById('stat-ventas-total').textContent = formatBRL(ventasTotal);
  document.getElementById('stat-productos-activos').textContent = productosActivos;
  document.getElementById('stat-conversion').textContent = tasaConversion + '%';
  document.getElementById('stat-valor-promedio').textContent = formatBRL(parseFloat(valorPromedio));
  
  // Actualizar gráficos
  actualizarCharts();
  
  // Actualizar tabla de visitantes
  actualizarTablaVisitantes();
}

// ============================================
// INICIALIZAR Y ACTUALIZAR GRÁFICOS
// ============================================

function inicializarCharts() {
  // Gráfico: Productos Más Vendidos
  const ctxVendidos = document.getElementById('chartVendidos');
  if (ctxVendidos) {
    charts.vendidos = new Chart(ctxVendidos, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
  
  // Gráfico: Productos Más Clickeados
  const ctxClickeados = document.getElementById('chartClickeados');
  if (ctxClickeados) {
    charts.clickeados = new Chart(ctxClickeados, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Clicks',
          data: [],
          backgroundColor: '#FF7A00'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  // Gráfico: Visitas por Hora
  const ctxVisitasHora = document.getElementById('chartVisitasHora');
  if (ctxVisitasHora) {
    charts.visitasHora = new Chart(ctxVisitasHora, {
      type: 'line',
      data: {
        labels: Array.from({length: 24}, (_, i) => i + ':00'),
        datasets: [{
          label: 'Visitas',
          data: Array(24).fill(0),
          borderColor: '#FF7A00',
          backgroundColor: 'rgba(255, 122, 0, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  // Gráfico: Visitantes por País
  const ctxPaises = document.getElementById('chartPaises');
  if (ctxPaises) {
    charts.paises = new Chart(ctxPaises, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
  
  // Gráfico: Carrito
  const ctxCarrito = document.getElementById('chartCarrito');
  if (ctxCarrito) {
    charts.carrito = new Chart(ctxCarrito, {
      type: 'bar',
      data: {
        labels: ['Agregados', 'Removidos'],
        datasets: [{
          label: 'Productos',
          data: [0, 0],
          backgroundColor: ['#4CAF50', '#F44336']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

function actualizarCharts() {
  // Actualizar Productos Más Vendidos
  const ventasPorProducto = {};
  analyticsData.productosVendidos.forEach(venta => {
    ventasPorProducto[venta.productoId] = (ventasPorProducto[venta.productoId] || 0) + venta.cantidad;
  });
  
  const topVendidos = Object.entries(ventasPorProducto)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  if (charts.vendidos) {
    charts.vendidos.data.labels = topVendidos.map(([id]) => {
      const producto = productosAdmin.find(p => p.id === parseInt(id));
      return producto ? producto.nombre.substring(0, 20) : 'Desconocido';
    });
    charts.vendidos.data.datasets[0].data = topVendidos.map(([_, cant]) => cant);
    charts.vendidos.update();
  }
  
  // Actualizar Productos Más Clickeados
  const topClickeados = Object.entries(analyticsData.productosClickeados)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  
  if (charts.clickeados) {
    charts.clickeados.data.labels = topClickeados.map(([id]) => {
      const producto = productosAdmin.find(p => p.id === parseInt(id));
      return producto ? producto.nombre.substring(0, 15) : 'Desconocido';
    });
    charts.clickeados.data.datasets[0].data = topClickeados.map(([_, clicks]) => clicks);
    charts.clickeados.update();
  }
  
  // Actualizar Visitantes por País
  const paisesCounts = {};
  analyticsData.visitantes.forEach(v => {
    paisesCounts[v.pais] = (paisesCounts[v.pais] || 0) + 1;
  });
  
  const topPaises = Object.entries(paisesCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  if (charts.paises) {
    charts.paises.data.labels = topPaises.map(([pais]) => pais);
    charts.paises.data.datasets[0].data = topPaises.map(([_, count]) => count);
    charts.paises.update();
  }
  
  // Actualizar Carrito
  const totalAgregados = Object.values(analyticsData.carritoAgregados).reduce((a, b) => a + b, 0);
  const totalRemovidos = Object.values(analyticsData.carritoRemovidos).reduce((a, b) => a + b, 0);
  
  if (charts.carrito) {
    charts.carrito.data.datasets[0].data = [totalAgregados, totalRemovidos];
    charts.carrito.update();
  }
  
  // Actualizar Visitas por Hora
  if (charts.visitasHora) {
    charts.visitasHora.data.datasets[0].data = analyticsData.ventasPorHora;
    charts.visitasHora.update();
  }
}

// ============================================
// TABLA DE VISITANTES
// ============================================

function actualizarTablaVisitantes() {
  const tbody = document.getElementById('visitantes-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  // Mostrar últimos 10 visitantes
  const visitantesRecientes = [...analyticsData.visitantes]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 10);
  
  visitantesRecientes.forEach(visitante => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code>${visitante.ip}</code></td>
      <td><span class="country-flag">${visitante.bandera}</span>${visitante.pais}</td>
      <td>${visitante.ciudad}</td>
      <td>${new Date(visitante.fecha).toLocaleString('es')}</td>
      <td>${visitante.paginasVistas || 1}</td>
      <td>${visitante.duracion || '< 1min'}</td>
    `;
    tbody.appendChild(tr);
  });
  
  if (visitantesRecientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#999;">No hay visitantes registrados aún</td></tr>';
  }
}

// ============================================
// GESTIÓN DE PRODUCTOS - TABLA
// ============================================

function renderizarProductos() {
  const tbody = document.getElementById('productos-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  let productosFiltrados = [...productosAdmin];
  
  // Aplicar filtro
  if (currentFilter === 'vendidos') {
    const ventasPorProducto = {};
    analyticsData.productosVendidos.forEach(venta => {
      ventasPorProducto[venta.productoId] = (ventasPorProducto[venta.productoId] || 0) + venta.cantidad;
    });
    productosFiltrados.sort((a, b) => (ventasPorProducto[b.id] || 0) - (ventasPorProducto[a.id] || 0));
  } else if (currentFilter === 'clickeados') {
    productosFiltrados.sort((a, b) => 
      (analyticsData.productosClickeados[b.id] || 0) - (analyticsData.productosClickeados[a.id] || 0)
    );
  } else if (currentFilter === 'stock-bajo') {
    productosFiltrados = productosFiltrados.filter(p => p.stock > 0 && p.stock < 20);
  } else if (currentFilter === 'sin-stock') {
    productosFiltrados = productosFiltrados.filter(p => p.stock === 0);
  }
  
  productosFiltrados.forEach((producto, index) => {
    const clicks = analyticsData.productosClickeados[producto.id] || 0;
    const agregados = analyticsData.carritoAgregados[producto.id] || 0;
    const removidos = analyticsData.carritoRemovidos[producto.id] || 0;
    
    // Calcular ventas
    let ventas = 0;
    analyticsData.productosVendidos.forEach(venta => {
      if (venta.productoId === producto.id) {
        ventas += venta.cantidad;
      }
    });
    
    // Badge de estado
    let badge = '';
    if (ventas > 50) {
      badge = '<span class="badge hot">🔥 HOT</span>';
    } else if (clicks > 100) {
      badge = '<span class="badge trending">📈 TRENDING</span>';
    } else if (producto.stock < 10 && producto.stock > 0) {
      badge = '<span class="badge new">⚠️ STOCK BAJO</span>';
    }
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${index + 1}</strong></td>
      <td>
        <div style="display:flex;align-items:center;gap:15px;">
          <img src="${producto.imagen}" class="product-img" alt="${producto.nombre}">
          <div>
            <strong>${producto.nombre}</strong>
            <div style="color:#999;font-size:12px;">${producto.categoria}</div>
          </div>
        </div>
      </td>
      <td><strong>${formatBRL(producto.precio)}</strong></td>
      <td>${producto.stock > 0 ? `✓ ${producto.stock}` : '<span style="color:#F44336">❌ Agotado</span>'}</td>
      <td>${clicks} clicks</td>
      <td><strong>${ventas}</strong> unidades</td>
      <td style="color:#4CAF50">${agregados}</td>
      <td style="color:#F44336">${removidos}</td>
      <td>${badge}</td>
      <td>
        <button class="btn-edit" onclick="editarProducto(${producto.id})">✏️</button>
        <button class="btn-delete" onclick="eliminarProducto(${producto.id})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  if (productosFiltrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:40px;color:#999;">No hay productos con este filtro</td></tr>';
  }
}

function filtrarProductos(filtro) {
  currentFilter = filtro;
  
  // Actualizar botones
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  renderizarProductos();
}

window.filtrarProductos = filtrarProductos;

// ============================================
// FORMULARIO DE PRODUCTOS
// ============================================

let editingId = null;

document.getElementById('productoForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const producto = {
    id: editingId || generarId(),
    nombre: document.getElementById('producto_nombre').value.trim(),
    precio: parseFloat(document.getElementById('producto_precio').value),
    imagen: document.getElementById('producto_imagen').value.trim(),
    imagenes: [document.getElementById('producto_imagen').value.trim()],
    categoria: document.getElementById('producto_categoria').value,
    stock: parseInt(document.getElementById('producto_stock').value),
    descripcion: document.getElementById('producto_descripcion').value.trim()
  };
  
  if (editingId) {
    const index = productosAdmin.findIndex(p => p.id === editingId);
    productosAdmin[index] = producto;
    alert('✅ Producto actualizado correctamente');
  } else {
    productosAdmin.push(producto);
    
    // Inicializar analytics para el nuevo producto
    analyticsData.productosClickeados[producto.id] = 0;
    analyticsData.carritoAgregados[producto.id] = 0;
    analyticsData.carritoRemovidos[producto.id] = 0;
    
    alert('✅ Producto agregado correctamente');
  }
  
  guardarProductos();
  guardarAnalytics();
  limpiarFormulario();
  renderizarProductos();
  actualizarDashboard();
  
  switchTab('productos');
});

function guardarProductos() {
  localStorage.setItem('flashbuy_productos', JSON.stringify(productosAdmin));
}

function generarId() {
  return productosAdmin.length > 0 
    ? Math.max(...productosAdmin.map(p => p.id)) + 1 
    : 1;
}

function editarProducto(id) {
  const producto = productosAdmin.find(p => p.id === id);
  if (!producto) return;
  
  editingId = id;
  document.getElementById('form-title').textContent = '✏️ Editar Producto';
  document.getElementById('btn-submit').textContent = '💾 Actualizar Producto';
  
  document.getElementById('producto_nombre').value = producto.nombre;
  document.getElementById('producto_precio').value = producto.precio;
  document.getElementById('producto_categoria').value = producto.categoria;
  document.getElementById('producto_stock').value = producto.stock;
  document.getElementById('producto_descripcion').value = producto.descripcion || '';
  document.getElementById('producto_imagen').value = producto.imagen;
  
  switchTab('agregar');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function eliminarProducto(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
  
  productosAdmin = productosAdmin.filter(p => p.id !== id);
  guardarProductos();
  renderizarProductos();
  actualizarDashboard();
  alert('🗑️ Producto eliminado correctamente');
}

function cancelarEdicion() {
  limpiarFormulario();
  switchTab('productos');
}

function limpiarFormulario() {
  document.getElementById('productoForm').reset();
  document.getElementById('form-title').textContent = '➕ Agregar Nuevo Producto';
  document.getElementById('btn-submit').textContent = '💾 Guardar Producto';
  editingId = null;
}

window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
window.cancelarEdicion = cancelarEdicion;

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

function formatBRL(n) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ============================================
// SIMULACIÓN DE DATOS (PARA DEMO)
// ============================================

// Si no hay datos, generar algunos para demostración
if (analyticsData.visitantes.length === 0) {
  generarDatosDemo();
}

function generarDatosDemo() {
  const paises = [
    { nombre: 'Brasil', bandera: '🇧🇷', ciudad: 'São Paulo' },
    { nombre: 'Colombia', bandera: '🇨🇴', ciudad: 'Medellín' },
    { nombre: 'México', bandera: '🇲🇽', ciudad: 'Ciudad de México' },
    { nombre: 'Argentina', bandera: '🇦🇷', ciudad: 'Buenos Aires' },
    { nombre: 'España', bandera: '🇪🇸', ciudad: 'Madrid' }
  ];
  
  // Generar visitantes aleatorios
  for (let i = 0; i < 50; i++) {
    const pais = paises[Math.floor(Math.random() * paises.length)];
    const fecha = new Date();
    fecha.setHours(fecha.getHours() - Math.floor(Math.random() * 72));
    
    analyticsData.visitantes.push({
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      pais: pais.nombre,
      bandera: pais.bandera,
      ciudad: pais.ciudad,
      fecha: fecha.toISOString(),
      paginasVistas: Math.floor(Math.random() * 5) + 1,
      duracion: `${Math.floor(Math.random() * 10) + 1}min`
    });
    
    const hora = fecha.getHours();
    analyticsData.ventasPorHora[hora]++;
  }
  
  // Generar clicks y ventas aleatorias para productos
  productosAdmin.forEach(producto => {
    analyticsData.productosClickeados[producto.id] = Math.floor(Math.random() * 200);
    analyticsData.carritoAgregados[producto.id] = Math.floor(Math.random() * 50);
    analyticsData.carritoRemovidos[producto.id] = Math.floor(Math.random() * 20);
    
    // Algunas ventas
    const numVentas = Math.floor(Math.random() * 10);
    for (let i = 0; i < numVentas; i++) {
      analyticsData.productosVendidos.push({
        productoId: producto.id,
        cantidad: Math.floor(Math.random() * 3) + 1,
        fecha: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  });
  
  guardarAnalytics();
}
