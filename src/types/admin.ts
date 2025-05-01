// Define the client status type
export type ClienteStatus = 'liberado' | 'bloqueado' | 'pendente' | 'ativo' | 'em-analise' | 'sem-contrato' | 'bloqueado-manualmente';

export interface ClienteSistema {
  id: string;
  razao_social: string;
  nome: string;
  tipo: string;
  numeroEmpregados: number;
  dataInclusao: number;
  situacao: ClienteStatus;
  cnpj: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  responsavel: string;
  contato: string;
  planoId: string;
  contratoId: string;
  razaoSocial?: string;
}

export interface ClienteComContrato extends ClienteSistema {
  statusContrato?: StatusContrato;
  diasParaVencimento?: number;
}

export interface Plano {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  numeroUsuarios: number;
}

export interface Contrato {
  id: string;
  numero: string;
  clienteSistemaId: string;
  planoId: string;
  dataInicio: number;
  dataFim: number;
  dataPrimeiroVencimento: number;
  valorMensal: number;
  status: string;
  taxaImplantacao: number;
  observacoes: string;
}

export interface Fatura {
  id: string;
  numero: string;
  clienteId: string;
  clienteName?: string;
  dataEmissao: number;
  dataVencimento: number;
  valor: number;
  status: 'pendente' | 'pago' | 'atrasado' | 'programada';
  linkBoleto?: string;
  linkNotaFiscal?: string;
}

// Add these type definitions for the ClientesPage.tsx
export type TipoPessoa = 'fisica' | 'juridica';
export type StatusContrato = 'ativo' | 'inativo' | 'cancelado' | 'pendente' | 'vencido' | 'vencimento-proximo' | 'sem-contrato';
