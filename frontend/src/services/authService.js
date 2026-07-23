import { api } from "./api";

export async function login(username, password) {
  const { data } = await api.post("/auth/login", { username, password });
  return data;
}
