
export interface AvaliacaoRisco {
  id: string;
  texto: string;
  severidade: number | string;
}

export interface AvaliacaoResposta {
  id: string;
  perguntaId: string;
  resposta: boolean;
  observacao?: string;
}
