
import { useCallback } from "react";
import { useCompanySelection } from "@/hooks/form/useCompanySelection";
import { useEmployeeSelection } from "@/hooks/form/useEmployeeSelection";
import { useFormSelection } from "@/hooks/form/useFormSelection";

export function useFormSelections() {
  const { 
    companies,
    selectedCompanyId, 
    setSelectedCompanyId 
  } = useCompanySelection();

  const {
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId
  } = useEmployeeSelection(selectedCompanyId);

  const {
    availableForms,
    selectedFormId,
    setSelectedFormId
  } = useFormSelection();

  const handleCompanyChange = useCallback((value: string) => {
    setSelectedCompanyId(value);
    setSelectedEmployeeId(undefined);
  }, [setSelectedCompanyId, setSelectedEmployeeId]);

  const handleEmployeeChange = useCallback((value: string) => {
    setSelectedEmployeeId(value);
  }, [setSelectedEmployeeId]);

  const handleFormChange = useCallback((value: string) => {
    setSelectedFormId(value);
  }, [setSelectedFormId]);

  // Derived state
  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
  const selectedFormTitle = availableForms.find(f => f.id === selectedFormId)?.titulo || "Formulário";

  return {
    // Company selection
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    
    // Employee selection
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    
    // Form selection
    availableForms,
    selectedFormId,
    setSelectedFormId,
    
    // Action handlers
    handleCompanyChange,
    handleEmployeeChange,
    handleFormChange,
    
    // Derived data
    selectedEmployee,
    selectedFormTitle
  };
}
