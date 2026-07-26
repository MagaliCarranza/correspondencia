import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function HomePage() {
  const { usuario } = useAuth();

  return (
    <div className="home-page">
      <h1>Bienvenida, {usuario?.nombreCompleto}</h1>
      <p>
        Rol: <strong>{usuario?.rol}</strong> - Area: <strong>{usuario?.area}</strong>
      </p>
      {usuario?.debeCambiarPassword && (
        <div className="alerta alerta-aviso">
          Estas usando una contraseña temporal.{" "}
          <Link to="/perfil">Cambiala desde tu perfil</Link> lo antes posible.
        </div>
      )}
      <p className="hint">Usa el menu superior para acceder a las funciones disponibles.</p>
    </div>
  );
}
