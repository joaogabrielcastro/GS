import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import { ALLOW_PUBLIC_REGISTER } from "@/config/env";
import DashboardMotorista from "@/pages/DashboardMotorista";
import DashboardAdmin from "@/pages/DashboardAdmin";
import DashboardFinanceiro from "@/pages/DashboardFinanceiro";
import ChecklistPage from "@/pages/ChecklistPage";
import ReportIssuePage from "@/pages/ReportIssuePage";
import LoadingScreen from "@/components/layout/LoadingScreen";

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const RoleBasedRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {ALLOW_PUBLIC_REGISTER ? (
            <Route path="/register" element={<RegisterPage />} />
          ) : null}

          <Route
            path="/motorista"
            element={
              <ProtectedRoute allowedRoles={["MOTORISTA"]}>
                <DashboardMotorista />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checklist/novo"
            element={
              <ProtectedRoute allowedRoles={["MOTORISTA"]}>
                <ChecklistPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ocorrencias/nova"
            element={
              <ProtectedRoute allowedRoles={["MOTORISTA"]}>
                <ReportIssuePage />
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
          position="top-center"
          containerClassName="!top-4"
          toastOptions={{
            duration: 4000,
            className: "!rounded-xl !shadow-elevated !text-sm !font-medium",
            style: {
              background: "#1F1F1F",
              color: "#fff",
              padding: "12px 16px",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#FF6B35",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4500,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
