import { useAuth } from "../context/AuthContext";

import "./Auth.css";

export default function Registro() {

  const { login } = useAuth();

  return (

    <div className="auth-page">

      <div className="auth-card">

        <h1>Crear cuenta</h1>

        <p>
          Regístrate para acceder a Grupo Cordillera.
        </p>

        <button
          className="btn-primary"
          onClick={login}
        >
          Registrarme
        </button>

      </div>

    </div>
  );
}