
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

/**
 * Function to get the active client ID from session storage and login session
 * @returns The active client ID or null if none exists
 */
export const getClienteIdAtivo = (): string | null => {
  try {
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
    
    // Se não encontrou, tentar pegar o ID do usuário autenticado
    try {
      const authDataStr = localStorage.getItem("supabase.auth.token");
      if (authDataStr) {
        const authData = JSON.parse(authDataStr);
        const userId = authData?.currentSession?.user?.id;
        
        if (userId) {
          console.log("Usando ID do usuário autenticado:", userId);
          return userId;
        }
      }
    } catch (error) {
      console.error("Erro ao obter ID do usuário autenticado:", error);
    }
    
    console.warn("Nenhum ID de cliente encontrado");
    return null;
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
