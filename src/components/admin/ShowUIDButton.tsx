
import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { InfoIcon } from "lucide-react";

const ShowUIDButton: React.FC = () => {
  const handleClick = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Erro ao obter usuário:", error);
        alert(`Erro ao obter UID: ${error.message}`);
        return;
      }
      
      console.log('Meu UID:', data.user?.id);
      alert(`Seu UID: ${data.user?.id || 'Usuário não autenticado'}`);
    } catch (err) {
      console.error("Erro inesperado:", err);
      alert("Erro ao obter UID do usuário");
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleClick}
      className="flex items-center gap-1"
      title="Mostrar meu UID"
    >
      <InfoIcon size={16} />
      <span className="hidden sm:inline">ID</span>
    </Button>
  );
};

export default ShowUIDButton;
