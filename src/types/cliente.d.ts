
// Type definition for Client related interfaces

export type TipoPessoa = "fisica" | "juridica" | "cliente";

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
  razao_social: string;
  razaoSocial?: string;
  nome: string;
  tipo: TipoPessoa;
  numeroEmpregados?: number;
  dataInclusao?: number | string; // timestamp
  situacao: ClienteStatus;
  cnpj: string;  // Made required to match admin.ts
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
