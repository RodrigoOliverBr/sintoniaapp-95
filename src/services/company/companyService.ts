
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/cadastro';
import { getDepartmentsByCompany } from '../department/departmentService';

export const getCompanies = async (): Promise<Company[]> => {
  console.log("Buscando todas as empresas");
  const { data, error } = await supabase
    .from('empresas')
    .select('*');

  if (error) {
    console.error("Erro ao buscar empresas:", error);
    throw error;
  }
  
  // Create base companies
  const companies = (data || []).map(company => ({
    id: company.id,
    name: company.nome,
    cpf_cnpj: company.cpf_cnpj,
    departments: [],
    clienteId: company.cliente_id || null // Handle possible null values
  }));

  console.log("Empresas encontradas:", companies.length);

  // Load departments for each company
  for (const company of companies) {
    try {
      const departments = await getDepartmentsByCompany(company.id);
      company.departments = departments;
      console.log(`Setores para empresa ${company.name}:`, departments);
    } catch (error) {
      console.error(`Erro ao buscar setores para empresa ${company.id}:`, error);
      company.departments = [];
    }
  }
  
  return companies;
};

export const getCompanyById = async (companyId: string): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error) throw error;
  
  if (!data) return null;
  
  const company = {
    id: data.id,
    name: data.nome,
    cpf_cnpj: data.cpf_cnpj,
    departments: [],
    clienteId: data.cliente_id || null // Handle possible null values
  };

  // Load departments for this company
  company.departments = await getDepartmentsByCompany(company.id);
  
  return company;
};

export const addCompany = async (companyData: Partial<Company>): Promise<Company> => {
  const dbData = {
    nome: companyData.name,
    cpf_cnpj: companyData.cpf_cnpj,
    cliente_id: companyData.clienteId
  };

  const { data, error } = await supabase
    .from('empresas')
    .insert(dbData)
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.nome,
    cpf_cnpj: data.cpf_cnpj,
    departments: [],
    clienteId: data.cliente_id || null // Handle possible null values
  };
};

export const deleteCompany = async (companyId: string): Promise<void> => {
  const { error } = await supabase
    .from('empresas')
    .delete()
    .eq('id', companyId);

  if (error) throw error;
};
