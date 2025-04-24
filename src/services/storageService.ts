
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Company, Department, JobRole, Employee, FormResult, FormStatus } from '@/types/cadastro';

// Companies
export const addCompany = async (companyData: Partial<Company>, clienteId: string) => {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .insert({
        nome: companyData.name,
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
    if (employeeData.departmentIds && employeeData.departmentIds.length > 0) {
      const departmentAssociations = employeeData.departmentIds.map(departmentId => ({
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

// Form Status and Result
export const getFormStatusByEmployeeId = (employeeId: string): FormStatus => {
  // TODO: Implement actual status retrieval from Supabase
  return 'not-started';
};

export const getFormResultByEmployeeId = (employeeId: string): FormResult | null => {
  // TODO: Implement actual form result retrieval from Supabase
  return null;
};
