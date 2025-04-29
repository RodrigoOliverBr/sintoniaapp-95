
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/cadastro";
import { getClienteIdAtivo } from "@/utils/clientContext";

export const getEmployeesByCompany = async (companyId: string): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from("funcionarios")
    .select("*, cargos(*)")
    .eq("empresa_id", companyId);

  if (error) throw error;

  return (data || []).map((employee) => ({
    id: employee.id,
    name: employee.nome,
    cpf: employee.cpf,
    email: employee.email || "", 
    role: employee.cargo_id,
    department_id: employee.department_id || "", 
    company_id: employee.empresa_id,
    created_at: employee.created_at,
    updated_at: employee.updated_at,
    status: employee.status || "ativo",
  }));
};

export const getEmployeeById = async (employeeId: string): Promise<Employee | null> => {
  const { data, error } = await supabase
    .from("funcionarios")
    .select("*, cargos(*)")
    .eq("id", employeeId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.nome,
    cpf: data.cpf,
    email: data.email || "", 
    role: data.cargo_id,
    department_id: data.department_id || "", 
    company_id: data.empresa_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    status: data.status || "ativo",
  };
};

export const addEmployee = async (employeeData: Partial<Employee>): Promise<Employee> => {
  // Ensure companyId is associated with the current client
  const clienteId = getClienteIdAtivo();
  if (!clienteId) {
    throw new Error("Nenhum cliente do sistema ativo para associar o funcionário");
  }

  const { data, error } = await supabase
    .from("funcionarios")
    .insert({
      nome: employeeData.name,
      cpf: employeeData.cpf,
      email: employeeData.email || "",
      cargo_id: employeeData.role,
      empresa_id: employeeData.company_id,
      status: employeeData.status || "ativo"
      // department_id will be handled by the employee_departments junction table
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.nome,
    cpf: data.cpf,
    email: data.email || "", 
    role: data.cargo_id,
    department_id: data.department_id || "",
    company_id: data.empresa_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    status: data.status || "ativo",
  };
};

export const updateEmployee = async (employeeId: string, employeeData: Partial<Employee>): Promise<Employee> => {
  const updateData: any = {};
  
  if (employeeData.name !== undefined) updateData.nome = employeeData.name;
  if (employeeData.cpf !== undefined) updateData.cpf = employeeData.cpf;
  if (employeeData.email !== undefined) updateData.email = employeeData.email;
  if (employeeData.role !== undefined) updateData.cargo_id = employeeData.role;
  if (employeeData.status !== undefined) updateData.status = employeeData.status;
  // department_id will be handled separately through the junction table

  const { data, error } = await supabase
    .from("funcionarios")
    .update(updateData)
    .eq("id", employeeId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.nome,
    cpf: data.cpf,
    email: data.email || "", 
    role: data.cargo_id,
    department_id: data.department_id || "",
    company_id: data.empresa_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    status: data.status || "ativo",
  };
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  const { error } = await supabase
    .from("funcionarios")
    .delete()
    .eq("id", employeeId);

  if (error) throw error;
};

// Get departments by company
export const getDepartmentsByCompany = async (companyId: string) => {
  const { data, error } = await supabase
    .from("setores")
    .select("*")
    .eq("empresa_id", companyId);

  if (error) throw error;

  return (data || []).map(dept => ({
    id: dept.id,
    name: dept.nome,
    companyId: dept.empresa_id,
    createdAt: dept.created_at,
    updatedAt: dept.updated_at
  }));
};
