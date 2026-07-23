import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { Layout } from "./components/Layout";
import { RutaProtegida } from "./components/RutaProtegida";
import { AuthProvider } from "./context/AuthContext";
import { AreasPage } from "./pages/AreasPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { UsuariosPage } from "./pages/UsuariosPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RutaProtegida>
                <Layout />
              </RutaProtegida>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route
              path="/usuarios"
              element={
                <RutaProtegida rolesPermitidos={["ADMIN"]}>
                  <UsuariosPage />
                </RutaProtegida>
              }
            />
            <Route
              path="/areas"
              element={
                <RutaProtegida rolesPermitidos={["ADMIN"]}>
                  <AreasPage />
                </RutaProtegida>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
