import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { estaAutenticado, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  if (estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await login(username.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const mensajeApi = err.response?.data?.mensaje;
      if (status === 423) {
        setError(mensajeApi ?? "La cuenta esta bloqueada.");
      } else if (status === 401) {
        setError(mensajeApi ?? "Usuario o contrasena incorrectos.");
      } else {
        setError("Error al iniciar sesion. Intenta de nuevo.");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={onSubmit}>
        <h1>Sistema de Correspondencia</h1>
        <p className="login-subtitle">Ingresa tus credenciales</p>

        <label>
          Usuario
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label>
          Contrasena
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <div className="alerta alerta-error">{error}</div>}

        <button type="submit" disabled={cargando}>
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
