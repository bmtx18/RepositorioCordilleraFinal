import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./CalificarDriver.css";

const API = "http://localhost:8080/api/bff/dashboard/drivers";

export default function CalificarDriver({ driverId, driverNombre, onCalificado }) {
  const { user } = useAuth0();

  const [puntuacion, setPuntuacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const enviarCalificacion = async () => {
    if (puntuacion === 0) {
      setMensaje("⚠️ Debes seleccionar al menos una estrella.");
      return;
    }

    setEnviando(true);
    setMensaje("");

    try {
      const res = await fetch(`${API}/calificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId,
          clienteNombre: user?.name || user?.nickname || "Cliente",
          clienteCorreo: user?.email,
          puntuacion,
          comentario: comentario.trim() || null,
        }),
      });

      if (!res.ok) throw new Error();

      setMensaje("✅ ¡Calificación enviada! Gracias.");
      setPuntuacion(0);
      setComentario("");
      if (onCalificado) onCalificado();
    } catch {
      setMensaje("❌ Error al enviar la calificación.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="calificar-container">
      <h3 className="calificar-titulo">
        ⭐ Califica a tu driver: <span>{driverNombre}</span>
      </h3>

      {/* Estrellas */}
      <div className="estrellas">
        {[1, 2, 3, 4, 5].map((estrella) => (
          <span
            key={estrella}
            className={`estrella ${estrella <= (hover || puntuacion) ? "activa" : ""}`}
            onClick={() => setPuntuacion(estrella)}
            onMouseEnter={() => setHover(estrella)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </span>
        ))}
      </div>

      <p className="puntuacion-texto">
        {puntuacion > 0
          ? ["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"][puntuacion]
          : "Selecciona una puntuación"}
      </p>

      {/* Comentario */}
      <textarea
        className="calificar-textarea"
        placeholder="Agrega un comentario (opcional)..."
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows={3}
        maxLength={300}
      />

      <button
        className="calificar-btn"
        onClick={enviarCalificacion}
        disabled={enviando}
      >
        {enviando ? "Enviando..." : "Enviar calificación"}
      </button>

      {mensaje && <p className="calificar-mensaje">{mensaje}</p>}
    </div>
  );
}
