
export interface Company {
  id: string;
  name: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  address?: string;
  type?: string;
  status?: string;
  contact?: string;
  zipCode?: string;
  state?: string;
  city?: string;
  createdAt?: string;
  updatedAt?: string;
  departments?: Department[];
}

export interface Department {
  id: string;
  name: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobRole {
  id: string;
  name: string;
  company_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  role?: string;
  department_id: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  status?: string;
}

export type TipoPessoa = 'juridica' | 'fisica';
export type StatusContrato = 'ativo' | 'cancelado' | 'em-analise' | 'sem-contrato';
export type StatusFatura = 'pendente' | 'pago' | 'atrasado' | 'programada';
export type CicloFaturamento = 'mensal' | 'trimestral' | 'anual';
export type ClienteStatus = 'liberado' | 'bloqueado' | 'pendente' | 'ativo' | 'em-analise' | 'sem-contrato' | 'bloqueado-manualmente';

export interface Form {
  id: string;
  titulo: string;
  descricao?: string;
  version?: string;
  ativo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClienteComContrato extends ClienteSistema {
  statusContrato?: StatusContrato | 'vencimento-proximo';
  diasParaVencimento?: number;
  contrato?: Contrato;
}

export interface ClienteSistema {
  id: string;
  razao_social: string;
  razaoSocial?: string;  // Alias para compatibilidade
  nome: string;
  tipo: TipoPessoa;
  numeroEmpregados: number;
  dataInclusao: number;
  situacao: ClienteStatus;
  cnpj: string;
  cpfCnpj?: string;
  email: string;
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
  cicloFaturamento?: string;
  proximaRenovacao?: number;
  ciclosGerados?: number;
}
