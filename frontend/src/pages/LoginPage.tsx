import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Para el enlace de registro
import apiClient from "../services/api";
import { useAuth } from "../context/AuthContext"; // Importa el hook de autenticación
import "./AuthPage.css"; // Crearemos este archivo CSS
import { toast } from "react-toastify";

// Interfaz para los datos del formulario
interface LoginFormInputs {
  email: string;
  password: string;
}

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const { login } = useAuth(); // Obtiene la función login del contexto
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null); // Para errores del backend
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Obtener la URL base de la API desde las variables de entorno
  const API_URL =
    process.env.REACT_APP_API_URL || "http://localhost:3000/api/v1";

    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");

      if (token) {
        localStorage.setItem("token", token);

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

  const onSubmit: SubmitHandler<LoginFormInputs> = async (
    data: LoginFormInputs
  ) => {
    setApiError(null); // Limpia errores previos
    try {
      const response = await apiClient.post("/auth/login", data);
      // Llama a la función login del context con el token y los datos del usuario
      login(response.data.access_token, response.data.user);
      toast.success("¡Login exitoso!");
      navigate("/dashboard"); // Redirige al dashboard (o donde quieras)
    } catch (error: any) {
      console.error("Error en el login:", error);
      // Muestra un mensaje de error genérico o específico del backend
      setApiError(
        error.response?.data?.message ||
          "Error al iniciar sesión. Verifica tus credenciales."
      );
      toast.error(apiError || "Error al iniciar sesión");
    }
  };

  const handleGoogleLogin = () => {
    // USA LA VARIABLE DE ENTORNO, NO LOCALHOST
    window.location.href = `${API_URL}/auth/google`;
  };


  return (
    <div className="mockup-container active">
      {" "}
      {/* Asegúrate que sea visible */}
      <div className="auth-container">
        <div className="auth-side">
          <h2>Bienvenido de vuelta</h2>
          <p>
            Accede a tu cuenta y continúa construyendo tu futuro profesional con
            las mejores herramientas de orientación vocacional e inteligencia
            artificial.
          </p>
        </div>
        <div className="auth-form-side">
          <div className="auth-logo">🎯 CareerGenius</div>
          <h2 style={{ color: "#2d3748", marginBottom: "10px" }}>
            Iniciar Sesión
          </h2>
          <p style={{ color: "#718096", marginBottom: "30px" }}>
            Ingresa tus credenciales para continuar
          </p>
          {/* Muestra el error de la API */}
          {apiError && (
            <p style={{ color: "red", marginBottom: "15px" }}>{apiError}</p>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>{" "}
              {/* Añadido htmlFor */}
              <input
                id="email" // Añadido id
                type="email"
                className={`form-input ${errors.email ? "input-error" : ""}`} // Clase condicional para error
                placeholder="tu@email.com"
                {...register("email", {
                  required: "El correo es requerido",
                  pattern: {
                    // Validación básica de email
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Correo electrónico inválido",
                  },
                })}
              />
              {errors.email && (
                <p
                  style={{ color: "red", fontSize: "0.8em", marginTop: "5px" }}
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>{" "}
              {/* Añadido htmlFor */}
              <input
                id="password" // Añadido id
                type="password"
                className={`form-input ${errors.password ? "input-error" : ""}`}
                placeholder="••••••••"
                {...register("password", {
                  required: "La contraseña es requerida",
                })}
              />
              {errors.password && (
                <p
                  style={{ color: "red", fontSize: "0.8em", marginTop: "5px" }}
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            <div style={{ textAlign: "right", marginBottom: "20px" }}>
              <Link
                to="/forgot-password"
                style={{
                  color: "#667eea",
                  textDecoration: "none",
                  fontSize: "0.9em",
                }}
              >
                ¿Olvidaste tu contraseña?
              </Link>{" "}
              {/* Usar Link para navegación interna */}
            </div>

            <button type="submit" className="btn-primary">
              Iniciar Sesión
            </button>
          </form>{" "}
          {/* Cierre del form */}
          <div className="divider">
            <span>o continúa con</span>
          </div>
          <div className="social-login">
            {/* Estos botones necesitarán su propia lógica */}
            <button className="social-btn">G</button>
            <button className="social-btn">f</button>
            <button className="social-btn">in</button>
          </div>
          <div className="auth-link">
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>{" "}
            {/* Usar Link */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
