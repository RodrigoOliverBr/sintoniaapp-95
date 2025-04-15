import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FormularioPage from "./pages/FormularioPage";
import ComoPreencher from "./pages/ComoPreencher";
import ComoAvaliar from "./pages/ComoAvaliar";
import Mitigacoes from "./pages/Mitigacoes";
import CompaniesPage from "./pages/CompaniesPage";
import EmployeesPage from "./pages/EmployeesPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ClientesPage from "./pages/admin/ClientesPage";
import PlanosPage from "./pages/admin/PlanosPage";
import ContratosPage from "./pages/admin/ContratosPage";
import FaturamentoPage from "./pages/admin/FaturamentoPage";
import { useEffect, useState } from "react";
import { TestClientInsertion } from './components/admin/TestClientInsertion';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, userType }: { children: React.ReactNode, userType: 'admin' | 'cliente' | 'all' }) => {
  const currentUserType = localStorage.getItem("sintonia:userType") || "";
  
  if (!currentUserType) {
    return <Navigate to="/login" replace />;
  }
  
  if (userType !== 'all' && currentUserType !== userType) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Verificar autenticação no carregamento inicial
    const userType = localStorage.getItem("sintonia:userType");
    setIsAuthenticated(!!userType);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rota de Login (pública) */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rotas do sistema cliente */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute userType="all">
                <FormularioPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/como-preencher" 
            element={
              <ProtectedRoute userType="all">
                <ComoPreencher />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/como-avaliar" 
            element={
              <ProtectedRoute userType="all">
                <ComoAvaliar />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mitigacoes" 
            element={
              <ProtectedRoute userType="all">
                <Mitigacoes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cadastros/empresas" 
            element={
              <ProtectedRoute userType="all">
                <CompaniesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cadastros/funcionarios" 
            element={
              <ProtectedRoute userType="all">
                <EmployeesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/relatorios" 
            element={
              <ProtectedRoute userType="all">
                <RelatoriosPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Rotas do sistema administrativo */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute userType="admin">
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/clientes" 
            element={
              <ProtectedRoute userType="admin">
                <ClientesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/planos" 
            element={
              <ProtectedRoute userType="admin">
                <PlanosPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/contratos" 
            element={
              <ProtectedRoute userType="admin">
                <ContratosPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/faturamento" 
            element={
              <ProtectedRoute userType="admin">
                <FaturamentoPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Rota inicial redireciona para o login se não autenticado */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
              <FormularioPage /> : 
              <Navigate to="/login" replace />
            } 
          />
          
          {/* Rota de fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
