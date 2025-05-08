
// Type definition for Client related interfaces

export type TipoPessoa = "fisica" | "juridica";

export type StatusContrato = 
  | "ativo" 
  | "pendente" 
  | "vencido" 
  | "cancelado" 
  | "renovado"
  | "inativo"
  | "sem-contrato"
  | "vencimento-proximo"
  | "em-analise";

export type ClienteStatus = 
  | "liberado" 
  | "bloqueado" 
  | "ativo" 
  | "em-analise" 
  | "sem-contrato" 
  | "bloqueado-manualmente"
  | "inativo"
  | "pendente";

export interface ClientePerfil {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  tipo?: TipoPessoa;
  cpfCnpj?: string;
  contato?: string;
  situacao?: ClienteStatus;
}

export interface ClienteSistema {
  id: string;
  razao_social: string; // Changed from optional to required for compatibility with admin.ts
  razaoSocial?: string;
  nome: string;
  tipo: TipoPessoa; // Enforced as TipoPessoa
  numeroEmpregados: number;
  dataInclusao: number; // timestamp
  situacao: ClienteStatus; // Enforced as ClienteStatus
  cnpj?: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  responsavel?: string;
  contato?: string;
  planoId?: string;
  contratoId?: string;
  clienteId?: string;
  statusContrato?: StatusContrato;
}
