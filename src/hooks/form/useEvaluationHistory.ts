
import { useState, useEffect } from "react";
import { FormResult } from "@/types/form";
import { getEmployeeFormHistory, deleteFormEvaluation } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

export function useEvaluationHistory(selectedEmployeeId: string | undefined) {
  const [evaluationHistory, setEvaluationHistory] = useState<FormResult[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [showingHistoryView, setShowingHistoryView] = useState<boolean>(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<FormResult | null>(null);
  const [isDeletingEvaluation, setIsDeletingEvaluation] = useState<boolean>(false);
  const { toast } = useToast();

  // Load employee evaluation history when employee ID changes
  useEffect(() => {
    if (selectedEmployeeId) {
      loadEmployeeHistory();
    } else {
      setEvaluationHistory([]);
      setShowingHistoryView(false);
    }
  }, [selectedEmployeeId]);

  const loadEmployeeHistory = async () => {
    if (!selectedEmployeeId) return;

    setIsLoadingHistory(true);
    try {
      const history = await getEmployeeFormHistory(selectedEmployeeId);
      setEvaluationHistory(history);
      
      // If there's history, show the history view
      if (history && history.length > 0) {
        setShowingHistoryView(true);
      } else {
        setShowingHistoryView(false);
      }
    } catch (error) {
      console.error("Error loading employee history:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de avaliações",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteEvaluation = async (evaluationId: string) => {
    setIsDeletingEvaluation(true);
    try {
      console.log(`Deleting evaluation ID: ${evaluationId}`);
      const result = await deleteFormEvaluation(evaluationId);
      
      // Successfully deleted
      sonnerToast.success("Avaliação excluída com sucesso");
      
      // Update the state locally by removing the deleted evaluation
      setEvaluationHistory(prevHistory => 
        prevHistory.filter(evaluation => evaluation.id !== evaluationId)
      );
      
      // If after filtering there are no evaluations left, hide history view
      setEvaluationHistory(current => {
        const updated = current.filter(evaluation => evaluation.id !== evaluationId);
        if (updated.length === 0) {
          setShowingHistoryView(false);
        }
        return updated;
      });
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      sonnerToast.error("Erro ao excluir avaliação");
    } finally {
      setIsDeletingEvaluation(false);
    }
  };

  return {
    evaluationHistory,
    isLoadingHistory,
    showingHistoryView,
    setShowingHistoryView,
    selectedEvaluation,
    setSelectedEvaluation,
    isDeletingEvaluation,
    loadEmployeeHistory,
    handleDeleteEvaluation
  };
}
