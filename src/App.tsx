
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
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
import UserAccountPage from "./pages/UserAccountPage";
import UsersAdminPage from "./pages/admin/UsersAdminPage";
import { useEffect, useState } from "react";
import { TestClientInsertion } from './components/admin/TestClientInsertion';
import { toast } from "sonner";

const queryClient = new QueryClient();

// Enhanced Protected Route component with role verification
const ProtectedRoute = ({ 
  children, 
  userTypes, 
  redirectTo = "/login" 
}: { 
  children: React.ReactNode, 
  userTypes: ('admin' | 'client' | 'all')[], 
  redirectTo?: string 
}) => {
  const currentUserType = localStorage.getItem("sintonia:userType") || "";
  const location = useLocation();
  
  // Check if user is authenticated
  if (!currentUserType) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  // Check if user has the required role
  const hasRequiredRole = userTypes.includes('all') || userTypes.includes(currentUserType as any);
  
  if (!hasRequiredRole) {
    // If trying to access admin routes as a client, show an error message
    if (currentUserType === 'client' && location.pathname.startsWith('/admin')) {
      toast.error("Você não tem permissão para acessar esta área.");
    }
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

// Admin routes protection wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute userTypes={['admin']} redirectTo="/">
      {children}
    </ProtectedRoute>
  );
};

// Client routes protection wrapper
const ClientRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute userTypes={['client', 'admin']} redirectTo="/login">
      {children}
    </ProtectedRoute>
  );
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
          
          {/* Rotas do sistema cliente - acessível por cliente e admin */}
          <Route 
            path="/" 
            element={
              <ClientRoute>
                <FormularioPage />
              </ClientRoute>
            } 
          />
          
          <Route 
            path="/como-preencher" 
            element={
              <ClientRoute>
                <ComoPreencher />
              </ClientRoute>
            } 
          />
          
          <Route 
            path="/como-avaliar" 
            element={
              <ClientRoute>
                <ComoAvaliar />
              </ClientRoute>
            } 
          />
          
          <Route 
            path="/mitigacoes" 
            element={
              <ClientRoute>
                <Mitigacoes />
              </ClientRoute>
            } 
          />
          
          <Route 
            path="/minha-conta" 
            element={
              <ClientRoute>
                <UserAccountPage />
              </ClientRoute>
            } 
          />
          
          <Route 
            path="/cadastros/empresas" 
            element={
              <ClientRoute>
                <CompaniesPage />
              </ClientRoute>
            } 
          />
          
          <Route 
            path="/cadastros/funcionarios" 
            element={
              <ClientRoute>
                <EmployeesPage />
              </ClientRoute>
            } 
          />
          
          <Route 
            path="/relatorios" 
            element={
              <ClientRoute>
                <RelatoriosPage />
              </ClientRoute>
            } 
          />
          
          {/* Rotas do sistema administrativo - acessível APENAS por admin */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <DashboardPage />
              </AdminRoute>
            } 
          />
          
          <Route 
            path="/admin/clientes" 
            element={
              <AdminRoute>
                <ClientesPage />
              </AdminRoute>
            } 
          />
          
          <Route 
            path="/admin/planos" 
            element={
              <AdminRoute>
                <PlanosPage />
              </AdminRoute>
            } 
          />
          
          <Route 
            path="/admin/contratos" 
            element={
              <AdminRoute>
                <ContratosPage />
              </AdminRoute>
            } 
          />
          
          <Route 
            path="/admin/faturamento" 
            element={
              <AdminRoute>
                <FaturamentoPage />
              </AdminRoute>
            } 
          />
          
          <Route 
            path="/admin/usuarios" 
            element={
              <AdminRoute>
                <UsersAdminPage />
              </AdminRoute>
            } 
          />
          
          {/* Rota inicial redireciona para o login se não autenticado */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to={localStorage.getItem("sintonia:userType") === "admin" ? "/admin/dashboard" : "/"} replace /> : 
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
