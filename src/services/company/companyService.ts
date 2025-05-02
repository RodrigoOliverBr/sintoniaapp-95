import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/cadastro';
import { getClienteIdAtivo } from '@/utils/clientContext';

export const getCompanies = async (): Promise<Company[]> => {
  console.log("Iniciando busca de empresas...");
  
  try {
    // Verificar sessão atual
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("Nenhuma sessão ativa encontrada");
      return [];
    }
    
    const userId = session.user.id;
    console.log("ID do usuário autenticado:", userId);
    
    // Verificar tipo de usuário
    const { data: perfil } = await supabase
      .from('perfis')
      .select('tipo')
      .eq('id', userId)
      .maybeSingle();
      
    console.log("Perfil encontrado:", perfil);
    
    // Consultar empresas baseado no tipo de usuário
    let query = supabase.from('empresas').select('*');
    
    if (perfil?.tipo === 'admin') {
      console.log("Usuário admin: buscando todas empresas");
      // Admin vê todas as empresas
    } else {
      console.log("Usuário cliente: buscando empresas do perfil", userId);
      // Cliente vê apenas suas próprias empresas
      query = query.eq('perfil_id', userId);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar empresas:", error);
      throw error;
    }
    
    console.log(`Empresas encontradas: ${data?.length || 0}`, data);
    
    return (data || []).map(company => ({
      id: company.id,
      name: company.nome,
      cpfCnpj: company.cpf_cnpj,
      telefone: company.telefone,
      email: company.email,
      address: company.endereco,
      type: company.tipo,
      status: company.situacao,
      contact: company.contato,
      zipCode: company.cep,
      state: company.estado,
      city: company.cidade,
      createdAt: company.created_at,
      updatedAt: company.updated_at
    }));
  } catch (error) {
    console.error("Erro na função getCompanies:", error);
    return [];
  }
};

export const getCompanyById = async (companyId: string): Promise<Company | null> => {
  const clienteId = await getClienteIdAtivo();
  
  let query = supabase
    .from('empresas')
    .select('*')
    .eq('id', companyId);
  
  // Se houver um cliente ativo, verificar se a empresa pertence a ele
  if (clienteId) {
    query = query.eq('perfil_id', clienteId);
  }
  
  const { data, error } = await query.maybeSingle();

  if (error) throw error;
  
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.nome,
    cpfCnpj: data.cpf_cnpj,
    telefone: data.telefone,
    email: data.email,
    address: data.endereco,
    type: data.tipo,
    status: data.situacao,
    contact: data.contato,
    zipCode: data.cep,
    state: data.estado,
    city: data.cidade,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const addCompany = async (companyData: Partial<Company>): Promise<Company> => {
  console.log("Iniciando addCompany...");
  
  // Get active client ID
  const clienteId = await getClienteIdAtivo();
  console.log("Client ID from getClienteIdAtivo:", clienteId);
  
  if (!clienteId) {
    console.error("Nenhum cliente do sistema ativo para associar a empresa");
    throw new Error("Você precisa estar autenticado para adicionar uma empresa");
  }

  console.log("Cliente ID para adicionar empresa:", clienteId);

  try {
    // Verificar a sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error("Erro ao verificar sessão ou sessão não encontrada:", sessionError);
      throw new Error("Sua sessão expirou. Por favor, faça login novamente.");
    }
    
    console.log("Session user ID:", session.user.id);
    
    // Verificar se o perfil existe na tabela de perfis
    const { data: perfilExists, error: perfilError } = await supabase
      .from('perfis')
      .select('id, tipo, email')
      .eq('id', session.user.id)
      .maybeSingle();

    if (perfilError) {
      console.error("Erro ao verificar perfil:", perfilError);
      throw new Error("Erro ao verificar seu perfil. Por favor, tente novamente mais tarde.");
    }

    if (!perfilExists) {
      console.error("Perfil não encontrado para ID:", session.user.id);
      throw new Error("Seu perfil não foi encontrado no sistema. Por favor, contate o suporte.");
    }

    console.log("Perfil encontrado:", perfilExists);
    
    // Verificar se o usuário é do tipo cliente
    if (perfilExists.tipo.toLowerCase() !== 'client') {
      console.error("Usuário não é do tipo cliente:", perfilExists.tipo);
      throw new Error("Apenas clientes podem cadastrar empresas.");
    }
    
    console.log("Adicionando empresa para o perfil:", session.user.id);
    
    const dbData = {
      nome: companyData.name,
      cpf_cnpj: companyData.cpfCnpj,
      telefone: companyData.telefone,
      email: companyData.email,
      endereco: companyData.address,
      tipo: companyData.type || 'juridica',
      situacao: companyData.status || 'ativo',
      contato: companyData.contact,
      cep: companyData.zipCode,
      estado: companyData.state,
      cidade: companyData.city,
      perfil_id: session.user.id // Use the session user ID directly
    };

    console.log("Dados para inserção:", dbData);

    const { data, error } = await supabase
      .from('empresas')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error("Erro detalhado ao cadastrar empresa:", error);
      throw error;
    }
    
    console.log("Empresa cadastrada com sucesso:", data);
    return {
      id: data.id,
      name: data.nome,
      cpfCnpj: data.cpf_cnpj,
      telefone: data.telefone,
      email: data.email,
      address: data.endereco,
      type: data.tipo,
      status: data.situacao,
      contact: data.contato,
      zipCode: data.cep,
      state: data.estado,
      city: data.cidade,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Erro ao adicionar empresa:", error);
    throw error;
  }
};

export const updateCompany = async (companyId: string, companyData: Partial<Company>): Promise<Company> => {
  const clienteId = await getClienteIdAtivo();
  const updateData: any = {};
  
  if (companyData.name) updateData.nome = companyData.name;
  if (companyData.cpfCnpj) updateData.cpf_cnpj = companyData.cpfCnpj;
  if (companyData.telefone) updateData.telefone = companyData.telefone;
  if (companyData.email) updateData.email = companyData.email;
  if (companyData.address) updateData.endereco = companyData.address;
  if (companyData.type) updateData.tipo = companyData.type;
  if (companyData.status) updateData.situacao = companyData.status;
  if (companyData.contact) updateData.contato = companyData.contact;
  if (companyData.zipCode) updateData.cep = companyData.zipCode;
  if (companyData.state) updateData.estado = companyData.state;
  if (companyData.city) updateData.cidade = companyData.city;

  let query = supabase
    .from('empresas')
    .update(updateData)
    .eq('id', companyId);
  
  // Se houver um cliente ativo, garantir que a empresa pertence a ele
  if (clienteId) {
    query = query.eq('perfil_id', clienteId);
  }
  
  const { data, error } = await query.select().single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.nome,
    cpfCnpj: data.cpf_cnpj,
    telefone: data.telefone,
    email: data.email,
    address: data.endereco,
    type: data.tipo,
    status: data.situacao,
    contact: data.contato,
    zipCode: data.cep,
    state: data.estado,
    city: data.cidade,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const deleteCompany = async (companyId: string): Promise<void> => {
  const clienteId = await getClienteIdAtivo();
  
  let query = supabase
    .from('empresas')
    .delete()
    .eq('id', companyId);
  
  // Se houver um cliente ativo, garantir que a empresa pertence a ele
  if (clienteId) {
    query = query.eq('perfil_id', clienteId);
  }
  
  const { error } = await query;

  if (error) throw error;
};
