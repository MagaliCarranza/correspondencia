import { useEffect, useState } from "react";
import { crearArea, listarAreas } from "../services/areaService";

export function AreasPage() {
  const [areas, setAreas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function recargar() {
    setAreas(await listarAreas());
  }

  useEffect(() => {
    recargar().catch(() => setError("No se pudieron cargar las areas."));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await crearArea(nombre.trim());
      setNombre("");
      await recargar();
    } catch (err) {
      setError(err.response?.data?.mensaje ?? "No se pudo crear el area.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="areas-page">
      <h1>Catalogo de areas</h1>

      <form className="form-inline" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Nueva area"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={80}
          required
        />
        <button type="submit" disabled={cargando}>
          {cargando ? "Guardando..." : "Agregar"}
        </button>
      </form>

      {error && <div className="alerta alerta-error">{error}</div>}

      <ul className="lista">
        {areas.map((a) => (
          <li key={a.id}>{a.nombre}</li>
        ))}
      </ul>
    </div>
  );
}
