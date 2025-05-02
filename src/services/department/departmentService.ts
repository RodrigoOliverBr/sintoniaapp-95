
import { supabase } from '@/integrations/supabase/client';
import { Department } from '@/types/cadastro';

export const getDepartmentsByCompany = async (companyId: string): Promise<Department[]> => {
  console.log("getDepartmentsByCompany: Buscando setores para a empresa:", companyId);
  
  if (!companyId) {
    console.warn("getDepartmentsByCompany: companyId está indefinido ou vazio");
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .eq('empresa_id', companyId);

    if (error) {
      console.error("getDepartmentsByCompany: Erro ao buscar setores:", error);
      throw error;
    }
    
    console.log(`getDepartmentsByCompany: ${data?.length || 0} setores encontrados para empresa ${companyId}:`, data);
    
    // Forçar devolução de array vazio em vez de null se não houver dados
    if (!data || data.length === 0) {
      console.log("getDepartmentsByCompany: Nenhum setor encontrado, retornando array vazio");
      return [];
    }
    
    const mappedDepartments = data.map(dept => ({
      id: dept.id,
      name: dept.nome,
      companyId: dept.empresa_id
    }));
    
    console.log("getDepartmentsByCompany: Setores após mapeamento:", mappedDepartments);
    
    return mappedDepartments;
  } catch (error) {
    console.error("getDepartmentsByCompany: Exceção ao buscar setores:", error);
    throw error;
  }
};

export const getDepartmentById = async (departmentId: string): Promise<Department | null> => {
  if (!departmentId) {
    console.warn("getDepartmentById: departmentId está indefinido ou vazio");
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .eq('id', departmentId)
      .single();

    if (error) {
      console.error("getDepartmentById: Erro ao buscar setor:", error);
      throw error;
    }
    
    if (!data) {
      console.warn("getDepartmentById: Nenhum setor encontrado com ID", departmentId);
      return null;
    }
    
    console.log("getDepartmentById: Setor encontrado:", data);
    
    return {
      id: data.id,
      name: data.nome,
      companyId: data.empresa_id
    };
  } catch (error) {
    console.error("getDepartmentById: Exceção ao buscar setor:", error);
    throw error;
  }
};

export const addDepartmentToCompany = async (departmentData: Partial<Department>): Promise<Department> => {
  if (!departmentData.companyId) {
    console.error("addDepartmentToCompany: companyId é obrigatório");
    throw new Error("ID da empresa é obrigatório");
  }
  
  if (!departmentData.name) {
    console.error("addDepartmentToCompany: name é obrigatório");
    throw new Error("Nome do setor é obrigatório");
  }
  
  const dbData = {
    nome: departmentData.name,
    empresa_id: departmentData.companyId
  };

  console.log("addDepartmentToCompany: Adicionando setor com dados:", dbData);

  try {
    const { data, error } = await supabase
      .from('setores')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error("addDepartmentToCompany: Erro ao adicionar setor:", error);
      throw error;
    }
    
    console.log("addDepartmentToCompany: Setor adicionado com sucesso:", data);
    
    return {
      id: data.id,
      name: data.nome,
      companyId: data.empresa_id
    };
  } catch (error) {
    console.error("addDepartmentToCompany: Exceção ao adicionar setor:", error);
    throw error;
  }
};

export const deleteDepartment = async (departmentId: string): Promise<void> => {
  if (!departmentId) {
    console.error("deleteDepartment: departmentId é obrigatório");
    throw new Error("ID do setor é obrigatório");
  }
  
  console.log("deleteDepartment: Removendo setor com ID:", departmentId);
  
  try {
    const { error } = await supabase
      .from('setores')
      .delete()
      .eq('id', departmentId);

    if (error) {
      console.error("deleteDepartment: Erro ao remover setor:", error);
      throw error;
    }
    
    console.log("deleteDepartment: Setor removido com sucesso");
  } catch (error) {
    console.error("deleteDepartment: Exceção ao remover setor:", error);
    throw error;
  }
};
