import { useEffect, useState } from "react";
import { Modal } from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { listarAreas } from "../services/areaService";
import {
  anularCorrespondencia,
  archivarCorrespondencia,
  asignarMensajero,
  buscarCorrespondencia,
} from "../services/correspondenciaService";
import { listarMensajeros } from "../services/usuarioService";

const ESTADOS = ["RECIBIDA", "EN_TRAMITE", "ENTREGADA", "ARCHIVADA", "ANULADA"];

const FILTROS_INICIALES = {
  folio: "",
  remitente: "",
  asunto: "",
  areaDestinoId: "",
  estado: "",
  fechaDesde: "",
  fechaHasta: "",
};

function formatearFecha(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CorrespondenciaPage() {
  const { usuario } = useAuth();
  const [areas, setAreas] = useState([]);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const [detalle, setDetalle] = useState(null);
  const [asignando, setAsignando] = useState(null);
  const [anulando, setAnulando] = useState(null);
  const [archivando, setArchivando] = useState(null);

  const puedeAsignar = ["ADMIN", "SUPERVISOR", "RECEPCIONISTA"].includes(
    usuario?.rol,
  );
  const puedeAnular = ["ADMIN", "RECEPCIONISTA"].includes(usuario?.rol);
  const puedeArchivar = ["ADMIN", "SUPERVISOR"].includes(usuario?.rol);

  useEffect(() => {
    listarAreas().then(setAreas).catch(() => {});
  }, []);

  async function buscar(pageActual = 0) {
    setError(null);
    setCargando(true);
    try {
      const data = await buscarCorrespondencia(filtros, pageActual, 20);
      setPagina(data);
      setPage(pageActual);
    } catch (err) {
      setError(
        err.response?.data?.mensaje ?? "No se pudo consultar la correspondencia.",
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    buscar(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function actualizar(campo) {
    return (e) => setFiltros({ ...filtros, [campo]: e.target.value });
  }

  function onSubmit(e) {
    e.preventDefault();
    buscar(0);
  }

  function limpiar() {
    setFiltros(FILTROS_INICIALES);
    setTimeout(() => buscar(0), 0);
  }

  function reemplazarEnPagina(actualizada) {
    setPagina((prev) =>
      prev
        ? {
            ...prev,
            content: prev.content.map((c) =>
              c.id === actualizada.id ? actualizada : c,
            ),
          }
        : prev,
    );
  }

  const totalPaginas = pagina?.totalPages ?? 0;
  const filas = pagina?.content ?? [];

  return (
    <div className="correspondencia-page">
      <h1>Consulta de correspondencia</h1>

      <form className="filtros" onSubmit={onSubmit}>
        <div className="filtros-grid">
          <label>
            Folio
            <input type="text" value={filtros.folio} onChange={actualizar("folio")} />
          </label>
          <label>
            Remitente
            <input
              type="text"
              value={filtros.remitente}
              onChange={actualizar("remitente")}
            />
          </label>
          <label>
            Asunto
            <input
              type="text"
              value={filtros.asunto}
              onChange={actualizar("asunto")}
            />
          </label>
          <label>
            Area destino
            <select
              value={filtros.areaDestinoId}
              onChange={actualizar("areaDestinoId")}
            >
              <option value="">Todas</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            Estado
            <select value={filtros.estado} onChange={actualizar("estado")}>
              <option value="">Todos</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </label>
          <label>
            Desde
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={actualizar("fechaDesde")}
            />
          </label>
          <label>
            Hasta
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={actualizar("fechaHasta")}
            />
          </label>
        </div>
        <div className="filtros-acciones">
          <button type="submit" disabled={cargando}>
            {cargando ? "Buscando..." : "Buscar"}
          </button>
          <button type="button" className="btn-secundario" onClick={limpiar}>
            Limpiar
          </button>
        </div>
      </form>

      {error && <div className="alerta alerta-error">{error}</div>}

      <table className="tabla">
        <thead>
          <tr>
            <th>Folio</th>
            <th>Fecha</th>
            <th>Remitente</th>
            <th>Asunto</th>
            <th>Prioridad</th>
            <th>Area destino</th>
            <th>Estado</th>
            <th>Mensajero</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 && !cargando && (
            <tr>
              <td colSpan={9} className="hint" style={{ textAlign: "center" }}>
                Sin resultados
              </td>
            </tr>
          )}
          {filas.map((c) => (
            <tr key={c.id}>
              <td>{c.folio}</td>
              <td>{formatearFecha(c.fechaRecepcion)}</td>
              <td>{c.remitente}</td>
              <td>{c.asunto}</td>
              <td>{c.prioridad}</td>
              <td>{c.areaDestino}</td>
              <td>{c.estado}</td>
              <td>{c.mensajero ?? "-"}</td>
              <td className="acciones-tabla">
                <button type="button" onClick={() => setDetalle(c)}>
                  Detalle
                </button>
                {puedeAsignar &&
                  (c.estado === "RECIBIDA" || c.estado === "EN_TRAMITE") && (
                    <button
                      type="button"
                      className="btn-secundario"
                      onClick={() => setAsignando(c)}
                    >
                      {c.estado === "RECIBIDA" ? "Asignar" : "Reasignar"}
                    </button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPaginas > 1 && (
        <div className="paginacion">
          <button
            type="button"
            disabled={page === 0 || cargando}
            onClick={() => buscar(page - 1)}
          >
            Anterior
          </button>
          <span>
            Pagina {page + 1} de {totalPaginas}
          </span>
          <button
            type="button"
            disabled={page + 1 >= totalPaginas || cargando}
            onClick={() => buscar(page + 1)}
          >
            Siguiente
          </button>
        </div>
      )}

      {detalle && (
        <Modal titulo={`Detalle ${detalle.folio}`} onCerrar={() => setDetalle(null)}>
          <DetalleCorrespondencia c={detalle} />
          <div className="detalle-acciones">
            {puedeAsignar &&
              (detalle.estado === "RECIBIDA" || detalle.estado === "EN_TRAMITE") && (
                <button
                  type="button"
                  onClick={() => {
                    setAsignando(detalle);
                    setDetalle(null);
                  }}
                >
                  {detalle.estado === "RECIBIDA"
                    ? "Asignar mensajero"
                    : "Reasignar mensajero"}
                </button>
              )}
            {puedeAnular && detalle.estado === "RECIBIDA" && (
              <button
                type="button"
                className="btn-peligro"
                onClick={() => {
                  setAnulando(detalle);
                  setDetalle(null);
                }}
              >
                Anular
              </button>
            )}
            {puedeArchivar && detalle.estado === "ENTREGADA" && (
              <button
                type="button"
                className="btn-secundario"
                onClick={() => {
                  setArchivando(detalle);
                  setDetalle(null);
                }}
              >
                Archivar
              </button>
            )}
          </div>
        </Modal>
      )}

      {asignando && (
        <Modal
          titulo={`Asignar mensajero (${asignando.folio})`}
          onCerrar={() => setAsignando(null)}
        >
          <FormAsignar
            correspondencia={asignando}
            onExito={(actualizada) => {
              setAsignando(null);
              reemplazarEnPagina(actualizada);
            }}
          />
        </Modal>
      )}

      {anulando && (
        <Modal
          titulo={`Anular ${anulando.folio}`}
          onCerrar={() => setAnulando(null)}
        >
          <FormMotivo
            etiqueta="Motivo de anulacion"
            obligatorio
            textoBoton="Anular correspondencia"
            claseBoton="btn-peligro"
            onSubmit={(motivo) => anularCorrespondencia(anulando.id, motivo)}
            onExito={(actualizada) => {
              setAnulando(null);
              reemplazarEnPagina(actualizada);
            }}
          />
        </Modal>
      )}

      {archivando && (
        <Modal
          titulo={`Archivar ${archivando.folio}`}
          onCerrar={() => setArchivando(null)}
        >
          <FormMotivo
            etiqueta="Motivo de archivo (opcional)"
            textoBoton="Archivar"
            onSubmit={(motivo) => archivarCorrespondencia(archivando.id, motivo)}
            onExito={(actualizada) => {
              setArchivando(null);
              reemplazarEnPagina(actualizada);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function DetalleCorrespondencia({ c }) {
  return (
    <dl className="detalle">
      <dt>Folio</dt>
      <dd>{c.folio}</dd>
      <dt>Estado</dt>
      <dd>{c.estado}</dd>
      <dt>Prioridad</dt>
      <dd>{c.prioridad}</dd>
      <dt>Tipo</dt>
      <dd>
        {c.tipo} ({c.tipoRemitente})
      </dd>
      <dt>Remitente</dt>
      <dd>{c.remitente}</dd>
      <dt>Asunto</dt>
      <dd>{c.asunto}</dd>
      <dt>Area destino</dt>
      <dd>{c.areaDestino}</dd>
      <dt>Observaciones</dt>
      <dd>{c.observaciones || "-"}</dd>

      <dt className="detalle-seccion">Recepcion</dt>
      <dd className="detalle-seccion" />
      <dt>Recibida por</dt>
      <dd>{c.recepcionadoPor}</dd>
      <dt>Fecha de recepcion</dt>
      <dd>{formatearFecha(c.fechaRecepcion)}</dd>

      {(c.mensajero || c.fechaAsignacion) && (
        <>
          <dt className="detalle-seccion">Asignacion</dt>
          <dd className="detalle-seccion" />
          <dt>Mensajero</dt>
          <dd>{c.mensajero ?? "-"}</dd>
          <dt>Fecha de asignacion</dt>
          <dd>{formatearFecha(c.fechaAsignacion)}</dd>
        </>
      )}

      {c.fechaEntrega && (
        <>
          <dt className="detalle-seccion">Entrega</dt>
          <dd className="detalle-seccion" />
          <dt>Recibio en destino</dt>
          <dd>{c.nombreRecibe}</dd>
          <dt>Fecha de entrega</dt>
          <dd>{formatearFecha(c.fechaEntrega)}</dd>
          <dt>Observaciones de entrega</dt>
          <dd>{c.observacionesEntrega || "-"}</dd>
        </>
      )}

      {c.anuladoEn && (
        <>
          <dt className="detalle-seccion">Anulacion</dt>
          <dd className="detalle-seccion" />
          <dt>Anulada por</dt>
          <dd>{c.anuladoPor}</dd>
          <dt>Fecha</dt>
          <dd>{formatearFecha(c.anuladoEn)}</dd>
          <dt>Motivo</dt>
          <dd>{c.motivoAnulacion}</dd>
        </>
      )}

      {c.archivadoEn && (
        <>
          <dt className="detalle-seccion">Archivo</dt>
          <dd className="detalle-seccion" />
          <dt>Archivada por</dt>
          <dd>{c.archivadoPor}</dd>
          <dt>Fecha</dt>
          <dd>{formatearFecha(c.archivadoEn)}</dd>
          <dt>Motivo</dt>
          <dd>{c.motivoArchivo || "-"}</dd>
        </>
      )}
    </dl>
  );
}

function FormAsignar({ correspondencia, onExito }) {
  const [mensajeros, setMensajeros] = useState([]);
  const [mensajeroId, setMensajeroId] = useState(
    correspondencia.mensajeroId ?? "",
  );
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    listarMensajeros()
      .then(setMensajeros)
      .catch(() => setError("No se pudieron cargar los mensajeros."));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const actualizada = await asignarMensajero(
        correspondencia.id,
        Number(mensajeroId),
      );
      onExito(actualizada);
    } catch (err) {
      setError(err.response?.data?.mensaje ?? "No se pudo asignar.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        Mensajero
        <select
          value={mensajeroId}
          onChange={(e) => setMensajeroId(e.target.value)}
          required
        >
          <option value="">Selecciona un mensajero</option>
          {mensajeros.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombreCompleto} ({m.username})
            </option>
          ))}
        </select>
      </label>

      {mensajeros.length === 0 && !error && (
        <div className="alerta alerta-aviso">
          No hay mensajeros activos. Registra uno en la seccion Usuarios.
        </div>
      )}
      {error && <div className="alerta alerta-error">{error}</div>}

      <button type="submit" disabled={cargando || !mensajeroId}>
        {cargando ? "Asignando..." : "Asignar"}
      </button>
    </form>
  );
}

function FormMotivo({
  etiqueta,
  obligatorio = false,
  textoBoton,
  claseBoton,
  onSubmit,
  onExito,
}) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const actualizada = await onSubmit(motivo.trim());
      onExito(actualizada);
    } catch (err) {
      setError(err.response?.data?.mensaje ?? "No se pudo completar la operacion.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label>
        {etiqueta}
        <textarea
          maxLength={500}
          rows={4}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          required={obligatorio}
        />
      </label>

      {error && <div className="alerta alerta-error">{error}</div>}

      <button
        type="submit"
        className={claseBoton}
        disabled={cargando || (obligatorio && !motivo.trim())}
      >
        {cargando ? "Guardando..." : textoBoton}
      </button>
    </form>
  );
}
