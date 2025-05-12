
import { supabase } from "@/integrations/supabase/client";

export interface AreaCriticaData {
  area: string;
  total: number;
}

/**
 * Fetches the ranking of critical areas for a company
 * @param companyId The ID of the company
 * @returns Promise with the ranking data
 */
export const getRankingAreasCriticas = async (companyId: string): Promise<AreaCriticaData[]> => {
  try {
    // This is a placeholder implementation
    // In a real scenario, you would fetch this data from the database
    
    // Example query that would be used in a real implementation:
    // const { data, error } = await supabase
    //   .from('avaliacoes')
    //   .select('respostas(pergunta_id, resposta)')
    //   .eq('empresa_id', companyId);
    
    console.log(`Fetching critical areas for company: ${companyId}`);
    
    // For now, return mock data
    return [
      { area: "Sobrecarga de Trabalho", total: 12 },
      { area: "Falta de Clareza em Atribuições", total: 8 },
      { area: "Desrespeito/Desvalorização", total: 5 },
      { area: "Conflitos Interpessoais", total: 4 },
      { area: "Problemas de Comunicação", total: 3 }
    ];
  } catch (error) {
    console.error("Error fetching critical areas ranking:", error);
    throw new Error("Falha ao buscar ranking de áreas críticas");
  }
};

/**
 * Fetches status data for risks management
 * @param companyId The ID of the company
 * @returns Promise with the status data
 */
export const getStatusImplementacao = async (companyId: string) => {
  try {
    // Mock data for implementation status
    return {
      pendentes: 3,
      emAndamento: 5,
      concluidos: 2,
      total: 10
    };
  } catch (error) {
    console.error("Error fetching implementation status:", error);
    throw new Error("Falha ao buscar status de implementação");
  }
};

/**
 * Gets risk data for a specific company
 */
export const getRiscosPorEmpresa = async (companyId: string) => {
  try {
    // This would be a real query in a production environment
    console.log(`Fetching risks for company: ${companyId}`);
    
    // Mock data - in a real app this would come from the database
    return [
      {
        id: "risk1",
        titulo: "Sobrecarga de trabalho",
        descricao: "Excesso de demandas, prazos exíguos e pressão por resultados",
        funcoes: ["Desenvolvedores", "Analistas", "Gerentes de Projetos"],
        probabilidade: "Alta",
        severidade: "Média", 
        status: "Implementando",
        medidasControle: "Revisão de processos e carga de trabalho. Distribuição equilibrada de tarefas.\nContratação de pessoal adicional.\nTreinamento em gestão do tempo.",
        prazo: "30 dias",
        responsavel: "RH, Gerência"
      },
      {
        id: "risk2",
        titulo: "Falta de Clareza nas Atribuições",
        descricao: "Empregados sem orientações claras sobre suas responsabilidades e atribuições",
        funcoes: ["Administrativo", "Suporte", "Novos Funcionários"],
        probabilidade: "Média",
        severidade: "Baixa",
        status: "Monitorando",
        medidasControle: "Definir claramente as responsabilidades e atribuições através de documentação.\nOferecer treinamento regular sobre funções e expectativas relacionadas a cada cargo.\nCriar canais diretos para esclarecer dúvidas ou solicitar orientações adicionais.",
        prazo: "60 dias",
        responsavel: "Gerência de RH, Departamento Jurídico"
      },
      {
        id: "risk3",
        titulo: "Desrespeito e Desvalorização Profissional",
        descricao: "Expressões ou atitudes que fazem os empregados se sentirem desrespeitados ou desvalorizados",
        funcoes: ["Atendimento", "Operacional", "Suporte"],
        probabilidade: "Média",
        severidade: "Média",
        status: "Pendente",
        medidasControle: "Implementar programa de reconhecimento e valorização.\nTreinar gestores em feedback construtivo.\nEstabelecer canais seguros para reportar situações de desrespeito.",
        prazo: "45 dias",
        responsavel: "Comitê de Ética, RH"
      }
    ];
  } catch (error) {
    console.error("Error fetching company risks:", error);
    throw new Error("Falha ao buscar riscos da empresa");
  }
};
