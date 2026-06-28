import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import "./DetalleProducto.css";

const API_PRODUCTOS = "http://localhost:8082/api/productos";

const EMOJIS = {
  Lavadoras: "🫧",
  Refrigeradores: "❄️",
  Televisores: "📺",
  Cocina: "🍳",
  Limpieza: "🧹",
  default: "⚡",
};

export default function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { esAdmin, esDriver } = useAuth();
  const { agregar } = useCarrito();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    if (esAdmin) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    if (esDriver) {
      navigate("/driver", { replace: true });
      return;
    }

    const cargarProducto = async () => {
      setCargando(true);
      setError(false);

      try {
        const res = await fetch(`${API_PRODUCTOS}/${id}`);
        if (!res.ok) throw new Error();

        const data = await res.json();
        setProducto(data);
      } catch (err) {
        console.error("Error cargando producto:", err);
        setError(true);
      } finally {
        setCargando(false);
      }
    };

    cargarProducto();
    setCantidad(1);
  }, [id, esAdmin, esDriver, navigate]);

  const getCategoria = (p) => p?.categoria?.nombre || p?.categoria || "";
  const getProveedor = (p) =>
    p?.proveedor?.nombre || p?.proveedor || "Sin proveedor";
  const getImagen = (p) => p?.imagenUrl || p?.imagen || "";

  const handleAgregar = () => {
    if (esAdmin || esDriver) return;
    if (!producto || producto.stock === 0) return;

    for (let i = 0; i < cantidad; i++) {
      agregar(producto);
    }

    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  if (cargando) {
    return (
      <div className="detalle-page">
        <div className="estado-centro">
          <div className="spinner" />
          <p>Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="detalle-page">
        <div className="estado-centro">
          <p style={{ fontSize: "3rem" }}>🔍</p>
          <p>No pudimos encontrar este producto.</p>

          <Link to="/" className="btn-primary" style={{ marginTop: "1.2rem" }}>
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const precio = Number(producto.precio || 0);
  const imagen = getImagen(producto);
  const categoria = getCategoria(producto);
  const sinStock = producto.stock === 0;

  return (
    <div className="detalle-page">
      <button className="btn-volver" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <div className="detalle-container">
        <div className="detalle-img">
          {imagen ? (
            <img src={imagen} alt={producto.nombre} className="detalle-img-real" />
          ) : (
            <span className="detalle-emoji">
              {EMOJIS[categoria] || EMOJIS.default}
            </span>
          )}

          {producto.stock <= 5 && producto.stock > 0 && (
            <span className="badge-stock-bajo">Últimas unidades</span>
          )}

          {sinStock && <span className="badge-agotado">Agotado</span>}
        </div>

        <div className="detalle-info">
          <span className="categoria">{categoria || "Electrodoméstico"}</span>

          <h1>{producto.nombre}</h1>

          <p className="detalle-proveedor">{getProveedor(producto)}</p>

          <p className="descripcion">
            {producto.descripcion ||
              "Tecnología premium para el hogar moderno con garantía oficial."}
          </p>

          <div className="detalle-precio-box">
            <h2>${precio.toLocaleString("es-CL")}</h2>
            <span className="detalle-cuotas">
              12 cuotas de ${Math.round(precio / 12).toLocaleString("es-CL")}
            </span>
          </div>

          <p className="detalle-stock">
            {sinStock ? "Sin stock disponible" : `Stock disponible: ${producto.stock}`}
          </p>

          {!sinStock && (
            <div className="detalle-cantidad-box">
              <span>Cantidad</span>

              <div className="cantidad-box">
                <button onClick={() => setCantidad((c) => Math.max(1, c - 1))}>
                  −
                </button>

                <span>{cantidad}</span>

                <button
                  onClick={() =>
                    setCantidad((c) => Math.min(producto.stock, c + 1))
                  }
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            className="btn-primary btn-agregar-detalle"
            onClick={handleAgregar}
            disabled={sinStock}
          >
            {sinStock
              ? "Sin stock"
              : agregado
              ? "✓ Agregado al carrito"
              : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}