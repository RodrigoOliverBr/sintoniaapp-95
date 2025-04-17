// Existing imports and types
export type ClienteStatus = 'liberado' | 'bloqueado' | 'pendente';

// Add missing type definitions
export type TipoPessoa = 'juridica' | 'fisica';
export type StatusContrato = 'ativo' | 'cancelado' | 'em-analise' | 'sem-contrato';
export type StatusFatura = 'pendente' | 'pago' | 'atrasado' | 'programada';

export interface Fatura {
  id: string;
  numero: string;
  clienteId: string;
  clienteSistemaId?: string;
  contratoId?: string;
  dataEmissao: number;
  dataVencimento: number;
  valor: number;
  status: StatusFatura;
  clienteName?: string;
  contratoNumero?: string;
  referencia?: string;
}

export interface Contrato {
  id: string;
  numero: string;
  clienteId: string;
  clienteSistemaId?: string;
  planoId: string;
  dataInicio: string;
  dataFim?: string;
  status: StatusContrato;
  valorMensal: number;
  taxaImplantacao: number;
}

export interface Plano {
  id: string;
  nome: string;
  valorMensal: number;
  valorImplantacao: number;
  ativo?: boolean;
  limiteEmpresas?: number;
  empresasIlimitadas?: boolean;
  limiteEmpregados?: number;
  empregadosIlimitados?: boolean;
}

export interface BatchSelection {
  [key: string]: boolean;
}

export interface ClienteComContrato extends ClienteSistema {
  statusContrato?: StatusContrato;
  contrato?: Contrato;
}

// Keep the existing ClienteSistema interface, but update it to match the actual database schema
export interface ClienteSistema {
  id: string;
  razao_social: string;
  nome: string;
  tipo: TipoPessoa;
  numeroEmpregados: number;
  dataInclusao: number;
  situacao: ClienteStatus;
  cnpj: string;
  cpfCnpj: string;
  email: string;
  telefone?: string;
  responsavel?: string;
  contato?: string;
  planoId?: string;
  contratoId?: string;
  clienteId?: string;
}

// Existing FormResult interface
export interface FormResult {
  employeeId: string;
  data: any;
  lastUpdated: number;
}
