
import { useState, useEffect } from "react";
import { ClienteSistema, Contrato, Plano, StatusContrato, ClienteStatus } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useContratos = () => {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [clientes, setClientes] = useState<ClienteSistema[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
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
      const formattedContratos = contratosData?.map(contrato => ({
        id: contrato.id,
        numero: contrato.numero,
        clienteId: contrato.cliente_id,
        clienteSistemaId: contrato.cliente_sistema_id,
        planoId: contrato.plano_id,
        dataInicio: contrato.data_inicio,
        dataFim: contrato.data_fim,
        dataPrimeiroVencimento: contrato.data_primeiro_vencimento,
        status: contrato.status as StatusContrato,
        valorMensal: Number(contrato.valor_mensal),
        taxaImplantacao: Number(contrato.taxa_implantacao || 0),
        observacoes: contrato.observacoes || "",
        cicloFaturamento: contrato.ciclo_faturamento,
        proximaRenovacao: contrato.proxima_renovacao,
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
      const formattedClientes = clientesData?.map(cliente => ({
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

  useEffect(() => {
    loadContratos();
  }, []);

  return {
    contratos,
    clientes,
    planos,
    loading,
    loadContratos
  };
};
