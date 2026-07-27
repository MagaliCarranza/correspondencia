import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ACCESOS = [
  {
    id: "consulta",
    titulo: "Consultar correspondencia",
    descripcion: "Busca y filtra la correspondencia registrada en el sistema.",
    ruta: "/correspondencia",
    roles: ["ADMIN", "SUPERVISOR", "RECEPCIONISTA", "MENSAJERO"],
  },
  {
    id: "recepcion",
    titulo: "Registrar correspondencia",
    descripcion: "Da de alta un documento nuevo y genera su folio.",
    ruta: "/recepcion",
    roles: ["ADMIN", "RECEPCIONISTA"],
  },
  {
    id: "mis-asignaciones",
    titulo: "Mis asignaciones",
    descripcion: "Ve la correspondencia que tienes pendiente por entregar.",
    ruta: "/mis-asignaciones",
    roles: ["ADMIN", "MENSAJERO"],
  },
  {
    id: "reportes",
    titulo: "Reportes PDF",
    descripcion: "Genera reportes formales con los filtros que necesites.",
    ruta: "/reportes",
    roles: ["ADMIN", "SUPERVISOR"],
  },
  {
    id: "usuarios",
    titulo: "Gestionar usuarios",
    descripcion: "Crea cuentas, restablece contraseñas y edita datos.",
    ruta: "/usuarios",
    roles: ["ADMIN"],
  },
  {
    id: "areas",
    titulo: "Gestionar áreas",
    descripcion: "Administra las áreas destino de la correspondencia.",
    ruta: "/areas",
    roles: ["ADMIN"],
  },
];

export function HomePage() {
  const { usuario } = useAuth();
  const accesos = ACCESOS.filter((a) => a.roles.includes(usuario?.rol));

  return (
    <div className="home-page">
      <section className="home-hero">
        <h1>Bienvenida, {usuario?.nombreCompleto}</h1>
        <p>
          <span className="badge-rol">{usuario?.rol}</span>
          Área: <strong>{usuario?.area}</strong>
        </p>
      </section>

      {usuario?.debeCambiarPassword && (
        <div className="alerta alerta-aviso">
          Estás usando una contraseña temporal.{" "}
          <Link to="/perfil">Cámbiala desde tu perfil</Link> lo antes posible.
        </div>
      )}

      <h2 className="home-seccion-titulo">Accesos rápidos</h2>
      <div className="home-accesos">
        {accesos.map((a) => (
          <Link key={a.id} to={a.ruta} className="acceso-card">
            <span className="acceso-card-titulo">{a.titulo}</span>
            <span className="acceso-card-desc">{a.descripcion}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
