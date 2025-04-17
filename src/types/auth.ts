
export interface UserProfile {
  id: string;
  nome?: string;
  email?: string;
  tipo: string;
  created_at: string;
  updated_at: string;
  telefone?: string;
}

export interface ClienteSistema {
  id: string;
  razao_social: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  responsavel?: string;
  situacao: string;
  plano_id?: string;
  contrato_id?: string;
  created_at: string;
  updated_at: string;
}
