import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DriverRoute({ children }) {

  const { estaAutenticado, cargando, cargandoRol, esDriver, login } = useAuth();

  if (cargando || cargandoRol) {
    return <p style={{ textAlign: "center", padding: "3rem" }}>Cargando permisos...</p>;
  }

  if (!estaAutenticado) {
    // No hay sesión: lo mandamos a iniciar sesión en vez de mostrar una página vacía
    login();
    return null;
  }

  if (!esDriver) {
    return <Navigate to="/" replace />;
  }

  return children;
}
