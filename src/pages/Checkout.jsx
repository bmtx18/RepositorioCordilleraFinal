import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useCarrito } from "../context/CarritoContext";
import "./Checkout.css";

const API_VENTAS = "http://localhost:8084/api/ventas";

const REGIONES = [
  "Región Metropolitana",
  "Valparaíso",
  "Región de O'Higgins",
  "Maule",
  "Biobío",
  "La Araucanía",
  "Los Lagos",
  "Los Ríos",
  "Coquimbo",
  "Atacama",
  "Antofagasta",
  "Tarapacá",
  "Arica y Parinacota",
  "Aysén",
  "Magallanes",
  "Ñuble",
];

function diasEstimadosPorRegion(region) {
  const r = region.toLowerCase();
  if (r.includes("metropolitana")) return 2;
  if (
    r.includes("valparaíso") ||
    r.includes("o'higgins") ||
    r.includes("maule") ||
    r.includes("biobío")
  )
    return 4;
  if (r.includes("arica") || r.includes("tarapacá") || r.includes("magallanes") || r.includes("aysén"))
    return 8;
  return 6;
}

// ── Formateo de campos de tarjeta (agregado) ────────────────────────────────

// Solo dígitos, máximo 16, agrupados de 4 en 4: "1234 5678 9012 3456"
function formatearNumeroTarjeta(valor) {
  const soloDigitos = valor.replace(/\D/g, "").slice(0, 16);
  return soloDigitos.replace(/(.{4})/g, "$1 ").trim();
}

// Solo dígitos, máximo 4 (MMAA), inserta "/" automático después de 2: "12/26"
function formatearVencimiento(valor) {
  const soloDigitos = valor.replace(/\D/g, "").slice(0, 4);
  if (soloDigitos.length <= 2) return soloDigitos;
  return `${soloDigitos.slice(0, 2)}/${soloDigitos.slice(2)}`;
}

// Solo dígitos, máximo 4 (admite Amex de 4, default 3)
function formatearCvv(valor) {
  return valor.replace(/\D/g, "").slice(0, 4);
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, vaciar } = useCarrito();
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();

  const [form, setForm] = useState({
    direccionEntrega: "",
    comuna: "",
    region: "Región Metropolitana",
    telefonoContacto: "",
  });

  const [tarjeta, setTarjeta] = useState({
    numero: "",
    nombre: "",
    vencimiento: "",
    cvv: "",
  });

  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const iva = total * 0.19;
  const totalConIva = total + iva;

  const diasEstimados = useMemo(
    () => diasEstimadosPorRegion(form.region),
    [form.region]
  );

  const fechaEstimada = useMemo(() => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + diasEstimados);
    return fecha.toLocaleDateString("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }, [diasEstimados]);

  if (!isAuthenticated) {
    return (
      <div className="checkout-page">
        <div className="checkout-vacio">
          <h2>Inicia sesión para continuar</h2>
          <p>Necesitas una cuenta para finalizar tu compra.</p>
          <button className="btn-primary" onClick={() => loginWithRedirect()}>
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-vacio">
          <h2>Tu carrito está vacío</h2>
          <p>Agrega productos antes de pasar a pagar.</p>
          <Link to="/" className="btn-primary">
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  const formularioValido =
    form.direccionEntrega.trim() &&
    form.comuna.trim() &&
    form.region.trim() &&
    form.telefonoContacto.trim() &&
    tarjeta.numero.replace(/\s/g, "").length >= 16 &&
    tarjeta.nombre.trim() &&
    tarjeta.vencimiento.trim() &&
    tarjeta.cvv.trim().length >= 3;

  const handleConfirmar = async () => {
    setError("");

    if (!formularioValido) {
      setError("Completa todos los campos para continuar.");
      return;
    }

    const venta = {
      usuarioId: 1,
      clienteNombre: user?.name || user?.nickname || "Cliente",
      clienteCorreo: user?.email || "sin-correo",
      reporteId: null,
      metodoPago: "TARJETA",
      direccionEntrega: form.direccionEntrega,
      comuna: form.comuna,
      region: form.region,
      telefonoContacto: form.telefonoContacto,
      detalles: items.map((item) => ({
        productoId: Number(item.id),
        nombreProducto: item.nombre,
        cantidad: Number(item.cantidad || 1),
        precioUnitario: Number(item.precio || 0),
      })),
    };

    try {
      setProcesando(true);

      const res = await fetch(API_VENTAS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venta),
      });

      if (!res.ok) {
        const texto = await res.text();
        throw new Error(texto || "Error al registrar la compra");
      }

      const ventaCreada = await res.json();

      vaciar();

      navigate("/confirmacion", {
        state: {
          venta: ventaCreada,
          diasEstimados,
          fechaEstimada,
        },
      });
    } catch (err) {
      console.error(err);
      setError("No se pudo procesar el pago: " + err.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="checkout-page">
      <button className="btn-volver" onClick={() => navigate("/carrito")}>
        ← Volver al carrito
      </button>

      <h1 className="checkout-titulo">Finalizar compra</h1>

      {error && <div className="checkout-alert error">{error}</div>}

      <div className="checkout-layout">
        <div className="checkout-formularios">
          {/* ── DATOS DE ENTREGA ── */}
          <section className="checkout-card">
            <h2>📦 Datos de entrega</h2>

            <div className="campo">
              <label>Dirección</label>
              <input
                type="text"
                placeholder="Calle, número, depto/casa"
                value={form.direccionEntrega}
                onChange={(e) =>
                  setForm({ ...form, direccionEntrega: e.target.value })
                }
              />
            </div>

            <div className="campo-grupo">
              <div className="campo">
                <label>Comuna</label>
                <input
                  type="text"
                  placeholder="Ej: Talagante"
                  value={form.comuna}
                  onChange={(e) =>
                    setForm({ ...form, comuna: e.target.value })
                  }
                />
              </div>

              <div className="campo">
                <label>Región</label>
                <select
                  value={form.region}
                  onChange={(e) =>
                    setForm({ ...form, region: e.target.value })
                  }
                >
                  {REGIONES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="campo">
              <label>Teléfono de contacto</label>
              <input
                type="tel"
                placeholder="+56 9 1234 5678"
                value={form.telefonoContacto}
                onChange={(e) =>
                  setForm({ ...form, telefonoContacto: e.target.value })
                }
              />
            </div>

            <div className="entrega-estimada">
              🚚 Llega aproximadamente el{" "}
              <strong>{fechaEstimada}</strong> ({diasEstimados}{" "}
              {diasEstimados === 1 ? "día" : "días"} hábiles)
            </div>
          </section>

          {/* ── DATOS DE PAGO ── */}
          <section className="checkout-card">
            <h2>💳 Pago con tarjeta</h2>
            <p className="checkout-nota">
              Pago simulado — no se realiza ningún cobro real.
            </p>

            <div className="campo">
              <label>Número de tarjeta</label>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
                maxLength={19}
                value={tarjeta.numero}
                onChange={(e) =>
                  setTarjeta({
                    ...tarjeta,
                    numero: formatearNumeroTarjeta(e.target.value),
                  })
                }
              />
            </div>

            <div className="campo">
              <label>Nombre en la tarjeta</label>
              <input
                type="text"
                placeholder="Como aparece en la tarjeta"
                value={tarjeta.nombre}
                onChange={(e) =>
                  setTarjeta({ ...tarjeta, nombre: e.target.value })
                }
              />
            </div>

            <div className="campo-grupo">
              <div className="campo">
                <label>Vencimiento</label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  inputMode="numeric"
                  maxLength={5}
                  value={tarjeta.vencimiento}
                  onChange={(e) =>
                    setTarjeta({
                      ...tarjeta,
                      vencimiento: formatearVencimiento(e.target.value),
                    })
                  }
                />
              </div>

              <div className="campo">
                <label>CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  inputMode="numeric"
                  maxLength={4}
                  value={tarjeta.cvv}
                  onChange={(e) =>
                    setTarjeta({
                      ...tarjeta,
                      cvv: formatearCvv(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </section>
        </div>

        {/* ── RESUMEN ── */}
        <aside className="checkout-resumen">
          <h3>Resumen del pedido</h3>

          <div className="resumen-items">
            {items.map((item) => (
              <div key={item.id} className="resumen-item">
                <span className="resumen-item-nombre">
                  {item.nombre} × {item.cantidad}
                </span>
                <span>
                  ${(item.precio * item.cantidad).toLocaleString("es-CL")}
                </span>
              </div>
            ))}
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

          <button
            className="btn-primary btn-confirmar"
            onClick={handleConfirmar}
            disabled={procesando}
          >
            {procesando ? "Procesando pago..." : "Confirmar y pagar"}
          </button>
        </aside>
      </div>
    </div>
  );
}
