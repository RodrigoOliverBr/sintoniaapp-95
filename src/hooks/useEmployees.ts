
import { useState, useCallback } from "react";
import { Company, Employee } from "@/types/cadastro";
import {
  getCompanies,
  getEmployeesByCompany,
  deleteEmployee,
  getJobRoleById,
} from "@/services";
import { useToast } from "@/hooks/use-toast";

interface JobRoleMap {
  [key: string]: string;
}

export const useEmployees = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roleNames, setRoleNames] = useState<JobRoleMap>({});
  const { toast } = useToast();

  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      console.log("useEmployees: Carregando empresas...");
      const companiesData = await getCompanies();
      console.log("useEmployees: Empresas carregadas:", companiesData.length, companiesData);
      
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
      
      if (Array.isArray(companiesData) && companiesData.length > 0 && !selectedCompanyId) {
        console.log("useEmployees: Selecionando primeira empresa:", companiesData[0].id);
        setSelectedCompanyId(companiesData[0].id);
      }
    } catch (error) {
      console.error("useEmployees: Erro ao carregar empresas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas",
        variant: "destructive",
      });
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadJobRoleNames = useCallback(async (roleIds: string[]) => {
    if (!roleIds.length) return {};
    
    console.log("useEmployees: Carregando nomes de cargos para IDs:", roleIds);
    
    const uniqueRoleIds = [...new Set(roleIds)];
    const newRoleNames: JobRoleMap = {};
    
    await Promise.all(
      uniqueRoleIds.map(async (roleId) => {
        try {
          console.log("useEmployees: Buscando cargo com ID:", roleId);
          const jobRole = await getJobRoleById(roleId);
          if (jobRole) {
            console.log("useEmployees: Cargo encontrado:", jobRole);
            newRoleNames[roleId] = jobRole.name;
          }
        } catch (error) {
          console.error(`useEmployees: Erro ao buscar nome do cargo ${roleId}:`, error);
        }
      })
    );
    
    console.log("useEmployees: Mapeamento de cargos gerado:", newRoleNames);
    return newRoleNames;
  }, []);

  const loadEmployees = useCallback(async (companyId: string) => {
    if (!companyId) {
      console.warn("useEmployees: Tentativa de carregar funcionários sem ID de empresa");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("useEmployees: Carregando funcionários para empresa:", companyId);
      
      const employeesData = await getEmployeesByCompany(companyId);
      console.log("useEmployees: Funcionários carregados:", employeesData.length, employeesData);
      
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      
      const roleIds = Array.isArray(employeesData) 
        ? employeesData
            .filter(emp => emp && emp.role)
            .map(emp => emp.role as string)
        : [];
      
      if (roleIds.length > 0) {
        const newRoleNames = await loadJobRoleNames(roleIds);
        setRoleNames(newRoleNames);
      }
    } catch (error) {
      console.error("useEmployees: Erro ao carregar funcionários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os funcionários",
        variant: "destructive",
      });
      setEmployees([]);
      setRoleNames({});
    } finally {
      setIsLoading(false);
    }
  }, [loadJobRoleNames, toast]);

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!employeeId) {
      console.warn("useEmployees: Tentativa de excluir funcionário sem ID");
      return;
    }
    
    try {
      console.log("useEmployees: Excluindo funcionário com ID:", employeeId);
      
      await deleteEmployee(employeeId);
      toast({
        title: "Sucesso",
        description: "Funcionário removido com sucesso!",
      });
      
      if (selectedCompanyId) {
        console.log("useEmployees: Recarregando lista após exclusão");
        loadEmployees(selectedCompanyId);
      }
    } catch (error) {
      console.error("useEmployees: Erro ao remover funcionário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o funcionário",
        variant: "destructive",
      });
    }
  };

  return {
    companies,
    employees,
    selectedCompanyId,
    isLoading,
    roleNames,
    setSelectedCompanyId,
    loadCompanies,
    loadEmployees,
    handleDeleteEmployee,
  };
};
