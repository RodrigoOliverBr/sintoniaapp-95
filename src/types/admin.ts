
export type ClienteStatus = 'liberado' | 'bloqueado';
export type TipoPessoa = 'fisica' | 'juridica';
export type StatusContrato = 'ativo' | 'em-analise' | 'cancelado';
export type CicloFaturamento = 'mensal' | 'trimestral' | 'anual';
export type StatusFatura = 'pendente' | 'pago' | 'atrasado' | 'programada';

// Renamed from Cliente to ClienteSistema to better reflect its role
export interface ClienteSistema {
  id: string;
  razaoSocial: string; // Renamed from nome
  tipo: TipoPessoa;
  numeroEmpregados: number;
  dataInclusao: number; // timestamp
  situacao: ClienteStatus;
  cnpj: string; // Renamed from cpfCnpj
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  responsavel: string; // Renamed from contato
  planoId?: string; // Reference to associated plan
  contratoId?: string; // Reference to associated contract
}

export interface Plano {
  id: string;
  nome: string;
  descricao: string;
  valorMensal: number;
  valorImplantacao: number;
  limiteEmpresas: number;
  empresasIlimitadas: boolean;
  limiteEmpregados: number;
  empregadosIlimitados: boolean;
  dataValidade: number | null; // timestamp ou null para sem vencimento
  semVencimento: boolean;
  ativo: boolean;
}

export interface Contrato {
  id: string;
  numero: string;
  clienteSistemaId: string; // Updated to reference clienteSistema
  planoId: string;
  dataInicio: number; // timestamp
  dataFim: number; // timestamp
  dataPrimeiroVencimento: number; // timestamp para o primeiro vencimento
  valorMensal: number;
  status: StatusContrato;
  taxaImplantacao: number;
  observacoes: string;
  cicloFaturamento: CicloFaturamento;
  proximaRenovacao?: number; // timestamp para próxima renovação automática
  ciclosGerados: number; // número de ciclos de faturamento já gerados
}

export interface Fatura {
  id: string;
  numero: string;
  clienteSistemaId: string; // Updated to reference clienteSistema
  contratoId: string;
  dataEmissao: number; // timestamp
  dataVencimento: number; // timestamp
  valor: number;
  status: StatusFatura;
  referencia: string; // ex: "05/2025"
}

// Interface para estado de seleção em lote
export interface BatchSelection {
  [key: string]: boolean;
}
