
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
      
      // Verificar se há sessão ativa
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Erro ao obter sessão:", sessionError);
        alert(`Erro ao obter sessão: ${sessionError.message}`);
        return;
      }
      
      console.log('Dados da sessão:', sessionData.session);
      
      // Verificar perfil do usuário
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfis')
        .select('tipo')
        .eq('id', data.user?.id)
        .maybeSingle();
      
      if (perfilError) {
        console.error("Erro ao obter perfil:", perfilError);
      } else {
        console.log('Perfil:', perfilData);
      }
      
      const message = `
        Seu UID: ${data.user?.id || 'Usuário não autenticado'}
        Email: ${data.user?.email || 'N/A'}
        Tipo: ${perfilData?.tipo || 'N/A'}
        Sessão ativa: ${sessionData.session ? 'Sim' : 'Não'}
      `;
      
      alert(message);
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
