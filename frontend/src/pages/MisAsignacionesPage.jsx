import { useEffect, useState } from "react";
import { Modal } from "../components/Modal";
import {
  listarMisAsignaciones,
  registrarEntrega,
} from "../services/correspondenciaService";

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

export function MisAsignacionesPage() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [entregando, setEntregando] = useState(null);
  const [mensajeOk, setMensajeOk] = useState(null);

  async function recargar() {
    setCargando(true);
    try {
      setAsignaciones(await listarMisAsignaciones());
      setError(null);
    } catch {
      setError("No se pudieron cargar las asignaciones.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    recargar();
  }, []);

  return (
    <div className="mis-asignaciones-page">
      <h1>Mis asignaciones pendientes</h1>

      {mensajeOk && <div className="alerta alerta-ok">{mensajeOk}</div>}
      {error && <div className="alerta alerta-error">{error}</div>}

      <table className="tabla">
        <thead>
          <tr>
            <th>Folio</th>
            <th>Asignada</th>
            <th>Remitente</th>
            <th>Asunto</th>
            <th>Prioridad</th>
            <th>Area destino</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {asignaciones.length === 0 && !cargando && (
            <tr>
              <td colSpan={7} className="hint" style={{ textAlign: "center" }}>
                No tienes correspondencia pendiente por entregar.
              </td>
            </tr>
          )}
          {asignaciones.map((c) => (
            <tr key={c.id}>
              <td>{c.folio}</td>
              <td>{formatearFecha(c.fechaAsignacion)}</td>
              <td>{c.remitente}</td>
              <td>{c.asunto}</td>
              <td>{c.prioridad}</td>
              <td>{c.areaDestino}</td>
              <td>
                <button type="button" onClick={() => setEntregando(c)}>
                  Marcar entregada
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {entregando && (
        <Modal
          titulo={`Entrega ${entregando.folio}`}
          onCerrar={() => setEntregando(null)}
        >
          <FormEntrega
            correspondencia={entregando}
            onExito={(actualizada) => {
              setEntregando(null);
              setMensajeOk(
                `Folio ${actualizada.folio} marcado como entregado.`,
              );
              recargar();
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function FormEntrega({ correspondencia, onExito }) {
  const [nombreRecibe, setNombreRecibe] = useState("");
  const [observacionesEntrega, setObservaciones] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const actualizada = await registrarEntrega(correspondencia.id, {
        nombreRecibe: nombreRecibe.trim(),
        observacionesEntrega: observacionesEntrega.trim() || null,
      });
      onExito(actualizada);
    } catch (err) {
      setError(err.response?.data?.mensaje ?? "No se pudo registrar la entrega.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        Nombre de quien recibe
        <input
          type="text"
          maxLength={120}
          value={nombreRecibe}
          onChange={(e) => setNombreRecibe(e.target.value)}
          required
        />
      </label>
      <label>
        Observaciones (opcional)
        <textarea
          maxLength={500}
          rows={3}
          value={observacionesEntrega}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </label>

      {error && <div className="alerta alerta-error">{error}</div>}

      <button type="submit" disabled={cargando || !nombreRecibe.trim()}>
        {cargando ? "Guardando..." : "Confirmar entrega"}
      </button>
    </form>
  );
}
