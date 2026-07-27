import { useEffect, useState } from "react";
import { Modal } from "../components/Modal";
import { listarAreas } from "../services/areaService";
import {
  actualizarUsuario,
  crearUsuario,
  desbloquearUsuario,
  listarUsuarios,
  resetearPasswordUsuario,
} from "../services/usuarioService";

const ROLES = ["ADMIN", "SUPERVISOR", "RECEPCIONISTA", "MENSAJERO"];

const FORM_INICIAL = {
  nombreCompleto: "",
  email: "",
  username: "",
  areaId: "",
  rol: "RECEPCIONISTA",
};

const FORM_EDICION_INICIAL = {
  nombreCompleto: "",
  email: "",
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
  const [credenciales, setCredenciales] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formEdicion, setFormEdicion] = useState(FORM_EDICION_INICIAL);
  const [errorEdicion, setErrorEdicion] = useState(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  async function recargar() {
    const [areasData, usuariosData] = await Promise.all([
      listarAreas(),
      listarUsuarios(),
    ]);
    setAreas(areasData);
    setUsuarios(usuariosData);
  }

  useEffect(() => {
    recargar().catch(() => setError("No se pudo cargar la información."));
  }, []);

  function actualizar(campo) {
    return (e) => setForm({ ...form, [campo]: e.target.value });
  }

  function actualizarEdicion(campo) {
    return (e) => setFormEdicion({ ...formEdicion, [campo]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMensaje(null);
    setError(null);
    setCargando(true);
    try {
      const resultado = await crearUsuario({
        ...form,
        areaId: Number(form.areaId),
      });
      setCredenciales({
        contexto: "creado",
        username: resultado.usuario.username,
        nombreCompleto: resultado.usuario.nombreCompleto,
        passwordTemporal: resultado.passwordTemporal,
      });
      setCopiado(false);
      setForm(FORM_INICIAL);
      await recargar();
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo crear el usuario."));
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

  function abrirEdicion(usuario) {
    setEditando(usuario);
    setFormEdicion({
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      areaId: String(usuario.areaId),
      rol: usuario.rol,
    });
    setErrorEdicion(null);
  }

  function cerrarEdicion() {
    setEditando(null);
    setFormEdicion(FORM_EDICION_INICIAL);
    setErrorEdicion(null);
  }

  async function guardarEdicion(e) {
    e.preventDefault();
    if (!editando) return;
    setErrorEdicion(null);
    setGuardandoEdicion(true);
    try {
      await actualizarUsuario(editando.id, {
        ...formEdicion,
        areaId: Number(formEdicion.areaId),
      });
      setMensaje(`Datos de ${editando.username} actualizados.`);
      cerrarEdicion();
      await recargar();
    } catch (err) {
      setErrorEdicion(
        extraerMensajeError(err, "No se pudieron guardar los cambios."),
      );
    } finally {
      setGuardandoEdicion(false);
    }
  }

  async function onResetearPassword(usuario) {
    const ok = window.confirm(
      `¿Resetear la contraseña de ${usuario.username}?\n\n` +
        "Se generará una nueva contraseña temporal. La anterior dejará de funcionar de inmediato.",
    );
    if (!ok) return;
    setError(null);
    try {
      const resultado = await resetearPasswordUsuario(usuario.id);
      setCredenciales({
        contexto: "reset",
        username: resultado.usuario.username,
        nombreCompleto: resultado.usuario.nombreCompleto,
        passwordTemporal: resultado.passwordTemporal,
      });
      setCopiado(false);
      await recargar();
    } catch (err) {
      setError(extraerMensajeError(err, "No se pudo resetear la contraseña."));
    }
  }

  async function copiarPassword() {
    if (!credenciales) return;
    try {
      await navigator.clipboard.writeText(credenciales.passwordTemporal);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  function cerrarCredenciales() {
    const contexto = credenciales?.contexto;
    const username = credenciales?.username;
    setCredenciales(null);
    setCopiado(false);
    if (contexto === "creado") {
      setMensaje(`Usuario ${username} creado correctamente.`);
    } else if (contexto === "reset") {
      setMensaje(`Contraseña de ${username} reseteada.`);
    }
  }

  const esReset = credenciales?.contexto === "reset";

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
          Correo electrónico
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
          Área
          <select value={form.areaId} onChange={actualizar("areaId")} required>
            <option value="">Selecciona un área</option>
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
            <th>Área</th>
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
                <div className="acciones-tabla">
                  <button type="button" onClick={() => abrirEdicion(u)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-secundario"
                    onClick={() => onResetearPassword(u)}
                  >
                    Resetear contraseña
                  </button>
                  {u.bloqueada && (
                    <button type="button" onClick={() => onDesbloquear(u.id)}>
                      Desbloquear
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editando && (
        <Modal
          titulo={`Editar usuario: ${editando.username}`}
          onCerrar={cerrarEdicion}
        >
          <form onSubmit={guardarEdicion}>
            <label>
              Nombre completo
              <input
                type="text"
                maxLength={50}
                value={formEdicion.nombreCompleto}
                onChange={actualizarEdicion("nombreCompleto")}
                required
              />
            </label>
            <label>
              Correo electrónico
              <input
                type="email"
                maxLength={120}
                value={formEdicion.email}
                onChange={actualizarEdicion("email")}
                required
              />
            </label>
            <label>
              Área
              <select
                value={formEdicion.areaId}
                onChange={actualizarEdicion("areaId")}
                required
              >
                <option value="">Selecciona un área</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Rol
              <select
                value={formEdicion.rol}
                onChange={actualizarEdicion("rol")}
                required
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <p className="hint">
              El nombre de usuario no puede modificarse. Para cambiar la
              contraseña usa el botón "Resetear contraseña".
            </p>

            {errorEdicion && (
              <div className="alerta alerta-error">{errorEdicion}</div>
            )}

            <div className="detalle-acciones">
              <button
                type="button"
                className="btn-secundario"
                onClick={cerrarEdicion}
              >
                Cancelar
              </button>
              <button type="submit" disabled={guardandoEdicion}>
                {guardandoEdicion ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {credenciales && (
        <Modal
          titulo={esReset ? "Contraseña reseteada" : "Usuario creado"}
          onCerrar={cerrarCredenciales}
        >
          <p>
            {esReset
              ? "Se generó una nueva contraseña temporal para "
              : "Se creó la cuenta de "}
            <strong>{credenciales.nombreCompleto}</strong>. Comparte estas
            credenciales con el usuario:{" "}
            <strong>solo se muestran una vez</strong>.
          </p>
          <div className="credenciales-caja">
            <div className="credenciales-fila">
              <span className="credenciales-etiqueta">Usuario</span>
              <code>{credenciales.username}</code>
            </div>
            <div className="credenciales-fila">
              <span className="credenciales-etiqueta">
                {esReset ? "Nueva contraseña" : "Contraseña temporal"}
              </span>
              <code>{credenciales.passwordTemporal}</code>
            </div>
          </div>
          <p className="hint">
            El usuario deberá cambiarla en su próximo inicio de sesión.
          </p>
          <div className="detalle-acciones">
            <button type="button" onClick={copiarPassword}>
              {copiado ? "Copiada!" : "Copiar contraseña"}
            </button>
            <button
              type="button"
              className="btn-secundario"
              onClick={cerrarCredenciales}
            >
              Listo
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function extraerMensajeError(err, fallback) {
  const detalle = err.response?.data;
  if (detalle?.detalle) {
    return Object.entries(detalle.detalle)
      .map(([campo, msg]) => `${campo}: ${msg}`)
      .join(" | ");
  }
  return detalle?.mensaje ?? fallback;
}
