import { createContext, useContext, useState } from "react";
import { login as loginRequest } from "../services/authService";

const AuthContext = createContext(null);

function leerUsuarioGuardado() {
  const raw = localStorage.getItem("usuario");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerUsuarioGuardado);

  async function login(username, password) {
    const data = await loginRequest(username, password);
    const perfil = {
      username: data.username,
      nombreCompleto: data.nombreCompleto,
      rol: data.rol,
      area: data.area,
      debeCambiarPassword: data.debeCambiarPassword,
    };
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(perfil));
    setUsuario(perfil);
    return perfil;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  function actualizarUsuario(cambios) {
    setUsuario((actual) => {
      if (!actual) return actual;
      const actualizado = { ...actual, ...cambios };
      localStorage.setItem("usuario", JSON.stringify(actualizado));
      return actualizado;
    });
  }

  const valor = {
    usuario,
    estaAutenticado: !!usuario,
    tieneRol: (rol) => usuario?.rol === rol,
    login,
    logout,
    actualizarUsuario,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
