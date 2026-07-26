import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { Layout } from "./components/Layout";
import { RutaProtegida } from "./components/RutaProtegida";
import { AuthProvider } from "./context/AuthContext";
import { AreasPage } from "./pages/AreasPage";
import { CorrespondenciaPage } from "./pages/CorrespondenciaPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MisAsignacionesPage } from "./pages/MisAsignacionesPage";
import { PerfilPage } from "./pages/PerfilPage";
import { RecepcionPage } from "./pages/RecepcionPage";
import { ReportesPage } from "./pages/ReportesPage";
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
            <Route path="/perfil" element={<PerfilPage />} />
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
            <Route
              path="/recepcion"
              element={
                <RutaProtegida rolesPermitidos={["ADMIN", "RECEPCIONISTA"]}>
                  <RecepcionPage />
                </RutaProtegida>
              }
            />
            <Route path="/correspondencia" element={<CorrespondenciaPage />} />
            <Route
              path="/mis-asignaciones"
              element={
                <RutaProtegida rolesPermitidos={["ADMIN", "MENSAJERO"]}>
                  <MisAsignacionesPage />
                </RutaProtegida>
              }
            />
            <Route
              path="/reportes"
              element={
                <RutaProtegida rolesPermitidos={["ADMIN", "SUPERVISOR"]}>
                  <ReportesPage />
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
