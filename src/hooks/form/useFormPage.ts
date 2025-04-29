
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { useCompanySelection } from "@/hooks/form/useCompanySelection";
import { useEmployeeSelection } from "@/hooks/form/useEmployeeSelection";
import { useFormSelection } from "@/hooks/form/useFormSelection";
import { useFormQuestions } from "@/hooks/form/useFormQuestions";
import { useFormAnswers } from "@/hooks/form/useFormAnswers";
import { useEvaluationHistory } from "@/hooks/form/useEvaluationHistory";
import { useFormCompletion } from "@/hooks/form/useFormCompletion";
import { useFormView } from "@/hooks/form/useFormView";
import { FormResult } from "@/types/form";

export function useFormPage() {
  // Custom hooks for forms
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

  const {
    questions,
    formSections,
  } = useFormQuestions(selectedFormId);

  const {
    answers,
    setAnswers
  } = useFormAnswers();

  const {
    selectedEvaluation,
    setSelectedEvaluation,
    evaluationHistory,
    isLoadingHistory,
    loadEmployeeHistory,
    handleDeleteEvaluation,
    isDeletingEvaluation
  } = useEvaluationHistory(selectedEmployeeId);

  const {
    isSubmitting,
    formComplete,
    setFormComplete,
    isNewEvaluation,
    setIsNewEvaluation,
    showResults,
    setShowResults,
    formResult,
    setFormResult,
    handleSaveAndComplete,
    resetFormState
  } = useFormCompletion();

  const {
    showForm,
    setShowForm,
    showingHistoryView,
    setShowingHistoryView,
    viewNewEvaluation,
    viewHistoryList,
    exitFormView
  } = useFormView();

  // Reset form when switching between employees
  useEffect(() => {
    resetForm();
    
    if (selectedEmployeeId) {
      // Load history when an employee is selected, don't show the form yet
      setShowForm(false);
    }
  }, [selectedEmployeeId]);

  const resetForm = () => {
    setAnswers({});
    resetFormState();
    setSelectedEvaluation(null);
    setShowForm(false);
  };

  const handleCompanyChange = (value: string) => {
    setSelectedCompanyId(value);
    setSelectedEmployeeId(undefined);
    resetForm();
    setShowingHistoryView(false);
  };

  const handleEmployeeChange = (value: string) => {
    setSelectedEmployeeId(value);
    resetForm();
    setShowingHistoryView(false);
  };

  const handleFormChange = (value: string) => {
    setSelectedFormId(value);
    setAnswers({});
    resetForm();
  };

  const handleNewEvaluation = () => {
    resetForm();
    setShowingHistoryView(false);
    setIsNewEvaluation(true);
    setShowForm(true);
    console.log("Iniciando nova avaliação");
  };
  
  const handleExitResults = () => {
    // Navigate to the home page instead of going back to the form
    setShowResults(false);
    setFormComplete(false);
    setSelectedEvaluation(null);
    setShowForm(false);
    setShowingHistoryView(false);
  };

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
  const selectedFormTitle = availableForms.find(f => f.id === selectedFormId)?.titulo || "Formulário";

  const handleSaveAndCompleteForm = async () => {
    if (!selectedFormId || !selectedEmployeeId || !selectedCompanyId) {
      sonnerToast.warning("Por favor, selecione empresa, funcionário e formulário antes de continuar");
      return;
    }

    // Check for duplicate evaluations before saving
    console.log("Verificando avaliações existentes para o funcionário...");
    await loadEmployeeHistory();

    const duplicateEvaluation = evaluationHistory.find(eval => 
      eval.is_complete && 
      eval.formulario_id === selectedFormId && 
      eval.id !== (selectedEvaluation?.id || '')
    );

    if (duplicateEvaluation && !selectedEvaluation) {
      console.log("Avaliação completa já existe para este formulário e funcionário.");
      sonnerToast.warning("Este funcionário já possui uma avaliação completa para este formulário.");
      setShowingHistoryView(true);
      setShowForm(false);
      return;
    }

    const updatedResult = await handleSaveAndComplete({
      selectedFormId,
      selectedEmployeeId,
      selectedCompanyId,
      answers,
      existingFormResult: formResult,
      selectedEvaluation,
      loadEmployeeHistory
    });
    
    if (updatedResult) {
      setSelectedEvaluation(updatedResult);
      setShowResults(true);
      setShowingHistoryView(false);
    }
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
    handleCompanyChange,
    handleEmployeeChange,
    handleFormChange,
    handleNewEvaluation,
    handleExitResults,
    handleSaveAndComplete: handleSaveAndCompleteForm,
  };
}
