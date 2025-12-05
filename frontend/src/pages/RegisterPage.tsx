import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";
import { toast } from "react-toastify";

// Interfaz para los datos del formulario (debe coincidir con CreateUserDto)
interface RegisterFormInputs {
  name: string;
  email: string;
  password: string;
  role: string; // El select devuelve string, el backend espera el enum
  terms: boolean; // Para el checkbox
}

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  // Obtener la URL base de la API
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (
    data: RegisterFormInputs
  ) => {
    // Quitamos 'terms' antes de enviar al backend
    const { terms, ...apiData } = data;
    setApiError(null);

    try {
      const response = await apiClient.post("/auth/register", apiData);
      login(response.data.access_token, response.data.user);
      toast.success("¡Registro exitoso! Bienvenido.");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error en el registro:", error);
      setApiError(
        error.response?.data?.message ||
          "Error al crear la cuenta. Intenta de nuevo."
      );
      toast.error(apiError || "Error al crear la cuenta");
    }
  };

    const handleSocialLogin = (provider: string) => {
      if (provider === "Google") {
        // USA LA VARIABLE DE ENTORNO
        window.location.href = `${API_URL}/auth/google`;
      } else {
        toast.info(`El inicio con ${provider} estará disponible pronto.`);
      }
    };

  return (
    <div className="mockup-container active">
      <div className="auth-container">
        <div className="auth-form-side">
          <div className="auth-logo">🎯 CareerGenius</div>
          <h2 style={{ color: "#2d3748", marginBottom: "10px" }}>
            Crear Cuenta
          </h2>
          <p style={{ color: "#718096", marginBottom: "30px" }}>
            Comienza tu camino profesional
          </p>

          {apiError && (
            <p style={{ color: "red", marginBottom: "15px" }}>{apiError}</p>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="name">Nombre Completo</label>
              <input
                id="name"
                type="text"
                className={`form-input ${errors.name ? "input-error" : ""}`}
                placeholder="Juan Pérez"
                {...register("name", { required: "El nombre es requerido" })}
              />
              {errors.name && (
                <p className="error-message">{errors.name.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? "input-error" : ""}`}
                placeholder="tu@email.com"
                {...register("email", {
                  required: "El correo es requerido",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Correo electrónico inválido",
                  },
                })}
              />
              {errors.email && (
                <p className="error-message">{errors.email.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                className={`form-input ${errors.password ? "input-error" : ""}`}
                placeholder="Mínimo 8 caracteres"
                {...register("password", {
                  required: "La contraseña es requerida",
                  minLength: {
                    value: 8,
                    message: "Debe tener al menos 8 caracteres",
                  },
                })}
              />
              {errors.password && (
                <p className="error-message">{errors.password.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="role">Tipo de Cuenta</label>
              <select
                id="role"
                className={`form-input ${errors.role ? "input-error" : ""}`}
                {...register("role", {
                  required: "Selecciona un tipo de cuenta",
                })}
              >
                <option value="">Selecciona...</option>
                {/* Asegúrate que los 'value' coincidan con tu enum UserRole */}
                <option value="student">Estudiante</option>
                {/* <option value="professional">Profesional</option> */}
                {/* <option value="company">Empresa</option> */}
              </select>
              {errors.role && (
                <p className="error-message">{errors.role.message}</p>
              )}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#4a5568",
                }}
              >
                <input
                  type="checkbox"
                  style={{ width: "18px", height: "18px" }}
                  {...register("terms", {
                    required: "Debes aceptar los términos",
                  })}
                />
                <span style={{ fontSize: "0.9em" }}>
                  Acepto los{" "}
                  <a href="/terms" target="_blank" style={{ color: "#667eea" }}>
                    términos y condiciones
                  </a>
                </span>
              </label>
              {errors.terms && (
                <p className="error-message">{errors.terms.message}</p>
              )}
            </div>

            <button type="submit" className="btn-primary">
              Crear Cuenta
            </button>
          </form>

          <div className="auth-link">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </div>
        </div>
        <div className="auth-side">
          <h2>Únete a CareerGenius</h2>
          <p>
            Descubre tu verdadera vocación, conecta con oportunidades laborales
            ideales y desarrolla las habilidades que el mercado demanda.
          </p>
          <div style={{ marginTop: "30px" }}>
            <div style={{ marginBottom: "15px" }}>✓ Test vocacional con IA</div>
            <div style={{ marginBottom: "15px" }}>
              ✓ Matching laboral inteligente
            </div>
            <div style={{ marginBottom: "15px" }}>
              ✓ Simulador de entrevistas
            </div>
            <div>✓ Desarrollo de habilidades personalizado</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
