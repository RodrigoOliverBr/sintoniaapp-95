
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FormularioPage from "./pages/FormularioPage";
import ComoPreencher from "./pages/ComoPreencher";
import ComoAvaliar from "./pages/ComoAvaliar";
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
import FormulariosPage from "./pages/admin/FormulariosPage";
import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, userType }: { children: React.ReactNode, userType: 'admin' | 'client' | 'all' }) => {
  const currentUserType = localStorage.getItem("sintonia:userType") || "";
  
  // Enforce light theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    document.documentElement.style.backgroundColor = "white";
    document.body.style.backgroundColor = "white";
    document.documentElement.style.color = "black";
    document.body.style.color = "black";
  }, []);
  
  if (!currentUserType) {
    return <Navigate to="/login" replace />;
  }
  
  // Verificar se o usuário tem o tipo correto para acessar a rota
  if (userType === 'admin' && currentUserType !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  // Redirecionamento para módulo administrativo se usuário admin tentar acessar área de cliente
  if (userType === 'client' && currentUserType === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return children;
};

const App = () => {
  // Moved authentication check to this component only
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Only check localStorage once during initialization
    const userType = localStorage.getItem("sintonia:userType");
    setIsAuthenticated(!!userType);
    
    // Enforce light theme
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    document.documentElement.style.backgroundColor = "white";
    document.body.style.backgroundColor = "white";
    document.documentElement.style.color = "black";
    document.body.style.color = "black";
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Login route is accessible to everyone */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Rotas do cliente */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute userType="client">
                  <FormularioPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/como-preencher" 
              element={
                <ProtectedRoute userType="client">
                  <ComoPreencher />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/como-avaliar" 
              element={
                <ProtectedRoute userType="client">
                  <ComoAvaliar />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/minha-conta" 
              element={
                <ProtectedRoute userType="all">
                  <UserAccountPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cadastros/empresas" 
              element={
                <ProtectedRoute userType="client">
                  <CompaniesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cadastros/funcionarios" 
              element={
                <ProtectedRoute userType="client">
                  <EmployeesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/relatorios" 
              element={
                <ProtectedRoute userType="client">
                  <RelatoriosPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Rotas do admin */}
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
            <Route 
              path="/admin/usuarios" 
              element={
                <ProtectedRoute userType="admin">
                  <UsersAdminPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Rotas para o gerenciamento de formulários */}
            <Route path="/admin/formularios">
              <Route 
                index
                element={
                  <ProtectedRoute userType="admin">
                    <FormulariosPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path=":formularioId"
                element={
                  <ProtectedRoute userType="admin">
                    <FormulariosPage />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="novo"
                element={
                  <ProtectedRoute userType="admin">
                    <FormulariosPage />
                  </ProtectedRoute>
                }
              />
            </Route>
            
            {/* Fallback route para usuários autenticados */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                  (localStorage.getItem("sintonia:userType") === 'admin' ? 
                    <Navigate to="/admin/dashboard" replace /> : 
                    <FormularioPage />
                  ) : 
                <Navigate to="/login" replace />
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
