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
  // For backwards compatibility with FormResults component
  totalYes?: number;
  totalNo?: number;
  yesPerSeverity?: Record<string, number>;
  analyistNotes?: string;
}

export interface Question {
  id: string;
  texto: string;
  risco_id: string;
  secao: string;
  secao_descricao?: string;
  ordem?: number;
  formulario_id: string;
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
  mitigations?: Mitigation[];
}

export interface Severity {
  id: string;
  nivel: string;
  descricao?: string;
  cor?: string;
  peso?: number;
  ordem?: number;
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

export type SeverityLevel = 'LEVEMENTE PREJUDICIAL' | 'PREJUDICIAL' | 'EXTREMAMENTE PREJUDICIAL';

export interface FormData {
  sections: {
    title: string;
    description?: string;
    questions: {
      id: number;
      text: string;
      severity: SeverityLevel;
      risk?: string;
      options?: { label: string; value: string; }[];
      requireObservation?: boolean;
      risco?: string;
      mitigationActions?: string[];
      showObservation?: boolean;
    }[];
  }[];
}

export type ClienteStatus = 'liberado' | 'bloqueado' | 'pendente' | 'ativo' | 'em-analise' | 'sem-contrato' | 'bloqueado-manualmente';
export type CicloFaturamento = 'mensal' | 'trimestral' | 'anual';
export type TipoPessoa = 'juridica' | 'fisica';
export type StatusContrato = 'ativo' | 'cancelado' | 'em-analise' | 'sem-contrato';

export interface ClienteSistema {
  id: string;
  razao_social: string;
  nome: string;
  tipo: TipoPessoa;
  numeroEmpregados: number;
  dataInclusao: number;
  situacao: ClienteStatus;
  cnpj: string;
  cpfCnpj?: string;
  email: string;
  telefone?: string;
  responsavel?: string;
  contato?: string;
  planoId?: string;
  contratoId?: string;
}
