import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/cadastro';
import { getDepartmentsByCompany } from '../department/departmentService';

export const getCompanies = async (): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('empresas')
    .select('*');

  if (error) throw error;
  
  // Create base companies
  const companies = (data || []).map(company => ({
    id: company.id,
    name: company.nome,
    cpf_cnpj: company.cpf_cnpj,
    departments: [],
    clienteId: company.cliente_id
  }));

  // Load departments for each company
  for (const company of companies) {
    const departments = await getDepartmentsByCompany(company.id);
    company.departments = departments;
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
    clienteId: data.cliente_id
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
    clienteId: data.cliente_id
  };
};

export const deleteCompany = async (companyId: string): Promise<void> => {
  const { error } = await supabase
    .from('empresas')
    .delete()
    .eq('id', companyId);

  if (error) throw error;
};
