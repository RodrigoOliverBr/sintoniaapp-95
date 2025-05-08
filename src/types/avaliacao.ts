
export interface AvaliacaoResposta {
  id: string;
  avaliacao_id: string;
  pergunta_id: string;
  pergunta?: {
    id: string;
    texto: string;
    risco?: {
      id: string;
      texto: string;
      severidade?: {
        id: string;
        nivel: string;
        descricao?: string;
      };
    };
  };
  resposta: boolean;
  resposta_texto?: string;
  observacao?: string;
  opcoes_selecionadas?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Avaliacao {
  id: string;
  funcionario_id: string;
  empresa_id: string;
  formulario_id?: string;
  total_sim: number;
  total_nao: number;
  is_complete: boolean;
  notas_analista?: string;
  created_at: string;
  updated_at: string;
  last_updated: string;
  respostas?: AvaliacaoResposta[];
  employeeId?: string; // Alias for funcionario_id to match FormResult interface
  answers?: Record<string, any>; // To match FormResult interface
}

// FormResult interface para garantir compatibilidade entre formatos diferentes
export interface FormResult {
  id: string;
  employeeId: string;
  empresa_id: string; // Este campo é necessário em ambos os formatos
  formulario_id: string;
  
  // Campos com nomes em português (formato antigo)
  total_sim?: number;
  total_nao?: number;
  is_complete?: boolean;
  notas_analista?: string;
  
  // Campos com nomes em inglês (formato novo)
  totalYes?: number;
  totalNo?: number;
  isComplete?: boolean;
  analyistNotes?: string;
  
  // Campos comuns
  created_at: string;
  updated_at: string;
  last_updated: string;
  
  // Dados de respostas em diferentes formatos
  answers?: Record<string, any>;
  respostas?: AvaliacaoResposta[];
  
  // Dados de classificação por severidade
  yesPerSeverity?: Record<string, number>;
}
