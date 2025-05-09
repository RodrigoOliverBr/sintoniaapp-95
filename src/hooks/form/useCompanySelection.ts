
import { useState, useEffect } from "react";
import { Company } from "@/types/cadastro";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useCompanySelection() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>("");
  const { toast } = useToast();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      console.log("useCompanySelection: Carregando empresas...");
      
      const { data: companiesData, error } = await supabase
        .from('empresas')
        .select('*');
        
      if (error) throw error;
      
      console.log("useCompanySelection: Empresas obtidas:", companiesData?.length, companiesData);
      
      // Mapear os dados para o formato Company
      const formattedCompanies: Company[] = companiesData.map(company => ({
        id: company.id,
        name: company.nome,
        nome: company.nome,
        cpfCnpj: company.cpf_cnpj,
        telefone: company.telefone,
        email: company.email,
        address: company.endereco,
        city: company.cidade,
        state: company.estado,
        zipCode: company.cep,
        type: company.tipo,
        status: company.situacao,
        contact: company.contato,
        createdAt: company.created_at,
        updatedAt: company.updated_at,
      }));
      
      setCompanies(formattedCompanies);
      
      // Se não houver empresa selecionada e tivermos empresas, seleciona a primeira
      if ((!selectedCompanyId || selectedCompanyId === "") && formattedCompanies.length > 0) {
        console.log("useCompanySelection: Selecionando primeira empresa:", formattedCompanies[0].id);
        setSelectedCompanyId(formattedCompanies[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshCompanies = () => {
    loadCompanies();
  };

  return {
    companies,
    loading,
    selectedCompanyId,
    setSelectedCompanyId,
    refreshCompanies,
  };
}
