import { Link } from "react-router-dom";
import "./SobreNosotros.css";

export default function SobreNosotros() {
  return (
    <div className="sobre-page">
      <div className="sobre-hero">
        <p className="sobre-eyebrow">Grupo Cordillera</p>
        <h1>
          Tecnología para el hogar, <br />
          <span className="sobre-accent">pensada para Chile</span>
        </h1>
        <p className="sobre-intro">
          Somos una tienda online especializada en electrodomésticos,
          comprometida con ofrecer productos de calidad, despacho a todo
          el país y una experiencia de compra simple y confiable.
        </p>
      </div>

      <div className="sobre-grid">
        <div className="sobre-card">
          <span className="sobre-icono">🏔️</span>
          <h3>Nuestro origen</h3>
          <p>
            Nacimos con la idea de acercar tecnología de calidad a cada
            hogar chileno, desde la cordillera hasta la costa, sin
            intermediarios innecesarios.
          </p>
        </div>

        <div className="sobre-card">
          <span className="sobre-icono">🚚</span>
          <h3>Despacho a todo Chile</h3>
          <p>
            Trabajamos con un equipo propio de drivers para asegurar que
            tu pedido llegue a tiempo, desde la Región Metropolitana
            hasta las zonas más extremas del país.
          </p>
        </div>

        <div className="sobre-card">
          <span className="sobre-icono">✅</span>
          <h3>Calidad garantizada</h3>
          <p>
            Cada producto que vendemos pasa por un control de calidad y
            cuenta con garantía oficial del fabricante.
          </p>
        </div>

        <div className="sobre-card">
          <span className="sobre-icono">💬</span>
          <h3>Soporte 24/7</h3>
          <p>
            Nuestro equipo de soporte está disponible todos los días del
            año para resolver tus dudas antes, durante y después de tu
            compra.
          </p>
        </div>
      </div>

      <div className="sobre-cta">
        <h2>¿Listo para encontrar tu próximo electrodoméstico?</h2>
        <Link to="/" className="btn-primary">
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
