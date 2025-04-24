
// Já existente, mas com pequenas melhorias de tratamento de erros
const handleAddRole = async () => {
  if (!newRoleName.trim()) {
    toast({
      title: "Erro",
      description: "O nome da função não pode estar vazio",
      variant: "destructive",
    });
    return;
  }

  if (!preselectedCompanyId) {
    toast({
      title: "Erro",
      description: "É necessário selecionar uma empresa primeiro",
      variant: "destructive",
    });
    return;
  }

  try {
    setIsLoading(true);
    
    // Verifica duplicidade considerando case-insensitive
    const existingRole = jobRoles.find(role => 
      role.name.toLowerCase().trim() === newRoleName.toLowerCase().trim() && 
      role.companyId === preselectedCompanyId
    );

    if (existingRole) {
      toast({
        title: "Erro",
        description: "Já existe uma função com este nome nesta empresa",
        variant: "destructive",
      });
      return;
    }

    await addJobRole(preselectedCompanyId, { 
      name: newRoleName.trim(),
      companyId: preselectedCompanyId
    });
    
    setNewRoleName("");
    toast({
      title: "Função adicionada",
      description: "A função foi adicionada com sucesso",
    });
    
    await loadJobRoles();
  } catch (error) {
    console.error("Erro ao adicionar job role:", error);
    toast({
      title: "Erro",
      description: error instanceof Error ? error.message : "Erro ao adicionar função",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
