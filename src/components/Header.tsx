
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
import { ClienteSistema } from "@/types/admin";
import { getClienteIdAtivo } from "@/utils/clientContext";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentClient, setCurrentClient] = useState<ClienteSistema | null>(null);
  
  useEffect(() => {
    const loadCurrentClient = async () => {
      const clienteId = getClienteIdAtivo();
      
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
          // Transform to match ClienteSistema interface
          const transformedData: ClienteSistema = {
            id: data.id,
            razaoSocial: data.razao_social,
            nome: data.razao_social, // For backward compatibility
            tipo: "juridica", // Default value
            numeroEmpregados: 0, // Default value
            dataInclusao: new Date(data.created_at).getTime(),
            situacao: data.situacao,
            cnpj: data.cnpj,
            cpfCnpj: data.cnpj, // For backward compatibility
            email: data.email || "",
            telefone: data.telefone || "",
            responsavel: data.responsavel || "",
            contato: data.responsavel, // For backward compatibility
            planoId: data.plano_id || undefined,
            contratoId: data.contrato_id || undefined,
            clienteId: data.id, // For backward compatibility
          };
          
          setCurrentClient(transformedData);
          
          // Store in localStorage for persistence
          localStorage.setItem("sintonia:currentCliente", JSON.stringify(transformedData));
        }
      } catch (err) {
        console.error("Error loading client data:", err);
      }
    };
    
    loadCurrentClient();
  }, [location.pathname]); // Reload when route changes to ensure current data
  
  const handleLogout = () => {
    localStorage.removeItem("sintonia:userType");
    localStorage.removeItem("sintonia:currentCliente");
    sessionStorage.removeItem("impersonatedClientId");
    navigate("/login");
  };

  return (
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
              <span className="font-medium">{currentClient?.razaoSocial || 'eSocial Brasil'}</span>
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
              className="flex items-center gap-1"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
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
  );
};

export default Header;
