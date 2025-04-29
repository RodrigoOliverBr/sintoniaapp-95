// Existing imports and types
export type ClienteStatus = 'liberado' | 'bloqueado' | 'pendente' | 'ativo' | 'em-analise' | 'sem-contrato' | 'bloqueado-manualmente';

// Add missing type definitions
export type TipoPessoa = 'juridica' | 'fisica';
export type StatusContrato = 'ativo' | 'cancelado' | 'em-analise' | 'sem-contrato';
export type StatusFatura = 'pendente' | 'pago' | 'atrasado' | 'programada';
export type CicloFaturamento = 'mensal' | 'trimestral' | 'anual';

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
  dataInicio: string | number;
  dataFim?: string | number;
  dataPrimeiroVencimento?: number;
  status: StatusContrato;
  valorMensal: number;
  taxaImplantacao: number;
  observacoes?: string;
  cicloFaturamento?: CicloFaturamento;
  proximaRenovacao?: number;
  ciclosGerados?: number;
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
  descricao?: string;
  semVencimento?: boolean;
  dataValidade?: string | number | null;
}

export interface BatchSelection {
  [key: string]: boolean;
}

export interface ClienteComContrato extends ClienteSistema {
  statusContrato?: StatusContrato | 'vencimento-proximo';
  diasParaVencimento?: number;
  contrato?: Contrato;
}

// Update ClienteSistema interface to support both razao_social and razaoSocial
export interface ClienteSistema {
  id: string;
  razao_social: string;
  razaoSocial?: string;  // Alias para compatibilidade
  nome: string;
  tipo: TipoPessoa;
  numeroEmpregados?: number;
  dataInclusao?: number | string;
  situacao: ClienteStatus;
  cnpj?: string;
  cpfCnpj?: string;
  email?: string;
  telefone?: string;
  responsavel?: string;
  contato?: string;
  planoId?: string;
  contratoId?: string;
  clienteId?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

// Existing FormResult interface
export interface FormResult {
  employeeId: string;
  data: any;
  lastUpdated: number;
}
