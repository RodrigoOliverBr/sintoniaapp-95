
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

