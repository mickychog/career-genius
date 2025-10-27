import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../services/api";

interface AuthContextType {
  user: any; // Deberías crear un tipo/interfaz para 'User'
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromToken = async () => {
      if (token) {
        try {
          // Llama al endpoint /auth/profile para validar el token
          const response = await apiClient.get("/auth/profile");
          setUser(response.data);
        } catch (error) {
          console.error("Token inválido, deslogueando.");
          setToken(null);
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };

    loadUserFromToken();
  }, [token]);

  const login = (newToken: string, newUser: any) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
        isLoading,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
