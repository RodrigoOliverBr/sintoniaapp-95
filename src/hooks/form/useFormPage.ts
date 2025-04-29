
import { useState, useEffect } from "react";
import { useFormQuestions } from "@/hooks/form/useFormQuestions";
import { useFormAnswers } from "@/hooks/form/useFormAnswers";
import { useEvaluationHistory } from "@/hooks/form/useEvaluationHistory";
import { useFormNavigation } from "@/hooks/form/useFormNavigation";
import { useFormSelections } from "@/hooks/form/useFormSelections";
import { useFormSubmissionHandler } from "@/hooks/form/useFormSubmissionHandler";

export function useFormPage() {
  // Get form selection state
  const {
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    availableForms,
    selectedFormId,
    setSelectedFormId,
    handleCompanyChange,
    handleEmployeeChange,
    handleFormChange,
    selectedEmployee,
    selectedFormTitle
  } = useFormSelections();

  // Get form questions and sections
  const {
    questions,
    formSections,
  } = useFormQuestions(selectedFormId);

  // Get form answers state
  const {
    answers,
    setAnswers,
    formResult,
    setFormResult,
    setIsSubmitting,
  } = useFormAnswers();

  // Get navigation state
  const {
    showResults,
    setShowResults,
    formComplete,
    setFormComplete,
    showForm,
    setShowForm,
    showingHistoryView,
    setShowingHistoryView,
    selectedEvaluation,
    setSelectedEvaluation,
    handleExitResults,
    handleNewEvaluation: navHandleNewEvaluation
  } = useFormNavigation();

  // Get evaluation history
  const {
    evaluationHistory,
    isLoadingHistory,
    loadEmployeeHistory,
    handleDeleteEvaluation,
    isDeletingEvaluation
  } = useEvaluationHistory(selectedEmployeeId);

  // Get form submission handler
  const {
    isSubmitting,
    isNewEvaluation,
    setIsNewEvaluation,
    resetFormState,
    handleSaveAndCompleteForm
  } = useFormSubmissionHandler({
    selectedFormId,
    selectedEmployeeId,
    selectedCompanyId,
    answers,
    formResult,
    evaluationHistory,
    selectedEvaluation,
    setSelectedEvaluation,
    setShowResults,
    setShowingHistoryView,
    loadEmployeeHistory
  });

  // Reset form when switching between employees
  useEffect(() => {
    resetForm();
    
    if (selectedEmployeeId) {
      // Load history when an employee is selected, don't show the form yet
      setShowForm(false);
      
      // Make sure to load the employee history
      loadEmployeeHistory();
    }
  }, [selectedEmployeeId]);

  const resetForm = () => {
    setAnswers({});
    resetFormState();
    setSelectedEvaluation(null);
    setShowForm(false);
  };

  const handleNewEvaluation = () => {
    resetForm();
    setIsNewEvaluation(true);
    navHandleNewEvaluation();
  };

  const handleEmployeeChangeWithReset = (value: string) => {
    handleEmployeeChange(value);
    resetForm();
    setShowingHistoryView(false);
  };

  const handleFormChangeWithReset = (value: string) => {
    handleFormChange(value);
    setAnswers({});
    resetForm();
  };

  const handleCompanyChangeWithReset = (value: string) => {
    handleCompanyChange(value);
    resetForm();
    setShowingHistoryView(false);
  };

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
    showForm,
    setShowForm,
    
    // History
    selectedEvaluation,
    setSelectedEvaluation,
    evaluationHistory,
    isLoadingHistory,
    showingHistoryView,
    setShowingHistoryView,
    loadEmployeeHistory,
    handleDeleteEvaluation,
    isDeletingEvaluation,
    
    // Actions
    handleCompanyChange: handleCompanyChangeWithReset,
    handleEmployeeChange: handleEmployeeChangeWithReset,
    handleFormChange: handleFormChangeWithReset,
    handleNewEvaluation,
    handleExitResults,
    handleSaveAndComplete: handleSaveAndCompleteForm,
    
    // Form state
    isSubmitting,
    isNewEvaluation,
    setIsNewEvaluation,
    
    // Derived data
    selectedEmployee,
    selectedFormTitle
  };
}
