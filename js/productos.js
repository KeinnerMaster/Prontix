// productos.js - Carga productos desde localStorage o usa productos predeterminados

// Productos predeterminados (se usan si no hay nada en localStorage)
const productosDefault = [
    // TECNOLOGIA
    { 
        id: 1, 
        nombre: "Cargador inalámbrico FastCharge", 
        precio: 49.90, 
        imagen: "https://images.unsplash.com/photo-1591290619762-c588dc522ff5?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1591290619762-c588dc522ff5?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1585338447937-7082f8fc763d?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&h=400&fit=crop"
        ],
        categoria: "Tecnologia", 
        stock: 120,
        descripcion: "Cargador inalámbrico de última generación con tecnología FastCharge. Compatible con todos los dispositivos que soportan carga inalámbrica. Diseño elegante y compacto.",
        colores: [
            { nombre: "Negro", hex: "#000000" },
            { nombre: "Blanco", hex: "#FFFFFF" }
        ]
    },
    { 
        id: 2, 
        nombre: "Audífonos In-Ear Pro", 
        precio: 89.90, 
        imagen: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=600&h=400&fit=crop"
        ],
        categoria: "Tecnologia", 
        stock: 60,
        descripcion: "Audífonos premium con cancelación activa de ruido y batería de larga duración. Perfectos para música, llamadas y entretenimiento. Resistentes al agua IPX4.",
        colores: [
            { nombre: "Negro", hex: "#000000" },
            { nombre: "Blanco", hex: "#FFFFFF" },
            { nombre: "Azul", hex: "#1E90FF" }
        ]
    },
    { 
        id: 6, 
        nombre: "Lámpara LED Ambiente", 
        precio: 34.90, 
        imagen: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=400&fit=crop"
        ],
        categoria: "Tecnologia", 
        stock: 70,
        descripcion: "Lámpara LED con múltiples colores y modos de iluminación. Control táctil y diseño moderno. Perfecta para crear ambiente en cualquier espacio.",
        colores: [
            { nombre: "RGB", hex: "#FF00FF" }
        ]
    },
    { 
        id: 7, 
        nombre: "Mouse Gamer RGB", 
        precio: 79.90, 
        imagen: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&h=400&fit=crop"
        ],
        categoria: "Tecnologia", 
        stock: 45,
        descripcion: "Mouse gaming de alta precisión con sensor óptico de 16000 DPI. Iluminación RGB personalizable y 8 botones programables. Diseño ergonómico para sesiones prolongadas.",
        colores: [
            { nombre: "Negro", hex: "#000000" }
        ]
    },
    { 
        id: 8, 
        nombre: "Teclado Mecánico", 
        precio: 129.90, 
        imagen: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&h=400&fit=crop"
        ],
        categoria: "Tecnologia", 
        stock: 35,
        descripcion: "Teclado mecánico profesional con switches Blue. Retroiluminación RGB y construcción premium. Ideal para gaming y productividad.",
        colores: [
            { nombre: "Negro", hex: "#000000" },
            { nombre: "Blanco", hex: "#FFFFFF" }
        ]
    },
    
    // ROPA
    { 
        id: 3, 
        nombre: "Camiseta Casual", 
        precio: 39.90, 
        imagen: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=400&fit=crop"
        ],
        categoria: "Ropa", 
        stock: 80,
        descripcion: "Camiseta de algodón 100% de alta calidad. Corte moderno y cómodo para uso diario. Disponible en múltiples tallas y colores.",
        tallas: ["S", "M", "L", "XL", "XXL"],
        colores: [
            { nombre: "Negro", hex: "#000000" },
            { nombre: "Blanco", hex: "#FFFFFF" },
            { nombre: "Gris", hex: "#808080" },
            { nombre: "Azul Marino", hex: "#000080" }
        ]
    },
    { 
        id: 9, 
        nombre: "Sudadera con Capucha", 
        precio: 69.90, 
        imagen: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=400&fit=crop"
        ],
        categoria: "Ropa", 
        stock: 55,
        descripcion: "Sudadera premium con capucha y bolsillo canguro. Tejido suave y cálido. Perfecta para clima frío o casual wear.",
        tallas: ["S", "M", "L", "XL"],
        colores: [
            { nombre: "Negro", hex: "#000000" },
            { nombre: "Gris", hex: "#808080" },
            { nombre: "Azul", hex: "#4169E1" }
        ]
    },
    { 
        id: 10, 
        nombre: "Jeans Slim Fit", 
        precio: 89.90, 
        imagen: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=400&fit=crop"
        ],
        categoria: "Ropa", 
        stock: 65,
        descripcion: "Jeans de mezclilla premium con corte slim fit. Diseño moderno y versátil para cualquier ocasión. Durabilidad garantizada.",
        tallas: ["28", "30", "32", "34", "36", "38"],
        colores: [
            { nombre: "Azul Oscuro", hex: "#1E3A5F" },
            { nombre: "Negro", hex: "#000000" }
        ]
    },
    { 
        id: 11, 
        nombre: "Chaqueta Deportiva", 
        precio: 99.90, 
        imagen: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=400&fit=crop"
        ],
        categoria: "Ropa", 
        stock: 40,
        descripcion: "Chaqueta deportiva ligera y resistente al viento. Ideal para running y actividades al aire libre. Diseño transpirable con bolsillos.",
        tallas: ["S", "M", "L", "XL"],
        colores: [
            { nombre: "Negro", hex: "#000000" },
            { nombre: "Rojo", hex: "#DC143C" },
            { nombre: "Azul", hex: "#0000CD" }
        ]
    },
    
    // ACCESORIOS
    { 
        id: 4, 
        nombre: "Mochila Urbana", 
        precio: 59.90, 
        imagen: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&h=400&fit=crop"
        ],
        categoria: "Accesorios", 
        stock: 40,
        descripcion: "Mochila urbana con compartimento para laptop de hasta 15 pulgadas. Múltiples bolsillos organizadores y diseño ergonómico. Material resistente al agua.",
        colores: [
            { nombre: "Negro", hex: "#000000" },
            { nombre: "Gris", hex: "#696969" },
            { nombre: "Azul", hex: "#1E90FF" }
        ]
    },
    { 
        id: 12, 
        nombre: "Reloj Inteligente", 
        precio: 149.90, 
        imagen: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=400&fit=crop"
        ],
        categoria: "Accesorios", 
        stock: 30,
        descripcion: "Smartwatch con monitor de frecuencia cardíaca, contador de pasos y notificaciones inteligentes. Resistente al agua y batería de larga duración.",
        colores: [
            { nombre: "Negro", hex: "#000000" },
            { nombre: "Plata", hex: "#C0C0C0" }
        ]
    },
    { 
        id: 13, 
        nombre: "Gafas de Sol Polarizadas", 
        precio: 45.90, 
        imagen: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=400&fit=crop"
        ],
        categoria: "Accesorios", 
        stock: 75,
        descripcion: "Gafas de sol con lentes polarizados de alta calidad. Protección UV400 y diseño moderno. Marco resistente y liviano.",
        colores: [
            { nombre: "Negro", hex: "#000000" },
            { nombre: "Café", hex: "#8B4513" }
        ]
    },
    { 
        id: 14, 
        nombre: "Billetera de Cuero", 
        precio: 35.90, 
        imagen: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&h=400&fit=crop"
        ],
        categoria: "Accesorios", 
        stock: 90,
        descripcion: "Billetera de cuero genuino con múltiples compartimentos para tarjetas y efectivo. Diseño elegante y compacto. Costura reforzada.",
        colores: [
            { nombre: "Negro", hex: "#000000" },
            { nombre: "Marrón", hex: "#654321" }
        ]
    },
    
    // UTENSILIOS
    { 
        id: 5, 
        nombre: "Organizador de Cocina 3 en 1", 
        precio: 29.90, 
        imagen: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=400&fit=crop"
        ],
        categoria: "Utensilios", 
        stock: 100,
        descripcion: "Set organizador versátil para cocina con tres compartimentos. Ideal para especias, utensilios y más. Diseño moderno y funcional."
    },
    { 
        id: 15, 
        nombre: "Set de Cuchillos Premium", 
        precio: 79.90, 
        imagen: "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1591643479301-f4d7f5d88ab3?w=600&h=400&fit=crop"
        ],
        categoria: "Utensilios", 
        stock: 50,
        descripcion: "Set de cuchillos profesionales de acero inoxidable. Incluye cuchillo de chef, para pan, verduras y más. Con base de madera."
    },
    { 
        id: 16, 
        nombre: "Licuadora Portátil", 
        precio: 54.90, 
        imagen: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&h=400&fit=crop"
        ],
        categoria: "Utensilios", 
        stock: 60,
        descripcion: "Licuadora portátil recargable vía USB. Perfecta para smoothies y batidos en cualquier lugar. Fácil de limpiar.",
        colores: [
            { nombre: "Rosa", hex: "#FF69B4" },
            { nombre: "Azul", hex: "#4169E1" },
            { nombre: "Negro", hex: "#000000" }
        ]
    },
    { 
        id: 17, 
        nombre: "Tabla de Cortar Bambú", 
        precio: 24.90, 
        imagen: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&h=400&fit=crop", 
        imagenes: [
            "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&h=400&fit=crop"
        ],
        categoria: "Utensilios", 
        stock: 85,
        descripcion: "Tabla de cortar de bambú ecológica y duradera. Antibacteriana y amigable con los cuchillos. Fácil de mantener."
    }
];

// Cargar productos: primero intenta desde localStorage, si no existe usa los predeterminados
function cargarProductosDesdeStorage() {
    const saved = localStorage.getItem('flashbuy_productos');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Error al cargar productos desde localStorage:', e);
            return productosDefault;
        }
    }
    return productosDefault;
}

// Array de productos activo
let productos = cargarProductosDesdeStorage();

// Función para recargar productos (útil si se actualizan desde el admin)
function recargarProductos() {
    productos = cargarProductosDesdeStorage();
    if (typeof renderProducts === 'function') {
        renderProducts();
    }
}

// Escuchar cambios en localStorage
window.addEventListener('storage', function(e) {
    if (e.key === 'flashbuy_productos') {
        recargarProductos();
    }
});

function formatBRL(n) {
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderProducts(filterCategory) {
    const lista = document.getElementById("product-list");
    if (!lista) return;
    
    lista.innerHTML = '';
    const toShow = filterCategory ? productos.filter(p => p.categoria === filterCategory) : productos;
    
    if (toShow.length === 0) {
        lista.innerHTML = '<p style="text-align:center;grid-column:1/-1;">No hay productos en esta categoría.</p>';
        return;
    }
    
    toShow.forEach(p => {
        const div = document.createElement("div");
        div.className = "producto";
        div.style.cursor = "pointer";
        div.onclick = () => window.location.href = `detalle-producto.html?id=${p.id}`;
        
        div.innerHTML = `
            <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
            <h4>${p.nombre}</h4>
            <p>${formatBRL(p.precio)}</p>
            <small style="color:#666">Categoría: ${p.categoria} • Stock: ${p.stock}</small>
            <button onclick="event.stopPropagation(); agregar(${p.id})">Agregar al carrito</button>
        `;
        lista.appendChild(div);
    });
    
    const allLinks = document.querySelectorAll('.cat-link, nav a[data-cat]');
    allLinks.forEach(a => a.classList.remove('active'));
    
    if (filterCategory) {
        const activeLinks = document.querySelectorAll(`[data-cat="${filterCategory}"]`);
        activeLinks.forEach(link => link.classList.add('active'));
    }
}

function agregar(id) {
    const p = productos.find(x => x.id === id);
    if (!p) return alert("Producto no encontrado");
    
    let carrito = JSON.parse(localStorage.getItem('flashbuy_cart') || '[]');
    
    const existingItem = carrito.find(item => item.id === id);
    const currentQuantity = existingItem ? existingItem.cantidad : 0;
    
    if (currentQuantity >= p.stock) {
        return alert('No hay más stock disponible de este producto.');
    }
    
    if (existingItem) {
        existingItem.cantidad += 1;
    } else {
        carrito.push({ ...p, cantidad: 1 });
    }
    
    localStorage.setItem('flashbuy_cart', JSON.stringify(carrito));
    alert("✓ Producto agregado al carrito: " + p.nombre);
}

document.addEventListener('DOMContentLoaded', function() { 
    renderProducts(); 
});

window.renderProducts = renderProducts;
window.agregar = agregar;
window.recargarProductos = recargarProductos;
