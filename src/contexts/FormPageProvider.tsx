
import React from "react";
import { FormPageContext } from "./FormPageContext";
import { useFormPage } from "@/hooks/form/useFormPage";

interface FormPageProviderProps {
  children: React.ReactNode;
}

export const FormPageProvider: React.FC<FormPageProviderProps> = ({ children }) => {
  const formPageData = useFormPage();
  
  // Extract all the properties from useFormPage
  const {
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
    
    // Questions and sections
    questions,
    formSections,
    
    // Form state
    answers,
    setAnswers,
    formResult,
    setFormResult,
    showResults,
    setShowResults,
    formComplete,
    setFormComplete,
    
    // View state
    showForm,
    setShowForm,
    showingHistoryView,
    setShowingHistoryView,
    
    // History
    selectedEvaluation,
    setSelectedEvaluation,
    evaluationHistory,
    isLoadingHistory,
    loadEmployeeHistory,
    handleDeleteEvaluation,
    isDeletingEvaluation,
    
    // Actions
    handleCompanyChange,
    handleEmployeeChange,
    handleFormChange,
    handleNewEvaluation,
    handleExitResults,
    handleSaveAndComplete,
    
    // Form state
    isSubmitting,
    isNewEvaluation,
    setIsNewEvaluation,
    
    // Derived data
    selectedEmployee,
    selectedFormTitle,
  } = formPageData;
  
  return (
    <FormPageContext.Provider value={{
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
      
      // Questions and sections
      questions,
      formSections,
      
      // Form state
      answers,
      setAnswers,
      formResult,
      setFormResult,
      showResults,
      setShowResults,
      formComplete,
      setFormComplete,
      
      // View state
      showForm,
      setShowForm,
      showingHistoryView,
      setShowingHistoryView,
      
      // History
      selectedEvaluation,
      setSelectedEvaluation,
      evaluationHistory,
      isLoadingHistory,
      loadEmployeeHistory,
      handleDeleteEvaluation,
      isDeletingEvaluation,
      
      // Actions
      handleCompanyChange,
      handleEmployeeChange,
      handleFormChange,
      handleNewEvaluation,
      handleExitResults,
      handleSaveAndComplete,
      
      // Form state
      isSubmitting,
      isNewEvaluation,
      
      // Derived data
      selectedEmployee,
      selectedFormTitle,
    }}>
      {children}
    </FormPageContext.Provider>
  );
};
