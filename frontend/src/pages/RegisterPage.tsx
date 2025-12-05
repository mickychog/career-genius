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
  // role eliminado del formulario visual
  terms: boolean;
}

const RegisterPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Obtener la URL base de la API
  const API_URL =
    process.env.REACT_APP_API_URL || "http://localhost:3000/api/v1";

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    const { terms, ...apiData } = data;

    // Asignamos el rol automáticamente
    const payload = { ...apiData, role: "student" };

    setIsLoading(true);

    try {
      const response = await apiClient.post("/auth/register", payload);
      login(response.data.access_token, response.data.user);
      toast.success("¡Bienvenido a CareerGenius!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error en el registro:", error);
      const msg = error.response?.data?.message || "Error al crear la cuenta.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === "Google") {
      window.location.href = `${API_URL}/auth/google`;
    } else {
      toast.info(`El registro con ${provider} estará disponible pronto.`);
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
              <li>
                <span className="benefit-icon">🚀</span>
                <div>
                  <strong>Plan de Carrera</strong>
                  <span>Cursos y habilidades para destacar.</span>
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
                  minLength: {
                    value: 8,
                    message: "Mínimo 8 caracteres",
                  },
                })}
              />
              {errors.password && (
                <p className="error-msg">{errors.password.message}</p>
              )}
            </div>

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
              {isLoading ? "Creando cuenta..." : "Registrarse"}
            </button>
          </form>

          {/* SECCIÓN REDES SOCIALES */}
          <div className="divider">
            <span>o regístrate con</span>
          </div>

          <div
            className="social-login-buttons"
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <button
              type="button"
              onClick={() => handleSocialLogin("Google")}
              className="social-btn"
              style={{
                border: "1px solid #e2e8f0",
                background: "white",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
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

            {/* <button
              type="button"
              onClick={() => handleSocialLogin("Facebook")}
              className="social-btn"
              style={{
                border: "1px solid #e2e8f0",
                background: "#1877F2",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "white",
              }}
            >
              <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>f</span>
              <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                Facebook
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("Instagram")}
              className="social-btn"
              style={{
                border: "none",
                background:
                  "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "white",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>📷</span>
              <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                Instagram
              </span>
            </button> */}
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
