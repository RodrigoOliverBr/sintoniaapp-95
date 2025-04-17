export type ClienteStatus = 'liberado' | 'bloqueado' | 'ativo' | 'em-analise' | 'sem-contrato' | 'bloqueado-manualmente';
export type TipoPessoa = 'fisica' | 'juridica';
export type StatusContrato = 'ativo' | 'em-analise' | 'cancelado' | 'bloqueado-manualmente';
export type CicloFaturamento = 'mensal' | 'trimestral' | 'anual';
export type StatusFatura = 'pendente' | 'pago' | 'atrasado' | 'programada';

// Add Cliente interface for backward compatibility
export interface Cliente {
  id: string;
  nome: string;
  tipo: TipoPessoa;
  numeroEmpregados: number;
  dataInclusao: number; // timestamp
  situacao: ClienteStatus;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  contato: string;
  planoId?: string; // Reference to associated plan
  contratoId?: string; // Reference to associated contract
}

// ClienteSistema with both new field names and aliases for backward compatibility
export interface ClienteSistema {
  id: string;
  razaoSocial: string;
  nome?: string; // Alias for backward compatibility
  tipo: TipoPessoa;
  numeroEmpregados: number;
  dataInclusao: number; // timestamp
  situacao: ClienteStatus;
  cnpj: string;
  cpfCnpj?: string; // Alias for backward compatibility
  email: string;
  telefone: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  responsavel: string;
  contato?: string; // Alias for backward compatibility
  planoId?: string; // Reference to associated plan
  contratoId?: string; // Reference to associated contract
  clienteId?: string; // For backward compatibility
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
  clienteSistemaId: string;
  clienteId?: string; // For backward compatibility
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
  clienteSistemaId: string;
  clienteId?: string; // For backward compatibility
  contratoId?: string; // Agora é opcional
  dataEmissao: number; // timestamp
  dataVencimento: number; // timestamp
  valor: number;
  status: StatusFatura;
  referencia?: string; // Campo para armazenar o número do contrato e número da parcela
  // Adicionando propriedades para evitar erros de TypeScript
  clienteName?: string;
  contratoNumero?: string;
}

// Interface para estado de seleção em lote
export interface BatchSelection {
  [key: string]: boolean;
}
