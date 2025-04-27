
import { useCompanySelection } from "./form/useCompanySelection";
import { useEmployeeSelection } from "./form/useEmployeeSelection";
import { useFormSelection } from "./form/useFormSelection";
import { useFormQuestions } from "./form/useFormQuestions";
import { useFormAnswers } from "./form/useFormAnswers";
import { useEvaluationHistory } from "./form/useEvaluationHistory";

export function useFormData() {
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
    currentSection,
    setCurrentSection
  } = useFormQuestions(selectedFormId);

  const {
    answers,
    setAnswers,
    formResult,
    setFormResult,
    isSubmitting,
    setIsSubmitting,
    formComplete,
    setFormComplete,
    showResults,
    setShowResults
  } = useFormAnswers();

  const {
    selectedEvaluation,
    setSelectedEvaluation,
    evaluationHistory,
    setEvaluationHistory,
    isLoadingHistory,
    showingHistoryView,
    setShowingHistoryView,
    loadEmployeeHistory
  } = useEvaluationHistory(selectedEmployeeId);

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
    currentSection,
    setCurrentSection,

    // Form answers and state
    answers,
    setAnswers,
    formResult,
    setFormResult,
    isSubmitting,
    setIsSubmitting,
    formComplete,
    setFormComplete,
    showResults,
    setShowResults,

    // Evaluation history
    selectedEvaluation,
    setSelectedEvaluation,
    evaluationHistory,
    setEvaluationHistory,
    isLoadingHistory,
    showingHistoryView,
    setShowingHistoryView,
    loadEmployeeHistory,
  };
}
