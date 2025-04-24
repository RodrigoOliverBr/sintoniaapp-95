
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
