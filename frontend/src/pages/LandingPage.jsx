import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LandingPage() {
  const { estaAutenticado } = useAuth();

  return (
    <div className="landing-page">
      <main className="landing-contenido">
        <h1>Gestión y Control de Correspondencia</h1>
        <p className="landing-descripcion">
          Plataforma para registrar, distribuir, entregar, archivar y reportar
          la correspondencia interna y externa de la organización, garantizando
          trazabilidad y control formal de cada documento.
        </p>
        <div className="landing-acciones">
          {estaAutenticado ? (
            <Link to="/inicio" className="landing-boton">
              Ir
            </Link>
          ) : (
            <Link to="/login" className="landing-boton">
              Iniciar sesión
            </Link>
          )}
        </div>
      </main>
      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} Sistema de Correspondencia</span>
        <span>Proyecto de titulación · Magali Carranza</span>
      </footer>
    </div>
  );
}
