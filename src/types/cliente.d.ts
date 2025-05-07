
export type ClienteStatus = 'ativo' | 'inativo' | 'pendente' | 'sem-contrato' | 'bloqueado' | 'liberado';

export interface ClienteSistema {
  id: string;
  razao_social: string;
  razaoSocial?: string; // Para compatibilidade com interfaces existentes
  cnpj: string;
  cpfCnpj?: string; // Para compatibilidade com interfaces existentes
  responsavel?: string;
  contato?: string;
  telefone?: string;
  email?: string;
  situacao: ClienteStatus;
  nome?: string; // Para compatibilidade com interfaces existentes
  tipo?: string;
  created_at?: string;
  updated_at?: string;
  plano_id?: string;
  contrato_id?: string;
  contratoId?: string; // Para compatibilidade
}
