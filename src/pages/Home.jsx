import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import "./Home.css";

const API_PRODUCTOS = "http://localhost:8082/api/productos";

const CATEGORIAS = [
  "Todos",
  "Lavadoras",
  "Refrigeradores",
  "Televisores",
  "Cocina",
  "Limpieza",
];

const EMOJIS = {
  Lavadoras: "🫧",
  Refrigeradores: "❄️",
  Televisores: "📺",
  Cocina: "🍳",
  Limpieza: "🧹",
  default: "⚡",
};

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [cargando, setCargando] = useState(true);
  const [notif, setNotif] = useState(null);

  const { agregar } = useCarrito();
  const navigate = useNavigate();

  const cargarProductos = async () => {
    try {
      setCargando(true);

      const res = await fetch(API_PRODUCTOS);

      if (!res.ok) {
        throw new Error("No se pudieron cargar los productos");
      }

      const data = await res.json();

      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
        ? data.content
        : [];

      setProductos(lista);
    } catch (err) {
      console.error("Error cargando productos:", err);
      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();

    const actualizarAlVolver = () => {
      cargarProductos();
    };

    window.addEventListener("focus", actualizarAlVolver);

    return () => {
      window.removeEventListener("focus", actualizarAlVolver);
    };
  }, []);

  const getCategoria = (producto) => {
    return producto.categoria?.nombre || producto.categoria || "";
  };

  const getProveedor = (producto) => {
    return producto.proveedor?.nombre || producto.proveedor || "Sin proveedor";
  };

  const getImagen = (producto) => {
    return producto.imagenUrl || producto.imagen || "";
  };

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase();

    return productos.filter((producto) => {
      const nombre = producto.nombre?.toLowerCase() || "";
      const proveedor = getProveedor(producto).toLowerCase();
      const categoriaProducto = getCategoria(producto);

      const coincideBusqueda =
        nombre.includes(q) || proveedor.includes(q);

      const coincideCategoria =
        categoria === "Todos" || categoriaProducto === categoria;

      return coincideBusqueda && coincideCategoria;
    });
  }, [productos, busqueda, categoria]);

  // Producto destacado del hero: el de mayor precio disponible en stock.
  // Si no hay productos cargados todavía, el hero usa un estado vacío elegante.
  const destacado = useMemo(() => {
    if (productos.length === 0) return null;
    const conStock = productos.filter((p) => p.stock > 0);
    const lista = conStock.length > 0 ? conStock : productos;
    return lista.reduce(
      (max, p) => (Number(p.precio) > Number(max.precio) ? p : max),
      lista[0]
    );
  }, [productos]);

  const handleAgregar = (e, producto) => {
    e.stopPropagation();

    if (producto.stock === 0) return;

    agregar(producto);
    setNotif(producto.nombre);

    setTimeout(() => {
      setNotif(null);
    }, 2000);
  };

  return (
    <div>
      {notif && (
        <div className="notif-toast">
          ✓ {notif} agregado al carrito
        </div>
      )}

      <div className="hero">
        <div className="hero-bg" />

        <div className="hero-content">
          <p className="hero-eyebrow">Grupo Cordillera</p>

          <h1 className="hero-title">
            Tecnología para <br />
            <span className="hero-accent">tu hogar</span>
          </h1>

          <p className="hero-subtitle">
            Electrodomésticos de alta calidad para tu hogar
          </p>

          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() =>
                document.getElementById("productos").scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Ver Productos
            </button>

            <button
              className="btn-outline"
              onClick={() => navigate("/sobre-nosotros")}
            >
              Conocer más
            </button>
          </div>
        </div>

        {/* Panel visual del hero: muestra el producto destacado en vez de quedar vacío */}
        <div className="hero-visual">
          {destacado ? (
            <div
              className="hero-panel"
              onClick={() => navigate(`/producto/${destacado.id}`)}
            >
              <span className="hero-panel-tag">Destacado</span>

              <div className="hero-panel-imagen">
                {getImagen(destacado) ? (
                  <img src={getImagen(destacado)} alt={destacado.nombre} />
                ) : (
                  <span className="hero-panel-emoji">
                    {EMOJIS[getCategoria(destacado)] || EMOJIS.default}
                  </span>
                )}
              </div>

              <div className="hero-panel-info">
                <p className="hero-panel-categoria">
                  {getCategoria(destacado) || "Producto"}
                </p>
                <h3 className="hero-panel-nombre">{destacado.nombre}</h3>
                <p className="hero-panel-precio">
                  ${Number(destacado.precio).toLocaleString("es-CL")}
                </p>
              </div>
            </div>
          ) : (
            <div className="hero-panel hero-panel-skeleton" />
          )}
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat">
          <strong>{productos.length}</strong>
          <span>Productos</span>
        </div>

        <div className="stat-divider" />

        <div className="stat">
          <strong>Envío</strong>
          <span>Todo Chile</span>
        </div>

        <div className="stat-divider" />

        <div className="stat">
          <strong>Soporte</strong>
          <span>24/7</span>
        </div>
      </div>

      <div className="page" id="productos">
        <div className="toolbar">
          <div className="categorias">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                className={`cat-btn ${categoria === cat ? "activa" : ""}`}
                onClick={() => setCategoria(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="search-box">
            <span className="search-icon">⌕</span>

            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="toolbar-info">
          <span>{filtrados.length} productos encontrados</span>
        </div>

        {cargando ? (
          <div className="estado-centro">
            <div className="spinner" />
            <p>Cargando catálogo...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="estado-centro">
            <p style={{ fontSize: "3rem" }}>🔍</p>
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div className="productos-grid">
            {filtrados.map((producto) => {
              const precio = Number(producto.precio || 0);
              const imagen = getImagen(producto);
              const categoriaProducto = getCategoria(producto);

              return (
                <div
                  key={producto.id}
                  className="producto-card"
                  onClick={() => navigate(`/producto/${producto.id}`)}
                >
                  <div className="card-imagen">
                    {imagen ? (
                      <img
                        src={imagen}
                        alt={producto.nombre}
                        className="producto-img"
                      />
                    ) : (
                      <span className="card-emoji">
                        {EMOJIS[categoriaProducto] || EMOJIS.default}
                      </span>
                    )}

                    {producto.stock <= 5 && producto.stock > 0 && (
                      <span className="badge-stock-bajo">
                        Últimas unidades
                      </span>
                    )}

                    {producto.stock === 0 && (
                      <span className="badge-agotado">Agotado</span>
                    )}
                  </div>

                  <div className="card-body">
                    <p className="card-categoria">
                      {categoriaProducto || "Sin categoría"}
                    </p>

                    <h3 className="card-nombre">{producto.nombre}</h3>

                    <p className="card-proveedor">
                      {getProveedor(producto)}
                    </p>

                    <p className="card-stock">Stock: {producto.stock}</p>

                    <div className="card-footer">
                      <div>
                        <p className="card-precio">
                          ${precio.toLocaleString("es-CL")}
                        </p>

                        <p className="card-cuotas">
                          12 cuotas de $
                          {Math.round(precio / 12).toLocaleString("es-CL")}
                        </p>
                      </div>

                      <button
                        className="btn-add"
                        onClick={(e) => handleAgregar(e, producto)}
                        disabled={producto.stock === 0}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
