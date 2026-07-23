import { useEffect, useState } from "react";
import { listarAreas } from "../services/areaService";
import {
  crearUsuario,
  desbloquearUsuario,
  listarUsuarios,
} from "../services/usuarioService";

const ROLES = ["ADMIN", "SUPERVISOR", "RECEPCIONISTA", "MENSAJERO"];

const FORM_INICIAL = {
  nombreCompleto: "",
  email: "",
  username: "",
  areaId: "",
  rol: "RECEPCIONISTA",
};

export function UsuariosPage() {
  const [areas, setAreas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function recargar() {
    const [areasData, usuariosData] = await Promise.all([
      listarAreas(),
      listarUsuarios(),
    ]);
    setAreas(areasData);
    setUsuarios(usuariosData);
  }

  useEffect(() => {
    recargar().catch(() => setError("No se pudo cargar la informacion."));
  }, []);

  function actualizar(campo) {
    return (e) => setForm({ ...form, [campo]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMensaje(null);
    setError(null);
    setCargando(true);
    try {
      const nuevo = await crearUsuario({
        ...form,
        areaId: Number(form.areaId),
      });
      setMensaje(
        `Usuario ${nuevo.username} creado. La contrasena temporal aparece en el log del backend (o se envio por correo).`,
      );
      setForm(FORM_INICIAL);
      await recargar();
    } catch (err) {
      const detalle = err.response?.data;
      if (detalle?.detalle) {
        setError(
          Object.entries(detalle.detalle)
            .map(([campo, msg]) => `${campo}: ${msg}`)
            .join(" | "),
        );
      } else {
        setError(detalle?.mensaje ?? "No se pudo crear el usuario.");
      }
    } finally {
      setCargando(false);
    }
  }

  async function onDesbloquear(id) {
    try {
      await desbloquearUsuario(id);
      await recargar();
    } catch {
      setError("No se pudo desbloquear la cuenta.");
    }
  }

  return (
    <div className="usuarios-page">
      <h1>Alta de usuarios</h1>

      <form className="form-columna" onSubmit={onSubmit}>
        <label>
          Nombre completo
          <input
            type="text"
            maxLength={50}
            value={form.nombreCompleto}
            onChange={actualizar("nombreCompleto")}
            required
          />
        </label>
        <label>
          Correo electronico
          <input
            type="email"
            maxLength={120}
            value={form.email}
            onChange={actualizar("email")}
            required
          />
        </label>
        <label>
          Nombre de usuario
          <input
            type="text"
            minLength={6}
            maxLength={12}
            pattern="[A-Za-z0-9._-]+"
            value={form.username}
            onChange={actualizar("username")}
            required
          />
          <small>6 a 12 caracteres, sin espacios ni caracteres especiales.</small>
        </label>
        <label>
          Area
          <select value={form.areaId} onChange={actualizar("areaId")} required>
            <option value="">Selecciona un area</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rol
          <select value={form.rol} onChange={actualizar("rol")} required>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        {mensaje && <div className="alerta alerta-ok">{mensaje}</div>}
        {error && <div className="alerta alerta-error">{error}</div>}

        <button type="submit" disabled={cargando}>
          {cargando ? "Guardando..." : "Crear usuario"}
        </button>
      </form>

      <h2>Usuarios registrados</h2>
      <table className="tabla">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Area</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.nombreCompleto}</td>
              <td>{u.email}</td>
              <td>{u.rol}</td>
              <td>{u.area}</td>
              <td>{u.bloqueada ? "Bloqueada" : "Activa"}</td>
              <td>
                {u.bloqueada && (
                  <button type="button" onClick={() => onDesbloquear(u.id)}>
                    Desbloquear
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
