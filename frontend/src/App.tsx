import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Páginas
import LoginPage from "@/pages/LoginPage";
import DashboardMotorista from "@/pages/DashboardMotorista";
import DashboardAdmin from "@/pages/DashboardAdmin";
import DashboardFinanceiro from "@/pages/DashboardFinanceiro";import TestAuth from '@/pages/TestAuth';
// Componente de rota protegida
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gs-orange-500 to-gs-orange-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Componente de redirecionamento baseado no papel
const RoleBasedRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gs-orange-500 to-gs-orange-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  console.log('User role:', user.role); // Debug

  switch (user.role) {
    case "MOTORISTA":
      return <Navigate to="/motorista" replace />;
    case "ADMINISTRADOR":
      return <Navigate to="/admin" replace />;
    case "FINANCEIRO":
      return <Navigate to="/financeiro" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/test" element={<TestAuth />} />

            <Route
              path="/motorista"
              element={
                <ProtectedRoute allowedRoles={["MOTORISTA"]}>
                  <DashboardMotorista />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMINISTRADOR"]}>
                  <DashboardAdmin />
                </ProtectedRoute>
              }
            />

            <Route
              path="/financeiro"
              element={
                <ProtectedRoute allowedRoles={["FINANCEIRO"]}>
                  <DashboardFinanceiro />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<RoleBasedRedirect />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#4ade80",
                  secondary: "#fff",
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
