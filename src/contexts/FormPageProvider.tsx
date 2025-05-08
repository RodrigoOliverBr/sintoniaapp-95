
import React from "react";
import { FormPageContext } from "./FormPageContext";
import { useFormPage } from "@/hooks/form/useFormPage";

interface FormPageProviderProps {
  children: React.ReactNode;
}

export const FormPageProvider: React.FC<FormPageProviderProps> = ({ children }) => {
  const formPageData = useFormPage();
  
  return (
    <FormPageContext.Provider value={{
      // Company selection
      companies: formPageData.companies,
      selectedCompanyId: formPageData.selectedCompanyId,
      setSelectedCompanyId: formPageData.setSelectedCompanyId,
      
      // Employee selection
      employees: formPageData.employees,
      selectedEmployeeId: formPageData.selectedEmployeeId,
      setSelectedEmployeeId: formPageData.setSelectedEmployeeId,
      
      // Form selection
      availableForms: formPageData.availableForms,
      selectedFormId: formPageData.selectedFormId,
      setSelectedFormId: formPageData.setSelectedFormId,
      
      // Questions and sections
      questions: formPageData.questions,
      formSections: formPageData.formSections,
      
      // Form state
      answers: formPageData.answers,
      setAnswers: formPageData.setAnswers,
      formResult: formPageData.formResult,
      setFormResult: formPageData.setFormResult,
      showResults: formPageData.showResults,
      setShowResults: formPageData.setShowResults,
      formComplete: formPageData.formComplete,
      setFormComplete: formPageData.setFormComplete,
      showForm: formPageData.showForm,
      setShowForm: formPageData.setShowForm,
      
      // History
      selectedEvaluation: formPageData.selectedEvaluation,
      setSelectedEvaluation: formPageData.setSelectedEvaluation,
      evaluationHistory: formPageData.evaluationHistory,
      isLoadingHistory: formPageData.isLoadingHistory,
      showingHistoryView: formPageData.showingHistoryView,
      setShowingHistoryView: formPageData.setShowingHistoryView,
      loadEmployeeHistory: formPageData.loadEmployeeHistory,
      handleDeleteEvaluation: formPageData.handleDeleteEvaluation,
      isDeletingEvaluation: formPageData.isDeletingEvaluation,
      
      // Actions
      handleCompanyChange: formPageData.handleCompanyChange,
      handleEmployeeChange: formPageData.handleEmployeeChange,
      handleFormChange: formPageData.handleFormChange,
      handleNewEvaluation: formPageData.handleNewEvaluation,
      handleExitResults: formPageData.handleExitResults,
      handleSaveAndComplete: formPageData.handleSaveAndComplete,
      
      // Form state
      isSubmitting: formPageData.isSubmitting,
      isNewEvaluation: formPageData.isNewEvaluation,
      setIsNewEvaluation: formPageData.setIsNewEvaluation,
      
      // Derived data
      selectedEmployee: formPageData.selectedEmployee,
      selectedFormTitle: formPageData.selectedFormTitle,
    }}>
      {children}
    </FormPageContext.Provider>
  );
};
