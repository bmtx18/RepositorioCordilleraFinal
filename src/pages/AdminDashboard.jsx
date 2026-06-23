import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_BFF = "http://localhost:8080/api/bff";
const ADMIN_EMAIL = "agu.moya@duocuc.cl";

// Paleta de colores para las barras
const COLORES = [
  "#a50034", "#1a1a2e", "#0d6efd", "#198754",
  "#fd7e14", "#6f42c1", "#20c997", "#dc3545",
];

export default function AdminDashboard() {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const navigate = useNavigate();

  const [indicadores, setIndicadores] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [despachosPendientes, setDespachosPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [asignandoDriverId, setAsignandoDriverId] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const esAdmin =
    isAuthenticated &&
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    if (!isLoading && !esAdmin) {
      navigate("/");
    }
  }, [isLoading, esAdmin]);

  useEffect(() => {
    if (!esAdmin) return;
    cargarTodo();
  }, [esAdmin]);

  const cargarTodo = async () => {
    setCargando(true);
    setError("");
    try {
      const [resInd, resDrivers, resVentas] = await Promise.all([
        fetch(`${API_BFF}/dashboard/indicadores`),
        fetch(`${API_BFF}/dashboard/drivers`),
        fetch("http://localhost:8084/api/ventas"),
      ]);

      const dataInd = await resInd.json();
      const dataDrivers = await resDrivers.json();
      const dataVentas = await resVentas.json();

      setIndicadores(Array.isArray(dataInd) ? dataInd : []);
      setDrivers(Array.isArray(dataDrivers) ? dataDrivers : []);

      // Filtrar ventas pendientes de asignación
      const pendientes = Array.isArray(dataVentas)
        ? dataVentas.filter(
            (v) => v.estadoDespacho === "PENDIENTE" || !v.estadoDespacho
          )
        : [];
      setDespachosPendientes(pendientes);
    } catch (err) {
      setError("No se pudieron cargar los datos del dashboard.");
    } finally {
      setCargando(false);
    }
  };

  const maxCantidad = indicadores.length
    ? Math.max(...indicadores.map((i) => i.cantidadVendida))
    : 1;

  const asignarDriver = async (ventaId, driverId) => {
    setMensaje("");
    try {
      const res = await fetch(
        `http://localhost:8084/api/ventas/${ventaId}/asignar-driver?driverId=${driverId}`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error();
      setMensaje(`✅ Driver asignado correctamente al pedido #${ventaId}`);
      setAsignandoDriverId(null);
      cargarTodo();
    } catch {
      setMensaje("❌ Error al asignar el driver.");
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────────

  if (isLoading || cargando) {
    return <div className="dash-loading">Cargando dashboard...</div>;
  }

  if (!esAdmin) return null;

  return (
    <div className="dash-container">
      <h1 className="dash-titulo">📊 Dashboard Administrador</h1>

      {error && <p className="dash-error">{error}</p>}
      {mensaje && <p className="dash-mensaje">{mensaje}</p>}

      {/* ── INDICADORES DE VENTAS ─────────────────────────────────────────── */}
      <section className="dash-seccion">
        <h2 className="dash-subtitulo">Indicadores de ventas por producto</h2>

        {indicadores.length === 0 ? (
          <p className="dash-vacio">No hay ventas registradas aún.</p>
        ) : (
          <>
            {/* Barras */}
            <div className="dash-barras">
              {indicadores.map((item, i) => (
                <div key={item.nombreProducto} className="barra-fila">
                  <span className="barra-nombre">{item.nombreProducto}</span>
                  <div className="barra-track">
                    <div
                      className="barra-fill"
                      style={{
                        width: `${(item.cantidadVendida / maxCantidad) * 100}%`,
                        backgroundColor: COLORES[i % COLORES.length],
                      }}
                    />
                  </div>
                  <span className="barra-valor">
                    {item.cantidadVendida} un. ({item.porcentaje}%)
                  </span>
                </div>
              ))}
            </div>

            {/* Tabla */}
            <div className="dash-tabla-wrapper">
              <table className="dash-tabla">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th>Unidades vendidas</th>
                    <th>% del total</th>
                    <th>Total recaudado</th>
                    <th>Posición</th>
                  </tr>
                </thead>
                <tbody>
                  {indicadores.map((item, i) => (
                    <tr key={item.nombreProducto}>
                      <td>{i + 1}</td>
                      <td>{item.nombreProducto}</td>
                      <td>{item.cantidadVendida}</td>
                      <td>{item.porcentaje}%</td>
                      <td>${item.totalRecaudado?.toLocaleString("es-CL")}</td>
                      <td>
                        {i === 0 && (
                          <span className="badge badge-top">🏆 Más vendido</span>
                        )}
                        {i === indicadores.length - 1 && indicadores.length > 1 && (
                          <span className="badge badge-bottom">📉 Menos vendido</span>
                        )}
                        {i > 0 && i < indicadores.length - 1 && (
                          <span className="badge badge-medio">· Intermedio</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* ── DESPACHOS PENDIENTES ──────────────────────────────────────────── */}
      <section className="dash-seccion">
        <h2 className="dash-subtitulo">
          Despachos pendientes de asignación ({despachosPendientes.length})
        </h2>

        {despachosPendientes.length === 0 ? (
          <p className="dash-vacio">Todos los despachos están asignados. 🎉</p>
        ) : (
          <div className="dash-despachos-grid">
            {despachosPendientes.map((venta) => (
              <div key={venta.id} className="dash-despacho-card">
                <p className="dash-pedido-id">Pedido #{venta.id}</p>
                <p className="dash-pedido-cliente">
                  👤 {venta.clienteNombre}
                </p>
                <p className="dash-pedido-total">
                  💰 ${venta.total?.toLocaleString("es-CL")}
                </p>

                {asignandoDriverId === venta.id ? (
                  <div className="dash-asignar">
                    <select
                      onChange={(e) =>
                        asignarDriver(venta.id, e.target.value)
                      }
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Selecciona un driver
                      </option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nombre} ({d.correo})
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn-cancelar"
                      onClick={() => setAsignandoDriverId(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-asignar"
                    onClick={() => setAsignandoDriverId(venta.id)}
                  >
                    🚚 Asignar driver
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── DRIVERS ACTIVOS ───────────────────────────────────────────────── */}
      <section className="dash-seccion">
        <h2 className="dash-subtitulo">
          Drivers registrados ({drivers.length})
        </h2>

        {drivers.length === 0 ? (
          <p className="dash-vacio">
            No hay drivers registrados. Crea uno con rol "DRIVER".
          </p>
        ) : (
          <div className="dash-drivers-grid">
            {drivers.map((d) => (
              <div key={d.id} className="dash-driver-card">
                <div className="driver-avatar">
                  {d.nombre?.charAt(0).toUpperCase()}
                </div>
                <p className="driver-card-nombre">{d.nombre}</p>
                <p className="driver-card-correo">{d.correo}</p>
                <span
                  className={`driver-card-estado ${
                    d.activo ? "activo" : "inactivo"
                  }`}
                >
                  {d.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
