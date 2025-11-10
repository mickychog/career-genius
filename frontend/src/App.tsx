import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 1. Agrupa TODOS los imports aquí al principio
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AboutPage from "./pages/AboutPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VocationalTestPage from "./pages/VocationalTestPage";
import TestResultsPage from "./pages/TestResultPage";

function App() {
  return (
    // 2. Configura el enrutador
    <BrowserRouter>
      <Header />{" "}
      {/* <-- Añadir Header aquí, se mostrará en todas las páginas */}
      <main>
        {" "}
        {/* Envuelve las rutas en un 'main' o 'div' si necesitas estilos */}
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas Privadas usando el Layout */}
          <Route element={<ProtectedRoute />}>
            {" "}
            {/* Protege todo el layout */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              {" "}
              {/* <-- Usa el Layout */}
              {/* La ruta index se renderiza DENTRO del Outlet del Layout */}
              <Route index element={<DashboardPage />} />
              <Route path="vocational-test" element={<VocationalTestPage />} />
              <Route path="results/:sessionId" element={<TestResultsPage />} />
              {/* Aquí añadirás otras rutas del dashboard: */}
              {/* <Route path="vocational-test" element={<VocationalTestPage />} /> */}
              {/* <Route path="settings" element={<SettingsPage />} /> */}
              {/* ... etc ... */}
            </Route>
          </Route>

          {/* Ruta para cualquier otra URL no encontrada */}
          <Route path="*" element={<div>404 - Página no encontrada</div>} />
        </Routes>
      </main>
      <ToastContainer // <-- Añadir Contenedor de Toasts
        position="top-right" // Posición de las notificaciones
        autoClose={3000} // Duración (3 segundos)
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" // O "dark"
      />
    </BrowserRouter>
  );
}

export default App;
