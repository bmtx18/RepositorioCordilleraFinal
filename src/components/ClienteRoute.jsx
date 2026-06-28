import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ClienteRoute({ children }) {
  const { cargando, cargandoRol, esAdmin, esDriver } = useAuth();

  if (cargando || cargandoRol) {
    return (
      <p style={{ textAlign: "center", padding: "3rem" }}>
        Cargando permisos...
      </p>
    );
  }

  if (esAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (esDriver) return <Navigate to="/driver" replace />;

  return children;
}