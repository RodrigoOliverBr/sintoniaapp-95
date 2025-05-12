
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
    // In a real implementation, we would query the planos_mitigacao table
    // const { data, error } = await supabase
    //   .from('planos_mitigacao')
    //   .select('status, count')
    //   .eq('empresa_id', companyId)
    //   .then((result) => {
    //     // Process the counts by status
    //   });
    
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
 * @param companyId The ID of the company
 * @returns Array of risk data objects
 */
export const getRiscosPorEmpresa = async (companyId: string) => {
  try {
    // In a real implementation, we would:
    // 1. Get all evaluations for the company
    // 2. Get all "Yes" responses and their associated questions
    // 3. Get all risks associated with those questions
    // 4. Get any existing mitigation plans for those risks
    
    // Example of the query that would be used:
    // const { data: avaliacoes, error: avaliacoesError } = await supabase
    //   .from('avaliacoes')
    //   .select('id')
    //   .eq('empresa_id', companyId);
    //
    // if (avaliacoesError) throw avaliacoesError;
    //
    // const avaliacaoIds = avaliacoes.map(a => a.id);
    //
    // const { data: respostas, error: respostasError } = await supabase
    //   .from('respostas')
    //   .select('pergunta_id')
    //   .in('avaliacao_id', avaliacaoIds)
    //   .eq('resposta', true);
    //
    // if (respostasError) throw respostasError;
    //
    // // Get unique pergunta_ids where the answer was "Yes"
    // const perguntaIds = [...new Set(respostas.map(r => r.pergunta_id))];
    //
    // const { data: perguntas, error: perguntasError } = await supabase
    //   .from('perguntas')
    //   .select('risco_id')
    //   .in('id', perguntaIds);
    //
    // if (perguntasError) throw perguntasError;
    //
    // // Get unique risco_ids associated with "Yes" answers
    // const riscoIds = [...new Set(perguntas.map(p => p.risco_id))];
    //
    // // Get riscos with their severidade
    // const { data: riscos, error: riscosError } = await supabase
    //   .from('riscos')
    //   .select('*, severidade(*)')
    //   .in('id', riscoIds);
    //
    // if (riscosError) throw riscosError;
    //
    // // Get any existing mitigation plans
    // const { data: planos, error: planosError } = await supabase
    //   .from('planos_mitigacao')
    //   .select('*')
    //   .eq('empresa_id', companyId)
    //   .in('risco_id', riscoIds);
    //
    // const formattedRiscos = riscos.map(risco => {
    //   // Find any existing mitigation plan for this risk
    //   const plano = planos?.find(p => p.risco_id === risco.id);
    //
    //   return {
    //     id: risco.id,
    //     titulo: risco.texto,
    //     descricao: "Descrição detalhada do risco identificado na avaliação.",
    //     funcoes: ["Todos os funcionários"],  // Would need additional data to specify
    //     probabilidade: "Média",
    //     severidade: risco.severidade.nome || "Média", 
    //     status: plano?.status || "Pendente",
    //     medidasControle: plano?.medidas_controle || "",
    //     prazo: plano?.prazo || "",
    //     responsavel: plano?.responsavel || ""
    //   };
    // });
    
    console.log(`Fetching risks for company: ${companyId}`);
    
    // For testing, return a larger set of mock risks to better match real data
    return [
      {
        id: "risk1",
        titulo: "Sobrecarga de trabalho",
        descricao: "Excesso de demandas, prazos exíguos e pressão por resultados",
        funcoes: ["Desenvolvedores", "Analistas", "Gerentes de Projetos"],
        probabilidade: "Alta",
        severidade: "Média", 
        status: "Pendente",
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
        status: "Pendente",
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
      },
      {
        id: "risk4",
        titulo: "Problemas de Comunicação",
        descricao: "Falhas nos processos de comunicação entre setores e níveis hierárquicos",
        funcoes: ["Todos os Setores"],
        probabilidade: "Alta",
        severidade: "Média",
        status: "Pendente",
        medidasControle: "Implementar canais de comunicação mais eficientes.\nRealizar reuniões periódicas entre departamentos.\nEstabelecer protocolos claros para comunicação interna.",
        prazo: "30 dias",
        responsavel: "Gerência, Comunicação Interna"
      },
      {
        id: "risk5",
        titulo: "Conflitos Interpessoais",
        descricao: "Desentendimentos recorrentes entre membros da equipe que prejudicam o ambiente de trabalho",
        funcoes: ["Comercial", "Atendimento", "TI"],
        probabilidade: "Média",
        severidade: "Média",
        status: "Pendente",
        medidasControle: "Oferecer treinamento em resolução de conflitos.\nImplementar mediação quando necessário.\nPromover atividades de integração entre equipes.",
        prazo: "45 dias",
        responsavel: "RH, Líderes de Equipe"
      },
      {
        id: "risk6",
        titulo: "Falta de Participação nas Decisões",
        descricao: "Empregados sem voz ativa nos processos decisórios que afetam seu trabalho",
        funcoes: ["Operacional", "Administrativo"],
        probabilidade: "Média",
        severidade: "Baixa",
        status: "Pendente",
        medidasControle: "Implementar reuniões de feedback e sugestões.\nCriar comitês com participação de diversos níveis hierárquicos.\nEstabelecer canais para coleta de ideias e melhorias.",
        prazo: "60 dias",
        responsavel: "Diretoria, Gerência"
      }
    ];
  } catch (error) {
    console.error("Error fetching company risks:", error);
    throw new Error("Falha ao buscar riscos da empresa");
  }
};
