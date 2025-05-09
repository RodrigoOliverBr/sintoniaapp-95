
import { supabase } from "@/integrations/supabase/client";
import { Company, Department } from "@/types/cadastro"; 

export async function getCompanies(): Promise<Company[]> {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*');
    
    if (error) {
      console.error("Erro ao buscar empresas:", error);
      throw new Error(error.message);
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    throw error;
  }
}

export async function getCompanyById(id: string): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Erro ao buscar empresa:", error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    throw error;
  }
}

export async function addCompany(companyData: Partial<Company>): Promise<Company> {
  try {
    // Verificamos se foi fornecida uma senha
    const companyToInsert = { ...companyData };
    const senha = companyToInsert.password;
    delete companyToInsert.password; // Removemos para não duplicar no objeto
    
    const { data, error } = await supabase
      .from('empresas')
      .insert([companyToInsert])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao adicionar empresa:", error);
      throw new Error(error.message);
    }
    
    // Se foi fornecida uma senha, também atualizamos a tabela clientes_sistema
    if (senha && data) {
      await supabase
        .from('clientes_sistema')
        .insert([{ 
          id: data.id,
          nome: data.nome,
          razao_social: data.nome,
          cnpj: data.cpf_cnpj,
          email: data.email,
          telefone: data.telefone,
          senha: senha
        }]);
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao adicionar empresa:", error);
    throw error;
  }
}

export async function updateCompany(id: string, companyData: Partial<Company>): Promise<Company> {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .update(companyData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao atualizar empresa:", error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error);
    throw error;
  }
}

export async function deleteCompany(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Erro ao excluir empresa:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Erro ao excluir empresa:", error);
    throw error;
  }
}

export async function getDepartmentsByCompany(companyId: string): Promise<Department[]> {
  try {
    const { data, error } = await supabase
      .from('setores')
      .select('*')
      .eq('empresa_id', companyId);
    
    if (error) {
      console.error("Erro ao buscar setores:", error);
      throw new Error(error.message);
    }
    
    // Convertemos os setores para o formato Department esperado pelo frontend
    const departments = data?.map(setor => ({
      id: setor.id,
      name: setor.nome,
      companyId: setor.empresa_id,
      createdAt: setor.created_at,
      updatedAt: setor.updated_at
    })) || [];
    
    return departments;
  } catch (error) {
    console.error("Erro ao buscar setores:", error);
    throw error;
  }
}

export async function deleteDepartment(departmentId: string, companyId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('setores')
      .delete()
      .eq('id', departmentId)
      .eq('empresa_id', companyId);
    
    if (error) {
      console.error("Erro ao excluir setor:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Erro ao excluir setor:", error);
    throw error;
  }
}
