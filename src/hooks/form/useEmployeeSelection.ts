
import { useState, useEffect } from "react";
import { Employee } from "@/types/cadastro";
import { getEmployeesByCompany } from "@/services";
import { useToast } from "@/hooks/use-toast";

export function useEmployeeSelection(selectedCompanyId: string | undefined) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>("");
  const { toast } = useToast();

  useEffect(() => {
    if (selectedCompanyId) {
      loadEmployees();
    } else {
      setEmployees([]);
    }
  }, [selectedCompanyId]);

  const loadEmployees = async () => {
    try {
      const employeesData = await getEmployeesByCompany(selectedCompanyId!);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os funcionários",
        variant: "destructive",
      });
    }
  };

  return {
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
  };
}
