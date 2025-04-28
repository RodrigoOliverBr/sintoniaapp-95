
import { supabase } from '@/integrations/supabase/client';
import { JobRole } from '@/types/cadastro';

export const getJobRoles = async (): Promise<JobRole[]> => {
  const { data, error } = await supabase
    .from('cargos')
    .select('*');

  if (error) throw error;
  
  return (data || []).map(role => ({
    id: role.id,
    name: role.nome,
    company_id: role.empresa_id,
    created_at: role.created_at,
    updated_at: role.updated_at
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
    company_id: role.empresa_id,
    created_at: role.created_at,
    updated_at: role.updated_at
  }));
};

export const getJobRoleById = async (roleId: string): Promise<JobRole | null> => {
  const { data, error } = await supabase
    .from('cargos')
    .select('*')
    .eq('id', roleId)
    .maybeSingle();

  if (error) throw error;
  
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.nome,
    company_id: data.empresa_id,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const addJobRole = async (roleData: Partial<JobRole>): Promise<JobRole> => {
  const { data, error } = await supabase
    .from('cargos')
    .insert({
      nome: roleData.name,
      empresa_id: roleData.company_id
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.nome,
    company_id: data.empresa_id,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const updateJobRole = async (roleId: string, roleData: Partial<JobRole>): Promise<JobRole> => {
  const { data, error } = await supabase
    .from('cargos')
    .update({
      nome: roleData.name,
      empresa_id: roleData.company_id
    })
    .eq('id', roleId)
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.nome,
    company_id: data.empresa_id,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const deleteJobRole = async (roleId: string): Promise<void> => {
  const { error } = await supabase
    .from('cargos')
    .delete()
    .eq('id', roleId);

  if (error) throw error;
};
