
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import SidebarLinks from "./SidebarLinks";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("sintonia:userType");
    localStorage.removeItem("sintonia:currentCliente");
    sessionStorage.removeItem("impersonatedClientId");
    navigate("/login");
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
