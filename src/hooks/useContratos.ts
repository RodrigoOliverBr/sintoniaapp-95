
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contrato, ClienteSistema, TipoPessoa, StatusContrato, Plano } from '@/types/admin';

export function useContratos() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<ClienteSistema[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentContrato, setCurrentContrato] = useState<Contrato | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
    loadPlanos();
  }, []);

  const loadPlanos = async () => {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .order('nome', { ascending: true });

      if (error) {
        console.error("Erro ao carregar planos:", error);
        return;
      }

      // Map the planos data to the Plano type
      const processedPlanos = data.map((plano: any) => ({
        id: plano.id,
        nome: plano.nome,
        descricao: plano.descricao || "",
        valor: Number(plano.valor_mensal) || 0,
        numeroUsuarios: plano.limite_empregados || 0,
        valorMensal: Number(plano.valor_mensal) || 0,
        valorImplantacao: Number(plano.valor_implantacao) || 0,
        limiteEmpresas: plano.limite_empresas || 0,
        empresasIlimitadas: plano.empresas_ilimitadas || false,
        limiteEmpregados: plano.limite_empregados || 0,
        empregadosIlimitados: plano.empregados_ilimitados || false,
        dataValidade: plano.data_validade ? new Date(plano.data_validade).getTime() : null,
        semVencimento: plano.sem_vencimento || false,
        ativo: plano.ativo !== false
      }));

      setPlanos(processedPlanos);
    } catch (e) {
      console.error("Erro inesperado ao carregar planos:", e);
    }
  };

  const loadData = async (filters?: any) => {
    setLoading(true);
    setIsLoading(true);
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
        cnpj: cliente.cnpj || "",
        cpfCnpj: cliente.cnpj || "",
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
      })) as ClienteSistema[];

      // Process contracts and link them to clients
      const processedContracts = contractsData.map((contract: any) => {
        // Find the client associated with this contract
        const client = clientesProcessed.find(c => c.id === contract.cliente_sistema_id);
        
        return {
          id: contract.id,
          numero: contract.numero,
          status: contract.status as StatusContrato,
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
        } as Contrato;
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
      setIsLoading(false);
    }
  };

  const createContrato = async (contrato: Omit<Contrato, 'id'>) => {
    setLoading(true);
    setIsLoading(true);
    setError(null);

    try {
      // Convert Contrato type to database format
      const contratoInsert = {
        numero: contrato.numero,
        cliente_id: contrato.clienteId,
        cliente_sistema_id: contrato.clienteSistemaId,
        plano_id: contrato.planoId,
        data_inicio: new Date(contrato.dataInicio).toISOString(),
        data_fim: contrato.dataFim ? new Date(contrato.dataFim).toISOString() : null,
        data_primeiro_vencimento: new Date(contrato.dataPrimeiroVencimento).toISOString(),
        valor_mensal: contrato.valorMensal,
        status: contrato.status,
        taxa_implantacao: contrato.taxaImplantacao,
        observacoes: contrato.observacoes,
        ciclo_faturamento: contrato.cicloFaturamento || 'mensal',
      };

      const { data, error } = await supabase
        .from('contratos')
        .insert([contratoInsert])
        .select();

      if (error) {
        console.error("Erro ao criar contrato:", error);
        setError(`Erro ao criar contrato: ${error.message}`);
        return false;
      } else {
        console.log("Contrato criado com sucesso:", data);
        await loadData(); // Refresh data after creating a contract
        return true;
      }
    } catch (e) {
      console.error("Erro inesperado ao criar contrato:", e);
      setError(`Erro inesperado ao criar contrato: ${e}`);
      return false;
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const updateContrato = async (id: string, updates: Partial<Contrato>) => {
    setLoading(true);
    setIsLoading(true);
    setError(null);

    try {
      // Convert Contrato updates to database format
      const contratoUpdates: any = {};
      
      if (updates.clienteSistemaId) contratoUpdates.cliente_sistema_id = updates.clienteSistemaId;
      if (updates.clienteId) contratoUpdates.cliente_id = updates.clienteId;
      if (updates.planoId) contratoUpdates.plano_id = updates.planoId;
      if (updates.numero) contratoUpdates.numero = updates.numero;
      if (updates.dataInicio) contratoUpdates.data_inicio = new Date(updates.dataInicio).toISOString();
      if (updates.dataFim) contratoUpdates.data_fim = new Date(updates.dataFim).toISOString();
      if (updates.dataPrimeiroVencimento) contratoUpdates.data_primeiro_vencimento = new Date(updates.dataPrimeiroVencimento).toISOString();
      if (updates.valorMensal !== undefined) contratoUpdates.valor_mensal = updates.valorMensal;
      if (updates.status) contratoUpdates.status = updates.status;
      if (updates.taxaImplantacao !== undefined) contratoUpdates.taxa_implantacao = updates.taxaImplantacao;
      if (updates.observacoes !== undefined) contratoUpdates.observacoes = updates.observacoes;
      if (updates.cicloFaturamento) contratoUpdates.ciclo_faturamento = updates.cicloFaturamento;

      const { data, error } = await supabase
        .from('contratos')
        .update(contratoUpdates)
        .eq('id', id)
        .select();

      if (error) {
        console.error("Erro ao atualizar contrato:", error);
        setError(`Erro ao atualizar contrato: ${error.message}`);
        return false;
      } else {
        console.log("Contrato atualizado com sucesso:", data);
        await loadData(); // Refresh data after updating a contract
        return true;
      }
    } catch (e) {
      console.error("Erro inesperado ao atualizar contrato:", e);
      setError(`Erro inesperado ao atualizar contrato: ${e}`);
      return false;
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const deleteContrato = async (id: string) => {
    setLoading(true);
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('contratos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Erro ao deletar contrato:", error);
        setError(`Erro ao deletar contrato: ${error.message}`);
        return false;
      } else {
        console.log("Contrato deletado com sucesso");
        await loadData(); // Refresh data after deleting a contract
        return true;
      }
    } catch (e) {
      console.error("Erro inesperado ao deletar contrato:", e);
      setError(`Erro inesperado ao deletar contrato: ${e}`);
      return false;
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  // Method for handling contract creation with parameters
  const addContrato = async (
    clienteId: string,
    planoId: string,
    numeroContrato: string,
    dataInicio: Date,
    dataFim: Date,
    dataPrimeiroVencimento: Date,
    valorMensal: number,
    status: StatusContrato,
    taxaImplantacao: number,
    observacoes: string
  ) => {
    const novoContrato: Omit<Contrato, 'id'> = {
      clienteId: clienteId,
      clienteSistemaId: clienteId, // Using the same ID for both since they refer to the same entity
      planoId: planoId,
      numero: numeroContrato,
      dataInicio: dataInicio.getTime(),
      dataFim: dataFim.getTime(),
      dataPrimeiroVencimento: dataPrimeiroVencimento.getTime(),
      valorMensal: valorMensal,
      status: status,
      taxaImplantacao: taxaImplantacao,
      observacoes: observacoes,
      cicloFaturamento: 'mensal',
    };

    return createContrato(novoContrato);
  };

  return {
    contratos,
    clientes,
    planos,
    loading,
    isLoading,
    error,
    currentContrato,
    setCurrentContrato,
    loadData,
    createContrato,
    updateContrato,
    deleteContrato,
    addContrato,
  };
}
