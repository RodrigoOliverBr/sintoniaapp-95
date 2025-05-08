
export interface Company {
  id: string;
  nome: string;
  tipo: string;
  cpf_cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  contato?: string;
  situacao: string;
  numero_empregados?: number;
  data_inclusao: string;
  created_at: string;
  updated_at: string;
  perfil_id?: string;
}

export interface Employee {
  id: string;
  nome: string;
  cpf?: string;
  empresa_id: string;
  cargo_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Form {
  id: string;
  titulo: string;
  descricao?: string;
  version?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  nome: string;
  empresa_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface JobRole {
  id: string;
  nome: string;
  empresa_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClienteSistema {
  id: string;
  razao_social: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  responsavel?: string;
  situacao: string;
  contrato_id?: string;
  plano_id?: string;
  created_at: string;
  updated_at: string;
  tipo: string;
}

export interface Contract {
  id: string;
  numero: string;
  cliente_id: string;
  cliente_sistema_id?: string;
  plano_id: string;
  data_inicio: string;
  data_fim?: string;
  data_primeiro_vencimento: string;
  status: string;
  valor_mensal: number;
  taxa_implantacao: number;
  ciclo_faturamento: string;
  proxima_renovacao?: string;
  ciclos_gerados?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  nome: string;
  descricao?: string;
  valor_mensal: number;
  valor_implantacao: number;
  limite_empresas?: number;
  limite_empregados?: number;
  empresas_ilimitadas?: boolean;
  empregados_ilimitados?: boolean;
  ativo: boolean;
  data_validade?: string;
  sem_vencimento?: boolean;
  created_at: string;
  updated_at: string;
}
