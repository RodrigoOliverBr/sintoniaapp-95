
export const addJobRole = async (companyId: string, roleData: Partial<JobRole>): Promise<JobRole> => {
  try {
    // Validar se o companyId e o nome do cargo são fornecidos
    if (!companyId) {
      throw new Error("ID da empresa é obrigatório");
    }

    if (!roleData.name || roleData.name.trim() === '') {
      throw new Error("Nome do cargo é obrigatório");
    }

    const { data, error } = await supabase
      .from('cargos')
      .insert({
        nome: roleData.name.trim(),
        empresa_id: companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar cargo:", error);
      throw error;
    }
    
    return {
      id: data.id,
      name: data.nome,
      companyId: data.empresa_id
    } as JobRole;
  } catch (error) {
    console.error('Erro detalhado ao adicionar cargo:', error);
    throw error;
  }
};
