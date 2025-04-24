
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
