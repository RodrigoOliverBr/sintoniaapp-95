import { FormData, SeverityLevel } from "@/types/form";

// Export formSections directly for use in components
export const formSections = [
  {
    title: "Demandas Psicológicas",
    description: "Avalie os últimos 14 dias (últimas duas semanas)",
    questions: ["1", "2", "3", "4"]
  },
  {
    title: "Organização e Gestão do Trabalho",
    description: "Avalie os últimos 14 dias (últimas duas semanas)",
    questions: ["5", "6", "7"]
  },
  {
    title: "Trabalho Ativo e Desenvolvimento de Competências",
    description: "Avalie os últimos 14 dias (últimas duas semanas)",
    questions: ["8", "9", "10"]
  },
  {
    title: "Apoio Social e Qualidade da Liderança",
    description: "Avalie os últimos 14 dias (últimas duas semanas)",
    questions: ["11", "12", "13", "14"]
  },
  {
    title: "Compensação e Reconhecimento",
    description: "Avalie os últimos 28 dias (últimas quatro semanas)",
    questions: ["15", "16", "17"]
  },
  {
    title: "Dupla Presença: Conflito Trabalho-Casa",
    description: "Avalie os últimos 14 dias (últimas duas semanas)",
    questions: ["18"]
  },
  {
    title: "Assédio Moral e Sexual",
    description: "Avalie os últimos 14 dias (últimas duas semanas)",
    questions: ["19", "20"]
  }
];

// Create a formQuestions map for easier access from FormularioPage
export const formQuestions = formSections.reduce((acc, section) => {
  section.questions.forEach(questionId => {
    acc[questionId] = true;
  });
  return acc;
}, {} as Record<string, boolean>);

export const formData: FormData = {
  sections: [
    {
      title: "Demandas Psicológicas",
      description: "Avalie os últimos 14 dias (últimas duas semanas)",
      questions: [
        {
          id: "1",
          risk: "Pressão por Metas e Produtividade",
          text: "Você se sentiu frequentemente pressionado para cumprir prazos ou metas que considera difíceis ou impossíveis?",
          severity: "PREJUDICIAL",
          mitigationActions: [
            "Reavaliar as metas e prazos definidos, ajustando-os para níveis alcançáveis.",
            "Oferecer suporte direto por meio de reuniões periódicas para acompanhamento e esclarecimento de expectativas.",
            "Disponibilizar recursos adicionais ou treinamento específico para melhorar a gestão do tempo e das atividades."
          ]
        },
        {
          id: "2",
          risk: "Ansiedade por Decisões Complexas",
          text: "Nas últimas duas semanas, você precisou tomar decisões complexas que lhe causaram ansiedade ou preocupação excessiva durante suas tarefas?",
          severity: "LEVEMENTE PREJUDICIAL",
          mitigationActions: [
            "Oferecer treinamento específico ou orientações práticas sobre como lidar com decisões complexas.",
            "Proporcionar suporte emocional ou aconselhamento psicológico disponível para situações que geram ansiedade.",
            "Realizar reuniões periódicas para revisar e simplificar processos decisórios complexos."
          ]
        },
        {
          id: "3",
          risk: "Interrupções e Interferências no Trabalho",
          text: "Sua atenção ficou prejudicada por exigências contínuas ou interrupções frequentes e injustificadas realizadas por um superior no trabalho?",
          severity: "PREJUDICIAL",
          mitigationActions: [
            "Definir horários específicos para comunicação ou reuniões com a chefia, reduzindo interrupções injustificadas.",
            "Proporcionar treinamento aos líderes sobre gestão eficaz e comunicação assertiva.",
            "Estabelecer procedimentos claros para que interrupções ocorram somente em situações necessárias ou emergenciais."
          ]
        },
        {
          id: "4",
          risk: "Repressão Emocional no Ambiente de Trabalho",
          text: "Precisou esconder ou reprimir suas emoções por exigência direta ou indireta da chefia?",
          severity: "PREJUDICIAL",
          mitigationActions: [
            "Promover treinamentos para líderes sobre gestão emocional e comunicação empática.",
            "Criar canais seguros e confidenciais para comunicação sobre insatisfações ou desconfortos emocionais.",
            "Incentivar reuniões periódicas para avaliar o ambiente emocional da equipe e identificar pontos críticos para intervenção."
          ]
        }
      ]
    },
    {
      title: "Organização e Gestão do Trabalho",
      description: "Avalie os últimos 14 dias (últimas duas semanas)",
      questions: [
        {
          id: "5",
          risk: "Sobrecarga de Trabalho sem Aviso Prévio",
          text: "Precisou realizar horas extras ou jornadas mais longas do que o combinado inicialmente sem aviso prévio adequado, de forma a se sentir lesado, prejudicado ou agredido?",
          severity: "LEVEMENTE PREJUDICIAL",
          mitigationActions: [
            "Estabelecer políticas claras sobre realização e comunicação antecipada de horas extras.",
            "Implementar controle rigoroso sobre jornada de trabalho, garantindo a comunicação prévia adequada.",
            "Disponibilizar canais confidenciais para reportar abusos ou irregularidades relacionadas à jornada de trabalho."
          ]
        },
        {
          id: "6",
          risk: "Imposição de Mudanças de Turno",
          text: "Precisou alterar seu turno repentinamente, após ter solicitado expressamente ao superior que não fizesse essa mudança, e acabou cedendo por insistência dele, afetando negativamente sua rotina familiar ou descanso?",
          severity: "PREJUDICIAL",
          mitigationActions: [
            "Estabelecer e respeitar políticas claras sobre mudanças de turno com antecedência mínima obrigatória.",
            "Capacitar gestores para gestão consciente da equipe e compreensão das implicações das mudanças inesperadas.",
            "Disponibilizar canais claros e seguros para reporte de abusos ou situações em que acordos pré-estabelecidos sejam descumpridos."
          ]
        },
        {
          id: "7",
          risk: "Falta de Clareza nas Atribuições",
          text: "Você pediu mais orientações ao seu superior sobre suas responsabilidades e atribuições e não as recebeu adequadamente nas últimas duas semanas?",
          severity: "LEVEMENTE PREJUDICIAL",
          mitigationActions: [
            "Definir claramente as responsabilidades e atribuições através de documentação ou reuniões periódicas.",
            "Oferecer treinamento regular sobre funções e expectativas relacionadas a cada cargo.",
            "Criar canais diretos e eficientes para esclarecer dúvidas ou solicitar orientações adicionais."
          ]
        }
      ]
    },
    {
      title: "Trabalho Ativo e Desenvolvimento de Competências",
      description: "Avalie os últimos 14 dias (últimas duas semanas)",
      questions: [
        {
          id: "8",
          risk: "Limitação da Expressão e Participação",
          text: "Sentiu falta de oportunidade para expressar opiniões ou sugestões sobre como realizar suas atividades?",
          severity: "LEVEMENTE PREJUDICIAL",
          mitigationActions: [
            "Promover reuniões periódicas para ouvir sugestões e opiniões da equipe sobre processos de trabalho.",
            "Implementar canais seguros e acessíveis para sugestões anônimas ou diretas.",
            "Treinar gestores para incentivar a participação ativa e valorização das contribuições dos funcionários."
          ]
        },
        {
          id: "9",
          risk: "Sobrecarga e Falta de Pausas Adequadas",
          text: "Percebeu que não teve tempo suficiente para realizar pausas adequadas durante a jornada de trabalho?",
          severity: "PREJUDICIAL",
          mitigationActions: [
            "Revisar e reorganizar horários de trabalho, assegurando pausas periódicas adequadas.",
            "Promover treinamentos de conscientização para gestores sobre a importância das pausas para saúde e produtividade.",
            "Implementar mecanismos de monitoramento para garantir o cumprimento dos horários de descanso previstos."
          ]
        },
        {
          id: "10",
          risk: "Restrição de Inovação e Melhoria Contínua",
          text: "Você tentou realizar alguma tarefa que sua função exigia de forma mais eficiente ou aprimorada do que foi solicitado, mas não foi autorizado pelo superior nas últimas duas semanas?",
          severity: "LEVEMENTE PREJUDICIAL",
          mitigationActions: [
            "Estabelecer um ambiente aberto à inovação e sugestões dos funcionários.",
            "Capacitar gestores para reconhecer e valorizar iniciativas que busquem melhoria contínua.",
            "Criar procedimentos claros para avaliação e feedback sobre propostas e sugestões feitas pelos funcionários."
          ]
        }
      ]
    },
    {
      title: "Apoio Social e Qualidade da Liderança",
      description: "Avalie os últimos 14 dias (últimas duas semanas)",
      questions: [
        {
          id: "11",
          risk: "Desrespeito e Desvalorização Profissional",
          text: "Alguma expressão ou atitude do seu superior fez você se sentir desrespeitado ou desvalorizado nas últimas duas semanas?",
          severity: "PREJUDICIAL",
          mitigationActions: [
            "Realizar treinamento regular para líderes sobre comunicação não violenta e respeito interpessoal.",
            "Criar um canal confidencial para relatos e denúncias de desrespeito ou desvalorização.",
            "Implementar reuniões periódicas para acompanhamento e feedback construtivo entre superiores e funcionários."
          ],
          options: [
            { label: "Comentários humilhantes ou depreciativos", value: "comentarios_humilhantes" },
            { label: "Gritos ou alteração do tom de voz de forma desrespeitosa", value: "gritos" },
            { label: "Desconsideração ou interrupção frequente quando você estava falando", value: "desconsideracao" },
            { label: "Ignorar ou minimizar suas contribuições ou esforços", value: "ignorar" },
            { label: "Outro", value: "outro" }
          ],
          showObservation: true
        },
        {
          id: "12",
          risk: "Falta de Suporte da Liderança",
          text: "Pediu apoio ou esclarecimento ao superior direto e não foi atendido adequadamente?",
          severity: "LEVEMENTE PREJUDICIAL",
          mitigationActions: [
            "Estabelecer canais diretos e efetivos de comunicação entre funcionários e superiores.",
            "Realizar treinamentos para líderes sobre comunicação eficaz e suporte adequado à equipe.",
            "Implementar sistema de acompanhamento de solicitações de apoio para garantir atendimento adequado."
          ]
        },
        {
          id: "13",
          risk: "Gestão Inadequada de Conflitos",
          text: "Presenciou ou sofreu conflito no trabalho sem que seu superior imediato tomasse providências adequadas?",
          severity: "PREJUDICIAL",
          mitigationActions: [
            "Capacitar gestores em técnicas de mediação e resolução de conflitos.",
            "Criar um protocolo claro e rápido para intervenção imediata em conflitos relatados.",
            "Implementar canais seguros e confidenciais para relatar conflitos não resolvidos adequadamente pelos superiores."
          ]
        },
        {
          id: "14",
          risk: "Isolamento e Falta de Apoio Social",
          text: "Sentiu-se isolado ou pouco apoiado por colegas?",
          severity: "LEVEMENTE PREJUDICIAL",
          mitigationActions: [
            "Incentivar a realização de atividades de integração e fortalecimento das relações interpessoais.",
            "Criar canais seguros para comunicação de sentimentos de isolamento ou falta de apoio.",
            "Oferecer treinamento e suporte aos gestores para melhorar a identificação e a intervenção precoce em casos de isolamento social."
          ]
        }
      ]
    },
    {
      title: "Compensação e Reconhecimento",
      description: "Avalie os últimos 28 dias (últimas quatro semanas)",
      questions: [
        {
          id: "15",
          risk: "Ameaças à Estabilidade no Trabalho",
          text: "Ouviu ameaças ou expressões explícitas do superior sugerindo risco de demissão, mesmo você realizando adequadamente suas tarefas nas últimas quatro semanas?",
          severity: "PREJUDICIAL",
          mitigationActions: [
            "Realizar investigação imediata e cuidadosa sobre a conduta do superior envolvido.",
            "Oferecer suporte psicológico imediato à vítima.",
            "Capacitar líderes sobre técnicas apropriadas de comunicação e gestão de desempenho, garantindo clareza e respeito nas interações."
          ]
        },
        {
          id: "16",
          risk: "Mudanças Forçadas de Alocação",
          text: "Seu superior sugeriu ou comentou sobre possível transferência contra sua vontade?",
          severity: "LEVEMENTE PREJUDICIAL",
          mitigationActions: [
            "Estabelecer uma política transparente sobre transferências internas, com critérios claros e comunicação antecipada.",
            "Promover diálogo aberto e respeitoso entre funcionários e superiores sobre eventuais mudanças de função ou departamento.",
            "Oferecer suporte psicológico ou aconselhamento profissional em situações que causem insegurança ou desconforto aos colaboradores."
          ]
        },
        {
          id: "17",
          risk: "Falta de Reconhecimento Profissional",
          text: "Percebeu falta de reconhecimento verbal ou prático pelo trabalho realizado corretamente?",
          severity: "LEVEMENTE PREJUDICIAL",
          mitigationActions: [
            "Incentivar gestores a fornecer reconhecimento regular através de feedback positivo e construtivo.",
            "Implementar programas formais de reconhecimento por desempenho e contribuições destacadas.",
            "Realizar treinamentos com líderes sobre a importância e técnicas eficazes de valorização das equipes."
          ]
        }
      ]
    },
    {
      title: "Dupla Presença: Conflito Trabalho-Casa",
      description: "Avalie os últimos 14 dias (últimas duas semanas)",
      questions: [
        {
          id: "18",
          risk: "Interferência Trabalho-Família",
          text: "Nas últimas duas semanas, o empregador exigiu de forma impositiva que você realizasse tarefas profissionais em casa, ou descumpriu um combinado previamente acordado, como solicitar sua presença no trabalho em dias previamente informados como folga por motivos importantes (situações médicas, cuidados com filhos ou familiares doentes), causando prejuízo ou conflito entre trabalho e demandas familiares?",
          severity: "PREJUDICIAL",
          mitigationActions: [
            "Estabelecer políticas claras sobre a separação entre responsabilidades profissionais e tempo pessoal/familiar.",
            "Promover treinamentos para gestores sobre a importância de respeitar acordos prévios e as necessidades pessoais dos funcionários.",
            "Implementar canais eficazes para que os colaboradores possam comunicar situações de conflito ou quebra de acordos pelo empregador."
          ]
        }
      ]
    },
    {
      title: "Assédio Moral e Sexual",
      description: "Avalie os últimos 14 dias (últimas duas semanas)",
      questions: [
        {
          id: "19",
          risk: "Assédio Sexual",
          text: "Você sofreu ou presenciou alguma situação de assédio sexual dentro da empresa, como insinuações, toques indesejados ou comentários ofensivos com conotação sexual por parte de colegas ou superiores?",
          severity: "EXTREMAMENTE PREJUDICIAL",
          mitigationActions: [
            "Desligamento imediato do agressor da empresa após investigação e confirmação da denúncia.",
            "Oferecimento de suporte psicológico imediato e contínuo à vítima.",
            "Implementação urgente de treinamentos sobre prevenção e identificação do assédio sexual para todos os funcionários."
          ],
          showObservation: true
        },
        {
          id: "20",
          risk: "Assédio Moral",
          text: "Você sofreu ou presenciou situação de assédio moral dentro da empresa nas últimas duas semanas?",
          severity: "EXTREMAMENTE PREJUDICIAL",
          mitigationActions: [
            "Criar um canal confidencial e seguro para denúncias de assédio moral.",
            "Oferecer suporte psicológico imediato e contínuo às vítimas.",
            "Realizar treinamentos periódicos obrigatórios para todos os funcionários sobre prevenção e combate ao assédio moral."
          ],
          options: [
            { label: "Humilhações ou comentários depreciativos", value: "humilhacoes" },
            { label: "Ameaças explícitas ou implícitas", value: "ameacas" },
            { label: "Exclusão social ou isolamento intencional", value: "exclusao" },
            { label: "Constrangimento em público", value: "constrangimento" },
            { label: "Ataques à dignidade pessoal", value: "ataques" },
            { label: "Outro", value: "outro" }
          ],
          showObservation: true
        }
      ]
    }
  ]
};
