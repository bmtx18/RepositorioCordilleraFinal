import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth0 } from "@auth0/auth0-react";
import "./Carrito.css";

export default function Carrito() {
  const [mostrarAuth, setMostrarAuth] = useState(false);
  const [error, setError] = useState("");

  const { items, total, quitar, cambiarCantidad, vaciar } = useCarrito();

  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  const irAPagar = () => {
    setError("");

    if (!isAuthenticated) {
      setMostrarAuth(true);
      return;
    }

    if (items.length === 0) {
      setError("El carrito está vacío.");
      return;
    }

    navigate("/checkout");
  };

  return (
    <div className="carrito-page">
      <div className="carrito-header">
        <h1>Carrito de compras</h1>

        {items.length > 0 && (
          <button className="btn-vaciar" onClick={vaciar}>
            Vaciar carrito
          </button>
        )}
      </div>

      {error && <div className="carrito-alert error">{error}</div>}

      {items.length === 0 ? (
        <div className="carrito-vacio">
          <h2>Tu carrito está vacío</h2>
          <p>Agrega productos para comenzar tu compra</p>
          <Link to="/" className="btn-primary">
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="carrito-layout">
          <div className="carrito-items">
            {items.map((item) => (
              <div key={item.id} className="carrito-item">
                <div className="carrito-item-img">
                  {item.imagenUrl || item.imagen ? (
                    <img
                      src={item.imagenUrl || item.imagen}
                      alt={item.nombre}
                    />
                  ) : (
                    "🛒"
                  )}
                </div>

                <div className="carrito-item-info">
                  <p className="item-categoria">
                    {item.categoria?.nombre || item.categoria || "Sin categoría"}
                  </p>

                  <h3>{item.nombre}</h3>

                  <p className="item-precio">
                    ${Number(item.precio).toLocaleString("es-CL")}
                  </p>

                  <div className="cantidad-box">
                    <button
                      onClick={() =>
                        cambiarCantidad(item.id, item.cantidad - 1)
                      }
                    >
                      -
                    </button>

                    <span>{item.cantidad}</span>

                    <button
                      onClick={() =>
                        cambiarCantidad(item.id, item.cantidad + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <p className="item-subtotal">
                    Subtotal: $
                    {(item.precio * item.cantidad).toLocaleString("es-CL")}
                  </p>

                  <button
                    className="btn-eliminar"
                    onClick={() => quitar(item.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <MiniResumen
            items={items}
            total={total}
            irAPagar={irAPagar}
          />
        </div>
      )}

      {mostrarAuth && (
        <div className="auth-modal-overlay">
          <div className="auth-modal">
            <h2>Continúa tu compra</h2>
            <p>Debes iniciar sesión para finalizar la compra</p>

            <button className="btn-primary" onClick={() => loginWithRedirect()}>
              Iniciar sesión
            </button>

            <button
              className="btn-cerrar-modal"
              onClick={() => setMostrarAuth(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniResumen({ items, total, irAPagar }) {
  const cantidadProductos = items.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

  const iva = total * 0.19;
  const totalConIva = total + iva;

  return (
    <div className="mini-resumen">
      <h3>Resumen</h3>

      <div className="resumen-linea">
        <span>Productos</span>
        <span>{cantidadProductos}</span>
      </div>

      <div className="resumen-linea">
        <span>Subtotal</span>
        <span>${Number(total).toLocaleString("es-CL")}</span>
      </div>

      <div className="resumen-linea">
        <span>IVA 19%</span>
        <span>${Number(iva).toLocaleString("es-CL")}</span>
      </div>

      <div className="resumen-linea">
        <span>Envío</span>
        <span>Gratis</span>
      </div>

      <div className="resumen-total">
        <span>Total</span>
        <strong>${Number(totalConIva).toLocaleString("es-CL")}</strong>
      </div>

      <button className="btn-primary btn-finalizar" onClick={irAPagar}>
        Ir a pagar
      </button>
    </div>
  );
}