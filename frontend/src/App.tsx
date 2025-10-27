import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
// 1. Importa tus páginas
// (Asegúrate de haber creado estos archivos en la carpeta 'frontend/src/pages/')
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";

import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas Privadas */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            {" "}
            {/* <-- Envolver con ProtectedRoute */}
            <Route index element={<DashboardPage />} />{" "}
            {/* <-- Ruta index dentro de la protegida */}
            {/* Aquí puedes añadir más rutas protegidas, ej. /profile, /settings */}
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
