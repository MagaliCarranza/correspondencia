import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { usuario, logout } = useAuth();
  const esAdmin = usuario?.rol === "ADMIN";
  const puedeRecepcionar = esAdmin || usuario?.rol === "RECEPCIONISTA";
  const esMensajero = esAdmin || usuario?.rol === "MENSAJERO";
  const puedeReportes = esAdmin || usuario?.rol === "SUPERVISOR";

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-brand">
          <Link to="/">Correspondencia</Link>
        </div>
        <nav className="layout-nav">
          <Link to="/">Inicio</Link>
          <Link to="/correspondencia">Consulta</Link>
          {puedeRecepcionar && <Link to="/recepcion">Recepcion</Link>}
          {esMensajero && <Link to="/mis-asignaciones">Mis asignaciones</Link>}
          {puedeReportes && <Link to="/reportes">Reportes</Link>}
          {esAdmin && (
            <>
              <Link to="/usuarios">Usuarios</Link>
              <Link to="/areas">Areas</Link>
            </>
          )}
        </nav>
        <div className="layout-user">
          <Link to="/perfil" className="layout-user-link">
            {usuario?.nombreCompleto} <small>({usuario?.rol})</small>
          </Link>
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
