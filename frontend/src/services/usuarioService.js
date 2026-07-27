import { api } from "./api";

export async function crearUsuario(payload) {
  const { data } = await api.post("/usuarios", payload);
  return data;
}

export async function listarUsuarios() {
  const { data } = await api.get("/usuarios");
  return data;
}

export async function desbloquearUsuario(id) {
  const { data } = await api.post(`/usuarios/${id}/desbloquear`);
  return data;
}

export async function listarMensajeros() {
  const { data } = await api.get("/usuarios/mensajeros");
  return data;
}

export async function obtenerMiPerfil() {
  const { data } = await api.get("/usuarios/me");
  return data;
}

export async function cambiarMiPassword(payload) {
  const { data } = await api.post("/usuarios/me/cambiar-password", payload);
  return data;
}

export async function actualizarUsuario(id, payload) {
  const { data } = await api.put(`/usuarios/${id}`, payload);
  return data;
}

export async function resetearPasswordUsuario(id) {
  const { data } = await api.post(`/usuarios/${id}/resetear-password`);
  return data;
}
