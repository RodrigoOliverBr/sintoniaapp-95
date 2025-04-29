
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ClienteSistema } from "@/types/cadastro";

// Get the currently active client ID (either real or impersonated)
export const getClienteIdAtivo = (): string | null => {
  // Primeiro tenta obter o ID do cliente impersonado (quando o admin acessa como cliente)
  const impersonatedClientId = sessionStorage.getItem("impersonatedClientId");
  
  if (impersonatedClientId) {
    console.log("Usando cliente impersonado:", impersonatedClientId);
    return impersonatedClientId;
  }
  
  // Se não estiver impersonando, tenta obter o cliente atual do localStorage
  const currentClienteData = localStorage.getItem("sintonia:currentCliente");
  if (currentClienteData) {
    try {
      const currentCliente = JSON.parse(currentClienteData);
      console.log("Usando cliente do localStorage:", currentCliente.id);
      return currentCliente.id;
    } catch (error) {
      console.error("Erro ao analisar dados do cliente atual:", error);
    }
  }

  console.log("Nenhum cliente ativo encontrado");
  return null;
};

// Custom hook for managing client context
export const useClienteContext = () => {
  const [clienteId, setClienteId] = useState<string | null>(getClienteIdAtivo());
  const [clienteData, setClienteData] = useState<ClienteSistema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to load cliente data from database
  const loadClienteData = async (id: string) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("clientes_sistema")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Normalize data for ClienteSistema
        const normalizedData: ClienteSistema = {
          id: data.id,
          razao_social: data.razao_social,
          razaoSocial: data.razao_social, // Alias para compatibilidade
          nome: data.razao_social, // Usando razão social como nome para compatibilidade
          tipo: "juridica", // Default value
          numeroEmpregados: 0, // Default value
          dataInclusao: Date.now(), // Default value
          situacao: data.situacao,
          cnpj: data.cnpj,
          cpfCnpj: data.cnpj, // Alias para compatibilidade
          email: data.email || "",
          telefone: data.telefone,
          responsavel: data.responsavel,
          contato: data.telefone, // Using telefone as contato
          planoId: data.plano_id,
          contratoId: data.contrato_id,
          clienteId: data.id // Using self id as clienteId
        };
        
        setClienteData(normalizedData);
        localStorage.setItem("sintonia:currentCliente", JSON.stringify(normalizedData));
      }
    } catch (err) {
      console.error("Error loading cliente data:", err);
      setError(err instanceof Error ? err.message : "Error loading cliente data");
    } finally {
      setLoading(false);
    }
  };

  // Update cliente ID and load data when it changes
  const setActiveClienteId = (id: string | null) => {
    if (id) {
      sessionStorage.setItem("impersonatedClientId", id);
      setClienteId(id);
      loadClienteData(id);
    } else {
      sessionStorage.removeItem("impersonatedClientId");
      const originalClientId = getClienteIdAtivo();
      setClienteId(originalClientId);
      if (originalClientId) {
        loadClienteData(originalClientId);
      }
    }
  };

  // Load client data on component mount
  useEffect(() => {
    const activeId = getClienteIdAtivo();
    setClienteId(activeId);
    
    if (activeId) {
      loadClienteData(activeId);
    }
  }, []);

  return {
    clienteId,
    clienteData,
    loading,
    error,
    setActiveClienteId,
    getClienteIdAtivo,
  };
};
