
import { useState, useEffect } from "react";
import { Company } from "@/types/cadastro";
import { getCompanies } from "@/services";
import { useToast } from "@/hooks/use-toast";

export function useCompanySelection() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>("");
  const { toast } = useToast();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const companiesData = await getCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas",
        variant: "destructive",
      });
    }
  };

  return {
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
  };
}
