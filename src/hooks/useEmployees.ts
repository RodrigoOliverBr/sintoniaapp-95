import { useState, useEffect } from "react";
import { Employee } from "@/types/cadastro";
import { supabase } from "@/integrations/supabase/client";
import { getEmployeesByCompany } from "@/services";

export function useEmployees(companyId: string | undefined) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      loadEmployees(companyId);
    } else {
      setEmployees([]);
      setLoading(false);
    }
  }, [companyId]);

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

  const refreshEmployees = (companyId: string) => {
    loadEmployees(companyId);
  };

  return {
    employees,
    loading,
    refreshEmployees,
  };
}
