import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./VistaDriver.css";

const API_BFF = "http://localhost:8080/api/bff";

// Colores por estado de despacho
const ESTADO_COLOR = {
  PENDIENTE:  { bg: "#fff3cd", text: "#856404" },
  ASIGNADO:   { bg: "#cfe2ff", text: "#084298" },
  EN_CAMINO:  { bg: "#d1ecf1", text: "#0c5460" },
  ENTREGADO:  { bg: "#d1e7dd", text: "#0f5132" },
};

export default function VistaDriver() {
  // DriverRoute ya garantiza que llegamos aquí autenticados y con rol DRIVER
  const { usuario, perfilUsuario } = useAuth();

  const driverId = perfilUsuario?.id;

  const [despachos, setDespachos] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [seccion, setSeccion] = useState("despachos"); // "despachos" | "calificaciones"
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!driverId) return;
    cargarDespachos();
    cargarCalificaciones();
  }, [driverId]);

  const cargarDespachos = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_BFF}/dashboard/drivers/${driverId}/despachos`);
      const data = await res.json();
      setDespachos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("No se pudieron cargar los despachos.");
    } finally {
      setCargando(false);
    }
  };

  const cargarCalificaciones = async () => {
    try {
      const res = await fetch(`${API_BFF}/dashboard/drivers/${driverId}/calificaciones`);
      const data = await res.json();
      setCalificaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando calificaciones:", err);
    }
  };

  const cambiarEstado = async (ventaId, nuevoEstado) => {
    setMensaje("");
    try {
      const res = await fetch(
        `http://localhost:8084/api/ventas/${ventaId}/estado-despacho?estado=${nuevoEstado}`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error();
      setMensaje(`✅ Estado actualizado a: ${nuevoEstado}`);
      cargarDespachos();
    } catch {
      setMensaje("❌ No se pudo actualizar el estado.");
    }
  };

  const promedioEstrellas = () => {
    if (calificaciones.length === 0) return 0;
    const suma = calificaciones.reduce((acc, c) => acc + c.puntuacion, 0);
    return (suma / calificaciones.length).toFixed(1);
  };

  // ── RENDER ───────────────────────────────────────────────────────────────────

  if (!driverId) {
    return (
      <div className="driver-no-auth">
        <h2>No encontramos tu perfil de driver</h2>
        <p>Contacta al administrador para verificar tu registro.</p>
      </div>
    );
  }

  return (
    <div className="driver-container">
      <h1 className="driver-titulo">
        🚚 Panel del Driver — {usuario?.name || usuario?.email}
      </h1>

      {/* Resumen calificaciones */}
      <div className="driver-resumen">
        <div className="driver-stat">
          <span className="driver-stat-valor">{despachos.length}</span>
          <span className="driver-stat-label">Despachos asignados</span>
        </div>
        <div className="driver-stat">
          <span className="driver-stat-valor">
            {despachos.filter((d) => d.estadoDespacho === "ENTREGADO").length}
          </span>
          <span className="driver-stat-label">Entregados</span>
        </div>
        <div className="driver-stat">
          <span className="driver-stat-valor">⭐ {promedioEstrellas()}</span>
          <span className="driver-stat-label">
            Calificación ({calificaciones.length} reseñas)
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="driver-tabs">
        <button
          className={seccion === "despachos" ? "tab-activo" : ""}
          onClick={() => setSeccion("despachos")}
        >
          📦 Mis Despachos
        </button>
        <button
          className={seccion === "calificaciones" ? "tab-activo" : ""}
          onClick={() => setSeccion("calificaciones")}
        >
          ⭐ Mis Calificaciones
        </button>
      </div>

      {mensaje && <p className="driver-mensaje">{mensaje}</p>}

      {/* Sección Despachos */}
      {seccion === "despachos" && (
        <div className="driver-seccion">
          {cargando ? (
            <p>Cargando despachos...</p>
          ) : despachos.length === 0 ? (
            <p className="driver-vacio">No tienes despachos asignados aún.</p>
          ) : (
            <div className="driver-grid">
              {despachos.map((despacho) => {
                const colorEstado =
                  ESTADO_COLOR[despacho.estadoDespacho] || ESTADO_COLOR.PENDIENTE;
                return (
                  <div key={despacho.id} className="despacho-card">
                    <div className="despacho-header">
                      <span className="despacho-id">Pedido #{despacho.id}</span>
                      <span
                        className="despacho-estado"
                        style={{
                          backgroundColor: colorEstado.bg,
                          color: colorEstado.text,
                        }}
                      >
                        {despacho.estadoDespacho}
                      </span>
                    </div>

                    <p className="despacho-cliente">
                      👤 {despacho.clienteNombre}
                    </p>
                    <p className="despacho-correo">{despacho.clienteCorreo}</p>
                    <p className="despacho-total">
                      💰 Total: ${despacho.total?.toLocaleString("es-CL")}
                    </p>

                    {/* Productos */}
                    {despacho.detalles && despacho.detalles.length > 0 && (
                      <ul className="despacho-productos">
                        {despacho.detalles.map((d, i) => (
                          <li key={i}>
                            {d.nombreProducto} × {d.cantidad}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Cambiar estado */}
                    {despacho.estadoDespacho !== "ENTREGADO" && (
                      <div className="despacho-acciones">
                        {despacho.estadoDespacho === "ASIGNADO" && (
                          <button
                            onClick={() =>
                              cambiarEstado(despacho.id, "EN_CAMINO")
                            }
                          >
                            🚗 Salir a entregar
                          </button>
                        )}
                        {despacho.estadoDespacho === "EN_CAMINO" && (
                          <button
                            className="btn-entregado"
                            onClick={() =>
                              cambiarEstado(despacho.id, "ENTREGADO")
                            }
                          >
                            ✅ Marcar entregado
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sección Calificaciones */}
      {seccion === "calificaciones" && (
        <div className="driver-seccion">
          {calificaciones.length === 0 ? (
            <p className="driver-vacio">Aún no tienes calificaciones.</p>
          ) : (
            <div className="driver-grid">
              {calificaciones.map((cal) => (
                <div key={cal.id} className="calificacion-card">
                  <div className="cal-estrellas">
                    {"⭐".repeat(cal.puntuacion)}
                    {"☆".repeat(5 - cal.puntuacion)}
                  </div>
                  <p className="cal-comentario">
                    "{cal.comentario || "Sin comentario"}"
                  </p>
                  <p className="cal-cliente">— {cal.clienteNombre}</p>
                  <p className="cal-fecha">
                    {new Date(cal.fecha).toLocaleDateString("es-CL")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
