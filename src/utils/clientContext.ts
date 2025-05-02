
// Define the client status type
export type ClienteStatus = 'liberado' | 'bloqueado' | 'pendente' | 'ativo' | 'em-analise' | 'sem-contrato' | 'bloqueado-manualmente';

// This utility file contains helper functions and types related to client context
// You can add any client-related utility functions here

/**
 * Function to format client status to display text
 * @param status ClienteStatus
 * @returns Formatted status text
 */
export const formatClientStatus = (status: ClienteStatus): string => {
  switch (status) {
    case 'liberado':
      return 'Liberado';
    case 'bloqueado':
      return 'Bloqueado';
    case 'pendente':
      return 'Pendente';
    case 'ativo':
      return 'Ativo';
    case 'em-analise':
      return 'Em Análise';
    case 'sem-contrato':
      return 'Sem Contrato';
    case 'bloqueado-manualmente':
      return 'Bloqueado Manualmente';
    default:
      return 'Desconhecido';
  }
};

/**
 * Function to get status color based on client status
 * @param status ClienteStatus
 * @returns CSS color class
 */
export const getStatusColor = (status: ClienteStatus): string => {
  switch (status) {
    case 'liberado':
    case 'ativo':
      return 'text-green-500';
    case 'bloqueado':
    case 'bloqueado-manualmente':
      return 'text-red-500';
    case 'pendente':
    case 'em-analise':
      return 'text-yellow-500';
    case 'sem-contrato':
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
};

import { supabase } from '@/integrations/supabase/client';

/**
 * Function to get the active client ID from session storage and login session
 * @returns The active client ID or null if none exists
 */
export const getClienteIdAtivo = async (): Promise<string | null> => {
  try {
    console.log("Obtendo ID do cliente ativo...");
    
    // Check for impersonated client ID in session storage
    const impersonatedClientId = sessionStorage.getItem("impersonatedClientId");
    if (impersonatedClientId) {
      console.log("Usando cliente impersonado:", impersonatedClientId);
      return impersonatedClientId;
    }
    
    // Check for client ID in localStorage
    const storedClient = localStorage.getItem("sintonia:currentCliente");
    if (storedClient) {
      try {
        const client = JSON.parse(storedClient);
        if (client.id) {
          console.log("Usando ID do cliente do localStorage:", client.id);
          return client.id;
        }
      } catch (error) {
        console.error("Erro ao analisar cliente armazenado:", error);
      }
    }
    
    // Obter o ID do usuário autenticado via Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Erro ao obter sessão:", sessionError);
      return null;
    }
    
    if (!session) {
      console.log("Nenhuma sessão ativa encontrada");
      return null;
    }
    
    const userId = session.user.id;
    if (!userId) {
      console.error("ID de usuário não encontrado na sessão");
      return null;
    }
    
    console.log("Obtido ID do usuário autenticado:", userId);
    
    // Verificar se este ID existe na tabela perfis usando maybeSingle() em vez de single()
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (perfilError) {
      console.error("Erro ao verificar perfil:", perfilError);
      return null;
    } 
    
    if (!perfil) {
      console.log("Nenhum perfil encontrado para o usuário ID:", userId);
      return null;
    }
    
    console.log("Perfil encontrado para usuário:", perfil);
    return userId;
    
  } catch (error) {
    console.error("Erro ao obter cliente ativo:", error);
    return null;
  }
};

/**
 * Verifica se o usuário atual é do tipo administrador
 * @returns Boolean indicando se o usuário é admin
 */
export const isUserAdmin = (): boolean => {
  try {
    const userType = localStorage.getItem("sintonia:userType");
    return userType === 'admin';
  } catch (error) {
    console.error("Erro ao verificar tipo de usuário:", error);
    return false;
  }
};

/**
 * Verifica se o usuário atual é do tipo cliente
 * @returns Boolean indicando se o usuário é cliente
 */
export const isUserClient = (): boolean => {
  try {
    const userType = localStorage.getItem("sintonia:userType");
    return userType === 'client';
  } catch (error) {
    console.error("Erro ao verificar tipo de usuário:", error);
    return false;
  }
};
