import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contrato, ClienteSistema, TipoPessoa } from '@/types/admin';

export function useContratos() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<ClienteSistema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (filters?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("useContratos: Carregando dados de contratos...");
      
      // Fetch contracts first
      const { data: contractsData, error: contractsError } = await supabase
        .from('contratos')
        .select(`
          *,
          cliente_sistema:cliente_sistema_id (*)
        `)
        .order('data_inicio', { ascending: false });

      if (contractsError) {
        console.error("Erro ao carregar contratos:", contractsError);
        setError(`Erro ao carregar contratos: ${contractsError.message}`);
        return;
      }

      // Fetch clients to get their information
      const { data: clientsData, error: clientsError } = await supabase
        .from('clientes_sistema')
        .select('*');

      if (clientsError) {
        console.error("Erro ao carregar clientes:", clientsError);
        setError(`Erro ao carregar clientes: ${clientsError.message}`);
        return;
      }

      // Map clients data to ClienteSistema format
      const clientesProcessed = clientsData.map((cliente: any) => ({
        id: cliente.id,
        nome: cliente.razao_social,
        razao_social: cliente.razao_social,
        razaoSocial: cliente.razao_social,
        cnpj: cliente.cnpj,
        cpfCnpj: cliente.cnpj,
        email: cliente.email || "",
        telefone: cliente.telefone || "",
        responsavel: cliente.responsavel || "",
        contato: cliente.responsavel || "",
        tipo: "juridica" as TipoPessoa, // Ensure correct type casting
        numeroEmpregados: 0,
        dataInclusao: cliente.created_at ? new Date(cliente.created_at).getTime() : Date.now(),
        situacao: cliente.situacao || "liberado",
        planoId: cliente.plano_id || "",
        contratoId: "",
        clienteId: cliente.id,
      }));

      // Process contracts and link them to clients
      const processedContracts = contractsData.map((contract: any) => {
        // Find the client associated with this contract
        const client = clientesProcessed.find(c => c.id === contract.cliente_sistema_id);
        
        return {
          id: contract.id,
          numero: contract.numero,
          status: contract.status,
          clienteId: contract.cliente_id,
          clienteSistemaId: contract.cliente_sistema_id,
          planoId: contract.plano_id,
          dataInicio: new Date(contract.data_inicio).getTime(),
          dataFim: contract.data_fim ? new Date(contract.data_fim).getTime() : null,
          dataPrimeiroVencimento: new Date(contract.data_primeiro_vencimento).getTime(),
          valorMensal: Number(contract.valor_mensal),
          taxaImplantacao: Number(contract.taxa_implantacao),
          observacoes: contract.observacoes || "",
          cicloFaturamento: contract.ciclo_faturamento || "mensal",
          proximaRenovacao: contract.proxima_renovacao 
            ? new Date(contract.proxima_renovacao).getTime() 
            : null,
          clientName: client?.nome || "Cliente não encontrado",
          clientInfo: client || null,
        };
      });

      console.log(`Contratos carregados: ${processedContracts.length}`);
      console.log(`Clientes processados: ${clientesProcessed.length}`);

      setContratos(processedContracts);
      setClientes(clientesProcessed);
    } catch (e) {
      console.error("Erro inesperado ao carregar contratos:", e);
      setError(`Erro inesperado ao carregar contratos: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  const createContrato = async (contrato: Omit<Contrato, 'id'>) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('contratos')
        .insert([contrato])
        .select();

      if (error) {
        console.error("Erro ao criar contrato:", error);
        setError(`Erro ao criar contrato: ${error.message}`);
      } else {
        console.log("Contrato criado com sucesso:", data);
        loadData(); // Refresh data after creating a contract
      }
    } catch (e) {
      console.error("Erro inesperado ao criar contrato:", e);
      setError(`Erro inesperado ao criar contrato: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  const updateContrato = async (id: string, updates: Partial<Contrato>) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('contratos')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error("Erro ao atualizar contrato:", error);
        setError(`Erro ao atualizar contrato: ${error.message}`);
      } else {
        console.log("Contrato atualizado com sucesso:", data);
        loadData(); // Refresh data after updating a contract
      }
    } catch (e) {
      console.error("Erro inesperado ao atualizar contrato:", e);
      setError(`Erro inesperado ao atualizar contrato: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteContrato = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('contratos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Erro ao deletar contrato:", error);
        setError(`Erro ao deletar contrato: ${error.message}`);
      } else {
        console.log("Contrato deletado com sucesso");
        loadData(); // Refresh data after deleting a contract
      }
    } catch (e) {
      console.error("Erro inesperado ao deletar contrato:", e);
      setError(`Erro inesperado ao deletar contrato: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    contratos,
    clientes,
    loading,
    error,
    loadData,
    createContrato,
    updateContrato,
    deleteContrato,
  };
}
