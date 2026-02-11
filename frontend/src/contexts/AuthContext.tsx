import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, AuthResponse } from "@/types";
import api from "@/services/api";
import socketService from "@/services/socket";
import toast from "react-hot-toast";

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  cpf?: string;
  phone?: string;
  role: string;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStoredData = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Conectar ao Socket.IO
        socketService.connect(parsedUser.id);
      }

      setLoading(false);
    };

    loadStoredData();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      const { token, refreshToken, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      setToken(token);
      setUser(user);

      // Conectar ao Socket.IO
      socketService.connect(user.id);

      toast.success(`Bem-vindo, ${user.name}!`);

      // Redirecionar com base no cargo
      if (user.role === "MOTORISTA") {
        navigate("/motorista");
      } else if (user.role === "ADMINISTRADOR") {
        navigate("/admin");
      } else if (user.role === "FINANCEIRO") {
        navigate("/financeiro");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      const message = error.response?.data?.error || "Erro ao fazer login";
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    // Desconectar do Socket.IO
    socketService.disconnect();

    toast.success("Logout realizado com sucesso");
    navigate("/login");
  };

  const register = async (data: RegisterData) => {
    try {
      await api.post("/auth/register", data);
      toast.success("Usuário cadastrado com sucesso! Faça login.");
    } catch (error: any) {
      const message =
        error.response?.data?.error || "Erro ao cadastrar usuário";
      toast.error(message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
