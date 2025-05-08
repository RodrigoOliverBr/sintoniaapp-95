
import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";

// Lazy load pages
const FormularioPage = React.lazy(() => import("@/pages/FormularioPage"));
const HomePage = React.lazy(() => import("@/pages/HomePage"));
const CompaniesPage = React.lazy(() => import("@/pages/CompaniesPage"));
const EmployeesPage = React.lazy(() => import("@/pages/EmployeesPage"));
const RelatoriosPage = React.lazy(() => import("@/pages/RelatoriosPage"));
const NotFoundPage = React.lazy(() => import("@/pages/NotFoundPage"));
const UserAccountPage = React.lazy(() => import("@/pages/UserAccountPage"));
const FormulariosPage = React.lazy(() => import("@/pages/admin/FormulariosPage"));
const ContratosPage = React.lazy(() => import("@/pages/ContratosPage"));
const FaturasPage = React.lazy(() => import("@/pages/FaturasPage"));
const DashboardPage = React.lazy(() => import("@/pages/DashboardPage"));
const ClientesPage = React.lazy(() => import("@/pages/ClientesPage"));

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<div>Carregando...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies"
              element={
                <ProtectedRoute>
                  <CompaniesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <EmployeesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/formulario"
              element={
                <ProtectedRoute>
                  <FormularioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/relatorios"
              element={
                <ProtectedRoute>
                  <RelatoriosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <UserAccountPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/formularios"
              element={
                <ProtectedRoute>
                  <FormulariosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts"
              element={
                <ProtectedRoute>
                  <ContratosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faturas"
              element={
                <ProtectedRoute>
                  <FaturasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedRoute>
                  <ClientesPage />
                </ProtectedRoute>
              }
            />
            
            {/* Fallback routes */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
          
          <Toaster position="top-right" />
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
