
export interface FormAnswer {
  questionId: string;
  answer: boolean;
  observation?: string;
  selectedOptions?: string[];
  otherText?: string;
}

export interface FormResult {
  id: string;
  employeeId: string;
  empresa_id: string;
  answers: Record<string, FormAnswer>;
  total_sim: number;
  total_nao: number;
  notas_analista?: string;
  is_complete: boolean;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  texto: string;
  risco_id: string;
  secao: string;
  secao_descricao?: string;
  ordem?: number;
  formulario_id?: string;
  opcoes?: { label: string; value: string; }[];
  observacao_obrigatoria?: boolean;
  risco?: Risk;
  pergunta_opcoes?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  pergunta_id: string;
  texto: string;
  ordem: number;
}

export interface Risk {
  id: string;
  texto: string;
  severidade_id: string;
  categoria?: string;
  severidade?: Severity;
}

export interface Severity {
  id: string;
  nivel: string;
  descricao?: string;
  cor?: string;
  peso?: number;
}

export interface FormSection {
  title: string;
  description?: string;
  questions: Question[];
}

export interface Mitigation {
  id: string;
  risco_id: string;
  texto: string;
}

