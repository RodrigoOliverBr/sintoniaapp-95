
export interface Company {
  id: string;
  nome: string;
  tipo: string;
  cpf_cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  contato: string;
  situacao: string;
  numero_empregados: number;
  created_at: string;
  updated_at: string;
  data_inclusao: string;
  perfil_id: string;
}

export interface Department {
  id: string;
  nome: string;
  empresa_id: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  nome: string;
  cpf: string;
  cargo_id: string;
  empresa_id: string;
  created_at: string;
  updated_at: string;
}

export interface JobRole {
  id: string;
  nome: string;
  empresa_id: string;
  created_at: string;
  updated_at: string;
}

export interface ClienteSistema {
  id: string;
  razao_social: string;
  cnpj: string;
  email: string;
  telefone: string;
  responsavel: string;
  situacao: string;
  contrato_id: string;
  plano_id: string;
  created_at: string;
  updated_at: string;
}
