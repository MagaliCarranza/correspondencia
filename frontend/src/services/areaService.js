import { api } from "./api";

export async function listarAreas() {
  const { data } = await api.get("/areas");
  return data;
}

export async function crearArea(nombre) {
  const { data } = await api.post("/areas", { nombre });
  return data;
}
