import { useEffect, useState } from "react";
import { listarAreas } from "../services/areaService";
import { registrarCorrespondencia } from "../services/correspondenciaService";

const TIPOS_REMITENTE = ["EXTERNO", "INTERNO"];
const TIPOS = ["OFICIO", "CIRCULAR", "MEMO", "INVITACION", "OTRO"];
const PRIORIDADES = ["NORMAL", "URGENTE"];

const FORM_INICIAL = {
  remitente: "",
  tipoRemitente: "EXTERNO",
  asunto: "",
  tipo: "OFICIO",
  prioridad: "NORMAL",
  areaDestinoId: "",
  observaciones: "",
};

export function RecepcionPage() {
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [folioGenerado, setFolioGenerado] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    listarAreas()
      .then(setAreas)
      .catch(() => setError("No se pudieron cargar las areas."));
  }, []);

  function actualizar(campo) {
    return (e) => setForm({ ...form, [campo]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setFolioGenerado(null);
    setCargando(true);
    try {
      const nueva = await registrarCorrespondencia({
        ...form,
        areaDestinoId: Number(form.areaDestinoId),
        observaciones: form.observaciones || null,
      });
      setFolioGenerado(nueva.folio);
      setForm(FORM_INICIAL);
    } catch (err) {
      const detalle = err.response?.data;
      if (detalle?.detalle) {
        setError(
          Object.entries(detalle.detalle)
            .map(([campo, msg]) => `${campo}: ${msg}`)
            .join(" | "),
        );
      } else {
        setError(detalle?.mensaje ?? "No se pudo registrar la correspondencia.");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="recepcion-page">
      <h1>Recepcion de correspondencia</h1>

      <form className="form-columna" onSubmit={onSubmit}>
        <label>
          Remitente
          <input
            type="text"
            maxLength={120}
            value={form.remitente}
            onChange={actualizar("remitente")}
            required
          />
        </label>

        <label>
          Tipo de remitente
          <select
            value={form.tipoRemitente}
            onChange={actualizar("tipoRemitente")}
            required
          >
            {TIPOS_REMITENTE.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label>
          Asunto
          <input
            type="text"
            maxLength={200}
            value={form.asunto}
            onChange={actualizar("asunto")}
            required
          />
        </label>

        <label>
          Tipo de documento
          <select value={form.tipo} onChange={actualizar("tipo")} required>
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label>
          Prioridad
          <select
            value={form.prioridad}
            onChange={actualizar("prioridad")}
            required
          >
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label>
          Area destino
          <select
            value={form.areaDestinoId}
            onChange={actualizar("areaDestinoId")}
            required
          >
            <option value="">Selecciona un area</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Observaciones
          <textarea
            maxLength={500}
            rows={3}
            value={form.observaciones}
            onChange={actualizar("observaciones")}
          />
        </label>

        {folioGenerado && (
          <div className="alerta alerta-ok">
            Correspondencia registrada con folio <strong>{folioGenerado}</strong>
          </div>
        )}
        {error && <div className="alerta alerta-error">{error}</div>}

        <button type="submit" disabled={cargando}>
          {cargando ? "Guardando..." : "Registrar"}
        </button>
      </form>
    </div>
  );
}
