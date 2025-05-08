import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import {
  Suspense,
  Navigate,
} from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
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
