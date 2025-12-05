import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import apiClient from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";
import { toast } from "react-toastify";

interface LoginFormInputs {
  email: string;
  password: string;
}

// Añadimos el tipo de retorno explícito para asegurar que TS sepa que es un componente
const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Obtener la URL base de la API desde las variables de entorno
  const API_URL =
    process.env.REACT_APP_API_URL || "http://localhost:3000/api/v1";

  // 1. Efecto para manejar el Login con Google (Token en URL)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      // Validamos el token obteniendo el perfil
      apiClient
        .get("/users/me")
        .then((res) => {
          login(token, res.data);
          toast.success(`¡Acceso con Google exitoso!`);
          navigate("/dashboard");
        })
        .catch(() => {
          toast.error("Error al validar sesión de Google.");
        });
    }
  }, [location, login, navigate]);

  // 2. Manejador de Login con Email/Password
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await apiClient.post("/auth/login", data);
      login(response.data.access_token, response.data.user);
      toast.success(`¡Bienvenido de vuelta!`);
      navigate("/dashboard");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Credenciales incorrectas.";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Manejador de Botón Google
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="auth-page-container animate-fade-in">
      <div className="auth-card">
        <div className="auth-visual-side">
          <div className="visual-content">
            <h2>Bienvenido de vuelta</h2>
            <p>
              Accede a tu cuenta para continuar construyendo tu futuro
              profesional.
            </p>
            <ul className="benefits-list">
              <li>
                <span className="benefit-icon">🚀</span>
                <div>
                  <strong>Continúa tu progreso</strong>
                  <span>Retoma tus tests y cursos.</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="visual-overlay"></div>
        </div>

        <div className="auth-form-side">
          <div className="form-header">
            <div className="auth-logo">🎯 CareerGenius</div>
            <h2>Iniciar Sesión</h2>
            <p>Ingresa tus credenciales para continuar.</p>
          </div>

          {apiError && <div className="api-error-banner">⚠️ {apiError}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? "input-error" : ""}`}
                placeholder="tu@email.com"
                {...register("email", { required: "Requerido" })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                className={`form-input ${errors.password ? "input-error" : ""}`}
                placeholder="••••••••"
                {...register("password", { required: "Requerido" })}
              />
            </div>

            <button
              type="submit"
              className="btn-primary btn-block"
              disabled={isLoading}
              style={{ marginTop: "20px" }}
            >
              {isLoading ? "Entrando..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="divider">
            <span>o continúa con</span>
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
              onClick={handleGoogleLogin}
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
              <span style={{ fontSize: "1.2rem" }}>🇬</span> Google
            </button>
          </div>

          <div className="auth-footer">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="link-highlight">
              Regístrate gratis aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
