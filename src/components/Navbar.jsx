import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCarrito } from "../context/CarritoContext";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { cantidadTotal } = useCarrito();

  const {
    usuario,
    estaAutenticado,
    cargando,
    cargandoRol,
    esAdmin,
    esDriver,
    login,
    logout,
  } = useAuth();

  if (cargando) return null;

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/")}>
        Grupo Cordillera
      </div>

      <div className="navbar-links">
        <Link to="/">INICIO</Link>

        {estaAutenticado && esAdmin ? (
          <>
            <Link to="/admin/productos">INVENTARIO</Link>
            <Link to="/admin/dashboard">DASHBOARD</Link>
          </>
        ) : estaAutenticado && esDriver ? (
          <>
            <Link to="/driver">MIS DESPACHOS</Link>
          </>
        ) : (
          <>
            <Link to="/carrito">🛒 CARRITO ({cantidadTotal})</Link>

            {estaAutenticado && (
              <Link to="/mis-pedidos">MIS PEDIDOS</Link>
            )}
          </>
        )}

        <Link to="/reportes">REPORTES</Link>
        <Link to="/sobre-nosotros">SOBRE NOSOTROS</Link>
      </div>

      <div className="navbar-auth">
        {!estaAutenticado ? (
          <>
            <button className="nav-login" onClick={login}>
              Iniciar sesión
            </button>
            <button className="nav-register" onClick={login}>
              Registrarse
            </button>
          </>
        ) : (
          <>
            <span className="usuario-navbar">
              {cargandoRol
                ? "Cargando..."
                : esAdmin
                ? "Administrador"
                : esDriver
                ? "Driver"
                : usuario?.name || usuario?.email}
            </span>

            <button className="nav-login" onClick={logout}>
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;