
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ 
  allowedUserTypes, 
  redirectPath = "/login" 
}: { 
  allowedUserTypes: ('admin' | 'client' | 'all')[], 
  redirectPath?: string 
}) => {
  const { currentUser, isAdmin, isClient } = useAuth();
  
  if (!currentUser) {
    return <Navigate to={redirectPath} replace />;
  }
  
  const hasAccess = allowedUserTypes.includes('all') || 
    (isAdmin && allowedUserTypes.includes('admin')) || 
    (isClient && allowedUserTypes.includes('client'));
  
  if (!hasAccess) {
    return <Navigate to={isAdmin ? "/admin/dashboard" : "/"} replace />;
  }
  
  return <Outlet />;
};

const AppRoutes = () => (
  <Routes>
    {/* Rota de Login (pública) */}
    <Route path="/login" element={<LoginPage />} />

    {/* Rotas para clientes */}
    <Route element={<ProtectedRoute allowedUserTypes={['client', 'admin']} />}>
      <Route path="/" element={<FormularioPage />} />
      <Route path="/como-preencher" element={<ComoPreencher />} />
      <Route path="/como-avaliar" element={<ComoAvaliar />} />
      <Route path="/mitigacoes" element={<Mitigacoes />} />
      <Route path="/minha-conta" element={<UserAccountPage />} />
      <Route path="/cadastros/empresas" element={<CompaniesPage />} />
      <Route path="/cadastros/funcionarios" element={<EmployeesPage />} />
      <Route path="/relatorios" element={<RelatoriosPage />} />
    </Route>

    {/* Rotas do sistema administrativo */}
    <Route element={<ProtectedRoute allowedUserTypes={['admin']} />}>
      <Route path="/admin/dashboard" element={<DashboardPage />} />
      <Route path="/admin/clientes" element={<ClientesPage />} />
      <Route path="/admin/planos" element={<PlanosPage />} />
      <Route path="/admin/contratos" element={<ContratosPage />} />
      <Route path="/admin/faturamento" element={<FaturamentoPage />} />
      <Route path="/admin/usuarios" element={<UsersAdminPage />} />
    </Route>
    
    {/* Rota default - redireciona para login */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    
    {/* Rota de fallback */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
