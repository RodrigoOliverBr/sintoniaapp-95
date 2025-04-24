
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Company, Department, JobRole, Employee, FormResult, FormStatus } from '@/types/cadastro';

// Companies
export const addCompany = async (companyData: Partial<Company>, clienteId?: string) => {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .insert({
        nome: companyData.name,
        cpf_cnpj: companyData.cpf_cnpj,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao adicionar empresa:', error);
    throw error;
  }
};

export const getCompanies = async (clienteId?: string) => {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select(`
        id, 
        nome, 
        setores(id, nome)
      `);

    if (error) throw error;
    return data as Company[];
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return [];
  }
};

export const deleteCompany = async (companyId: string) => {
  try {
    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', companyId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    throw error;
  }
};

export const getCompanyById = async (companyId: string) => {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', companyId)
      .single();

    if (error) throw error;
    return data as Company;
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return null;
  }
};

// Departments
export const addDepartmentToCompany = async (companyId: string, departmentData: Partial<Department>) => {
  try {
    const { data, error } = await supabase
      .from('setores')
      .insert({
        nome: departmentData.name,
        empresa_id: companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao adicionar setor:', error);
    throw error;
  }
};

export const getDepartmentsByCompany = async (companyId: string) => {
  try {
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .eq('empresa_id', companyId);

    if (error) throw error;
    return data as Department[];
  } catch (error) {
    console.error('Erro ao buscar setores:', error);
    return [];
  }
};

export const getDepartmentById = async (departmentId: string) => {
  try {
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .eq('id', departmentId)
      .single();

    if (error) throw error;
    return data as Department;
  } catch (error) {
    console.error('Erro ao buscar setor:', error);
    return null;
  }
};

export const deleteDepartment = async (companyId: string, departmentId: string) => {
  try {
    const { error } = await supabase
      .from('setores')
      .delete()
      .eq('id', departmentId)
      .eq('empresa_id', companyId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao excluir setor:', error);
    throw error;
  }
};

// Job Roles
export const addJobRole = async (companyId: string, roleData: Partial<JobRole>) => {
  try {
    const { data, error } = await supabase
      .from('cargos')
      .insert({
        nome: roleData.name,
        empresa_id: companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao adicionar cargo:', error);
    throw error;
  }
};

export const getJobRolesByCompany = async (companyId: string) => {
  try {
    const { data, error } = await supabase
      .from('cargos')
      .select('*')
      .eq('empresa_id', companyId);

    if (error) throw error;
    return data as JobRole[];
  } catch (error) {
    console.error('Erro ao buscar cargos:', error);
    return [];
  }
};

export const getJobRoles = async () => {
  try {
    const { data, error } = await supabase
      .from('cargos')
      .select('*');

    if (error) throw error;
    return data as JobRole[];
  } catch (error) {
    console.error('Erro ao buscar cargos:', error);
    return [];
  }
};

export const getJobRoleById = async (roleId: string) => {
  try {
    const { data, error } = await supabase
      .from('cargos')
      .select('*')
      .eq('id', roleId)
      .single();

    if (error) throw error;
    return data as JobRole;
  } catch (error) {
    console.error('Erro ao buscar cargo:', error);
    return null;
  }
};

export const updateJobRole = async (roleId: string, roleData: Partial<JobRole>) => {
  try {
    const { data, error } = await supabase
      .from('cargos')
      .update({
        nome: roleData.name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar cargo:', error);
    throw error;
  }
};

export const deleteJobRole = async (roleId: string) => {
  try {
    const { error } = await supabase
      .from('cargos')
      .delete()
      .eq('id', roleId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao excluir cargo:', error);
    throw error;
  }
};

// Employees
export const addEmployee = async (employeeData: Partial<Employee>) => {
  try {
    // First, insert the employee
    const { data: employeeResult, error: employeeError } = await supabase
      .from('funcionarios')
      .insert({
        nome: employeeData.name,
        cpf: employeeData.cpf,
        empresa_id: employeeData.companyId,
        cargo_id: employeeData.roleId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (employeeError) throw employeeError;

    // Then, insert department associations
    const departmentIds = employeeData.departmentIds || [];
    if (departmentIds.length > 0) {
      const departmentAssociations = departmentIds.map(departmentId => ({
        employee_id: employeeResult.id,
        department_id: departmentId,
      }));

      const { error: departmentError } = await supabase
        .from('employee_departments')
        .insert(departmentAssociations);

      if (departmentError) throw departmentError;
    }

    return employeeResult;
  } catch (error) {
    console.error('Erro ao adicionar funcionário:', error);
    throw error;
  }
};

export const updateEmployee = async (employeeId: string, employeeData: Partial<Employee>) => {
  try {
    // Update employee details
    const { data: employeeResult, error: employeeError } = await supabase
      .from('funcionarios')
      .update({
        nome: employeeData.name,
        cpf: employeeData.cpf,
        cargo_id: employeeData.roleId,
        empresa_id: employeeData.companyId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', employeeId)
      .select()
      .single();

    if (employeeError) throw employeeError;

    // Update department associations
    const departmentIds = employeeData.departmentIds || [];
    
    // First, remove existing department associations
    const { error: deleteError } = await supabase
      .from('employee_departments')
      .delete()
      .eq('employee_id', employeeId);

    if (deleteError) throw deleteError;

    // Then, insert new department associations if any
    if (departmentIds.length > 0) {
      const departmentAssociations = departmentIds.map(departmentId => ({
        employee_id: employeeId,
        department_id: departmentId,
      }));

      const { error: associationError } = await supabase
        .from('employee_departments')
        .insert(departmentAssociations);

      if (associationError) throw associationError;
    }

    return employeeResult;
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    throw error;
  }
};

export const getEmployees = async () => {
  try {
    const { data, error } = await supabase
      .from('funcionarios')
      .select(`
        *,
        employee_departments(department_id)
      `);

    if (error) throw error;
    return data as Employee[];
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    return [];
  }
};

export const getEmployeesByCompany = async (companyId: string) => {
  try {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('empresa_id', companyId);

    if (error) throw error;
    return data as Employee[];
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    return [];
  }
};

export const deleteEmployee = async (employeeId: string) => {
  try {
    // First, delete department associations
    await supabase
      .from('employee_departments')
      .delete()
      .eq('employee_id', employeeId);

    // Then delete the employee
    const { error } = await supabase
      .from('funcionarios')
      .delete()
      .eq('id', employeeId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao excluir funcionário:', error);
    throw error;
  }
};

// Form Status and Result (placeholders for now)
export const getFormStatusByEmployeeId = (employeeId: string): FormStatus => {
  // TODO: Implement actual status retrieval from Supabase
  return 'not-started';
};

export const getFormResultByEmployeeId = (employeeId: string): FormResult | null => {
  // TODO: Implement actual form result retrieval from Supabase
  return null;
};

export const saveFormResult = async () => {
  // TODO: Implement form result save
  return null;
};
