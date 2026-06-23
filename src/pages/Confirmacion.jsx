import { useLocation, useNavigate, Link } from "react-router-dom";
import "./Confirmacion.css";

export default function Confirmacion() {
  const location = useLocation();
  const navigate = useNavigate();

  const { venta, diasEstimados, fechaEstimada } = location.state || {};

  // Si alguien llega directo a esta URL sin haber comprado, lo mandamos al inicio
  if (!venta) {
    return (
      <div className="confirmacion-page">
        <div className="confirmacion-vacio">
          <h2>No encontramos información de tu compra</h2>
          <Link to="/" className="btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmacion-page">
      <div className="confirmacion-card">
        <div className="confirmacion-check">✓</div>

        <h1>¡Compra confirmada!</h1>
        <p className="confirmacion-sub">
          Pedido #{venta.id} — te enviamos el detalle a tu correo.
        </p>

        <div className="confirmacion-entrega">
          🚚 Llega aproximadamente el <strong>{fechaEstimada}</strong>
          <span>({diasEstimados} días hábiles)</span>
        </div>

        <div className="confirmacion-detalle">
          <h3>Resumen del pedido</h3>

          {venta.detalles?.map((d, i) => (
            <div key={i} className="confirmacion-item">
              <span>
                {d.nombreProducto} × {d.cantidad}
              </span>
              <span>${Number(d.subtotal).toLocaleString("es-CL")}</span>
            </div>
          ))}

          <div className="confirmacion-total">
            <span>Total pagado</span>
            <strong>${Number(venta.total).toLocaleString("es-CL")}</strong>
          </div>
        </div>

        <div className="confirmacion-direccion">
          <h3>Dirección de entrega</h3>
          <p>
            {venta.direccionEntrega}, {venta.comuna}
          </p>
          <p>{venta.region}</p>
          <p>📞 {venta.telefonoContacto}</p>
        </div>

        <div className="confirmacion-acciones">
          <Link to="/mis-pedidos" className="btn-primary">
            Ver mis pedidos
          </Link>
          <Link to="/" className="btn-outline">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
