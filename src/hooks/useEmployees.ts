
import { useState, useEffect } from "react";
import { Employee } from "@/types/cadastro";
import { supabase } from "@/integrations/supabase/client";
import { getEmployeesByCompany } from "@/services/employee/employeeService";
import { getCompanies } from "@/services/company/companyService";
import { Company } from "@/types/cadastro";
import { getJobRolesByCompany } from "@/services/jobRole/jobRoleService";
import { toast } from "sonner";

export function useEmployees(initialCompanyId?: string) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(initialCompanyId || null);
  const [loading, setLoading] = useState(true);
  const [roleNames, setRoleNames] = useState<Record<string, string>>({});
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadEmployees(selectedCompanyId);
      loadRoleNames(selectedCompanyId);
    } else {
      setEmployees([]);
      setLoading(false);
    }
  }, [selectedCompanyId]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const companiesData = await getCompanies();
      setCompanies(companiesData);
      
      // If we have companies but no selection, select the first one
      if (companiesData.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(companiesData[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      setError(error instanceof Error ? error : new Error('Erro ao carregar empresas'));
      setCompanies([]);
      toast.error("Erro ao carregar empresas");
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async (companyId: string) => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      setError(null);
      const employeesData = await getEmployeesByCompany(companyId);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      // Importante: não limpar a lista de funcionários em caso de erro
      // para que dados previamente carregados não desapareçam
      setError(error instanceof Error ? error : new Error('Erro ao carregar funcionários'));
      toast.error("Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  };
  
  const loadRoleNames = async (companyId: string) => {
    if (!companyId) return;
    
    try {
      const roles = await getJobRolesByCompany(companyId);
      const rolesMap: Record<string, string> = {};
      
      roles.forEach(role => {
        rolesMap[role.id] = role.name;
      });
      
      setRoleNames(rolesMap);
    } catch (error) {
      console.error("Erro ao carregar cargos:", error);
      // Não mostrar toast para este erro secundário para evitar excesso de notificações
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('funcionarios')
        .delete()
        .eq('id', employeeId);
        
      if (error) throw error;
      
      // Update employees list locally after deletion instead of refetching
      setEmployees(prevEmployees => 
        prevEmployees.filter(employee => employee.id !== employeeId)
      );
      
      toast.success("Funcionário excluído com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao excluir funcionário:", error);
      toast.error("Erro ao excluir funcionário");
      return false;
    }
  };

  const refreshEmployees = (companyId: string) => {
    if (companyId) {
      loadEmployees(companyId);
    }
  };

  return {
    employees,
    loading,
    companies,
    selectedCompanyId,
    isLoading: loading,
    roleNames,
    error,
    setSelectedCompanyId,
    loadCompanies,
    loadEmployees,
    refreshEmployees,
    handleDeleteEmployee,
  };
}
