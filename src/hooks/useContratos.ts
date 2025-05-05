
import { useState, useEffect, useCallback } from "react";
import { Contrato, ClienteSistema, Plano, StatusContrato } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseContratosResult {
  contratos: Contrato[];
  clientes: ClienteSistema[];
  planos: Plano[];
  isLoading: boolean;
  currentContrato: Contrato | null;
  setCurrentContrato: (contrato: Contrato | null) => void;
  addContrato: (
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
  ) => Promise<boolean>;
  updateContrato: (
    id: string,
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
  ) => Promise<boolean>;
  deleteContrato: (contratoId: string, clienteId: string) => Promise<boolean>;
}

export const useContratos = (): UseContratosResult => {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<ClienteSistema[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentContrato, setCurrentContrato] = useState<Contrato | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("useContratos: Iniciando carregamento de dados");
      
      console.log("useContratos: Carregando clientes do sistema...");
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes_sistema')
        .select('*');
      
      if (clientesError) {
        console.error("useContratos: Erro ao carregar clientes:", clientesError);
        toast.error("Erro ao carregar clientes");
        return;
      }
      
      if (!clientesData || clientesData.length === 0) {
        console.log("useContratos: Nenhum cliente encontrado na consulta");
      } else {
        console.log(`useContratos: ${clientesData.length} clientes carregados com sucesso:`, 
          clientesData.map(c => ({ id: c.id, nome: c.razao_social }))
        );
      }
      
      // Convert database schema to ClienteSistema type
      const clientesFormatted: ClienteSistema[] = clientesData?.map(c => ({
        id: c.id,
        nome: c.razao_social || "",
        razao_social: c.razao_social || "",
        razaoSocial: c.razao_social || "",
        cnpj: c.cnpj || "",
        cpfCnpj: c.cnpj || "", 
        telefone: c.telefone || "",
        email: c.email || "",
        responsavel: c.responsavel || "",
        contato: c.responsavel || "",
        situacao: c.situacao || "",
        tipo: "cliente",
        numeroEmpregados: 0,
        dataInclusao: c.created_at,
        ativo: true,
        planoId: c.plano_id || "",
        contratoId: c.contrato_id || ""
      })) || [];
      
      setClientes(clientesFormatted);
      
      console.log("useContratos: Carregando planos ativos...");
      const { data: planosData, error: planosError } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true);
      
      if (planosError) {
        console.error("useContratos: Erro ao carregar planos:", planosError);
        toast.error("Erro ao carregar planos");
        return;
      }
      
      console.log(`useContratos: ${planosData?.length || 0} planos ativos carregados`);
      
      // Convert database schema to Plano type with all required properties
      const planosFormatted: Plano[] = planosData?.map(p => ({
        id: p.id,
        nome: p.nome || "",
        valor: p.valor_mensal || 0,
        valorMensal: p.valor_mensal || 0,
        valorImplantacao: p.valor_implantacao || 0,
        descricao: p.descricao || "",
        ativo: p.ativo || false,
        numeroUsuarios: p.limite_usuarios || 0,
        limiteEmpresas: p.limite_empresas || 0,
        limiteEmpregados: p.limite_empregados || 0,
        empresasIlimitadas: p.empresas_ilimitadas || false,
        empregadosIlimitados: p.empregados_ilimitados || false,
        dataValidade: p.data_validade ? new Date(p.data_validade).getTime() : null,
        semVencimento: p.sem_vencimento || false
      })) || [];
      
      setPlanos(planosFormatted);
      
      console.log("useContratos: Carregando contratos...");
      const { data: contratosData, error: contratosError } = await supabase
        .from('contratos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (contratosError) {
        console.error("useContratos: Erro ao carregar contratos:", contratosError);
        toast.error("Erro ao carregar contratos");
        return;
      }
      
      console.log(`useContratos: ${contratosData?.length || 0} contratos carregados`);
      
      // Convert database schema to Contrato type ensuring number types
      const contratosFormatted: Contrato[] = contratosData?.map(c => ({
        id: c.id,
        clienteSistemaId: c.cliente_sistema_id || "",
        clienteId: c.cliente_id || c.cliente_sistema_id || "",
        planoId: c.plano_id || "",
        dataInicio: new Date(c.data_inicio).getTime(),
        dataFim: new Date(c.data_fim).getTime(),
        dataPrimeiroVencimento: new Date(c.data_primeiro_vencimento).getTime(),
        valorMensal: c.valor_mensal || 0,
        numero: c.numero || "",
        status: c.status || "ATIVO",
        taxaImplantacao: c.taxa_implantacao || 0,
        observacoes: c.observacoes || ""
      })) || [];
      
      setContratos(contratosFormatted);
      
      console.log("useContratos: Carregamento de dados concluído com sucesso");
    } catch (error) {
      console.error("useContratos: Erro inesperado ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contratos')
        .insert({
          cliente_sistema_id: clienteId,
          cliente_id: clienteId, // Ensure cliente_id is set to match the required field
          plano_id: planoId,
          numero: numeroContrato,
          data_inicio: dataInicio.toISOString(),
          data_fim: dataFim.toISOString(),
          data_primeiro_vencimento: dataPrimeiroVencimento.toISOString(),
          valor_mensal: valorMensal,
          status: status,
          taxa_implantacao: taxaImplantacao,
          observacoes: observacoes,
        });

      if (error) {
        console.error("Erro ao adicionar contrato:", error);
        toast.error(`Erro ao adicionar contrato: ${error.message}`);
        return false;
      }

      loadData();
      return true;
    } catch (error: any) {
      console.error("Erro ao adicionar contrato:", error);
      toast.error(`Erro ao adicionar contrato: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateContrato = async (
    id: string,
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
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contratos')
        .update({
          cliente_sistema_id: clienteId,
          plano_id: planoId,
          numero: numeroContrato,
          data_inicio: dataInicio.toISOString(),
          data_fim: dataFim.toISOString(),
          data_primeiro_vencimento: dataPrimeiroVencimento.toISOString(),
          valor_mensal: valorMensal,
          status: status,
          taxa_implantacao: taxaImplantacao,
          observacoes: observacoes,
        })
        .eq('id', id);

      if (error) {
        console.error("Erro ao atualizar contrato:", error);
        toast.error(`Erro ao atualizar contrato: ${error.message}`);
        return false;
      }

      loadData();
      return true;
    } catch (error: any) {
      console.error("Erro ao atualizar contrato:", error);
      toast.error(`Erro ao atualizar contrato: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContrato = async (contratoId: string, clienteId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('contratos')
        .delete()
        .eq('id', contratoId);

      if (error) {
        console.error("Erro ao excluir contrato:", error);
        toast.error(`Erro ao excluir contrato: ${error.message}`);
        return false;
      }

      loadData();
      return true;
    } catch (error: any) {
      console.error("Erro ao excluir contrato:", error);
      toast.error(`Erro ao excluir contrato: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    contratos,
    clientes,
    planos,
    isLoading,
    currentContrato,
    setCurrentContrato,
    addContrato,
    updateContrato,
    deleteContrato,
  };
};
