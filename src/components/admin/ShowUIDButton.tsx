
import React from "react";
import { Button } from "@/components/ui/button";
import { supabase, logAuthStatus } from "@/integrations/supabase/client";
import { InfoIcon } from "lucide-react";
import { toast } from "sonner";

const ShowUIDButton: React.FC = () => {
  const handleClick = async () => {
    try {
      // Verificar se há sessão ativa
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Erro ao obter sessão:", sessionError);
        toast.error(`Erro ao obter sessão: ${sessionError.message}`);
        return;
      }
      
      if (!sessionData.session) {
        toast.warning("Você não está autenticado. Por favor, faça login.");
        console.log('Não há sessão ativa');
        return;
      }
      
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Erro ao obter usuário:", error);
        toast.error(`Erro ao obter UID: ${error.message}`);
        return;
      }
      
      console.log('Meu UID:', data.user?.id);
      console.log('Dados da sessão:', sessionData.session);
      
      // Verificar perfil do usuário
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfis')
        .select('tipo')
        .eq('id', data.user?.id)
        .maybeSingle();
      
      if (perfilError) {
        console.error("Erro ao obter perfil:", perfilError);
        toast.error(`Erro ao obter perfil: ${perfilError.message}`);
      } else {
        console.log('Perfil:', perfilData);
      }
      
      const message = `
        Seu UID: ${data.user?.id || 'Usuário não autenticado'}
        Email: ${data.user?.email || 'N/A'}
        Tipo: ${perfilData?.tipo || 'N/A'}
        Sessão ativa: ${sessionData.session ? 'Sim' : 'Não'}
        
        Verifique o console para mais detalhes.
      `;
      
      toast.success("Informações de autenticação disponíveis no console");
      alert(message);
      
      // Verificar as políticas RLS que se aplicam ao usuário
      const isAdmin = await logAuthStatus();
      if (isAdmin) {
        toast.success("Você está autenticado como administrador");
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      toast.error("Erro ao obter UID do usuário");
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
