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
      try {
        // First check if we have a session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          setChecking(false);
          return;
        }
        
        // Always get the user type directly from the database for security
        if (session.user) {
          const { data: profileData } = await supabase
            .from('perfis')
            .select('tipo')
            .eq('id', session.user.id)
            .single();
          
          if (profileData) {
            const actualUserType = profileData.tipo.toLowerCase();
            console.log("User type from database:", actualUserType);
            
            // Update local storage with the correct type from database
            const storedType = actualUserType === 'admin' ? 'admin' : 'client';
            localStorage.setItem("sintonia:userType", storedType);
            
            // Check if the user has the required role
            const hasRequiredRole = userTypes.includes('all') || userTypes.includes(storedType as any);
            console.log("Has required role:", hasRequiredRole, "Required roles:", userTypes);
            
            setAuthorized(hasRequiredRole);
            
            // If trying to access admin routes as non-admin, show an error message
            if (!hasRequiredRole && location.pathname.startsWith('/admin') && storedType !== 'admin') {
              toast.error("Você não tem permissão para acessar esta área administrativa.");
            }
          } else {
            // No profile found, not authorized
            console.log("No profile found for user");
            setAuthorized(false);
            localStorage.removeItem("sintonia:userType");
          }
        }
      } catch (error) {
        console.error("Error checking authorization:", error);
        setAuthorized(false);
      } finally {
        setChecking(false);
      }
    };
    
    checkAuthorization();
  }, [location, userTypes]);
  
  // Still checking authorization
  if (checking) {
    return <div className="flex items-center justify-center h-screen">Verificando acesso...</div>;
  }
  
  // If not authorized, redirect
  if (!authorized) {
    console.log("Not authorized, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  
  // Authorized, render children
  return <>{children}</>;
};

// Admin routes protection wrapper - STRICT check for admin only
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute userTypes={['admin']} redirectTo="/login">
      {children}
    </ProtectedRoute>
  );
};

// Client routes protection wrapper - allows both client and admin access
const ClientRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute userTypes={['client', 'admin']} redirectTo="/login">
      {children}
    </ProtectedRoute>
  );
};

function App() {
  // Keep track of authentication state globally
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check authentication on initial load and listen for changes
    const checkAuth = async () => {
      try {
        // Get session
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        if (session) {
          // Get user type directly from database to prevent tampering
          const { data: profileData } = await supabase
            .from('perfis')
            .select('tipo')
            .eq('id', session.user.id)
            .single();
          
          if (profileData) {
            const actualType = profileData.tipo.toLowerCase();
            const storedType = actualType === 'admin' ? 'admin' : 'client';
            localStorage.setItem("sintonia:userType", storedType);
            setUserType(storedType);
          } else {
            setUserType(null);
            localStorage.removeItem("sintonia:userType");
          }
        } else {
          setUserType(null);
          localStorage.removeItem("sintonia:userType");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setUserType(null);
        localStorage.removeItem("sintonia:userType");
      } else {
        // Get fresh user type from database on auth state change
        const { data: profileData } = await supabase
          .from('perfis')
          .select('tipo')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) {
          const actualType = profileData.tipo.toLowerCase();
          const storedType = actualType === 'admin' ? 'admin' : 'client';
          localStorage.setItem("sintonia:userType", storedType);
          setUserType(storedType);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  // If still loading the initial auth state, show a simple loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Login route (public) */}
          <Route path="/login" element={
            isAuthenticated ? 
              <Navigate to={userType === "admin" ? "/admin/dashboard" : "/"} replace /> : 
              <LoginPage />
          } />
          
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
