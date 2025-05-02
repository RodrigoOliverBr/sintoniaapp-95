
import { useState, useEffect } from "react";
import { Company } from "@/types/cadastro";
import { getCompanies } from "@/services";
import { useToast } from "@/hooks/use-toast";

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
      
      const companiesData = await getCompanies();
      console.log("useCompanySelection: Empresas obtidas:", companiesData.length, companiesData);
      
      setCompanies(companiesData);
      
      // Se não houver empresa selecionada e tivermos empresas, seleciona a primeira
      if ((!selectedCompanyId || selectedCompanyId === "") && companiesData.length > 0) {
        console.log("useCompanySelection: Selecionando primeira empresa:", companiesData[0].id);
        setSelectedCompanyId(companiesData[0].id);
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
