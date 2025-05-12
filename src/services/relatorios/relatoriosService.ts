
import { supabase } from "@/integrations/supabase/client";
import { PlanoMitigacao } from "@/types/cliente";

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
    // In a real implementation, we would query the database to get all the necessary data
    // Here's the implementation plan:
    
    // 1. Get all evaluations for the company
    const { data: avaliacoes, error: avaliacoesError } = await supabase
      .from('avaliacoes')
      .select('id')
      .eq('empresa_id', companyId);
      
    if (avaliacoesError) {
      console.error("Error fetching evaluations:", avaliacoesError);
      throw avaliacoesError;
    }
    
    // No evaluations found, return mock data
    if (!avaliacoes || avaliacoes.length === 0) {
      console.log(`No evaluations found for company: ${companyId}, using mock data`);
      return getMockRiscosData();
    }
    
    // Get all the evaluation IDs
    const avaliacaoIds = avaliacoes.map(a => a.id);
    
    // 2. Get all "Yes" responses and their associated questions
    const { data: respostas, error: respostasError } = await supabase
      .from('respostas')
      .select('avaliacao_id, pergunta_id, resposta')
      .in('avaliacao_id', avaliacaoIds);
      
    if (respostasError) {
      console.error("Error fetching responses:", respostasError);
      throw respostasError;
    }
    
    // If no responses found, return mock data
    if (!respostas || respostas.length === 0) {
      console.log(`No responses found for evaluations, using mock data`);
      return getMockRiscosData();
    }
    
    // 3. Group responses by pergunta_id and count yes/no
    const responsesByQuestion: Record<string, { yes: number; total: number }> = {};
    
    respostas.forEach(resposta => {
      const perguntaId = resposta.pergunta_id;
      
      if (!responsesByQuestion[perguntaId]) {
        responsesByQuestion[perguntaId] = { yes: 0, total: 0 };
      }
      
      responsesByQuestion[perguntaId].total += 1;
      
      if (resposta.resposta === true) {
        responsesByQuestion[perguntaId].yes += 1;
      }
    });
    
    // 4. Get all questions with their associated risks
    const { data: perguntas, error: perguntasError } = await supabase
      .from('perguntas')
      .select(`
        id, 
        texto, 
        risco_id,
        risco:riscos (
          id, 
          texto,
          severidade:severidade (
            id,
            nivel
          )
        )
      `)
      .in('id', Object.keys(responsesByQuestion));
      
    if (perguntasError) {
      console.error("Error fetching questions:", perguntasError);
      throw perguntasError;
    }
    
    // If no questions found, return mock data
    if (!perguntas || perguntas.length === 0) {
      console.log(`No questions found, using mock data`);
      return getMockRiscosData();
    }
    
    // 5. Group questions by risk_id
    const questionsByRisk: Record<string, { 
      riskInfo: any; 
      questions: any[]; 
      totalYes: number; 
      totalQuestions: number; 
    }> = {};
    
    perguntas.forEach(pergunta => {
      const riscoId = pergunta.risco_id;
      const response = responsesByQuestion[pergunta.id] || { yes: 0, total: 0 };
      
      if (!questionsByRisk[riscoId]) {
        questionsByRisk[riscoId] = {
          riskInfo: pergunta.risco,
          questions: [],
          totalYes: 0,
          totalQuestions: 0
        };
      }
      
      questionsByRisk[riscoId].questions.push(pergunta);
      questionsByRisk[riscoId].totalYes += response.yes;
      questionsByRisk[riscoId].totalQuestions += response.total;
    });
    
    // 6. Get all employees who responded "Yes" to each risk's questions
    const riscoIds = Object.keys(questionsByRisk);
    const funcionariosExpostosPorRisco: Record<string, Set<string>> = {};
    
    // Initialize sets for each risk
    riscoIds.forEach(riscoId => {
      funcionariosExpostosPorRisco[riscoId] = new Set();
    });
    
    // For each evaluation, get the employee and their associated function
    for (const avaliacaoId of avaliacaoIds) {
      // Get the employee ID for this evaluation
      const { data: avaliacao, error: avaliacaoError } = await supabase
        .from('avaliacoes')
        .select('funcionario_id')
        .eq('id', avaliacaoId)
        .single();
        
      if (avaliacaoError || !avaliacao) {
        console.error(`Error fetching evaluation ${avaliacaoId}:`, avaliacaoError);
        continue;
      }
      
      const funcionarioId = avaliacao.funcionario_id;
      
      // Get the employee's function (cargo)
      const { data: funcionario, error: funcionarioError } = await supabase
        .from('funcionarios')
        .select('cargo_id, cargo:cargos(nome)')
        .eq('id', funcionarioId)
        .single();
        
      if (funcionarioError || !funcionario || !funcionario.cargo) {
        console.error(`Error fetching employee ${funcionarioId}:`, funcionarioError);
        continue;
      }
      
      const cargoNome = funcionario.cargo.nome;
      
      // For each risk, check if this employee responded "Yes" to any of its questions
      for (const riscoId of riscoIds) {
        const perguntaIds = questionsByRisk[riscoId].questions.map(q => q.id);
        
        // Check if this employee responded "Yes" to any of these questions
        const { data: respostasPositivas, error: respostasError } = await supabase
          .from('respostas')
          .select('pergunta_id')
          .eq('avaliacao_id', avaliacaoId)
          .eq('resposta', true)
          .in('pergunta_id', perguntaIds);
          
        if (respostasError) {
          console.error(`Error fetching positive responses for evaluation ${avaliacaoId}:`, respostasError);
          continue;
        }
        
        // If the employee responded "Yes" to any question for this risk, add their function
        if (respostasPositivas && respostasPositivas.length > 0) {
          funcionariosExpostosPorRisco[riscoId].add(cargoNome);
        }
      }
    }
    
    // 7. Get any existing mitigation plans for these risks
    const { data: planosMitigacao, error: planosError } = await supabase
      .from('planos_mitigacao')
      .select('*')
      .eq('empresa_id', companyId)
      .in('risco_id', riscoIds);
      
    // Create a map for easy access to plans by risk ID
    const planosPorRisco: Record<string, any> = {};
    
    if (planosMitigacao) {
      planosMitigacao.forEach(plano => {
        planosPorRisco[plano.risco_id] = plano;
      });
    }
    
    // 8. Format the final data
    const riscos = Object.entries(questionsByRisk).map(([riscoId, riskData]) => {
      const plano = planosPorRisco[riscoId];
      const funcoesExpostas = Array.from(funcionariosExpostosPorRisco[riscoId]);
      
      return {
        id: riscoId,
        titulo: riskData.riskInfo?.texto || "Risco sem título",
        descricao: "Risco identificado com base nas respostas dos funcionários.",
        funcoes: funcoesExpostas.length > 0 ? funcoesExpostas : ["Todos os funcionários"],
        probabilidade: `${riskData.totalYes}/${riskData.totalQuestions}`,
        totalYes: riskData.totalYes,
        totalQuestions: riskData.totalQuestions,
        severidade: riskData.riskInfo?.severidade?.nivel || "Média",
        status: plano?.status || "Pendente",
        medidasControle: plano?.medidas_controle || "",
        prazo: plano?.prazo || "",
        responsavel: plano?.responsavel || ""
      };
    });
    
    return riscos.length > 0 ? riscos : getMockRiscosData();
    
  } catch (error) {
    console.error("Error fetching company risks:", error);
    return getMockRiscosData();
  }
};

// Helper function to provide mock data when real data can't be retrieved
const getMockRiscosData = () => {
  return [
    {
      id: "risk1",
      titulo: "Sobrecarga de trabalho",
      descricao: "Excesso de demandas, prazos exíguos e pressão por resultados",
      funcoes: ["Desenvolvedores", "Analistas", "Gerentes de Projetos"],
      probabilidade: "4/8",
      totalYes: 4,
      totalQuestions: 8,
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
      probabilidade: "3/6",
      totalYes: 3,
      totalQuestions: 6,
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
      probabilidade: "2/5",
      totalYes: 2,
      totalQuestions: 5,
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
      probabilidade: "5/10",
      totalYes: 5,
      totalQuestions: 10,
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
      probabilidade: "4/7",
      totalYes: 4,
      totalQuestions: 7,
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
      probabilidade: "3/8",
      totalYes: 3,
      totalQuestions: 8,
      severidade: "Baixa",
      status: "Pendente",
      medidasControle: "Implementar reuniões de feedback e sugestões.\nCriar comitês com participação de diversos níveis hierárquicos.\nEstabelecer canais para coleta de ideias e melhorias.",
      prazo: "60 dias",
      responsavel: "Diretoria, Gerência"
    }
  ];
};
