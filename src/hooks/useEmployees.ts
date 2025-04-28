
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
      const companiesData = await getCompanies();
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
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

  const loadEmployees = useCallback(async (companyId: string) => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      const employeesData = await getEmployeesByCompany(companyId);
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      
      const roleIds = Array.isArray(employeesData) 
        ? employeesData
            .filter(emp => emp && emp.role)
            .map(emp => emp.role as string)
        : [];
      
      const uniqueRoleIds = [...new Set(roleIds)];
      const newRoleNames: JobRoleMap = {};
      
      await Promise.all(
        uniqueRoleIds.map(async (roleId) => {
          try {
            const jobRole = await getJobRoleById(roleId);
            if (jobRole) {
              newRoleNames[roleId] = jobRole.name;
            }
          } catch (error) {
            console.error(`Error fetching role name for ${roleId}:`, error);
          }
        })
      );
      
      setRoleNames(newRoleNames);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os funcionários",
        variant: "destructive",
      });
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!employeeId) return;
    
    try {
      await deleteEmployee(employeeId);
      toast({
        title: "Sucesso",
        description: "Funcionário removido com sucesso!",
      });
      if (selectedCompanyId) {
        loadEmployees(selectedCompanyId);
      }
    } catch (error) {
      console.error("Erro ao remover funcionário:", error);
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
