import { FormData } from "@/types/form";

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
          text: "Você se sentiu frequentemente pressionado para cumprir prazos ou metas que considera difíceis ou impossíveis?",
          severity: "PREJUDICIAL"
        },
        {
          id: "2",
          text: "Nas últimas duas semanas, você precisou tomar decisões complexas que lhe causaram ansiedade ou preocupação excessiva durante suas tarefas?",
          severity: "LEVEMENTE PREJUDICIAL"
        },
        {
          id: "3",
          text: "Sua atenção ficou prejudicada por exigências contínuas ou interrupções frequentes e injustificadas realizadas por um superior no trabalho?",
          severity: "PREJUDICIAL"
        },
        {
          id: "4",
          text: "Precisou esconder ou reprimir suas emoções por exigência direta ou indireta da chefia?",
          severity: "PREJUDICIAL"
        }
      ]
    },
    {
      title: "Organização e Gestão do Trabalho",
      description: "Avalie os últimos 14 dias (últimas duas semanas)",
      questions: [
        {
          id: "5",
          text: "Precisou realizar horas extras ou jornadas mais longas do que o combinado inicialmente sem aviso prévio adequado, de forma a se sentir lesado, prejudicado ou agredido?",
          severity: "LEVEMENTE PREJUDICIAL"
        },
        {
          id: "6",
          text: "Precisou alterar seu turno repentinamente, após ter solicitado expressamente ao superior que não fizesse essa mudança, e acabou cedendo por insistência dele, afetando negativamente sua rotina familiar ou descanso?",
          severity: "PREJUDICIAL"
        },
        {
          id: "7",
          text: "Você pediu mais orientações ao seu superior sobre suas responsabilidades e atribuições e não as recebeu adequadamente nas últimas duas semanas?",
          severity: "LEVEMENTE PREJUDICIAL"
        }
      ]
    },
    {
      title: "Trabalho Ativo e Desenvolvimento de Competências",
      description: "Avalie os últimos 14 dias (últimas duas semanas)",
      questions: [
        {
          id: "8",
          text: "Sentiu falta de oportunidade para expressar opiniões ou sugestões sobre como realizar suas atividades?",
          severity: "LEVEMENTE PREJUDICIAL"
        },
        {
          id: "9",
          text: "Percebeu que não teve tempo suficiente para realizar pausas adequadas durante a jornada de trabalho?",
          severity: "PREJUDICIAL"
        },
        {
          id: "10",
          text: "Você tentou realizar alguma tarefa que sua função exigia de forma mais eficiente ou aprimorada do que foi solicitado, mas não foi autorizado pelo superior nas últimas duas semanas?",
          severity: "LEVEMENTE PREJUDICIAL"
        }
      ]
    },
    {
      title: "Apoio Social e Qualidade da Liderança",
      description: "Avalie os últimos 14 dias (últimas duas semanas)",
      questions: [
        {
          id: "11",
          text: "Alguma expressão ou atitude do seu superior fez você se sentir desrespeitado ou desvalorizado nas últimas duas semanas?",
          severity: "PREJUDICIAL"
        },
        {
          id: "12",
          text: "Pediu apoio ou esclarecimento ao superior direto e não foi atendido adequadamente?",
          severity: "LEVEMENTE PREJUDICIAL"
        },
        {
          id: "13",
          text: "Presenciou ou sofreu conflito no trabalho sem que seu superior imediato tomasse providências adequadas?",
          severity: "PREJUDICIAL"
        },
        {
          id: "14",
          text: "Sentiu-se isolado ou pouco apoiado por colegas?",
          severity: "LEVEMENTE PREJUDICIAL"
        }
      ]
    },
    {
      title: "Compensação e Reconhecimento",
      description: "Avalie os últimos 28 dias (últimas quatro semanas)",
      questions: [
        {
          id: "15",
          text: "Ouviu ameaças ou expressões explícitas do superior sugerindo risco de demissão, mesmo você realizando adequadamente suas tarefas nas últimas quatro semanas?",
          severity: "PREJUDICIAL"
        },
        {
          id: "16",
          text: "Seu superior sugeriu ou comentou sobre possível transferência contra sua vontade?",
          severity: "LEVEMENTE PREJUDICIAL"
        },
        {
          id: "17",
          text: "Percebeu falta de reconhecimento verbal ou prático pelo trabalho realizado corretamente?",
          severity: "LEVEMENTE PREJUDICIAL"
        }
      ]
    },
    {
      title: "Dupla Presença: Conflito Trabalho-Casa",
      description: "Avalie os últimos 14 dias (últimas duas semanas)",
      questions: [
        {
          id: "18",
          text: "Nas últimas duas semanas, o empregador exigiu de forma impositiva que você realizasse tarefas profissionais em casa, ou descumpriu um combinado previamente acordado, como solicitar sua presença no trabalho em dias previamente informados como folga por motivos importantes (situações médicas, cuidados com filhos ou familiares doentes), causando prejuízo ou conflito entre trabalho e demandas familiares?",
          severity: "PREJUDICIAL"
        }
      ]
    },
    {
      title: "Assédio Moral e Sexual",
      description: "Avalie os últimos 14 dias (últimas duas semanas)",
      questions: [
        {
          id: "19",
          text: "Você sofreu ou presenciou alguma situação de assédio sexual dentro da empresa, como insinuações, toques indesejados ou comentários ofensivos com conotação sexual por parte de colegas ou superiores?",
          severity: "EXTREMAMENTE PREJUDICIAL"
        },
        {
          id: "20",
          text: "Você sofreu ou presenciou situação de assédio moral dentro da empresa nas últimas duas semanas?",
          severity: "EXTREMAMENTE PREJUDICIAL"
        }
      ]
    }
  ]
};
