
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import SidebarLinks from "./SidebarLinks";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log("Sidebar: Iniciando processo de logout completo...");
      
      // Clear all storage before signOut to ensure complete cleanup
      localStorage.clear();
      sessionStorage.clear();
      
      // Clean any cookies related to the session
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      console.log("Sidebar: Armazenamento local e de sessão limpos");
      
      // Sign out from Supabase with specific options to force complete logout
      const { error } = await supabase.auth.signOut({ 
        scope: 'global' // This ensures a complete sign out of all tabs/windows
      });
      
      if (error) {
        console.error("Sidebar: Erro ao fazer logout:", error);
        toast.error("Erro ao fazer logout. Tente novamente.");
        return;
      }
      
      console.log("Sidebar: Logout do Supabase bem-sucedido");
      
      // Force a hard redirect to login page to ensure clean state
      // Adding random parameter to prevent caching
      console.log("Sidebar: Redirecionando para /login");
      window.location.href = `/login?t=${new Date().getTime()}`;
    } catch (error) {
      console.error("Sidebar: Erro ao fazer logout:", error);
      toast.error("Ocorreu um erro ao fazer logout.");
    }
  };

  // Verificação se está em uma rota de admin ou cliente
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 flex-col border-r bg-white hidden md:flex">
      <div className="flex h-16 items-center justify-center border-b px-6">
        <img
          src="/lovable-uploads/5fbfce9a-dae3-444b-99c8-9b92040ef7e2.png"
          alt="Sintonia Logo"
          className="h-10"
        />
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        <SidebarLinks />
      </nav>
      <div className="border-t p-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
