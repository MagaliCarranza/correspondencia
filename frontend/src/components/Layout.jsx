import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { usuario, logout } = useAuth();

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-brand">
          <Link to="/">Correspondencia</Link>
        </div>
        <nav className="layout-nav">
          <Link to="/">Inicio</Link>
          {usuario?.rol === "ADMIN" && (
            <>
              <Link to="/usuarios">Usuarios</Link>
              <Link to="/areas">Areas</Link>
            </>
          )}
        </nav>
        <div className="layout-user">
          <span>
            {usuario?.nombreCompleto} <small>({usuario?.rol})</small>
          </span>
          <button type="button" onClick={logout}>
            Salir
          </button>
        </div>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
