
import { useState, useEffect } from "react";
import { Employee } from "@/types/cadastro";
import { supabase } from "@/integrations/supabase/client";
import { getEmployeesByCompany } from "@/services/employee/employeeService";
import { getCompanies } from "@/services/company/companyService";
import { Company } from "@/types/cadastro";
import { getJobRolesByCompany } from "@/services/jobRole/jobRoleService";

export function useEmployees(initialCompanyId?: string) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(initialCompanyId || null);
  const [loading, setLoading] = useState(true);
  const [roleNames, setRoleNames] = useState<Record<string, string>>({});
  
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
      const companiesData = await getCompanies();
      setCompanies(companiesData);
      
      // If we have companies but no selection, select the first one
      if (companiesData.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(companiesData[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async (companyId: string) => {
    try {
      setLoading(true);
      const employeesData = await getEmployeesByCompany(companyId);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };
  
  const loadRoleNames = async (companyId: string) => {
    try {
      const roles = await getJobRolesByCompany(companyId);
      const rolesMap: Record<string, string> = {};
      
      roles.forEach(role => {
        rolesMap[role.id] = role.name;
      });
      
      setRoleNames(rolesMap);
    } catch (error) {
      console.error("Erro ao carregar cargos:", error);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('funcionarios')
        .delete()
        .eq('id', employeeId);
        
      if (error) throw error;
      
      // Refresh employees list after deletion
      if (selectedCompanyId) {
        loadEmployees(selectedCompanyId);
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir funcionário:", error);
      return false;
    }
  };

  const refreshEmployees = (companyId: string) => {
    loadEmployees(companyId);
  };

  return {
    employees,
    loading,
    companies,
    selectedCompanyId,
    isLoading: loading,
    roleNames,
    setSelectedCompanyId,
    loadCompanies,
    loadEmployees,
    refreshEmployees,
    handleDeleteEmployee,
  };
}
