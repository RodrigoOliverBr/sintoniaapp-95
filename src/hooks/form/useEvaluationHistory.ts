
import { useState, useCallback, useEffect } from "react";
import { FormResult } from "@/types/form";
import { getEmployeeFormHistory, deleteFormEvaluation } from "@/services/form";
import { toast as sonnerToast } from "sonner";

export function useEvaluationHistory(employeeId?: string) {
  const [evaluationHistory, setEvaluationHistory] = useState<FormResult[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isDeletingEvaluation, setIsDeletingEvaluation] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<FormResult | null>(null);

  const loadEmployeeHistory = useCallback(async () => {
    if (!employeeId) {
      setEvaluationHistory([]);
      return;
    }

    setIsLoadingHistory(true);
    try {
      console.log(`Loading evaluation history for employee ${employeeId}`);
      const history = await getEmployeeFormHistory(employeeId);
      setEvaluationHistory(history);
      console.log(`Loaded ${history.length} evaluations`);
    } catch (error) {
      console.error("Error loading employee evaluation history:", error);
      sonnerToast.error("Could not load evaluation history");
      setEvaluationHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [employeeId]);

  const handleDeleteEvaluation = useCallback(async (evaluationId: string) => {
    if (!evaluationId) {
      sonnerToast.error("Invalid evaluation ID");
      return;
    }

    setIsDeletingEvaluation(true);
    try {
      console.log(`Deleting evaluation with ID: ${evaluationId}`);
      
      // Call the deletion service
      await deleteFormEvaluation(evaluationId);
      
      console.log(`Successfully deleted evaluation ${evaluationId}`);
      
      // Update local state by removing the deleted evaluation
      setEvaluationHistory(prevHistory => 
        prevHistory.filter(evaluation => evaluation.id !== evaluationId)
      );
      
      // Reset selected evaluation if it was the one that was deleted
      if (selectedEvaluation && selectedEvaluation.id === evaluationId) {
        setSelectedEvaluation(null);
      }
      
      sonnerToast.success("Evaluation successfully deleted!");
      
    } catch (error: any) {
      console.error("Error deleting evaluation:", error);
      sonnerToast.error(`Could not delete evaluation: ${error.message || "Unknown error"}`);
    } finally {
      setIsDeletingEvaluation(false);
    }
  }, [selectedEvaluation]);

  useEffect(() => {
    if (employeeId) {
      loadEmployeeHistory();
    }
  }, [employeeId, loadEmployeeHistory]);

  return {
    selectedEvaluation,
    setSelectedEvaluation,
    evaluationHistory,
    isLoadingHistory,
    loadEmployeeHistory,
    handleDeleteEvaluation,
    isDeletingEvaluation
  };
}
