
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClienteSistema, ClienteStatus } from "@/types/admin";
import { getClienteIdAtivo } from "@/utils/clientContext";
import { supabase } from "@/integrations/supabase/client";
import { ThemeProvider } from "next-themes";

interface HeaderProps {
  title?: string;
}

// Define the type for client data from supabase
interface ClienteSupabase {
  id: string;
  razao_social: string;
  contrato_id?: string;
  situacao: string;
  responsavel?: string;
  telefone?: string;
  email?: string;
  cnpj: string;
  plano_id?: string;
  created_at: string;
  updated_at: string;
  tipo?: string;
}

const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentClient, setCurrentClient] = useState<ClienteSistema | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Force remove dark class to ensure light mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    document.documentElement.style.backgroundColor = "white";
    document.body.style.backgroundColor = "white";
    document.documentElement.style.color = "black";
    document.body.style.color = "black";
  }, []);
  
  useEffect(() => {
    const loadCurrentClient = async () => {
      const clienteId = await getClienteIdAtivo();
      
      if (!clienteId) {
        const currentClientData = localStorage.getItem("sintonia:currentCliente");
        if (currentClientData) {
          try {
            setCurrentClient(JSON.parse(currentClientData));
          } catch (error) {
            console.error("Error parsing client data:", error);
          }
        }
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("clientes_sistema")
          .select("*")
          .eq("id", clienteId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          const clienteData = data as ClienteSupabase;
          const transformedData: ClienteSistema = {
            id: clienteData.id,
            razao_social: clienteData.razao_social,
            nome: clienteData.razao_social,
            tipo: clienteData.tipo || "juridica",
            numeroEmpregados: 0,
            dataInclusao: new Date(clienteData.created_at).getTime(),
            situacao: (clienteData.situacao || "liberado") as ClienteStatus,
            cnpj: clienteData.cnpj,
            cpfCnpj: clienteData.cnpj,
            email: clienteData.email || "",
            telefone: clienteData.telefone || "",
            responsavel: clienteData.responsavel || "",
            contato: clienteData.responsavel || "",
            planoId: clienteData.plano_id || "",
            contratoId: clienteData.contrato_id || "",
            clienteId: clienteData.id,
          };
          
          setCurrentClient(transformedData);
          
          localStorage.setItem("sintonia:currentCliente", JSON.stringify(transformedData));
        }
      } catch (err) {
        console.error("Error loading client data:", err);
      }
    };
    
    loadCurrentClient();
  }, [location.pathname]);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("Iniciando processo de logout...");
      
      // Clear local storage and session storage BEFORE signOut
      localStorage.removeItem("sintonia:userType");
      localStorage.removeItem("sintonia:currentCliente");
      sessionStorage.removeItem("impersonatedClientId");
      
      console.log("Armazenamento local limpo. Executando signOut...");
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      console.log("Logout bem-sucedido, redirecionando para /login");
      
      // Use replace instead of navigate to prevent back button from returning to dashboard
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro durante o logout:", error);
      setIsLoggingOut(false);
    }
  };

  const getClientName = () => {
    if (!currentClient) return 'eSocial Brasil';
    return currentClient.razao_social || currentClient.razaoSocial || currentClient.nome || 'eSocial Brasil';
  }

  return (
    <ThemeProvider defaultTheme="light" forcedTheme="light">
      <header className="bg-white shadow print:hidden relative">
        <div className="mx-auto md:ml-64 px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <img
                src="/lovable-uploads/5fbfce9a-dae3-444b-99c8-9b92040ef7e2.png"
                alt="Sintonia Logo"
                className="h-8 mr-2 md:hidden"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center text-sm text-gray-600 mr-4">
                <span className="font-medium">{currentClient?.razao_social || currentClient?.razaoSocial || currentClient?.nome || 'eSocial Brasil'}</span>
                <span className="mx-2">•</span>
                <span>{currentClient?.responsavel || 'Admin'}</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate("/minha-conta")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-1"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">{isLoggingOut ? "Saindo..." : "Sair"}</span>
              </Button>
              
              <div className="p-2">
                <img 
                  src="/lovable-uploads/55c55435-602d-4685-ade6-6d83d636842d.png" 
                  alt="eSocial Brasil Logo" 
                  className="h-12" 
                />
              </div>
            </div>
          </div>
        </div>
      </header>
    </ThemeProvider>
  );
};

export default Header;
