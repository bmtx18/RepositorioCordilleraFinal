import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const iniciarAdmin = (e) => {
    e.preventDefault();

    const TOKEN_SEGURIDAD = "CORDILLERA-ADMIN-2026";

    if (token === TOKEN_SEGURIDAD) {
      localStorage.setItem("adminAuth", "true");
      navigate("/admin/productos");
    } else {
      setError("Token de seguridad incorrecto");
    }
  };

  return (
    <main style={{ padding: "40px", maxWidth: "420px", margin: "auto" }}>
      <h1>Inserte su token de seguridad</h1>

      <form onSubmit={iniciarAdmin} style={{ display: "grid", gap: "12px" }}>
        <input
          type="password"
          placeholder="Token de seguridad"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />

        <button type="submit">Validar acceso</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}