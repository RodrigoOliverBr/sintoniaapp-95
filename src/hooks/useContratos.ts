
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Contrato, ClienteSistema, Plano } from "@/types/admin";
import { toast } from "sonner";
import { gerarFaturasAutomaticas } from "@/components/admin/contratos/InvoiceGenerator";

export const useContratos = () => {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<ClienteSistema[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentContrato, setCurrentContrato] = useState<Contrato | null>(null);

  const refreshContratos = async () => {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select('*');
      
      if (error) {
        console.error('Erro ao recarregar contratos:', error);
        return;
      }
      
      const contratosFormatados = data.map(contrato => ({
        id: contrato.id,
        numero: contrato.numero,
        clienteSistemaId: contrato.cliente_sistema_id || contrato.cliente_id,
        clienteId: contrato.cliente_id,
        planoId: contrato.plano_id,
        dataInicio: new Date(contrato.data_inicio).getTime(),
        dataFim: new Date(contrato.data_fim).getTime(),
        dataPrimeiroVencimento: new Date(contrato.data_primeiro_vencimento).getTime(),
        valorMensal: Number(contrato.valor_mensal),
        status: contrato.status as any,
        taxaImplantacao: Number(contrato.taxa_implantacao),
        observacoes: contrato.observacoes || '',
        cicloFaturamento: contrato.ciclo_faturamento as any,
        proximaRenovacao: contrato.proxima_renovacao ? new Date(contrato.proxima_renovacao).getTime() : undefined,
        ciclosGerados: contrato.ciclos_gerados || 0
      }));
      
      setContratos(contratosFormatados);
    } catch (error) {
      console.error('Erro ao recarregar contratos:', error);
    }
  };

  const loadData = async () => {
    try {
      // Carregar clientes do sistema
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes_sistema')
        .select('*');
      
      if (clientesError) {
        console.error('Erro ao carregar clientes:', clientesError);
        return;
      }
      
      const clientesFormatados = clientesData.map(cliente => ({
        id: cliente.id,
        razaoSocial: cliente.razao_social,
        nome: cliente.razao_social, // Para compatibilidade
        tipo: 'juridica' as const,
        numeroEmpregados: 0,
        dataInclusao: Date.now(),
        situacao: cliente.situacao as 'liberado' | 'bloqueado',
        cnpj: cliente.cnpj,
        cpfCnpj: cliente.cnpj, // Para compatibilidade
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        responsavel: cliente.responsavel || '',
        contato: cliente.responsavel, // Para compatibilidade
        planoId: cliente.plano_id,
        contratoId: cliente.contrato_id,
      }));
      
      setClientes(clientesFormatados);
      
      // Carregar planos
      const { data: planosData, error: planosError } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true);
      
      if (planosError) {
        console.error('Erro ao carregar planos:', planosError);
        return;
      }
      
      const planosFormatados = planosData.map(plano => ({
        id: plano.id,
        nome: plano.nome,
        descricao: plano.descricao || '',
        valorMensal: Number(plano.valor_mensal),
        valorImplantacao: Number(plano.valor_implantacao),
        limiteEmpresas: plano.limite_empresas || 0,
        empresasIlimitadas: plano.empresas_ilimitadas || false,
        limiteEmpregados: plano.limite_empregados || 0,
        empregadosIlimitados: plano.empregados_ilimitados || false,
        dataValidade: plano.data_validade ? new Date(plano.data_validade).getTime() : null,
        semVencimento: plano.sem_vencimento || false,
        ativo: plano.ativo
      }));
      
      setPlanos(planosFormatados);
      
      await refreshContratos();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  // Adicionar Contrato
  const addContrato = async (
    formClienteId: string,
    formPlanoId: string,
    formNumeroContrato: string,
    formDataInicio: Date,
    formDataFim: Date,
    formDataPrimeiroVencimento: Date,
    formValorMensal: number,
    formStatus: string,
    formTaxaImplantacao: number,
    formObservacoes: string
  ) => {
    try {
      setIsLoading(true);
      
      // Inserir o contrato
      const { data, error } = await supabase
        .from('contratos')
        .insert({
          numero: formNumeroContrato,
          cliente_sistema_id: formClienteId,
          cliente_id: formClienteId, // Usando o mesmo ID do clienteSistema para o cliente_id
          plano_id: formPlanoId,
          data_inicio: formDataInicio.toISOString(),
          data_fim: formDataFim.toISOString(),
          data_primeiro_vencimento: formDataPrimeiroVencimento.toISOString(),
          valor_mensal: formValorMensal,
          status: formStatus,
          taxa_implantacao: formTaxaImplantacao,
          observacoes: formObservacoes,
          ciclo_faturamento: 'mensal' // Sempre mensal agora
        })
        .select();

      if (error) {
        console.error("Erro ao adicionar contrato:", error);
        toast.error("Erro ao adicionar contrato: " + error.message);
        return false;
      }

      // Atualiza o cliente com a referência ao contrato
      await supabase
        .from('clientes_sistema')
        .update({ contrato_id: data[0].id })
        .eq('id', formClienteId);

      // Se o contrato for ativo, gerar faturas automáticas
      let faturasGeradas = false;
      if (formStatus === 'ativo') {
        faturasGeradas = await gerarFaturasAutomaticas({
          contratoId: data[0].id,
          clienteId: formClienteId,
          valorMensal: formValorMensal,
          taxaImplantacao: formTaxaImplantacao,
          dataInicio: formDataInicio,
          dataPrimeiroVencimento: formDataPrimeiroVencimento,
          numeroContrato: formNumeroContrato
        });
        
        if (faturasGeradas) {
          toast.success("Contrato e faturas geradas com sucesso!");
        } else {
          toast.warning("Contrato salvo, mas houve um problema ao gerar as faturas");
        }
      } else {
        toast.success("Contrato adicionado com sucesso!");
      }

      await refreshContratos();
      return true;
    } catch (error: any) {
      console.error("Erro ao adicionar contrato:", error);
      toast.error("Erro ao adicionar contrato: " + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar Contrato
  const updateContrato = async (
    id: string,
    formClienteId: string,
    formPlanoId: string,
    formNumeroContrato: string,
    formDataInicio: Date,
    formDataFim: Date,
    formDataPrimeiroVencimento: Date,
    formValorMensal: number,
    formStatus: string,
    formTaxaImplantacao: number,
    formObservacoes: string
  ) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('contratos')
        .update({
          numero: formNumeroContrato,
          cliente_sistema_id: formClienteId,
          cliente_id: formClienteId,
          plano_id: formPlanoId,
          data_inicio: formDataInicio.toISOString(),
          data_fim: formDataFim.toISOString(),
          data_primeiro_vencimento: formDataPrimeiroVencimento.toISOString(),
          valor_mensal: formValorMensal,
          status: formStatus,
          taxa_implantacao: formTaxaImplantacao,
          observacoes: formObservacoes,
          ciclo_faturamento: 'mensal' // Sempre mensal agora
        })
        .eq('id', id);

      if (error) {
        console.error("Erro ao atualizar contrato:", error);
        toast.error("Erro ao atualizar contrato: " + error.message);
        return false;
      }

      await refreshContratos();
      toast.success("Contrato atualizado com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Erro ao atualizar contrato:", error);
      toast.error("Erro ao atualizar contrato: " + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir Contrato
  const deleteContrato = async (id: string, clienteSistemaId: string) => {
    try {
      setIsLoading(true);
      // Primeiro, atualiza o cliente para remover a referência ao contrato
      await supabase
        .from('clientes_sistema')
        .update({ contrato_id: null })
        .eq('id', clienteSistemaId);

      // Depois exclui o contrato
      const { error } = await supabase
        .from('contratos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Erro ao excluir contrato:", error);
        toast.error("Erro ao excluir contrato: " + error.message);
        return false;
      }

      await refreshContratos();
      toast.success("Contrato excluído com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Erro ao excluir contrato:", error);
      toast.error("Erro ao excluir contrato: " + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  return {
    contratos,
    clientes,
    planos,
    isLoading,
    currentContrato,
    setCurrentContrato,
    refreshContratos,
    addContrato,
    updateContrato,
    deleteContrato
  };
};
