
export interface ClienteSistema {
  id: string;
  nome: string;
  email?: string | null;
  cpfCnpj?: string | null;
  telefone?: string | null;
  tipo: string;
  situacao: string;
  responsavel?: string | null;
  contrato_id?: string | null;
  plano_id?: string | null;
  dataInclusao?: Date | null;
  created_at: string;
  updated_at: string;
  // Database fields - align with Supabase tables
  cnpj?: string;
  razao_social?: string;
}

export interface Contrato {
  id: string;
  cliente_id: string;
  numero: string;
  valor_mensal: number;
  taxa_implantacao?: number;
  ciclo_faturamento: string;
  status: string;
  observacoes?: string;
  data_inicio: string;
  data_fim?: string;
  data_primeiro_vencimento: string;
  proxima_renovacao?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  nome: string;
  name?: string; // Adding an alias for name to maintain compatibility
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
  data_inclusao?: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  nome: string;
  name?: string; // Adding an alias for name to maintain compatibility
  cpf?: string;
  empresa_id: string;
  cargo_id?: string;
  email?: string;
  role?: string;
  company_id?: string; // Alias for empresa_id
  created_at: string;
  updated_at: string;
  department_id?: string; // Added for department reference
}

export interface Department {
  id: string;
  name?: string;
  nome: string;
  empresa_id: string;
  companyId?: string; // Alias for empresa_id
}

export interface JobRole {
  id: string;
  name?: string;
  nome: string;
  empresa_id: string;
  company_id?: string; // Alias for empresa_id
}

// Form type to be used in form selection components
export interface Form {
  id: string;
  titulo: string;
  descricao?: string;
  version?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
