
export interface Form {
  id: string;
  titulo: string;
  descricao?: string;
  version?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  titulo: string;
  descricao?: string;
  ordem: number;
  formulario_id: string;
  created_at: string;
  updated_at: string;
}

export interface Severity {
  id: string;
  nivel: string;
  descricao?: string;
  ordem?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Risk {
  id: string;
  texto: string;
  severidade_id: string;
  severidade?: Severity;
  created_at?: string;
  updated_at?: string;
  mitigations?: Mitigation[];
}

export interface Mitigation {
  id: string;
  texto: string;
  risco_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id: string;
  texto: string;
  secao_id: string;
  formulario_id: string;
  risco_id: string;
  risco?: Risk;
  ordem_pergunta?: number;
  observacao_obrigatoria?: boolean;
  created_at?: string;
  updated_at?: string;
  opcoes?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  texto: string;
  pergunta_id: string;
  ordem?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FormAnswer {
  questionId: string;
  answer: boolean | null;
  observation?: string;
  selectedOptions?: string[];
}

export interface FormResult {
  id: string;
  funcionario_id: string;
  empresa_id: string;
  formulario_id: string;
  total_sim: number;
  total_nao: number;
  is_complete: boolean;
  notas_analista?: string;
  created_at: string;
  updated_at: string;
  last_updated: string;
  respostas?: Answer[];
}

export interface Answer {
  id: string;
  avaliacao_id: string;
  pergunta_id: string;
  resposta: boolean | null;
  observacao?: string;
  opcoes_selecionadas?: string[];
  created_at?: string;
  updated_at?: string;
}
