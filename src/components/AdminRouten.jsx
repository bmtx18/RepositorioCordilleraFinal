import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {

  const { estaAutenticado, cargando, cargandoRol, esAdmin } = useAuth();

  if (cargando || cargandoRol) {
    return <p style={{ textAlign: "center", padding: "3rem" }}>Cargando permisos...</p>;
  }

  if (!estaAutenticado || !esAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
