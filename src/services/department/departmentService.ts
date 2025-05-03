import { supabase } from '@/integrations/supabase/client';
import { Department } from '@/types/cadastro';
import { toast } from 'sonner';

// Keep a cache of departments by company to improve performance
const departmentsCache: Record<string, { data: Department[]; timestamp: number }> = {};

// Function to clear cache for a specific company
const clearCacheForCompany = (companyId: string) => {
  if (departmentsCache[companyId]) {
    console.log(`departmentService: Clearing cache for company ${companyId}`);
    delete departmentsCache[companyId];
  }
};

export const getDepartmentsByCompany = async (companyId: string): Promise<Department[]> => {
  console.log("getDepartmentsByCompany: Buscando setores para a empresa:", companyId);
  
  if (!companyId) {
    console.warn("getDepartmentsByCompany: companyId está indefinido ou vazio");
    return [];
  }
  
  // Check if we have a fresh cache (less than 10 seconds old)
  const now = Date.now();
  const cachedData = departmentsCache[companyId];
  if (cachedData && (now - cachedData.timestamp < 10000)) {
    console.log(`getDepartmentsByCompany: Usando cache para empresa ${companyId}, ${cachedData.data.length} setores`);
    return cachedData.data;
  }
  
  try {
    // Small delay to ensure any recent DB operations have completed
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`getDepartmentsByCompany: Fazendo consulta ao Supabase para empresa ${companyId}`);
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .eq('empresa_id', companyId);

    if (error) {
      console.error("getDepartmentsByCompany: Erro ao buscar setores:", error);
      throw error;
    }
    
    console.log(`getDepartmentsByCompany: ${data?.length || 0} setores encontrados para empresa ${companyId}:`, data);
    
    // Ensure we always return an array
    const departments = data || [];
    
    const mappedDepartments = departments.map(dept => ({
      id: dept.id,
      name: dept.nome,
      companyId: dept.empresa_id
    }));
    
    // Update cache
    departmentsCache[companyId] = {
      data: mappedDepartments,
      timestamp: now
    };
    
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
    
    // Clear cache for this company to ensure fresh data on next fetch
    clearCacheForCompany(departmentData.companyId);
    
    // Notify user of success
    toast.success("Setor cadastrado com sucesso!");
    
    const newDepartment = {
      id: data.id,
      name: data.nome,
      companyId: data.empresa_id
    };
    
    return newDepartment;
  } catch (error) {
    console.error("addDepartmentToCompany: Exceção ao adicionar setor:", error);
    throw error;
  }
};

export const deleteDepartment = async (departmentId: string, companyId?: string): Promise<void> => {
  if (!departmentId) {
    console.error("deleteDepartment: departmentId é obrigatório");
    throw new Error("ID do setor é obrigatório");
  }
  
  console.log("deleteDepartment: Removendo setor com ID:", departmentId);
  
  try {
    // If we don't have the companyId, fetch it first to know which cache to clear
    if (!companyId) {
      const department = await getDepartmentById(departmentId);
      companyId = department?.companyId;
    }
    
    const { error } = await supabase
      .from('setores')
      .delete()
      .eq('id', departmentId);

    if (error) {
      console.error("deleteDepartment: Erro ao remover setor:", error);
      throw error;
    }
    
    console.log("deleteDepartment: Setor removido com sucesso");
    
    // Clear cache for this company
    if (companyId) {
      clearCacheForCompany(companyId);
    }
    
    // Notify success
    toast.success("Setor removido com sucesso");
  } catch (error) {
    console.error("deleteDepartment: Exceção ao remover setor:", error);
    throw error;
  }
};
