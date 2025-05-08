
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";

// Import pages directly instead of lazy loading to simplify for now
import FormularioPage from "@/pages/FormularioPage";
import HomePage from "@/pages/HomePage";
import CompaniesPage from "@/pages/CompaniesPage";
import EmployeesPage from "@/pages/EmployeesPage";
import RelatoriosPage from "@/pages/RelatoriosPage";
import NotFoundPage from "@/pages/NotFoundPage";
import UserAccountPage from "@/pages/UserAccountPage";
import FormulariosPage from "@/pages/admin/FormulariosPage";
import ContratosPage from "@/pages/ContratosPage";
import FaturasPage from "@/pages/FaturasPage";
import DashboardPage from "@/pages/DashboardPage";
import ClientesPage from "@/pages/ClientesPage";
import ComoPreencherPage from "@/pages/ComoPreencherPage";
import ComoAvaliarPage from "@/pages/ComoAvaliarPage";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
              
              {/* New routes based on SidebarLinks */}
              <Route
                path="/como-preencher"
                element={
                  <ProtectedRoute>
                    <ComoPreencherPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/como-avaliar"
                element={
                  <ProtectedRoute>
                    <ComoAvaliarPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/minha-conta"
                element={
                  <ProtectedRoute>
                    <UserAccountPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cadastros/empresas"
                element={
                  <ProtectedRoute>
                    <CompaniesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cadastros/funcionarios"
                element={
                  <ProtectedRoute>
                    <EmployeesPage />
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
    </QueryClientProvider>
  );
}

export default App;
