
export interface Question {
  id: string;
  texto: string;
  risco_id: string;
  secao_id: string;  // Keep this as the primary way to link to sections
  ordem_pergunta?: number;
  formulario_id: string;
  opcoes?: { label: string; value: string; }[];
  observacao_obrigatoria?: boolean;
  risco?: Risk;
  pergunta_opcoes?: QuestionOption[];
  secao?: Section; // Add reference to section for compatibility
}

export interface Section {
  id: string;
  titulo: string;
  descricao?: string;
  ordem: number;
  formulario_id: string;
  created_at: string;
  updated_at: string;
  count?: number;  // Add this for SecoesTab compatibility
}

export interface QuestionOption {
  id: string;
  pergunta_id: string;
  texto: string;
  ordem?: number;
}

export interface Risk {
  id: string;
  texto: string;
  severidade_id: string;
  created_at?: string;
  updated_at?: string;
  severidade?: Severity;
  mitigations?: Mitigation[]; // Add this for compatibility with RiskTable
}

export interface Severity {
  id: string;
  nivel: string;
  descricao?: string;
  ordem?: number;
}

export interface Mitigation {
  id: string;
  texto: string;
  risco_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface FormAnswer {
  questionId: string;
  answer: boolean | null;
  observation?: string;
  selectedOptions?: string[];
  otherText?: string;
}

// Import from avaliacao to avoid type duplication
import { AvaliacaoResposta } from './avaliacao';

export interface FormResult {
  id: string;
  employeeId: string;
  empresa_id: string;
  formulario_id: string;
  
  // Support for both naming conventions
  total_sim?: number;
  total_nao?: number;
  totalYes?: number; 
  totalNo?: number;
  
  is_complete?: boolean;
  isComplete?: boolean;
  
  notas_analista?: string;
  analyistNotes?: string;
  
  created_at: string;
  updated_at: string;
  last_updated: string;
  
  // Support for both response formats
  answers?: Record<string, any>;
  respostas?: AvaliacaoResposta[];
  
  yesPerSeverity?: Record<string, number>;
}

export interface SeverityLevel {
  id: string;
  level: string;
  color: string;
  description: string;
}

export interface FormData {
  sections: {
    title: string;
    description?: string;
    questions: {
      id: string;
      text: string;
      severity: string;
      options?: { label: string; value: string; }[];
    }[];
  }[];
}
