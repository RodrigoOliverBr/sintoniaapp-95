
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ClienteSistema } from "@/types/admin";

// Get the currently active client ID (either real or impersonated)
export const getClienteIdAtivo = (): string | null => {
  const impersonatedClientId = sessionStorage.getItem("impersonatedClientId");
  
  if (impersonatedClientId) {
    return impersonatedClientId;
  }
  
  const currentClienteData = localStorage.getItem("sintonia:currentCliente");
  if (currentClienteData) {
    try {
      const currentCliente = JSON.parse(currentClienteData);
      return currentCliente.id;
    } catch (error) {
      console.error("Error parsing current cliente data:", error);
    }
  }

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
        
        setClienteData(transformedData);
        
        // Store in localStorage for persistence
        localStorage.setItem("sintonia:currentCliente", JSON.stringify(transformedData));
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
