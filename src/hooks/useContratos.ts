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
          clientesData.map(c => ({ id: c.id, nome: c.razao_social || c.nome }))
        );
      }
      
      setClientes(clientesData || []);
      
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
      setPlanos(planosData || []);
      
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
      setContratos(contratosData || []);
      
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
        .insert([
          {
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
          },
        ]);

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
