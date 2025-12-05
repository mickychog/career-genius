import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AboutPage from "./pages/AboutPage";
import VocationalTestPage from "./pages/VocationalTestPage";
import TestResultsPage from "./pages/TestResultsPage";
import UniversitySearchPage from "./pages/UniversitySearchPage";
import SkillsDevelopmentPage from "./pages/SkillsDevelopmentPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute"; // <-- Importar el nuevo componente
import DashboardLayout from "./layouts/DashboardLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      {/* El Header maneja su propia lógica visual, lo dejamos fuera de las rutas */}
      <Header />

      <main>
        <Routes>
          {/* --- RUTAS PÚBLICAS (Solo accesibles si NO estás logueado) --- */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* --- RUTAS PROTEGIDAS (Solo accesibles si ESTÁS logueado) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="vocational-test" element={<VocationalTestPage />} />
              <Route path="results/:sessionId" element={<TestResultsPage />} />
              <Route
                path="university-search"
                element={<UniversitySearchPage />}
              />
              <Route
                path="skills-development"
                element={<SkillsDevelopmentPage />}
              />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Ruta para cualquier otra URL no encontrada */}
          <Route path="*" element={<div>404 - Página no encontrada</div>} />
        </Routes>
      </main>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
}

export default App;
