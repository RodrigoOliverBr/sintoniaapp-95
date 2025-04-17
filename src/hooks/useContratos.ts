
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
      console.log("Contratos atualizados:", contratosFormatados);
    } catch (error) {
      console.error('Erro ao recarregar contratos:', error);
    }
  };

  // Função para atualizar a situação do cliente com base no status do contrato
  const atualizarSituacaoCliente = async (
    clienteId: string,
    statusContrato: string
  ) => {
    try {
      console.log(`Atualizando situação do cliente ${clienteId} com base no status do contrato: ${statusContrato}`);
      
      // Primeiro, verificar se o cliente está bloqueado manualmente
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes_sistema')
        .select('situacao')
        .eq('id', clienteId)
        .single();
      
      if (clienteError) {
        console.error('Erro ao verificar situação do cliente:', clienteError);
        return;
      }
      
      // Se o cliente estiver bloqueado manualmente, não atualizamos a situação
      if (clienteData?.situacao === 'bloqueado-manualmente') {
        console.log('Cliente está bloqueado manualmente, não atualizando situação');
        return;
      }
      
      // Mapear o status do contrato para a situação do cliente
      let novaSituacao;
      switch (statusContrato) {
        case 'ativo':
          novaSituacao = 'ativo';
          break;
        case 'em-analise':
          novaSituacao = 'em-analise';
          break;
        case 'cancelado':
          novaSituacao = 'sem-contrato';
          break;
        case 'bloqueado-manualmente':
          novaSituacao = 'bloqueado-manualmente';
          break;
        default:
          novaSituacao = 'sem-contrato';
      }
      
      console.log(`Atualizando cliente ${clienteId} para situação: ${novaSituacao}`);
      
      // Atualizar a situação do cliente
      const { error } = await supabase
        .from('clientes_sistema')
        .update({ situacao: novaSituacao })
        .eq('id', clienteId);
      
      if (error) {
        console.error('Erro ao atualizar situação do cliente:', error);
      } else {
        console.log(`Situação do cliente ${clienteId} atualizada para ${novaSituacao}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar situação do cliente:', error);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      
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
        situacao: cliente.situacao as 'liberado' | 'bloqueado' | 'ativo' | 'em-analise' | 'sem-contrato' | 'bloqueado-manualmente',
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
      console.log("Clientes carregados:", clientesFormatados);
      
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
      console.log("Planos carregados:", planosFormatados);
      
      await refreshContratos();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
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
      
      // Verificar se já existe um contrato ativo para este cliente
      if (formStatus === 'ativo') {
        const { data: contratosAtivos, error: checkError } = await supabase
          .from('contratos')
          .select('id')
          .eq('cliente_sistema_id', formClienteId)
          .eq('status', 'ativo');
          
        if (checkError) {
          console.error("Erro ao verificar contratos existentes:", checkError);
          toast.error("Erro ao verificar contratos existentes");
          return false;
        }
        
        if (contratosAtivos && contratosAtivos.length > 0) {
          toast.error("Este cliente já possui um contrato ativo. Cancele o contrato existente antes de criar um novo.");
          return false;
        }
      }
      
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

      console.log("Contrato adicionado:", data[0]);

      // Atualiza o cliente com a referência ao contrato
      await supabase
        .from('clientes_sistema')
        .update({ contrato_id: data[0].id })
        .eq('id', formClienteId);

      // Atualizar a situação do cliente com base no status do contrato
      await atualizarSituacaoCliente(formClienteId, formStatus);
      
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
      await loadData(); // Recarregar todos os dados para garantir consistência
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
      
      // Se estamos alterando para ativo, verificar se já existe um contrato ativo para este cliente
      if (formStatus === 'ativo') {
        // Buscar o contrato atual para verificar seu status
        const { data: contratoAtual, error: getError } = await supabase
          .from('contratos')
          .select('status')
          .eq('id', id)
          .single();
        
        if (getError) {
          console.error("Erro ao obter contrato:", getError);
          toast.error("Erro ao obter contrato: " + getError.message);
          return false;
        }
        
        // Se o contrato atual já não é ativo, verificar outros contratos ativos
        if (contratoAtual?.status !== 'ativo') {
          const { data: contratosAtivos, error: checkError } = await supabase
            .from('contratos')
            .select('id')
            .eq('cliente_sistema_id', formClienteId)
            .eq('status', 'ativo')
            .neq('id', id); // Exclui o contrato atual da verificação
            
          if (checkError) {
            console.error("Erro ao verificar contratos existentes:", checkError);
            toast.error("Erro ao verificar contratos existentes");
            return false;
          }
          
          if (contratosAtivos && contratosAtivos.length > 0) {
            toast.error("Este cliente já possui um contrato ativo. Cancele o contrato existente antes de ativar este.");
            return false;
          }
        }
      }
      
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
      
      console.log(`Contrato ${id} atualizado com status: ${formStatus}`);
      
      // Atualizar a situação do cliente com base no status do contrato
      await atualizarSituacaoCliente(formClienteId, formStatus);

      await refreshContratos();
      await loadData(); // Recarregar todos os dados para garantir consistência
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
      
      // Obter o status do contrato antes de excluí-lo
      const { data: contratoData, error: getError } = await supabase
        .from('contratos')
        .select('status')
        .eq('id', id)
        .single();
      
      if (getError) {
        console.error("Erro ao obter contrato:", getError);
      } else if (contratoData) {
        // Se o contrato estava ativo, atualizar o status do cliente para "sem-contrato"
        if (contratoData.status === 'ativo') {
          await atualizarSituacaoCliente(clienteSistemaId, 'cancelado');
        }
      }

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
      await loadData(); // Recarregar todos os dados para garantir consistência
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
