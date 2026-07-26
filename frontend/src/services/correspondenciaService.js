import { api } from "./api";

export async function registrarCorrespondencia(payload) {
  const { data } = await api.post("/correspondencia", payload);
  return data;
}

export async function buscarCorrespondencia(filtros = {}, page = 0, size = 20) {
  const params = { page, size };
  Object.entries(filtros).forEach(([k, v]) => {
    if (v !== "" && v !== null && v !== undefined) params[k] = v;
  });
  const { data } = await api.get("/correspondencia", { params });
  return data;
}

export async function asignarMensajero(correspondenciaId, mensajeroId) {
  const { data } = await api.post(`/correspondencia/${correspondenciaId}/asignar`, {
    mensajeroId,
  });
  return data;
}

export async function registrarEntrega(correspondenciaId, payload) {
  const { data } = await api.post(
    `/correspondencia/${correspondenciaId}/entregar`,
    payload,
  );
  return data;
}

export async function listarMisAsignaciones() {
  const { data } = await api.get("/correspondencia/mis-asignaciones");
  return data;
}

export async function anularCorrespondencia(correspondenciaId, motivo) {
  const { data } = await api.post(`/correspondencia/${correspondenciaId}/anular`, {
    motivo,
  });
  return data;
}

export async function archivarCorrespondencia(correspondenciaId, motivo) {
  const { data } = await api.post(`/correspondencia/${correspondenciaId}/archivar`, {
    motivo: motivo || null,
  });
  return data;
}
