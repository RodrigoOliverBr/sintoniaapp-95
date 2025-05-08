
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TipoPessoa } from "@/types/cliente";
import { toast } from "sonner";

interface HeaderProps {
  userType?: string;
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ userType, userName }) => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("Usuário");
  const [tipo, setTipo] = useState<string>("cliente");

  useEffect(() => {
    // Try to get user data from localStorage or props
    const getUserData = async () => {
      // First try from props
      if (userName) {
        setName(userName);
      }
      
      if (userType) {
        setTipo(userType);
      }
      
      // Then try from localStorage
      const storedUser = localStorage.getItem("sintonia:currentUser");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.nome) {
            setName(userData.nome);
          }
          if (userData.tipo) {
            setTipo(userData.tipo);
          }
        } catch (e) {
          console.error("Error parsing user data from localStorage", e);
        }
      }
      
      // If still not set, try to fetch from API
      if (name === "Usuário" || !tipo) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: perfil } = await supabase
              .from("perfis")
              .select("nome, tipo")
              .eq("id", session.user.id)
              .maybeSingle();
            
            if (perfil) {
              setName(perfil.nome || "Usuário");
              setTipo(perfil.tipo as TipoPessoa || "cliente");
              
              // Update localStorage
              localStorage.setItem("sintonia:userType", perfil.tipo);
              localStorage.setItem("sintonia:currentUser", JSON.stringify({
                id: session.user.id,
                email: session.user.email,
                tipo: perfil.tipo,
                nome: perfil.nome
              }));
            }
          }
        } catch (error) {
          console.error("Error fetching user data", error);
        }
      }
    };
    
    getUserData();
  }, [userName, userType, name]);

  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove sintonia specific items
    localStorage.removeItem("sintonia:userType");
    localStorage.removeItem("sintonia:currentCliente");
    localStorage.removeItem("sintonia:currentUser");
  };

  const handleSignOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Then attempt to sign out with Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        throw error;
      }
      
      toast.success("Desconectado com sucesso");
      
      // Force page reload to ensure clean state
      window.location.href = "/auth";
    } catch (error) {
      console.error("Error signing out", error);
      toast.error("Erro ao desconectar");
      
      // Force redirect to login anyway for safety
      window.location.href = "/auth";
    }
  };

  return (
    <header className="sticky top-0 z-10 h-14 bg-white border-b shadow-sm">
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">SintoniaApp</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full"
              aria-label="Abrir menu do usuário"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-white">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {tipo === "admin" ? "Administrador" : "Cliente"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/account")}>
              <User className="mr-2 h-4 w-4" />
              <span>Minha conta</span>
            </DropdownMenuItem>
            {tipo === "admin" && (
              <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
