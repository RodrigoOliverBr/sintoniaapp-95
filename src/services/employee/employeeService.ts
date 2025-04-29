
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/cadastro';

export const getEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('*');

  if (error) throw error;
  
  return (data || []).map(employee => {
    return {
      id: employee.id,
      name: employee.nome,
      email: employee.email || '',
      cpf: employee.cpf || '',
      role: employee.cargo_id || '',
      department_id: employee.department_id || '',
      company_id: employee.empresa_id,
      created_at: employee.created_at,
      updated_at: employee.updated_at,
      status: employee.status || 'active'
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
      email: employee.email || '',
      cpf: employee.cpf || '',
      role: employee.cargo_id || '',
      department_id: employee.department_id || '',
      company_id: employee.empresa_id,
      created_at: employee.created_at,
      updated_at: employee.updated_at,
      status: employee.status || 'active'
    };
  });
};

export const addEmployee = async (employeeData: Partial<Employee>): Promise<Employee> => {
  const dbData = {
    nome: employeeData.name,
    cpf: employeeData.cpf,
    cargo_id: employeeData.role,
    empresa_id: employeeData.company_id,
    email: employeeData.email || ''
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
    email: data.email || '',
    cpf: data.cpf || '',
    role: data.cargo_id || '',
    department_id: data.department_id || '',
    company_id: data.empresa_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    status: data.status || 'active'
  };
};

export const updateEmployee = async (employeeId: string, employeeData: Partial<Employee>): Promise<Employee> => {
  const dbData: any = {};
  
  if (employeeData.name) dbData.nome = employeeData.name;
  if (employeeData.cpf) dbData.cpf = employeeData.cpf;
  if (employeeData.role) dbData.cargo_id = employeeData.role;
  if (employeeData.company_id) dbData.empresa_id = employeeData.company_id;
  if (employeeData.email) dbData.email = employeeData.email;

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
    email: data.email || '',
    cpf: data.cpf || '',
    role: data.cargo_id || '',
    department_id: data.department_id || '',
    company_id: data.empresa_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    status: data.status || 'active'
  };
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  const { error } = await supabase
    .from('funcionarios')
    .delete()
    .eq('id', employeeId);

  if (error) throw error;
};
