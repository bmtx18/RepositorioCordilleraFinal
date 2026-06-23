import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Reportes.css";

const API_REPORTES = "http://localhost:8086/api/reportes";
const ADMIN_EMAIL = "agu.moya@duocuc.cl";

export default function Reportes() {
  const { isAuthenticated, loginWithRedirect, user, isLoading } = useAuth0();

  const [reportes, setReportes] = useState([]);
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [respuestaAdmin, setRespuestaAdmin] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const esAdmin =
    isAuthenticated &&
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const cargarReportes = async () => {
    try {
      const res = await fetch(API_REPORTES);

      if (!res.ok) {
        throw new Error("No se pudieron cargar los reportes");
      }

      const data = await res.json();
      setReportes(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los reportes.");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      cargarReportes();
    }
  }, [isAuthenticated]);

  const reportesVisibles = esAdmin
    ? reportes
    : reportes.filter(
        (reporte) =>
          reporte.clienteCorreo?.toLowerCase() === user?.email?.toLowerCase()
      );

  const crearReporte = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!tipo || !descripcion.trim()) {
      setError("Debes completar todos los campos.");
      return;
    }

    const nuevoReporte = {
      clienteNombre: user?.name || user?.nickname || "Cliente",
      clienteCorreo: user?.email,
      tipo,
      descripcion,
    };

    try {
      const res = await fetch(API_REPORTES, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoReporte),
      });

      if (!res.ok) {
        const texto = await res.text();
        throw new Error(texto || "Error al crear reporte");
      }

      setTipo("");
      setDescripcion("");
      setMostrarFormulario(false);
      setMensaje("Reporte enviado correctamente.");
      await cargarReportes();
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el reporte: " + err.message);
    }
  };

  const responderReporte = async (id) => {
    const respuesta = respuestaAdmin[id];

    if (!respuesta || !respuesta.trim()) {
      setError("Debes escribir una respuesta.");
      return;
    }

    try {
      const res = await fetch(`${API_REPORTES}/${id}/responder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          respuestaAdmin: respuesta,
        }),
      });

      if (!res.ok) {
        const texto = await res.text();
        throw new Error(texto || "Error al responder reporte");
      }

      setRespuestaAdmin({
        ...respuestaAdmin,
        [id]: "",
      });

      setMensaje("Reporte respondido correctamente.");
      setError("");
      await cargarReportes();
    } catch (err) {
      console.error(err);
      setError("No se pudo responder el reporte: " + err.message);
    }
  };

  const generarPDFReportes = () => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(18);
    doc.text("Reporte general de solicitudes - Grupo Cordillera", 14, 18);

    doc.setFontSize(10);
    doc.text(`Generado por: ${user?.name || user?.email}`, 14, 28);
    doc.text(`Fecha: ${new Date().toLocaleString("es-CL")}`, 14, 35);
    doc.text(`Total de reportes: ${reportes.length}`, 14, 42);

    const filas = reportes.map((reporte) => [
      reporte.id,
      reporte.clienteNombre || "Sin nombre",
      reporte.clienteCorreo || "Sin correo",
      reporte.tipo || "Sin tipo",
      reporte.descripcion || "Sin descripción",
      reporte.estado || "Pendiente",
      reporte.respuestaAdmin || "Sin respuesta",
      reporte.fechaCreacion || "Sin fecha",
      reporte.fechaRespuesta || "Sin respuesta",
    ]);

    autoTable(doc, {
      startY: 50,
      head: [
        [
          "ID",
          "Cliente",
          "Correo",
          "Tipo",
          "Descripción",
          "Estado",
          "Respuesta admin",
          "Fecha creación",
          "Fecha respuesta",
        ],
      ],
      body: filas,
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [220, 0, 90],
        textColor: 255,
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 30 },
        2: { cellWidth: 42 },
        3: { cellWidth: 35 },
        4: { cellWidth: 55 },
        5: { cellWidth: 25 },
        6: { cellWidth: 55 },
        7: { cellWidth: 35 },
        8: { cellWidth: 35 },
      },
    });

    doc.save("reportes_grupo_cordillera.pdf");
  };

  if (isLoading) {
    return <div className="reportes-page">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="reportes-page">
        <div className="reportes-card">
          <h1>Reportes</h1>
          <p>Debes iniciar sesión para acceder a los reportes.</p>
          <button className="btn-reporte" onClick={() => loginWithRedirect()}>
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reportes-page">
      <div className="reportes-card">
        <div className="reportes-header">
          <div>
            <h1>{esAdmin ? "Reportes de clientes" : "Mis reportes"}</h1>
            <p>
              {esAdmin
                ? "Revisa, responde y descarga los reportes enviados por clientes."
                : "Aquí puedes crear reportes y revisar respuestas del administrador."}
            </p>
          </div>

          {!esAdmin && (
            <button
              className="btn-reporte"
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
            >
              {mostrarFormulario ? "Cerrar formulario" : "Crear reporte"}
            </button>
          )}

          {esAdmin && (
            <button className="btn-reporte" onClick={generarPDFReportes}>
              Crear PDF de reportes
            </button>
          )}
        </div>

        {mensaje && <p className="mensaje-reporte success">{mensaje}</p>}
        {error && <p className="mensaje-reporte error">{error}</p>}

        {!esAdmin && mostrarFormulario && (
          <form className="formulario-reporte" onSubmit={crearReporte}>
            <label>Tipo de reporte</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Seleccione una opción</option>
              <option value="Producto defectuoso">Producto defectuoso</option>
              <option value="Problema con compra">Problema con compra</option>
              <option value="Problema con entrega">Problema con entrega</option>
              <option value="Otro">Otro</option>
            </select>

            <label>Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el problema..."
              rows="5"
            />

            <button className="btn-reporte" type="submit">
              Enviar reporte
            </button>
          </form>
        )}

        {reportesVisibles.length === 0 ? (
          <p className="sin-reportes">
            {esAdmin
              ? "No existen reportes de clientes."
              : "No tienes reportes registrados."}
          </p>
        ) : (
          <div className="historial-reportes">
            {reportesVisibles.map((reporte) => (
              <div key={reporte.id} className="card-reporte">
                <div className="reporte-top">
                  <h3>{reporte.tipo}</h3>

                  <span
                    className={
                      reporte.estado === "Respondido"
                        ? "estado-respondido"
                        : "estado-pendiente"
                    }
                  >
                    {reporte.estado || "Pendiente"}
                  </span>
                </div>

                {esAdmin && (
                  <>
                    <p>
                      <strong>Cliente:</strong> {reporte.clienteNombre}
                    </p>
                    <p>
                      <strong>Correo:</strong> {reporte.clienteCorreo}
                    </p>
                  </>
                )}

                <p>
                  <strong>Descripción:</strong> {reporte.descripcion}
                </p>

                <p>
                  <strong>Fecha creación:</strong>{" "}
                  {reporte.fechaCreacion || "Sin fecha"}
                </p>

                {reporte.respuestaAdmin && (
                  <div className="respuesta-admin-box">
                    <strong>Respuesta del administrador:</strong>
                    <p>{reporte.respuestaAdmin}</p>
                    <small>
                      Fecha respuesta: {reporte.fechaRespuesta || "Sin fecha"}
                    </small>
                  </div>
                )}

                {esAdmin && reporte.estado !== "Respondido" && (
                  <div className="admin-responder-box">
                    <textarea
                      placeholder="Escribe una respuesta para el cliente..."
                      value={respuestaAdmin[reporte.id] || ""}
                      onChange={(e) =>
                        setRespuestaAdmin({
                          ...respuestaAdmin,
                          [reporte.id]: e.target.value,
                        })
                      }
                      rows="4"
                    />

                    <button
                      className="btn-reporte"
                      onClick={() => responderReporte(reporte.id)}
                    >
                      Enviar respuesta
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}