
import { useCallback } from "react";
import { toast as sonnerToast } from "sonner";
import { FormResult } from "@/types/form";
import { useFormCompletion } from "@/hooks/form/useFormCompletion";

export function useFormSubmissionHandler({ 
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
}: {
  selectedFormId: string;
  selectedEmployeeId?: string;
  selectedCompanyId?: string;
  answers: Record<string, any>;
  formResult: FormResult | null;
  evaluationHistory: FormResult[];
  selectedEvaluation: FormResult | null;
  setSelectedEvaluation: (evaluation: FormResult | null) => void;
  setShowResults: (show: boolean) => void;
  setShowingHistoryView: (show: boolean) => void;
  loadEmployeeHistory: () => Promise<void>;
}) {
  const {
    isSubmitting,
    isNewEvaluation,
    setIsNewEvaluation,
    handleSaveAndComplete: saveAndComplete,
    resetFormState
  } = useFormCompletion();

  const handleSaveAndCompleteForm = useCallback(async () => {
    if (!selectedFormId || !selectedEmployeeId || !selectedCompanyId) {
      sonnerToast.warning("Por favor, selecione empresa, funcionário e formulário antes de continuar");
      return;
    }

    // Check for duplicate evaluations before saving
    console.log("Verificando avaliações existentes para o funcionário...");
    await loadEmployeeHistory();

    const duplicateEvaluation = evaluationHistory.find(evaluation => 
      evaluation.is_complete && 
      evaluation.formulario_id === selectedFormId && 
      evaluation.id !== (selectedEvaluation?.id || '')
    );

    if (duplicateEvaluation && !selectedEvaluation) {
      console.log("Avaliação completa já existe para este formulário e funcionário.");
      sonnerToast.warning("Este funcionário já possui uma avaliação completa para este formulário.");
      setShowingHistoryView(true);
      return;
    }

    const updatedResult = await saveAndComplete({
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
  }, [
    selectedFormId, 
    selectedEmployeeId, 
    selectedCompanyId, 
    answers, 
    formResult, 
    evaluationHistory,
    selectedEvaluation,
    loadEmployeeHistory,
    saveAndComplete,
    setSelectedEvaluation,
    setShowResults,
    setShowingHistoryView
  ]);

  return {
    isSubmitting,
    isNewEvaluation,
    setIsNewEvaluation,
    resetFormState,
    handleSaveAndCompleteForm
  };
}
