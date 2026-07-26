import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  cambiarMiPassword,
  obtenerMiPerfil,
} from "../services/usuarioService";

const REGLAS_PASSWORD = [
  { id: "largo", texto: "Al menos 8 caracteres", test: (v) => v.length >= 8 },
  { id: "minuscula", texto: "Una letra minuscula", test: (v) => /[a-z]/.test(v) },
  { id: "mayuscula", texto: "Una letra mayuscula", test: (v) => /[A-Z]/.test(v) },
  { id: "numero", texto: "Un numero", test: (v) => /\d/.test(v) },
  {
    id: "especial",
    texto: "Un caracter especial (!@#$%...)",
    test: (v) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?~`]/.test(v),
  },
];

const FORM_INICIAL = {
  passwordActual: "",
  passwordNueva: "",
  passwordConfirmacion: "",
};

const VISIBILIDAD_INICIAL = {
  passwordActual: false,
  passwordNueva: false,
  passwordConfirmacion: false,
};

export function PerfilPage() {
  const { actualizarUsuario } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [visible, setVisible] = useState(VISIBILIDAD_INICIAL);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [errorPerfil, setErrorPerfil] = useState(null);

  useEffect(() => {
    obtenerMiPerfil()
      .then(setPerfil)
      .catch(() => setErrorPerfil("No se pudo cargar tu perfil."));
  }, []);

  function actualizar(campo) {
    return (e) => setForm({ ...form, [campo]: e.target.value });
  }

  function alternarVisibilidad(campo) {
    setVisible((v) => ({ ...v, [campo]: !v[campo] }));
  }

  function todasLasReglas() {
    return REGLAS_PASSWORD.every((r) => r.test(form.passwordNueva));
  }

  function coincideConfirmacion() {
    return (
      form.passwordConfirmacion.length > 0 &&
      form.passwordNueva === form.passwordConfirmacion
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (!form.passwordActual) {
      setError("Debes ingresar tu contraseña actual.");
      return;
    }
    if (!todasLasReglas()) {
      setError("La nueva contraseña no cumple con todas las reglas de seguridad.");
      return;
    }
    if (!coincideConfirmacion()) {
      setError("La confirmacion no coincide con la nueva contraseña.");
      return;
    }
    if (form.passwordActual === form.passwordNueva) {
      setError("La nueva contraseña debe ser distinta de la actual.");
      return;
    }

    setCargando(true);
    try {
      const actualizado = await cambiarMiPassword({
        passwordActual: form.passwordActual,
        passwordNueva: form.passwordNueva,
      });
      actualizarUsuario({
        debeCambiarPassword: actualizado.debeCambiarPassword,
      });
      setPerfil(actualizado);
      setForm(FORM_INICIAL);
      setVisible(VISIBILIDAD_INICIAL);
      setMensaje("Contraseña actualizada correctamente.");
    } catch (err) {
      const detalle = err.response?.data;
      if (detalle?.detalle) {
        setError(
          Object.values(detalle.detalle).join(" | "),
        );
      } else {
        setError(detalle?.mensaje ?? "No se pudo actualizar la contraseña.");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="perfil-page">
      <h1>Mi perfil</h1>

      {errorPerfil && <div className="alerta alerta-error">{errorPerfil}</div>}

      <section className="form-columna">
        <h2>Mis datos</h2>
        {perfil ? (
          <dl className="detalle">
            <dt>Nombre completo</dt>
            <dd>{perfil.nombreCompleto}</dd>
            <dt>Usuario</dt>
            <dd>{perfil.username}</dd>
            <dt>Correo electronico</dt>
            <dd>{perfil.email}</dd>
            <dt>Rol</dt>
            <dd>{perfil.rol}</dd>
            <dt>Area</dt>
            <dd>{perfil.area}</dd>
            <dt>Estado</dt>
            <dd>{perfil.bloqueada ? "Bloqueada" : "Activa"}</dd>
          </dl>
        ) : (
          <p className="hint">Cargando...</p>
        )}
        <p className="hint">
          Si necesitas modificar tu nombre, correo o area, solicitaselo a un
          administrador.
        </p>
      </section>

      <form className="form-columna" onSubmit={onSubmit}>
        <h2>Cambiar contraseña</h2>

        <label>
          Contraseña actual
          <div className="campo-password">
            <input
              type={visible.passwordActual ? "text" : "password"}
              value={form.passwordActual}
              onChange={actualizar("passwordActual")}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="btn-visor"
              onClick={() => alternarVisibilidad("passwordActual")}
              aria-label={
                visible.passwordActual
                  ? "Ocultar contraseña actual"
                  : "Mostrar contraseña actual"
              }
            >
              {visible.passwordActual ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </label>
        <label>
          Nueva contraseña
          <div className="campo-password">
            <input
              type={visible.passwordNueva ? "text" : "password"}
              value={form.passwordNueva}
              onChange={actualizar("passwordNueva")}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="btn-visor"
              onClick={() => alternarVisibilidad("passwordNueva")}
              aria-label={
                visible.passwordNueva
                  ? "Ocultar nueva contraseña"
                  : "Mostrar nueva contraseña"
              }
            >
              {visible.passwordNueva ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </label>
        <ul className="reglas-password">
          {REGLAS_PASSWORD.map((r) => {
            const ok = r.test(form.passwordNueva);
            return (
              <li key={r.id} className={ok ? "regla-ok" : "regla-pendiente"}>
                {ok ? "OK" : "..."} {r.texto}
              </li>
            );
          })}
        </ul>
        <label>
          Confirmar nueva contraseña
          <div className="campo-password">
            <input
              type={visible.passwordConfirmacion ? "text" : "password"}
              value={form.passwordConfirmacion}
              onChange={actualizar("passwordConfirmacion")}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="btn-visor"
              onClick={() => alternarVisibilidad("passwordConfirmacion")}
              aria-label={
                visible.passwordConfirmacion
                  ? "Ocultar confirmacion"
                  : "Mostrar confirmacion"
              }
            >
              {visible.passwordConfirmacion ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {form.passwordConfirmacion.length > 0 && !coincideConfirmacion() && (
            <small className="regla-pendiente">
              No coincide con la nueva contraseña.
            </small>
          )}
        </label>

        {mensaje && <div className="alerta alerta-ok">{mensaje}</div>}
        {error && <div className="alerta alerta-error">{error}</div>}

        <button type="submit" disabled={cargando}>
          {cargando ? "Guardando..." : "Actualizar contraseña"}
        </button>
      </form>
    </div>
  );
}
