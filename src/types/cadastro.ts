
export interface Company {
  id: string;
  name: string;
  departments: Department[];
  clienteId?: string; // Added to associate companies with clients
}

export interface Department {
  id: string;
  name: string;
  companyId: string;
}

export interface JobRole {
  id: string;
  name: string;
  companyId: string; // Added companyId to associate roles with companies
}

export interface Employee {
  id: string;
  name: string;
  cpf: string;
  roleId: string;
  departmentId: string;
  companyId: string;
}

// For form data types
export type FormStatus = 'not-started' | 'in-progress' | 'completed';

export interface FormResult {
  employeeId: string;
  data: any;
  lastUpdated: number;
  isComplete?: boolean;
}
