
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
