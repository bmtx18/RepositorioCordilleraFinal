import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CalificarDriver from "../components/CalificarDriver";
import "./MisPedidos.css";

const API_BFF = "http://localhost:8080/api/bff";

const MisPedidos = () => {
  const { usuario, estaAutenticado } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!estaAutenticado || !usuario?.email) return;

    cargarPedidos();
    cargarDrivers();
  }, [estaAutenticado, usuario]);

  const cargarPedidos = async () => {
    setCargando(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BFF}/ventas/cliente/${encodeURIComponent(usuario.email)}`
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      setPedidos(Array.isArray(data) ? data : []);
    } catch {
      setError("No se pudieron cargar tus pedidos.");
    } finally {
      setCargando(false);
    }
  };

  const cargarDrivers = async () => {
    try {
      const res = await fetch(`${API_BFF}/dashboard/drivers`);
      const data = await res.json();
      setDrivers(Array.isArray(data) ? data : []);
    } catch {
      console.error("No se pudieron cargar los drivers");
    }
  };

  const obtenerDriver = (driverId) => {
    return drivers.find((d) => d.id === driverId);
  };

  const formatearEstado = (estado) => {
    if (!estado) return "Pendiente";

    const textos = {
      PENDIENTE: "Pendiente",
      ASIGNADO: "Driver asignado",
      EN_CAMINO: "En camino",
      ENTREGADO: "Entregado",
    };

    return textos[estado] || estado;
  };

  const renderTimeline = (estadoActual) => {
    const estados = ["PENDIENTE", "ASIGNADO", "EN_CAMINO", "ENTREGADO"];
    const indexActual = estados.indexOf(estadoActual || "PENDIENTE");

    return (
      <div className="pedido-timeline">
        <div className="pedido-timeline-line" />

        {estados.map((estado, i) => (
          <div key={estado} className="pedido-timeline-item">
            <div
              className={`pedido-timeline-dot ${
                i <= indexActual ? "active" : ""
              }`}
            />

            <span
              className={`pedido-timeline-text ${
                i <= indexActual ? "active" : ""
              }`}
            >
              {formatearEstado(estado)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (!estaAutenticado) {
    return (
      <div className="pedidos-page">
        <div className="pedido-login">
          <h2>Inicia sesión para ver tus pedidos</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="pedidos-page">
      <div className="pedidos-header">
        <h1>Mis Pedidos</h1>
        <p>Bienvenido {usuario?.name || usuario?.email}</p>
      </div>

      {cargando && <p>Cargando pedidos...</p>}
      {error && <p className="pedido-error">{error}</p>}

      <div className="pedidos-grid">
        {pedidos.map((pedido) => {
          const driver = obtenerDriver(pedido.driverId);

          return (
            <div key={pedido.id} className="pedido-card">
              <div className="pedido-card-top">
                <div>
                  <h3>Pedido #{pedido.id}</h3>
                  <small>
                    {pedido.fechaVenta
                      ? new Date(pedido.fechaVenta).toLocaleDateString("es-CL")
                      : "Sin fecha"}
                  </small>
                </div>

                <strong>
                  ${Number(pedido.total || 0).toLocaleString("es-CL")}
                </strong>
              </div>

              {renderTimeline(pedido.estadoDespacho)}

              <div className="pedido-info">
                <p>
                  <strong>Estado:</strong>{" "}
                  {formatearEstado(pedido.estadoDespacho)}
                </p>

                <p>
                  <strong>Driver asignado:</strong>{" "}
                  {driver ? driver.nombre : "Aún no asignado"}
                </p>
              </div>

              {pedido.estadoDespacho === "ENTREGADO" && pedido.driverId && (
                <CalificarDriver
                  driverId={pedido.driverId}
                  driverNombre={driver?.nombre || "Driver"}
                />
              )}
            </div>
          );
        })}
      </div>

      {!cargando && pedidos.length === 0 && (
        <p>No tienes pedidos registrados todavía.</p>
      )}
    </div>
  );
};

export default MisPedidos;