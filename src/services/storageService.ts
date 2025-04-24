
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
    
    const companies = data.map(company => ({
      id: company.id,
      name: company.nome,
      departments: company.setores?.map(dept => ({
        id: dept.id,
        name: dept.nome,
        companyId: company.id
      })) || [],
      clienteId
    }));
    
    return companies as Company[];
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return []; // Return empty array instead of a rejected promise
  }
};

export const deleteCompany = async (companyId: string) => {
  try {
    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', companyId);

    if (error) throw error;
    return true;
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
    return {
      id: data.id,
      name: data.nome,
      cpf_cnpj: data.cpf_cnpj,
      departments: [],
    } as Company;
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
    
    return {
      id: data.id,
      name: data.nome,
      companyId: data.empresa_id
    } as Department;
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
    
    const departments = data.map(dept => ({
      id: dept.id,
      name: dept.nome,
      companyId: dept.empresa_id
    }));
    
    return departments as Department[];
  } catch (error) {
    console.error('Erro ao buscar setores:', error);
    return []; // Return empty array instead of a rejected promise
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
    
    return {
      id: data.id,
      name: data.nome,
      companyId: data.empresa_id
    } as Department;
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
    return true;
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
    
    return {
      id: data.id,
      name: data.nome,
      companyId: data.empresa_id
    } as JobRole;
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
    
    const roles = data.map(role => ({
      id: role.id,
      name: role.nome,
      companyId: role.empresa_id
    }));
    
    return roles as JobRole[];
  } catch (error) {
    console.error('Erro ao buscar cargos:', error);
    return []; // Return empty array instead of a rejected promise
  }
};

export const getJobRoles = async () => {
  try {
    const { data, error } = await supabase
      .from('cargos')
      .select('*');

    if (error) throw error;
    
    const roles = data.map(role => ({
      id: role.id,
      name: role.nome,
      companyId: role.empresa_id
    }));
    
    return roles as JobRole[];
  } catch (error) {
    console.error('Erro ao buscar cargos:', error);
    return []; // Return empty array instead of a rejected promise
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
    
    return {
      id: data.id,
      name: data.nome,
      companyId: data.empresa_id
    } as JobRole;
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
    return true;
  } catch (error) {
    console.error('Erro ao excluir cargo:', error);
    throw error;
  }
};

// Employees
export const addEmployee = async (employeeData: Partial<Employee>) => {
  try {
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
    
    return {
      id: employeeResult.id,
      name: employeeResult.nome,
      cpf: employeeResult.cpf,
      roleId: employeeResult.cargo_id,
      companyId: employeeResult.empresa_id,
      departmentIds: departmentIds
    } as Employee;
  } catch (error) {
    console.error('Erro ao adicionar funcionário:', error);
    throw error;
  }
};

export const getEmployees = async () => {
  try {
    const { data: employeesData, error } = await supabase
      .from('funcionarios')
      .select(`
        *,
        employee_departments(department_id)
      `);

    if (error) throw error;
    
    if (!employeesData) return [];
    
    const employeeIds = employeesData.map(e => e.id);
    const { data: allDepartments } = await supabase
      .from('employee_departments')
      .select('*')
      .in('employee_id', employeeIds);
    
    const employees = employeesData.map(emp => {
      const departmentIds = allDepartments
        ?.filter(d => d.employee_id === emp.id)
        .map(d => d.department_id) || [];
      
      return {
        id: emp.id,
        name: emp.nome,
        cpf: emp.cpf,
        roleId: emp.cargo_id,
        companyId: emp.empresa_id,
        departmentIds
      };
    });
    
    return employees as Employee[];
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    return []; // Return empty array instead of a rejected promise
  }
};

export const getEmployeesByCompany = async (companyId: string) => {
  try {
    const { data: employeesData, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('empresa_id', companyId);

    if (error) throw error;
    
    if (!employeesData) return [];
    
    const employeeIds = employeesData.map(e => e.id);
    
    let departmentAssociations: any[] = [];
    if (employeeIds.length > 0) {
      const { data } = await supabase
        .from('employee_departments')
        .select('*')
        .in('employee_id', employeeIds);
        
      departmentAssociations = data || [];
    }
    
    const employees = employeesData.map(emp => {
      const departmentIds = departmentAssociations
        .filter(d => d.employee_id === emp.id)
        .map(d => d.department_id);
        
      return {
        id: emp.id,
        name: emp.nome,
        cpf: emp.cpf,
        roleId: emp.cargo_id,
        companyId: emp.empresa_id,
        departmentIds
      };
    });
    
    return employees as Employee[];
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    return []; // Return empty array instead of a rejected promise
  }
};

export const updateEmployee = async (employeeId: string, employeeData: Partial<Employee>) => {
  try {
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

    const departmentIds = employeeData.departmentIds || [];
    
    const { error: deleteError } = await supabase
      .from('employee_departments')
      .delete()
      .eq('employee_id', employeeId);

    if (deleteError) throw deleteError;

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

export const deleteEmployee = async (employeeId: string) => {
  try {
    await supabase
      .from('employee_departments')
      .delete()
      .eq('employee_id', employeeId);

    const { error } = await supabase
      .from('funcionarios')
      .delete()
      .eq('id', employeeId);

    if (error) throw error;
    return true;
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

export const saveFormResult = async (employeeId?: string, result?: FormResult) => {
  // TODO: Implement form result save
  console.log('Saving form result for employee:', employeeId, result);
  return null;
};
