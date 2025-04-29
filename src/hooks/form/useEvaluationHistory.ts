
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
      sonnerToast.error("Não foi possível carregar o histórico de avaliações");
      setEvaluationHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [employeeId]);

  const handleDeleteEvaluation = useCallback(async (evaluationId: string) => {
    if (!evaluationId) {
      sonnerToast.error("ID da avaliação inválido");
      return;
    }

    const confirmed = window.confirm(
      "Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita."
    );

    if (!confirmed) {
      return;
    }

    setIsDeletingEvaluation(true);
    try {
      console.log(`Deletando avaliação com ID: ${evaluationId}`);
      
      // Implementação melhorada para deletar a avaliação completa
      await deleteFormEvaluation(evaluationId);
      
      // Atualizar o estado local para remover a avaliação excluída
      setEvaluationHistory(prevHistory => 
        prevHistory.filter(evaluation => evaluation.id !== evaluationId)
      );
      
      // Resetar a avaliação selecionada se ela foi a que foi excluída
      if (selectedEvaluation && selectedEvaluation.id === evaluationId) {
        setSelectedEvaluation(null);
      }
      
      sonnerToast.success("Avaliação excluída com sucesso!");
      
    } catch (error: any) {
      console.error("Erro ao excluir avaliação:", error);
      sonnerToast.error(`Não foi possível excluir a avaliação: ${error.message || "Erro desconhecido"}`);
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
