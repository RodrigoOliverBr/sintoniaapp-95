import { supabase } from '@/integrations/supabase/client';
import { Company, Department, Employee, JobRole } from '@/types/cadastro';

// Companies
export const getCompanies = async (): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('empresas')
    .select('*');

  if (error) throw error;
  
  return (data || []).map(company => ({
    id: company.id,
    name: company.nome,
    cpf_cnpj: company.cpf_cnpj,
    departments: [],
    clienteId: company.cliente_id
  }));
};

export const getCompanyById = async (companyId: string): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error) throw error;
  
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.nome,
    cpf_cnpj: data.cpf_cnpj,
    departments: [],
    clienteId: data.cliente_id
  };
};

export const addCompany = async (companyData: Partial<Company>): Promise<Company> => {
  const dbData = {
    nome: companyData.name,
    cpf_cnpj: companyData.cpf_cnpj,
    cliente_id: companyData.clienteId
  };

  const { data, error } = await supabase
    .from('empresas')
    .insert(dbData)
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.nome,
    cpf_cnpj: data.cpf_cnpj,
    departments: [],
    clienteId: data.cliente_id
  };
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
  
  return (data || []).map(dept => ({
    id: dept.id,
    name: dept.nome,
    companyId: dept.empresa_id
  }));
};

export const getDepartmentById = async (departmentId: string): Promise<Department | null> => {
  const { data, error } = await supabase
    .from('setores')
    .select('*')
    .eq('id', departmentId)
    .single();

  if (error) throw error;
  
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.nome,
    companyId: data.empresa_id
  };
};

export const addDepartmentToCompany = async (departmentData: Partial<Department>): Promise<Department> => {
  const dbData = {
    nome: departmentData.name,
    empresa_id: departmentData.companyId
  };

  const { data, error } = await supabase
    .from('setores')
    .insert(dbData)
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.nome,
    companyId: data.empresa_id
  };
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
  
  return (data || []).map(role => ({
    id: role.id,
    name: role.nome,
    companyId: role.empresa_id
  }));
};

export const getJobRolesByCompany = async (companyId: string): Promise<JobRole[]> => {
  const { data, error } = await supabase
    .from('cargos')
    .select('*')
    .eq('empresa_id', companyId);

  if (error) throw error;
  
  return (data || []).map(role => ({
    id: role.id,
    name: role.nome,
    companyId: role.empresa_id
  }));
};

export const getJobRoleById = async (jobRoleId: string): Promise<JobRole | null> => {
  const { data, error } = await supabase
    .from('cargos')
    .select('*')
    .eq('id', jobRoleId)
    .single();

  if (error) throw error;
  
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.nome,
    companyId: data.empresa_id
  };
};

export const addJobRole = async (companyId: string, roleData: Partial<JobRole>): Promise<JobRole> => {
  const dbData = {
    nome: roleData.name,
    empresa_id: companyId
  };

  const { data, error } = await supabase
    .from('cargos')
    .insert(dbData)
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.nome,
    companyId: data.empresa_id
  };
};

// Employees
export const getEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('*');

  if (error) throw error;
  
  return (data || []).map(employee => {
    return {
      id: employee.id,
      name: employee.nome,
      cpf: employee.cpf || '',
      roleId: employee.cargo_id || '',
      companyId: employee.empresa_id,
      departmentIds: [] // Will be populated separately
    };
  });
};

export const getEmployeesByCompany = async (companyId: string): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('*')
    .eq('empresa_id', companyId);

  if (error) throw error;
  
  return (data || []).map(employee => {
    return {
      id: employee.id,
      name: employee.nome,
      cpf: employee.cpf || '',
      roleId: employee.cargo_id || '',
      companyId: employee.empresa_id,
      departmentIds: [] // Will be populated separately
    };
  });
};

export const addEmployee = async (employeeData: Partial<Employee>): Promise<Employee> => {
  const dbData = {
    nome: employeeData.name,
    cpf: employeeData.cpf,
    cargo_id: employeeData.roleId,
    empresa_id: employeeData.companyId
  };

  const { data, error } = await supabase
    .from('funcionarios')
    .insert(dbData)
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.nome,
    cpf: data.cpf || '',
    roleId: data.cargo_id || '',
    companyId: data.empresa_id,
    departmentIds: employeeData.departmentIds || []
  };
};

export const updateEmployee = async (employeeId: string, employeeData: Partial<Employee>): Promise<Employee> => {
  const dbData: any = {};
  
  if (employeeData.name) dbData.nome = employeeData.name;
  if (employeeData.cpf) dbData.cpf = employeeData.cpf;
  if (employeeData.roleId) dbData.cargo_id = employeeData.roleId;
  if (employeeData.companyId) dbData.empresa_id = employeeData.companyId;

  const { data, error } = await supabase
    .from('funcionarios')
    .update(dbData)
    .eq('id', employeeId)
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.nome,
    cpf: data.cpf || '',
    roleId: data.cargo_id || '',
    companyId: data.empresa_id,
    departmentIds: employeeData.departmentIds || []
  };
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

// Placeholder for getFormResults to fix build errors
export const getFormResults = async (): Promise<any[]> => {
  // Esta função precisa ser implementada
  return [];
};
