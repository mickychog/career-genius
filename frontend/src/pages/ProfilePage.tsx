import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api";
import "./ProfilePage.css"; // Crearemos este CSS

// Interfaz de Usuario (debe coincidir con el backend)
interface UserProfile {
  name: string;
  email: string;
  headline: string;
  gender: string;
  location: string;
  phone: string;
  summary: string;
  birthDate: string;
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

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordFields, setPasswordFields] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 1. Cargar Perfil (GET /users/me)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: profileData } = await apiClient.get("/users/me");

        // Formatear la fecha ISO a YYYY-MM-DD para el input[type=date]
        const formattedDate = profileData.birthDate
          ? new Date(profileData.birthDate).toISOString().split("T")[0]
          : "";

        setProfile({
          name: profileData.name || user?.name || "",
          email: profileData.email || user?.email || "",
          headline: profileData.headline || "",
          gender: profileData.gender || "prefer_not_to_say",
          location: profileData.location || "Nacional (Bolivia)",
          phone: profileData.phone || "",
          summary: profileData.summary || "",
          birthDate: formattedDate,
        });
      } catch (error) {
        toast.error("Error al cargar el perfil del usuario.");
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // 2. Manejadores para Edición de Perfil
  const handleProfileChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  // Helper para eliminar campos vacíos (Duplicado de SettingsPage, para asegurar)
  const cleanDto = (dto: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any> = {};
    for (const key in dto) {
      if (dto[key] !== null && dto[key] !== undefined && dto[key] !== "") {
        cleaned[key] = dto[key];
      }
    }
    return cleaned;
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      const rawDto = {
        name: profile.name,
        headline: profile.headline,
        summary: profile.summary,
        phone: profile.phone,
        location: profile.location,
        // El backend espera la fecha en string o date object
        birthDate: profile.birthDate,
        gender: profile.gender,
      };

      const updateDto = cleanDto(rawDto);

      if (Object.keys(updateDto).length === 0) {
        toast.info("No hay cambios para guardar.");
        setIsEditing(false);
        return;
      }

      await apiClient.patch("/users/me", updateDto);
      toast.success("✅ Perfil actualizado.");
      setIsEditing(false);
    } catch (error) {
      toast.error("❌ Error al guardar.");
      console.error(error);
    }
  };

  // 3. Manejadores para Cambio de Contraseña
  const handlePasswordChange = async () => {
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      toast.error("Las nuevas contraseñas no coinciden.");
      return;
    }
    if (passwordFields.newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      // Aquí iría el llamado al endpoint PATCH /auth/change-password
      // Este endpoint debe ser creado en el AuthController
      toast.success("🔑 Contraseña cambiada correctamente (Simulación).");
      setPasswordFields({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(
        "Error al cambiar contraseña (Contraseña antigua incorrecta)."
      );
    }
  };

  // 4. Helper para mostrar el género en la UI
  const getGenderDisplay = (genderCode: string) => {
    switch (genderCode) {
      case "male":
        return "Masculino";
      case "female":
        return "Femenino";
      case "other":
        return "Otro";
      default:
        return "Prefiero no decir";
    }
  };

  if (loading)
    return (
      <div className="profile-container">
        <h2>Cargando perfil...</h2>
      </div>
    );
  if (!profile)
    return (
      <div className="profile-container">
        <h2>Perfil no encontrado.</h2>
      </div>
    );

  // Verificación simple de campos mínimos
  const isProfileIncomplete =
    !profile.name || !profile.headline || !profile.birthDate;

  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-header-card">
        <div className="profile-info-section">
          <div className="profile-avatar">
            {profile.name ? profile.name[0] : "U"}
          </div>
          <div>
            <h1 className="profile-name">{profile.name}</h1>
            {/* <p className="profile-headline">
              {profile.headline || "Rol no definido"}
            </p> */}
            <p className="profile-email">📧 {profile.email}</p>
          </div>
        </div>
        {isProfileIncomplete && (
          <div className="profile-alert">
            ⚠️ Tu perfil está incompleto. Edita ahora para obtener mejores
            recomendaciones.
          </div>
        )}
        <button
          className="btn-edit-profile"
          onClick={() => setIsEditing(!isEditing)}
        >
          ✏️ {isEditing ? "Cancelar Edición" : "Editar Perfil"}
        </button>
      </div>

      {/* SECCIÓN 1: EDICIÓN DE PERFIL */}
      <div className="profile-section">
        <h3>Información Personal</h3>
        <div className="profile-info-grid">
          {/* Fila 1 - Nombre */}
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
          {/* Fila 1 - Género */}
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
              <div className="info-value">
                {getGenderDisplay(profile.gender)}
              </div>
            )}
          </div>

          {/* Fila 2 - Fecha de Nacimiento */}
          <div className="info-field">
            <div className="info-label">Fecha de Nacimiento</div>
            {isEditing ? (
              <input
                name="birthDate"
                type="date"
                value={profile.birthDate}
                onChange={handleProfileChange}
                className="info-input"
              />
            ) : (
              <div className="info-value">{profile.birthDate || "N/A"}</div>
            )}
          </div>
          {/* Fila 2 - Teléfono */}
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
              <div className="info-value">{profile.phone || "N/A"}</div>
            )}
          </div>

          {/* Fila 3 - Ubicación */}
          <div className="info-field">
            <div className="info-label">Ubicación (Departamento)</div>
            {isEditing ? (
              <select
                name="location"
                value={profile.location}
                onChange={handleProfileChange}
                className="info-input"
              >
                {DEPARTAMENTOS_BOLIVIA.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            ) : (
              <div className="info-value">{profile.location}</div>
            )}
          </div>
          {/* Fila 3 - Rol Actual */}
          <div className="info-field">
            <div className="info-label">Rol Actual</div>
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
                {profile.headline || "No definido"}
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

        {/* Botón de Guardado */}
        {isEditing && (
          <div style={{ marginTop: "30px", textAlign: "center" }}>
            <button
              className="btn-primary"
              onClick={handleSaveProfile}
              style={{ width: "auto", padding: "12px 30px" }}
            >
              GUARDAR PERFIL
            </button>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: CAMBIAR CONTRASEÑA */}
      <div className="profile-section">
        <h3>Cambiar Contraseña</h3>
        <div className="password-grid">
          <input
            type="password"
            placeholder="Contraseña Antigua"
            value={passwordFields.oldPassword}
            onChange={(e) =>
              setPasswordFields((p) => ({ ...p, oldPassword: e.target.value }))
            }
            className="info-input"
          />
          <input
            type="password"
            placeholder="Nueva Contraseña (mín. 8)"
            value={passwordFields.newPassword}
            onChange={(e) =>
              setPasswordFields((p) => ({ ...p, newPassword: e.target.value }))
            }
            className="info-input"
          />
          <input
            type="password"
            placeholder="Confirmar Nueva Contraseña"
            value={passwordFields.confirmPassword}
            onChange={(e) =>
              setPasswordFields((p) => ({
                ...p,
                confirmPassword: e.target.value,
              }))
            }
            className="info-input"
          />
        </div>
        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <button
            className="btn-secondary"
            onClick={handlePasswordChange}
            style={{ width: "auto", padding: "12px 30px" }}
          >
            Actualizar Contraseña
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
