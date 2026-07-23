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
