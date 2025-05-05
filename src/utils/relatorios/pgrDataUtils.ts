
import { Question } from "@/types/form";

interface RiskAnalysis {
  probability: string;
  severity: string;
  status: string;
}

interface PGRSection {
  title: string;
  description?: string;
  questions: Question[];
  riskAnalysis?: RiskAnalysis;
  controlMeasures?: string;
  implementationDeadline?: string;
  responsible?: string;
}

// Utility function to generate PGR data structure from questions and answers
export const generatePGRData = (questions: Question[], answers: Record<string, any>): PGRSection[] => {
  // Group questions by risk category
  const riskCategories: Record<string, Question[]> = {};
  
  questions.forEach(question => {
    const riskId = question.risco_id;
    if (!riskCategories[riskId]) {
      riskCategories[riskId] = [];
    }
    riskCategories[riskId].push(question);
  });
  
  // Generate a PGR section for each risk category
  const sections: PGRSection[] = Object.entries(riskCategories).map(([riskId, riskQuestions], index) => {
    // Determine risk severity based on proportion of 'yes' answers
    const totalQuestions = riskQuestions.length;
    let yesCount = 0;
    
    riskQuestions.forEach(question => {
      if (answers[question.id] === true) {
        yesCount++;
      }
    });
    
    const yesPercentage = totalQuestions > 0 ? (yesCount / totalQuestions) * 100 : 0;
    
    // Determine risk status based on yes percentage
    let status = "Baixo";
    let severity = "Baixa";
    let probability = "Baixa";
    
    if (yesPercentage >= 75) {
      status = "Crítico";
      severity = "Alta";
      probability = "Alta";
    } else if (yesPercentage >= 50) {
      status = "Moderado";
      severity = "Média";
      probability = "Média";
    } else if (yesPercentage >= 25) {
      status = "Tolerável";
      severity = "Baixa";
      probability = "Média";
    }
    
    // Generate sample risk titles based on index
    const riskTitles = [
      "Riscos Organizacionais",
      "Excesso de Demandas",
      "Relacionamento Interpessoal",
      "Condições de Trabalho",
      "Suporte Social",
      "Autonomia e Controle",
      "Conflito Trabalho-Família"
    ];
    
    // Generate sample risk descriptions
    const riskDescriptions = [
      "Fatores relacionados à estrutura organizacional que podem impactar a saúde mental dos colaboradores.",
      "Carga de trabalho excessiva e pressão por resultados que podem levar ao esgotamento profissional.",
      "Aspectos da interação social no ambiente de trabalho que podem gerar estresse ou conflitos.",
      "Elementos físicos e ambientais que afetam o bem-estar no trabalho.",
      "Nível de apoio recebido de colegas e supervisores para lidar com demandas do trabalho.",
      "Grau de controle que o trabalhador tem sobre suas atividades e decisões no trabalho.",
      "Interferência das demandas profissionais na vida pessoal e familiar."
    ];
    
    // Generate sample control measures
    const controlMeasureOptions = [
      "Implementar programa de gestão de estresse e bem-estar. Realizar avaliações periódicas de clima organizacional.",
      "Revisar distribuição de tarefas e prazos. Implementar pausas programadas durante o expediente.",
      "Promover treinamentos em comunicação não-violenta e gestão de conflitos. Criar canais de diálogo.",
      "Adequar mobiliário e equipamentos ergonômicos. Melhorar condições ambientais (iluminação, ruído, temperatura).",
      "Desenvolver programas de mentoria e apoio entre pares. Capacitar líderes em suporte emocional.",
      "Revisar processos decisórios para incluir participação dos colaboradores. Permitir flexibilidade na organização do trabalho.",
      "Implementar políticas de equilíbrio trabalho-vida e flexibilidade de horários. Respeitar períodos de descanso."
    ];
    
    // Generate sample deadlines and responsible parties
    const implementationDeadlines = ["30 dias", "60 dias", "90 dias", "120 dias", "180 dias"];
    const responsibleOptions = [
      "Equipe de Saúde Ocupacional",
      "Recursos Humanos e Gestores",
      "Comitê de Bem-Estar",
      "Gestores Diretos",
      "SESMT e RH"
    ];
    
    return {
      title: riskTitles[index % riskTitles.length],
      description: riskDescriptions[index % riskDescriptions.length],
      questions: riskQuestions,
      riskAnalysis: {
        probability,
        severity,
        status
      },
      controlMeasures: controlMeasureOptions[index % controlMeasureOptions.length],
      implementationDeadline: implementationDeadlines[index % implementationDeadlines.length],
      responsible: responsibleOptions[index % responsibleOptions.length]
    };
  });
  
  return sections;
};
