import { useState, useEffect } from "react";
import { supabase, handleSupabaseError, ensureAuthenticated } from "@/integrations/supabase/client";
import { Contrato, ClienteSistema, Plano, StatusContrato } from "@/types/admin";
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
      console.log("Refreshing contratos...");
      
      // Verificar autenticação antes da operação
      const isAuthenticated = await ensureAuthenticated();
      if (!isAuthenticated) {
        console.error("Usuário não autenticado para operação refreshContratos");
        toast.error("Você precisa estar autenticado para acessar os contratos");
        return;
      }
      
      const { data, error } = await supabase
        .from('contratos')
        .select('*');
      
      if (error) {
        console.error('Erro ao recarregar contratos:', error);
        const errorMessage = handleSupabaseError(error);
        toast.error(`Erro ao carregar contratos: ${errorMessage}`);
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
      toast.error("Erro ao carregar contratos. Verifique sua conexão e autenticação.");
    }
  };

  const atualizarSituacaoCliente = async (
    clienteId: string,
    statusContrato: string
  ) => {
    try {
      console.log(`Atualizando situação do cliente ${clienteId} com base no status do contrato: ${statusContrato}`);
      
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes_sistema')
        .select('situacao')
        .eq('id', clienteId)
        .single();
      
      if (clienteError) {
        console.error('Erro ao verificar situação do cliente:', clienteError);
        return;
      }
      
      if (clienteData?.situacao === 'bloqueado-manualmente') {
        console.log('Cliente está bloqueado manualmente, não atualizando situação');
        return;
      }
      
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
      console.log("Loading contratos data...");
      
      // Verificar autenticação antes da operação
      const isAuthenticated = await ensureAuthenticated();
      if (!isAuthenticated) {
        console.error("Usuário não autenticado para operação loadData");
        toast.error("Você precisa estar autenticado para acessar os dados");
        return;
      }
      
      // Log da sessão atual para debug
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Sessão atual durante loadData:", sessionData?.session?.user?.id);
      
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes_sistema')
        .select('*');
      
      if (clientesError) {
        console.error('Erro ao carregar clientes:', clientesError);
        const errorMessage = handleSupabaseError(clientesError);
        toast.error(`Erro ao carregar dados dos clientes: ${errorMessage}`);
        return;
      }
      
      console.log("Dados brutos de clientes:", clientesData);
      
      const clientesFormatados: ClienteSistema[] = clientesData.map(cliente => ({
        id: cliente.id,
        razao_social: cliente.razao_social,
        razaoSocial: cliente.razao_social,
        nome: cliente.razao_social,
        tipo: 'juridica' as const,
        numeroEmpregados: 0,
        dataInclusao: Date.now(),
        situacao: cliente.situacao as 'liberado' | 'bloqueado' | 'ativo' | 'em-analise' | 'sem-contrato' | 'bloqueado-manualmente',
        cnpj: cliente.cnpj,
        cpfCnpj: cliente.cnpj,
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        responsavel: cliente.responsavel || '',
        contato: cliente.responsavel || '',
        planoId: cliente.plano_id || '',
        contratoId: cliente.contrato_id || '',
        clienteId: cliente.id,
      }));
      
      setClientes(clientesFormatados);
      console.log("Clientes formatados para exibição:", clientesFormatados);
      
      const { data: planosData, error: planosError } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true);
      
      if (planosError) {
        console.error('Erro ao carregar planos:', planosError);
        const errorMessage = handleSupabaseError(planosError);
        toast.error(`Erro ao carregar dados dos planos: ${errorMessage}`);
        return;
      }
      
      const planosFormatados: Plano[] = planosData.map(plano => ({
        id: plano.id,
        nome: plano.nome,
        descricao: plano.descricao || '',
        valor: Number(plano.valor_mensal || 0),
        numeroUsuarios: 0,
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
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error(`Erro ao carregar dados: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

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
      if (!formClienteId || !formPlanoId || !formNumeroContrato) {
        toast.error("Cliente, Plano e Número do Contrato são obrigatórios");
        return false;
      }

      setIsLoading(true);
      console.log("Adicionando contrato com dados:", {
        cliente: formClienteId,
        plano: formPlanoId,
        numero: formNumeroContrato
      });
      
      // Verificar autenticação antes da operação
      const isAuthenticated = await ensureAuthenticated();
      if (!isAuthenticated) {
        console.error("Usuário não autenticado para operação addContrato");
        toast.error("Você precisa estar autenticado para adicionar contratos");
        return false;
      }
      
      // Log da sessão atual para debug
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Sessão atual durante addContrato:", sessionData?.session?.user?.id);
      
      // Verificar se o cliente já tem contratos ativos
      if (formStatus === 'ativo') {
        const { data: contratosAtivos, error: checkError } = await supabase
          .from('contratos')
          .select('id')
          .eq('cliente_sistema_id', formClienteId)
          .eq('status', 'ativo');
          
        if (checkError) {
          console.error("Erro ao verificar contratos existentes:", checkError);
          toast.error("Erro ao verificar contratos existentes: " + checkError.message);
          return false;
        }
        
        if (contratosAtivos && contratosAtivos.length > 0) {
          toast.error("Este cliente já possui um contrato ativo. Cancele o contrato existente antes de criar um novo.");
          return false;
        }
      }
      
      // Adicionando log detalhado dos dados que serão inseridos
      console.log("Inserindo contrato com os seguintes dados:", {
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
        ciclo_faturamento: 'mensal'
      });
      
      // Tentativa de inserção do contrato
      const { data, error } = await supabase
        .from('contratos')
        .insert({
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
          ciclo_faturamento: 'mensal'
        })
        .select();

      if (error) {
        console.error("Erro ao adicionar contrato:", error);
        const errorMessage = handleSupabaseError(error);
        toast.error("Erro ao adicionar contrato: " + errorMessage);
        
        // Se for erro de violação de RLS, mostrar informações adicionais
        if (error.message.includes('violates row-level security policy')) {
          console.error("Erro de permissão detectado. Verificando perfil...");
          const { data: perfil } = await supabase
            .from('perfis')
            .select('tipo')
            .eq('id', sessionData?.session?.user?.id)
            .maybeSingle();
          
          console.log("Perfil do usuário:", perfil);
          if (!perfil || perfil.tipo !== 'admin') {
            toast.error("Você precisa ter perfil de administrador para esta operação");
          }
        }
        
        return false;
      }

      console.log("Contrato adicionado com sucesso:", data[0]);

      // Atualiza o ID do contrato no cliente
      const { error: updateError } = await supabase
        .from('clientes_sistema')
        .update({ contrato_id: data[0].id })
        .eq('id', formClienteId);
        
      if (updateError) {
        console.error("Erro ao atualizar cliente com contrato ID:", updateError);
      }

      await atualizarSituacaoCliente(formClienteId, formStatus);
      
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
      await loadData();
      return true;
    } catch (error: any) {
      console.error("Erro ao adicionar contrato:", error);
      toast.error("Erro ao adicionar contrato: " + (error.message || "Erro desconhecido"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

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
      if (!formClienteId || !formPlanoId || !formNumeroContrato) {
        toast.error("Cliente, Plano e Número do Contrato são obrigatórios");
        return false;
      }
      
      setIsLoading(true);
      console.log("Atualizando contrato ID:", id);
      
      // Verificar autenticação antes da operação
      const isAuthenticated = await ensureAuthenticated();
      if (!isAuthenticated) {
        console.error("Usuário não autenticado para operação updateContrato");
        toast.error("Você precisa estar autenticado para atualizar contratos");
        return false;
      }
      
      // Log da sessão atual para debug
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Sessão atual durante updateContrato:", sessionData?.session?.user?.id);
      
      if (formStatus === 'ativo') {
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
        
        if (contratoAtual?.status !== 'ativo') {
          const { data: contratosAtivos, error: checkError } = await supabase
            .from('contratos')
            .select('id')
            .eq('cliente_sistema_id', formClienteId)
            .eq('status', 'ativo')
            .neq('id', id);
          
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
      
      // Log detalhado dos dados que serão atualizados
      console.log("Atualizando contrato com os seguintes dados:", {
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
        ciclo_faturamento: 'mensal'
      });
      
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
          ciclo_faturamento: 'mensal'
        })
        .eq('id', id);

      if (error) {
        console.error("Erro ao atualizar contrato:", error);
        const errorMessage = handleSupabaseError(error);
        toast.error("Erro ao atualizar contrato: " + errorMessage);
        
        // Se for erro de violação de RLS, mostrar informações adicionais
        if (error.message.includes('violates row-level security policy')) {
          console.error("Erro de permissão detectado. Verificando perfil...");
          const { data: perfil } = await supabase
            .from('perfis')
            .select('tipo')
            .eq('id', sessionData?.session?.user?.id)
            .maybeSingle();
          
          console.log("Perfil do usuário:", perfil);
          if (!perfil || perfil.tipo !== 'admin') {
            toast.error("Você precisa ter perfil de administrador para esta operação");
          }
        }
        
        return false;
      }
      
      console.log(`Contrato ${id} atualizado com status: ${formStatus}`);
      
      await atualizarSituacaoCliente(formClienteId, formStatus);

      await refreshContratos();
      await loadData();
      toast.success("Contrato atualizado com sucesso!");
      return true;
    } catch (error: any) {
      console.error("Erro ao atualizar contrato:", error);
      toast.error("Erro ao atualizar contrato: " + (error.message || "Erro desconhecido"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContrato = async (id: string, clienteSistemaId: string) => {
    try {
      setIsLoading(true);
      
      // Verificar autenticação antes da operação
      const isAuthenticated = await ensureAuthenticated();
      if (!isAuthenticated) {
        console.error("Usuário não autenticado para operação deleteContrato");
        toast.error("Você precisa estar autenticado para excluir contratos");
        return false;
      }
      
      // Log da sessão atual para debug
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Sessão atual durante deleteContrato:", sessionData?.session?.user?.id);
      
      // ... keep existing code (update client, contract status, etc.)

      const { error } = await supabase
        .from('contratos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Erro ao excluir contrato:", error);
        const errorMessage = handleSupabaseError(error);
        toast.error("Erro ao excluir contrato: " + errorMessage);
        return false;
      }

      await refreshContratos();
      await loadData();
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

  useEffect(() => {
    // Verificar se há sessão ativa e somente então carregar os dados
    const initializeWithAuth = async () => {
      const isAuth = await ensureAuthenticated();
      if (isAuth) {
        loadData();
      } else {
        console.error("Não foi possível carregar dados devido a problemas de autenticação");
        toast.error("Você precisa estar autenticado para acessar os contratos");
      }
    };
    
    initializeWithAuth();
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
