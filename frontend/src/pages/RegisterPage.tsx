import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";
import { toast } from "react-toastify";

interface RegisterFormInputs {
  name: string;
  email: string;
  password: string;
  role: string;
  terms: boolean;
}

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    const { terms, ...apiData } = data;

    // ASIGNACIÓN AUTOMÁTICA DE ROL
    apiData.role = "student";

    setIsLoading(true);

    try {
      const response = await apiClient.post("/auth/register", apiData);
      login(response.data.access_token, response.data.user);
      toast.success("¡Bienvenido a CareerGenius! Tu cuenta ha sido creada.");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error en el registro:", error);
      const msg = error.response?.data?.message || "Error al crear la cuenta.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejador para Login Social
  const handleSocialLogin = (provider: string) => {
    if (provider === "Google") {
      window.location.href = "http://localhost:3000/api/v1/auth/google";
    } else {
      toast.info(`El inicio con ${provider} estará disponible pronto.`);
    }
  };
  
  return (
    <div className="auth-page-container animate-fade-in">
      <div className="auth-card">
        {/* LADO IZQUIERDO: VISUAL */}
        <div className="auth-visual-side">
          <div className="visual-content">
            <h2>
              Tu futuro profesional <br />
              comienza en Bolivia
            </h2>
            <p>
              Únete a la plataforma de orientación vocacional potenciada por
              Inteligencia Artificial.
            </p>
            <ul className="benefits-list">
              <li>
                <span className="benefit-icon">🧠</span>
                <div>
                  <strong>Test Adaptativo IA</strong>
                  <span>Descubre tu perfil real.</span>
                </div>
              </li>
              <li>
                <span className="benefit-icon">🏫</span>
                <div>
                  <strong>Universidades Locales</strong>
                  <span>Encuentra dónde estudiar.</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="visual-overlay"></div>
        </div>

        {/* LADO DERECHO: FORMULARIO */}
        <div className="auth-form-side">
          <div className="form-header">
            <div className="auth-logo">🎯 CareerGenius</div>
            <h2>Crear Cuenta</h2>
            <p>Completa tus datos para empezar gratis.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Nombre Completo</label>
              <input
                id="name"
                type="text"
                className={`form-input ${errors.name ? "input-error" : ""}`}
                placeholder="Ej. Juan Pérez"
                {...register("name", { required: "El nombre es requerido" })}
              />
              {errors.name && (
                <p className="error-msg">{errors.name.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? "input-error" : ""}`}
                placeholder="nombre@ejemplo.com"
                {...register("email", {
                  required: "El correo es requerido",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Correo electrónico inválido",
                  },
                })}
              />
              {errors.email && (
                <p className="error-msg">{errors.email.message}</p>
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
                  minLength: { value: 8, message: "Mínimo 8 caracteres" },
                })}
              />
              {errors.password && (
                <p className="error-msg">{errors.password.message}</p>
              )}
            </div>

            {/* SELECTOR DE ROL ELIMINADO */}

            <div className="form-check">
              <input
                type="checkbox"
                id="terms"
                {...register("terms", {
                  required: "Debes aceptar los términos",
                })}
              />
              <label htmlFor="terms">
                Acepto los{" "}
                <a href="#" className="link-highlight">
                  términos y condiciones
                </a>
              </label>
            </div>
            {errors.terms && (
              <p className="error-msg">{errors.terms.message}</p>
            )}

            <button
              type="submit"
              className="btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading ? "Creando cuenta..." : "Registrarse con Email"}
            </button>
          </form>

          {/* SECCIÓN REDES SOCIALES */}
          <div
            className="auth-divider"
            style={{
              margin: "25px 0",
              textAlign: "center",
              position: "relative",
            }}
          >
            <span
              style={{
                background: "#fff",
                padding: "0 10px",
                color: "#718096",
                fontSize: "0.9em",
                position: "relative",
                zIndex: 1,
              }}
            >
              o regístrate con
            </span>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                borderBottom: "1px solid #e2e8f0",
                zIndex: 0,
              }}
            ></div>
          </div>

          <div
            className="social-buttons"
            style={{ display: "flex", gap: "15px", justifyContent: "center" }}
          >
            <button
              type="button"
              onClick={() => handleSocialLogin("Google")}
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                background: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#f7fafc")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "white")
              }
            >
              <span style={{ fontSize: "1.2rem" }}>🇬</span>
              <span
                style={{
                  fontSize: "0.9rem",
                  color: "#4a5568",
                  fontWeight: 600,
                }}
              >
                Google
              </span>
            </button>

          </div>

          <div className="auth-footer">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="link-highlight">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
