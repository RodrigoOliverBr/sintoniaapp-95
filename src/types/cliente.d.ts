
// src/types/cliente.d.ts
// Este arquivo contém as definições de tipos relacionados aos clientes do sistema

export interface ClienteDashboard {
  id: string;
  razao_social: string;
  nome_responsavel?: string;
  email_responsavel?: string;
  telefone?: string;
  situacao: string;
  plano?: string;
  data_contrato?: string;
  proximity?: number;  // apenas para o cálculo de relevância na busca
}

export interface ClienteInput {
  razao_social: string;
  cnpj: string;
  email?: string;
  responsavel?: string;
  telefone?: string;
  situacao?: string;
  plano_id?: string;
}

export interface ClienteSystem {
  id: string;
  razao_social: string;
  cnpj: string;
  email: string | null;
  responsavel: string | null;
  telefone: string | null;
  situacao: string;
  plano_id: string | null;
  contrato_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contrato {
  id: string;
  numero: string;
  cliente_id: string;
  cliente_sistema_id: string | null;
  plano_id: string;
  data_inicio: string;
  data_fim: string | null;
  valor_mensal: number;
  taxa_implantacao: number;
  data_primeiro_vencimento: string;
  ciclo_faturamento: string;
  status: string;
  observacoes: string | null;
  ciclos_gerados: number | null;
  proxima_renovacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContratoInput {
  numero: string;
  cliente_id: string;
  plano_id: string;
  data_inicio: string;
  data_fim?: string;
  valor_mensal: number;
  taxa_implantacao?: number;
  data_primeiro_vencimento: string;
  ciclo_faturamento: string;
  status?: string;
  observacoes?: string;
}

export interface Fatura {
  id: string;
  numero: string;
  cliente_id: string;
  cliente_sistema_id: string | null;
  contrato_id: string | null;
  valor: number;
  data_emissao: string;
  data_vencimento: string;
  status: string;
  referencia: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plano {
  id: string;
  nome: string;
  descricao: string | null;
  valor_mensal: number;
  valor_implantacao: number;
  limite_empresas: number | null;
  limite_empregados: number | null;
  empresas_ilimitadas: boolean | null;
  empregados_ilimitados: boolean | null;
  sem_vencimento: boolean | null;
  data_validade: string | null;
  ativo: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface PlanoInput {
  nome: string;
  descricao?: string;
  valor_mensal: number;
  valor_implantacao?: number;
  limite_empresas?: number;
  limite_empregados?: number;
  empresas_ilimitadas?: boolean;
  empregados_ilimitados?: boolean;
  sem_vencimento?: boolean;
  data_validade?: string;
  ativo?: boolean;
}

export interface PlanoMitigacao {
  id?: string;
  empresa_id: string;
  risco_id: string;
  medidas_controle: string;
  prazo: string;
  responsavel: string;
  status: "Pendente" | "Implementando" | "Monitorando";
  created_at?: string;
  updated_at?: string;
}
