import { api } from "./api";

export async function descargarReporteCorrespondenciaPdf(filtros = {}) {
  const params = {};
  Object.entries(filtros).forEach(([k, v]) => {
    if (v !== "" && v !== null && v !== undefined) params[k] = v;
  });
  const response = await api.get("/reportes/correspondencia.pdf", {
    params,
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const enlace = document.createElement("a");
  enlace.href = url;
  const nombreDefecto = `correspondencia_${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`;
  const dispositivo = response.headers["content-disposition"];
  const match = dispositivo && /filename="?([^";]+)/i.exec(dispositivo);
  enlace.download = match ? match[1] : nombreDefecto;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.URL.revokeObjectURL(url);
}
