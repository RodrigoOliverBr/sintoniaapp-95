
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Company, Employee, Form } from "@/types/cadastro";
import { getAllForms } from "@/services/form/formService";

export function useFormSelections() {
  const { toast } = useToast();
  
  // Data state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  
  // Selection state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>();
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Load companies on mount
  useEffect(() => {
    loadCompanies();
    loadForms();
  }, []);
  
  // Load employees when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      loadEmployees(selectedCompanyId);
    } else {
      setEmployees([]);
      setSelectedEmployeeId(undefined);
    }
  }, [selectedCompanyId]);
  
  // Load companies
  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('empresas')
        .select('*');
      
      if (error) throw error;
      
      setCompanies(data || []);
    } catch (error) {
      console.error("Error loading companies:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load employees for a company
  const loadEmployees = async (companyId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('empresa_id', companyId);
      
      if (error) throw error;
      
      setEmployees(data || []);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os funcionários",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load forms
  const loadForms = async () => {
    try {
      setIsLoading(true);
      const forms = await getAllForms();
      setAvailableForms(forms);
      
      // Auto-select first form if available
      if (forms.length > 0 && !selectedFormId) {
        setSelectedFormId(forms[0].id);
      }
    } catch (error) {
      console.error("Error loading forms:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os formulários",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle company selection
  const handleCompanyChange = useCallback((companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedEmployeeId(undefined);
  }, []);
  
  // Handle employee selection
  const handleEmployeeChange = useCallback((employeeId: string) => {
    setSelectedEmployeeId(employeeId);
  }, []);
  
  // Handle form selection
  const handleFormChange = useCallback((formId: string) => {
    setSelectedFormId(formId);
  }, []);
  
  // Derived data
  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const selectedFormTitle = availableForms.find(f => f.id === selectedFormId)?.titulo || "Formulário";
  
  return {
    // Data
    companies,
    employees,
    availableForms,
    
    // Selection state
    selectedCompanyId,
    setSelectedCompanyId,
    selectedEmployeeId,
    setSelectedEmployeeId,
    selectedFormId,
    setSelectedFormId,
    
    // Actions
    handleCompanyChange,
    handleEmployeeChange,
    handleFormChange,
    
    // Status
    isLoading,
    
    // Derived data
    selectedEmployee,
    selectedFormTitle
  };
}
