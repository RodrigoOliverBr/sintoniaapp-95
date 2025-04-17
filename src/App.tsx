
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
import { supabase } from "./integrations/supabase/client";

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
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const checkAuthorization = async () => {
      // First check if we have a session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setChecking(false);
        return;
      }
      
      // Get the stored user type
      let storedUserType = localStorage.getItem("sintonia:userType");
      
      // Double check with the database to prevent tampering
      if (session.user) {
        const { data: profileData } = await supabase
          .from('perfis')
          .select('tipo')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profileData) {
          const actualUserType = profileData.tipo.toLowerCase();
          
          // If stored type doesn't match actual type, update it
          if (storedUserType !== actualUserType) {
            console.warn("Stored user type doesn't match profile. Updating...");
            storedUserType = actualUserType === 'admin' ? 'admin' : 'client';
            localStorage.setItem("sintonia:userType", storedUserType);
          }
          
          // Check if the user has the required role
          const hasRequiredRole = userTypes.includes('all') || userTypes.includes(storedUserType as any);
          setAuthorized(hasRequiredRole);
          
          // If trying to access admin routes as non-admin, show an error message
          if (!hasRequiredRole && location.pathname.startsWith('/admin') && storedUserType !== 'admin') {
            toast.error("Você não tem permissão para acessar esta área administrativa.");
          }
        } else {
          // No profile found, not authorized
          setAuthorized(false);
        }
      }
      
      setChecking(false);
    };
    
    checkAuthorization();
  }, [location, userTypes]);
  
  // Still checking authorization
  if (checking) {
    return <div className="flex items-center justify-center h-screen">Verificando acesso...</div>;
  }
  
  // If not authorized, redirect
  if (!authorized) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  
  // Authorized, render children
  return <>{children}</>;
};

// Admin routes protection wrapper - STRICT check for admin only
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
  const [userType, setUserType] = useState<string | null>(null);
  
  useEffect(() => {
    // Check authentication on initial load and listen for changes
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session) {
        const currentType = localStorage.getItem("sintonia:userType");
        setUserType(currentType);
      } else {
        setUserType(null);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setUserType(null);
      } else {
        const currentType = localStorage.getItem("sintonia:userType");
        setUserType(currentType);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Login route (public) */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Client system routes - accessible by client and admin */}
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
          
          {/* Admin system routes - accessible ONLY by admin */}
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
          
          {/* Root redirect based on authentication status and user type */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to={userType === "admin" ? "/admin/dashboard" : "/"} replace /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
