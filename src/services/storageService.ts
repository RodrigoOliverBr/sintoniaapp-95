
import { supabase } from '@/integrations/supabase/client';
import { Company, Department, Employee, JobRole } from '@/types/cadastro';

// Companies
export const getCompanies = async (): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('empresas')
    .select('*');

  if (error) throw error;
  return data || [];
};

export const getCompanyById = async (companyId: string): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error) throw error;
  return data;
};

export const addCompany = async (companyData: Partial<Company>): Promise<Company> => {
  const { data, error } = await supabase
    .from('empresas')
    .insert(companyData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCompany = async (companyId: string): Promise<void> => {
  const { error } = await supabase
    .from('empresas')
    .delete()
    .eq('id', companyId);

  if (error) throw error;
};

// Departments
export const getDepartmentsByCompany = async (companyId: string): Promise<Department[]> => {
  const { data, error } = await supabase
    .from('setores')
    .select('*')
    .eq('empresa_id', companyId);

  if (error) throw error;
  return data || [];
};

export const getDepartmentById = async (departmentId: string): Promise<Department | null> => {
  const { data, error } = await supabase
    .from('setores')
    .select('*')
    .eq('id', departmentId)
    .single();

  if (error) throw error;
  return data;
};

export const addDepartmentToCompany = async (departmentData: Partial<Department>): Promise<Department> => {
  const { data, error } = await supabase
    .from('setores')
    .insert(departmentData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteDepartment = async (departmentId: string): Promise<void> => {
  const { error } = await supabase
    .from('setores')
    .delete()
    .eq('id', departmentId);

  if (error) throw error;
};

// Job Roles
export const getJobRoles = async (): Promise<JobRole[]> => {
  const { data, error } = await supabase
    .from('cargos')
    .select('*');

  if (error) throw error;
  return data || [];
};

export const getJobRolesByCompany = async (companyId: string): Promise<JobRole[]> => {
  const { data, error } = await supabase
    .from('cargos')
    .select('*')
    .eq('empresa_id', companyId);

  if (error) throw error;
  return data || [];
};

export const getJobRoleById = async (jobRoleId: string): Promise<JobRole | null> => {
  const { data, error } = await supabase
    .from('cargos')
    .select('*')
    .eq('id', jobRoleId)
    .single();

  if (error) throw error;
  return data;
};

export const addJobRole = async (companyId: string, roleData: Partial<JobRole>): Promise<JobRole> => {
  const { data, error } = await supabase
    .from('cargos')
    .insert({
      ...roleData,
      empresa_id: companyId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Employees
export const getEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('*');

  if (error) throw error;
  return data || [];
};

export const getEmployeesByCompany = async (companyId: string): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('*')
    .eq('empresa_id', companyId);

  if (error) throw error;
  return data || [];
};

export const addEmployee = async (employeeData: Partial<Employee>): Promise<Employee> => {
  const { data, error } = await supabase
    .from('funcionarios')
    .insert(employeeData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEmployee = async (employeeId: string, employeeData: Partial<Employee>): Promise<Employee> => {
  const { data, error } = await supabase
    .from('funcionarios')
    .update(employeeData)
    .eq('id', employeeId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  const { error } = await supabase
    .from('funcionarios')
    .delete()
    .eq('id', employeeId);

  if (error) throw error;
};

// Form Results and Status
export const getFormResultByEmployeeId = (employeeId: string): any => {
  // Esta função precisa ser implementada de acordo com a lógica do seu aplicativo
  // Por enquanto, retornando um placeholder
  return null;
};

export const getFormStatusByEmployeeId = (employeeId: string): string => {
  // Esta função precisa ser implementada de acordo com a lógica do seu aplicativo
  // Por enquanto, retornando um placeholder
  return 'not-started';
};

export const saveFormResult = async (formResult: any): Promise<any> => {
  // Esta função precisa ser implementada de acordo com a lógica do seu aplicativo
  // Por enquanto, retornando um placeholder
  return null;
};
