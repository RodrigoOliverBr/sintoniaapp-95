
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeftCircle } from "lucide-react";
import SidebarLinks from "./SidebarLinks";
import AdminSidebarLinks from "./AdminSidebarLinks";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { logout, isAdmin, isImpersonating, impersonatedClient, endImpersonation } = useAuth();

  const handleLogout = () => {
    logout();
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
      
      {isImpersonating && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm">
          <div className="font-medium text-yellow-800">
            Acessando como cliente
          </div>
          <div className="text-yellow-700">
            {impersonatedClient?.razaoSocial}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-1 text-yellow-800 hover:bg-yellow-200 w-full flex items-center gap-2"
            onClick={endImpersonation}
          >
            <ArrowLeftCircle size={16} />
            Voltar para Admin
          </Button>
        </div>
      )}
      
      <nav className="flex-1 overflow-y-auto py-2">
        {isAdminRoute ? <AdminSidebarLinks /> : <SidebarLinks />}
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
