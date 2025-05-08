
// Define the client status type
export type ClienteStatus = 'liberado' | 'bloqueado' | 'pendente' | 'ativo' | 'em-analise' | 'sem-contrato' | 'bloqueado-manualmente';
export type StatusFatura = 'pendente' | 'pago' | 'atrasado' | 'programada';
export type BatchSelection = Record<string, boolean>;
export type CicloFaturamento = 'mensal' | 'trimestral' | 'anual';
export type TipoPessoa = 'fisica' | 'juridica' | 'cliente'; // Added 'cliente' to fix type errors

export interface ClienteSistema {
  id: string;
  razao_social: string;
  nome: string;
  tipo: TipoPessoa; // Use the correct type
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
  clienteId?: string;
  senha?: string; // Add password field for user creation
}

export interface ClienteComContrato extends ClienteSistema {
  statusContrato?: StatusContrato;
  diasParaVencimento?: number;
  contrato?: Contrato;
}

export interface Plano {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  numeroUsuarios: number;
  
  // Fields used in the components
  valorMensal: number;
  valorImplantacao: number;
  limiteEmpresas: number;
  empresasIlimitadas: boolean;
  limiteEmpregados: number;
  empregadosIlimitados: boolean;
  dataValidade: number | null;
  semVencimento: boolean;
  ativo: boolean;
}

export interface Contrato {
  id: string;
  numero: string;
  clienteSistemaId: string;
  clienteId: string;
  planoId: string;
  dataInicio: number;
  dataFim: number;
  dataPrimeiroVencimento: number;
  valorMensal: number;
  status: StatusContrato;
  taxaImplantacao: number;
  observacoes: string;
  cicloFaturamento?: CicloFaturamento;
  proximaRenovacao?: number;
  ciclosGerados?: number;
}

export interface Fatura {
  id: string;
  numero: string;
  clienteId: string;
  clienteName?: string;
  dataEmissao: number;
  dataVencimento: number;
  valor: number;
  status: StatusFatura;
  linkBoleto?: string;
  linkNotaFiscal?: string;
  clienteSistemaId?: string;
  contratoId?: string;
  contratoNumero?: string;
  referencia?: string;
}

// Add these type definitions for the ClientesPage.tsx
export type StatusContrato = 'ativo' | 'inativo' | 'cancelado' | 'pendente' | 'vencido' | 'vencimento-proximo' | 'sem-contrato' | 'em-analise';

// Fix for InvoicePreview display type
export type Display = "flex" | "block" | "inline" | "inline-block" | "grid" | "inline-flex" | 
                      "flow-root" | "contents" | "list-item" | "none" | "hidden";
