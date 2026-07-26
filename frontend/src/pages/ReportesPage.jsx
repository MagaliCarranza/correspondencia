import { useEffect, useState } from "react";
import { listarAreas } from "../services/areaService";
import { descargarReporteCorrespondenciaPdf } from "../services/reporteService";

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

export function ReportesPage() {
  const [areas, setAreas] = useState([]);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    listarAreas().then(setAreas).catch(() => {});
  }, []);

  function actualizar(campo) {
    return (e) => setFiltros({ ...filtros, [campo]: e.target.value });
  }

  async function generar(e) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setCargando(true);
    try {
      await descargarReporteCorrespondenciaPdf(filtros);
      setMensaje("Reporte generado. Revisa tu carpeta de descargas.");
    } catch (err) {
      const detalle = err.response;
      if (detalle?.status === 403) {
        setError("No tienes permiso para generar reportes.");
      } else {
        setError("No se pudo generar el reporte.");
      }
    } finally {
      setCargando(false);
    }
  }

  function limpiar() {
    setFiltros(FILTROS_INICIALES);
    setError(null);
    setMensaje(null);
  }

  return (
    <div className="reportes-page">
      <h1>Reportes de correspondencia</h1>
      <p className="hint">
        Aplica los filtros que quieras incluir y descarga el PDF. Si dejas todo
        vacio, se incluyen todos los registros.
      </p>

      <form className="filtros" onSubmit={generar}>
        <div className="filtros-grid">
          <label>
            Folio
            <input
              type="text"
              value={filtros.folio}
              onChange={actualizar("folio")}
            />
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

        {mensaje && <div className="alerta alerta-ok">{mensaje}</div>}
        {error && <div className="alerta alerta-error">{error}</div>}

        <div className="filtros-acciones">
          <button type="submit" disabled={cargando}>
            {cargando ? "Generando PDF..." : "Generar PDF"}
          </button>
          <button type="button" className="btn-secundario" onClick={limpiar}>
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}
