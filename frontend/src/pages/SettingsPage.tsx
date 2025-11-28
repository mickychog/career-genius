import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getTestStatus } from "../services/api";
import apiClient from "../services/api";
import "./SettingsPage.css";

// --- DTOs e Interfaces ---

interface TestStatus {
  hasCompletedTest: boolean;
  selectedCareer: string | null;
  sessionId: string | null;
}

// Interfaz que refleja el documento de usuario que devuelve GET /users/me
interface UserProfile {
  name: string;
  email: string; // No editable
  headline: string;
  gender: string;
  location: string;
  phone: string;
  summary: string;
  birthDate: string; // Formato YYYY-MM-DD para el input
}

const DEPARTAMENTOS_BOLIVIA = [
  "Nacional (Bolivia)",
  "Beni",
  "Chuquisaca",
  "Cochabamba",
  "La Paz",
  "Oruro",
  "Pando",
  "Potosí",
  "Santa Cruz",
  "Tarija",
];

// Definición de las notificaciones para el estado inicial
interface NotificationState {
  weeklyNewsletter: boolean;
}

const SettingsPage = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // --- ESTADO DE NOTIFICACIONES ---
  const [notifications, setNotifications] = useState<NotificationState>({
    weeklyNewsletter: false,
  }); // <-- Declaración de estado

  // Estado inicial MÍNIMO (se pobla en useEffect)
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || "",
    email: user?.email || "",
    headline: "",
    gender: "prefer_not_to_say", // <-- Cambiado a valor de Backend por defecto
    location: "Nacional (Bolivia)",
    phone: "",
    summary: "",
    birthDate: "",
  });

  const [statusData, setStatusData] = useState<TestStatus | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // 1. Cargar estado de la carrera y el perfil del usuario
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar Estado del Test
        const { data: status } = await getTestStatus();
        setStatusData(status);

        // Cargar Perfil del Usuario (GET /users/me)
        const { data: profileData } = await apiClient.get("/users/me");

        // --- Formateo y Poblamiento de Datos ---
        const formattedDate = profileData.birthDate
          ? new Date(profileData.birthDate).toISOString().split("T")[0] // YYYY-MM-DD
          : "";

        setProfile({
          name: profileData.name || user?.name || "",
          email: profileData.email || user?.email || "",
          headline: profileData.headline || "",
          // USAR VALOR DEL BACKEND, si no existe, usar valor por defecto
          gender: profileData.gender || "prefer_not_to_say",
          location: profileData.location || "Nacional (Bolivia)",
          phone: profileData.phone || "",
          summary: profileData.summary || "",
          birthDate: formattedDate,
        });
      } catch (error) {
        console.error("Error cargando datos de configuración:", error);
        // Si falla la carga, asumimos que no hay datos y quitamos el loading
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchData();
  }, [user]);

  // 2. Manejadores de Estado y Guardado
  const handleProfileChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Helper para limpiar el DTO
  const cleanDto = (dto: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any> = {};
    for (const key in dto) {
      // Incluye el campo si NO es null, undefined, o una cadena vacía ("")
      if (dto[key] !== null && dto[key] !== undefined && dto[key] !== "") {
        cleaned[key] = dto[key];
      }
    }
    return cleaned;
  };

  const handleSaveProfile = async () => {
    try {
      // Crea el DTO crudo
      const rawDto = {
        name: profile.name,
        headline: profile.headline,
        summary: profile.summary,
        phone: profile.phone,
        location: profile.location,
        birthDate: profile.birthDate,
        // ✅ CORRECCIÓN FINAL: El valor de profile.gender ya es el código del backend (male, female, etc.)
        gender: profile.gender,
      };

      const updateDto = cleanDto(rawDto);

      if (Object.keys(updateDto).length === 0) {
        toast.info("No hay cambios para guardar.");
        setIsEditing(false);
        return;
      }

      await apiClient.patch("/users/me", updateDto);
      toast.success("✅ Perfil actualizado correctamente.");
      setIsEditing(false);
    } catch (error: any) {
      const validationError = error.response?.data?.message;
      let errorMsg = "Error desconocido al guardar.";

      if (Array.isArray(validationError)) {
        // Si la respuesta es un array de errores de validación (ej. gender)
        errorMsg = validationError.join("; ");
      } else if (validationError) {
        errorMsg = validationError.message || validationError;
      }

      console.error("Detalle del Error 400:", validationError);

      toast.error(`❌ Error al guardar: ${errorMsg}`);
    }
  };

  const handleFocusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    toast.info(`Prioridad establecida en: ${e.target.value}`);
  };

  const handleLogout = () => {
    logout();
    toast.info("Sesión cerrada.");
  };

  const handleResetVocationalData = () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres borrar tu historial de test y empezar de nuevo?"
      )
    ) {
      toast.success(
        "Historial vocacional borrado (Simulación). ¡Listo para un nuevo test!"
      );
    }
  };

  const toggleNotification = (key: keyof NotificationState) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.info(`Configuración de notificación guardada.`);
  };

  if (loadingProfile)
    return (
      <div className="settings-container">
        <h2>Cargando configuración...</h2>
      </div>
    );

  // VISTA DEL COMPONENTE
  return (
    <div className="settings-container animate-fade-in">
      <div className="settings-header">
        <h2>⚙️ Configuración del Perfil</h2>
        <p>Personaliza tu información y preferencias de orientación.</p>
      </div>

      {/* SECCIÓN 1: DATOS PERSONALES */}
      <div className="settings-section">
        <h3>👤 Información Básica</h3>
        <div className="profile-info-grid">
          {/* Nombre */}
          <div className="info-field">
            <div className="info-label">Nombre Completo</div>
            {isEditing ? (
              <input
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                className="info-input"
              />
            ) : (
              <div className="info-value">{profile.name}</div>
            )}
          </div>

          {/* Email (No editable) */}
          <div className="info-field">
            <div className="info-label">Email</div>
            <div className="info-value">{profile.email}</div>
          </div>

          {/* Fecha de Nacimiento */}
          <div className="info-field">
            <div className="info-label">Fecha de Nacimiento</div>
            {isEditing ? (
              // Input type date espera formato YYYY-MM-DD
              <input
                name="birthDate"
                type="date"
                value={profile.birthDate}
                onChange={handleProfileChange}
                className="info-input"
              />
            ) : (
              <div className="info-value">
                {profile.birthDate || "No especificado"}
              </div>
            )}
          </div>

          {/* Teléfono */}
          <div className="info-field">
            <div className="info-label">Teléfono</div>
            {isEditing ? (
              <input
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                className="info-input"
                placeholder="+591..."
              />
            ) : (
              <div className="info-value">
                {profile.phone || "No especificado"}
              </div>
            )}
          </div>

          {/* Sexo (CORREGIDO) */}
          <div className="info-field">
            <div className="info-label">Género</div>
            {isEditing ? (
              <select
                name="gender"
                value={profile.gender}
                onChange={handleProfileChange}
                className="info-input"
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
                <option value="prefer_not_to_say">Prefiero no decir</option>
              </select>
            ) : (
              // Muestra el valor amigable si el valor de la DB es el código
              <div className="info-value">
                {profile.gender === "male"
                  ? "Masculino"
                  : profile.gender === "female"
                  ? "Femenino"
                  : profile.gender === "other"
                  ? "Otro"
                  : "Prefiero no decir"}
              </div>
            )}
          </div>

          {/* Titular */}
          <div className="info-field" style={{ gridColumn: "1 / -1" }}>
            <div className="info-label">Titular / Rol Actual</div>
            {isEditing ? (
              <input
                name="headline"
                value={profile.headline}
                onChange={handleProfileChange}
                className="info-input"
                placeholder="Ej: Estudiante en busca de carrera"
              />
            ) : (
              <div className="info-value">
                {profile.headline || "No especificado"}
              </div>
            )}
          </div>

          {/* Resumen */}
          <div className="info-field" style={{ gridColumn: "1 / -1" }}>
            <div className="info-label">Resumen / Bio</div>
            {isEditing ? (
              <textarea
                name="summary"
                value={profile.summary}
                onChange={handleProfileChange}
                className="info-input"
                rows={3}
                placeholder="Descríbete en breve..."
              />
            ) : (
              <div className="info-value">
                {profile.summary || "No especificado"}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: "20px", textAlign: "right" }}>
          {isEditing ? (
            <button
              className="btn-primary"
              onClick={handleSaveProfile}
              style={{ width: "auto" }}
            >
              Guardar Cambios
            </button>
          ) : (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              ✏️ Editar Información
            </button>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: PREFERENCIAS DE ORIENTACIÓN VOCACIONAL */}
      <div className="settings-section">
        <h3>🎯 Contexto de Búsqueda</h3>

        {/* CARRERA SELECCIONADA */}
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">Carrera Seleccionada</div>
            <div className="setting-description">
              Tu foco actual: **{statusData?.selectedCareer || "No definida"}**
            </div>
          </div>
          {/* El botón redirige a búsqueda de universidades, donde el usuario puede seleccionar otra carrera (foco) */}
          <button
            className="btn-edit"
            onClick={() => navigate("/dashboard/university-search")}
            style={{ padding: "8px 15px" }}
          >
            Cambiar Foco
          </button>
        </div>

        {/* REGIÓN DE INTERÉS (DEPARTAMENTOS) */}
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">Departamento de Interés</div>
            <div className="setting-description">
              Filtra universidades y recursos por región en Bolivia.
            </div>
          </div>
          <select
            name="location"
            value={profile.location}
            onChange={handleProfileChange}
            className="toggle-select"
            style={{ width: "150px" }}
            disabled={!isEditing}
          >
            {DEPARTAMENTOS_BOLIVIA.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* PRIORIDAD EDUCATIVA */}
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">Prioridad Educativa</div>
            <div className="setting-description">
              Define si priorizamos formación universitaria (largo) o técnica
              (corta).
            </div>
          </div>
          <select className="toggle-select" onChange={handleFocusChange}>
            <option>Universidad (4-5 años)</option>
            <option>Instituto Técnico (2-3 años)</option>
            <option>Emprendimiento/Oficio (Capacitación)</option>
          </select>
        </div>
      </div>

      {/* SECCIÓN 3: SEGURIDAD Y CUENTA */}
      <div className="settings-section">
        <h3>🔒 Seguridad y Notificaciones</h3>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">Recibir Newsletter Semanal</div>
          </div>
          <div
            className={`toggle-switch ${
              notifications.weeklyNewsletter ? "active" : ""
            }`}
            onClick={() => toggleNotification("weeklyNewsletter")}
          ></div>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-title">Cerrar Sesión</div>
            <div className="setting-description">
              Finaliza tu sesión actual.
            </div>
          </div>
          <button
            className="btn-danger"
            onClick={handleLogout}
            style={{ width: "auto", padding: "8px 15px" }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* ZONA DE PELIGRO (Opciones de Borrado) */}
      <div className="danger-zone">
        <h4>⚠️ Zona de Reinicio</h4>
        <p style={{ marginBottom: "15px" }}>
          Estas acciones afectarán tu historial vocacional:
        </p>
        <button
          className="btn-danger"
          onClick={handleResetVocationalData}
          style={{ width: "auto" }}
        >
          Borrar Test Vocacional
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
