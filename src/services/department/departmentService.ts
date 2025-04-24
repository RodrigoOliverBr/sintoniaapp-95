
import { supabase } from '@/integrations/supabase/client';
import { Department } from '@/types/cadastro';

export const getDepartmentsByCompany = async (companyId: string): Promise<Department[]> => {
  console.log("Buscando setores para a empresa:", companyId);
  const { data, error } = await supabase
    .from('setores')
    .select('*')
    .eq('empresa_id', companyId);

  if (error) {
    console.error("Erro ao buscar setores:", error);
    throw error;
  }
  
  console.log("Setores encontrados:", data);
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

  console.log("Adicionando setor com dados:", dbData);

  const { data, error } = await supabase
    .from('setores')
    .insert(dbData)
    .select()
    .single();

  if (error) throw error;
  
  console.log("Setor adicionado com sucesso:", data);
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
