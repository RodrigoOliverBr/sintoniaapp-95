
export interface AvaliacaoResposta {
  id: string;
  avaliacao_id: string;
  pergunta_id: string;
  pergunta: {
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
  opcoes_selecionadas?: string[] | null;
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
}
