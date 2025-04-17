
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ClienteSistema } from '@/types/auth';

export const useClientImpersonation = () => {
  const [impersonatedClient, setImpersonatedClient] = useState<ClienteSistema | null>(null);
  const navigate = useNavigate();

  const fetchImpersonatedClient = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('clientes_sistema')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;

      if (data) {
        const clientWithAliases: ClienteSistema = {
          ...data,
          razaoSocial: data.razao_social,
          planoId: data.plano_id,
          contratoId: data.contrato_id
        };
        
        setImpersonatedClient(clientWithAliases);
        localStorage.setItem("sintonia:currentCliente", JSON.stringify(clientWithAliases));
      }
    } catch (error) {
      console.error('Error fetching impersonated client:', error);
      sessionStorage.removeItem('impersonatedClientId');
      sessionStorage.removeItem('impersonatedClientName');
    }
  };

  const startImpersonation = (client: ClienteSistema) => {
    sessionStorage.setItem('impersonatedClientId', client.id);
    sessionStorage.setItem('impersonatedClientName', client.razao_social || client.razaoSocial || '');
    setImpersonatedClient(client);
    toast.success(`Acessando como cliente: ${client.razao_social || client.razaoSocial}`);
    navigate('/');
  };

  const endImpersonation = () => {
    sessionStorage.removeItem('impersonatedClientId');
    sessionStorage.removeItem('impersonatedClientName');
    localStorage.removeItem("sintonia:currentCliente");
    setImpersonatedClient(null);
    toast.info("Modo de acesso como cliente encerrado");
    navigate('/admin/clientes');
  };

  return {
    impersonatedClient,
    startImpersonation,
    endImpersonation,
    fetchImpersonatedClient
  };
};
