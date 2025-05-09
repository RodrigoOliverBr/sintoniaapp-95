
import { useState, useEffect } from "react";
import { ClienteSistema, Contrato, Plano, StatusContrato, ClienteStatus } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useContratos = () => {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<ClienteSistema[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentContrato, setCurrentContrato] = useState<Contrato | null>(null);
  const { toast } = useToast();

  const loadContratos = async () => {
    try {
      setLoading(true);
      console.log("Carregando contratos...");
      
      // Carregar todos os contratos
      const { data: contratosData, error: contratosError } = await supabase
        .from("contratos")
        .select("*")
        .order("created_at", { ascending: false });

      if (contratosError) {
        throw contratosError;
      }

      console.log(`${contratosData?.length || 0} contratos encontrados`);
      
      // Formatar os contratos para o formato esperado pela aplicação
      const formattedContratos: Contrato[] = contratosData?.map(contrato => ({
        id: contrato.id,
        numero: contrato.numero,
        clienteId: contrato.cliente_id,
        clienteSistemaId: contrato.cliente_sistema_id,
        planoId: contrato.plano_id,
        dataInicio: contrato.data_inicio ? new Date(contrato.data_inicio).getTime() : new Date().getTime(),
        dataFim: contrato.data_fim ? new Date(contrato.data_fim).getTime() : addMonths(new Date(), 12).getTime(),
        dataPrimeiroVencimento: contrato.data_primeiro_vencimento ? new Date(contrato.data_primeiro_vencimento).getTime() : new Date().getTime(),
        status: contrato.status as StatusContrato,
        valorMensal: Number(contrato.valor_mensal),
        taxaImplantacao: Number(contrato.taxa_implantacao || 0),
        observacoes: contrato.observacoes || "",
        cicloFaturamento: contrato.ciclo_faturamento,
        proximaRenovacao: contrato.proxima_renovacao ? new Date(contrato.proxima_renovacao).getTime() : undefined,
        ciclosGerados: contrato.ciclos_gerados
      })) || [];
      
      setContratos(formattedContratos);

      // Carregar todos os clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes_sistema")
        .select("*");

      if (clientesError) {
        throw clientesError;
      }

      console.log(`${clientesData?.length || 0} clientes encontrados`);
      
      // Formatar os clientes para o formato esperado pela aplicação
      const formattedClientes: ClienteSistema[] = clientesData?.map(cliente => ({
        id: cliente.id,
        nome: cliente.razao_social || "",
        razao_social: cliente.razao_social || "",
        razaoSocial: cliente.razao_social || "",
        cnpj: cliente.cnpj || "",
        cpfCnpj: cliente.cnpj || "",
        telefone: cliente.telefone || "",
        email: cliente.email || "",
        responsavel: cliente.responsavel || "",
        contato: cliente.responsavel || "",
        situacao: cliente.situacao as ClienteStatus || "liberado",
        tipo: "juridica",
        numeroEmpregados: 0,
        dataInclusao: new Date().getTime(),
        planoId: cliente.plano_id || "",
        contratoId: cliente.contrato_id || ""
      })) || [];
      
      setClientes(formattedClientes);

      // Carregar todos os planos
      const { data: planosData, error: planosError } = await supabase
        .from("planos")
        .select("*")
        .eq("ativo", true);

      if (planosError) {
        throw planosError;
      }

      console.log(`${planosData?.length || 0} planos encontrados`);
      
      // Formatar os planos para o formato esperado pela aplicação
      const formattedPlanos = planosData?.map(plano => ({
        id: plano.id,
        nome: plano.nome,
        descricao: plano.descricao || "",
        valor: Number(plano.valor_mensal || 0),
        numeroUsuarios: plano.limite_empregados || 0,
        valorMensal: Number(plano.valor_mensal || 0),
        valorImplantacao: Number(plano.valor_implantacao || 0),
        limiteEmpresas: plano.limite_empresas || 0,
        empresasIlimitadas: plano.empresas_ilimitadas || false,
        limiteEmpregados: plano.limite_empregados || 0,
        empregadosIlimitados: plano.empregados_ilimitados || false,
        dataValidade: plano.data_validade ? new Date(plano.data_validade).getTime() : null,
        semVencimento: plano.sem_vencimento || false,
        ativo: plano.ativo || true
      })) || [];
      
      setPlanos(formattedPlanos);

      return formattedContratos;
    } catch (error) {
      console.error("Erro ao carregar contratos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contratos",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

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
    try {
      const novoContrato = {
        cliente_sistema_id: clienteId,
        cliente_id: clienteId, // Mantemos o mesmo ID para os dois campos por compatibilidade
        plano_id: planoId,
        numero: numeroContrato,
        data_inicio: dataInicio.toISOString(),
        data_fim: dataFim.toISOString(),
        data_primeiro_vencimento: dataPrimeiroVencimento.toISOString(),
        valor_mensal: valorMensal,
        status: status,
        taxa_implantacao: taxaImplantacao,
        observacoes: observacoes,
        ciclo_faturamento: "mensal"
      };
      
      const { data, error } = await supabase
        .from("contratos")
        .insert([novoContrato])
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Atualizar o cliente com o ID do contrato
      await supabase
        .from("clientes_sistema")
        .update({ contrato_id: data.id })
        .eq("id", clienteId);
      
      await loadContratos();
      return true;
    } catch (error) {
      console.error("Erro ao adicionar contrato:", error);
      return false;
    }
  };

  const updateContrato = async (
    contratoId: string,
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
    try {
      const contratoAtualizado = {
        cliente_sistema_id: clienteId,
        cliente_id: clienteId,
        plano_id: planoId,
        numero: numeroContrato,
        data_inicio: dataInicio.toISOString(),
        data_fim: dataFim.toISOString(),
        data_primeiro_vencimento: dataPrimeiroVencimento.toISOString(),
        valor_mensal: valorMensal,
        status: status,
        taxa_implantacao: taxaImplantacao,
        observacoes: observacoes
      };
      
      const { error } = await supabase
        .from("contratos")
        .update(contratoAtualizado)
        .eq("id", contratoId);
        
      if (error) {
        throw error;
      }
      
      // Atualizar o cliente com o ID do contrato se o status for ativo
      if (status === "ativo") {
        await supabase
          .from("clientes_sistema")
          .update({ contrato_id: contratoId })
          .eq("id", clienteId);
      }
      
      await loadContratos();
      return true;
    } catch (error) {
      console.error("Erro ao atualizar contrato:", error);
      return false;
    }
  };

  const deleteContrato = async (contratoId: string, clienteSistemaId: string) => {
    try {
      // Remover referência ao contrato no cliente
      await supabase
        .from("clientes_sistema")
        .update({ contrato_id: null })
        .eq("id", clienteSistemaId)
        .eq("contrato_id", contratoId);
      
      // Deletar o contrato
      const { error } = await supabase
        .from("contratos")
        .delete()
        .eq("id", contratoId);
        
      if (error) {
        throw error;
      }
      
      await loadContratos();
      return true;
    } catch (error) {
      console.error("Erro ao excluir contrato:", error);
      return false;
    }
  };

  useEffect(() => {
    loadContratos();
  }, []);

  // Helper function para adicionar meses a uma data
  function addMonths(date: Date, months: number): Date {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  }

  return {
    contratos,
    clientes,
    planos,
    loading,
    currentContrato,
    setCurrentContrato,
    loadContratos,
    addContrato,
    updateContrato,
    deleteContrato
  };
};
