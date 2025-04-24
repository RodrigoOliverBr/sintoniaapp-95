
export interface Company {
  id: string;
  name: string;
  departments: Department[];
  clienteId?: string; // Added to associate companies with clients
  cpf_cnpj?: string;
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
  companyId: string;
  departmentIds: string[]; // Fixed: Added departmentIds property as array of strings
  departmentId?: string;   // Kept for backwards compatibility
}

export type FormStatus = 'not-started' | 'in-progress' | 'complete';

export interface FormResult {
  answers: Record<number, any>;
  totalYes: number;
  totalNo: number;
  severityCounts: Record<string, number>;
  yesPerSeverity: Record<string, number>;
  analyistNotes?: string;
  isComplete?: boolean;
}
