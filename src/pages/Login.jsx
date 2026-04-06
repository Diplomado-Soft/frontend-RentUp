import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }
    alert(`Login con: ${email}`);
    navigate("/");
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} style={{ padding: "2rem", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h2>Iniciar Sesión</h2>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "8px", width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "8px", width: "100%" }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ padding: "10px 20px", background: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}
export default Login;