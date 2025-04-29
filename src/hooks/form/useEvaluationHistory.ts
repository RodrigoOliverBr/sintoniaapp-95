
import { useState, useCallback, useEffect } from "react";
import { FormResult } from "@/types/form";
import { getEmployeeFormHistory, deleteFormEvaluation } from "@/services/form";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  const verifyDeletion = async (evaluationId: string): Promise<boolean> => {
    try {
      const { data: evaluation, error } = await supabase
        .from('avaliacoes')
        .select('id')
        .eq('id', evaluationId)
        .maybeSingle();
        
      if (error) {
        console.error("Error verifying deletion:", error);
        return false;
      }
      
      // If the evaluation still exists, deletion failed
      return !evaluation;
    } catch (e) {
      console.error("Error checking evaluation deletion:", e);
      return false;
    }
  }

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
      console.log(`Iniciando exclusão da avaliação com ID: ${evaluationId}`);
      
      // Call the service to delete from database
      await deleteFormEvaluation(evaluationId);
      
      // Verify if deletion was successful by checking if the evaluation still exists
      const isDeleted = await verifyDeletion(evaluationId);
      
      if (isDeleted) {
        console.log("Avaliação excluída com sucesso no banco de dados");
        
        // Update the local state to remove the deleted evaluation
        setEvaluationHistory(prevHistory => 
          prevHistory.filter(evaluation => evaluation.id !== evaluationId)
        );
        
        // Reset selected evaluation if it was the one deleted
        if (selectedEvaluation && selectedEvaluation.id === evaluationId) {
          setSelectedEvaluation(null);
        }
        
        sonnerToast.success("Avaliação excluída com sucesso do banco de dados!");
      } else {
        console.error("Falha na verificação da exclusão da avaliação");
        sonnerToast.error("A exclusão parece ter falhado. A avaliação ainda existe no banco de dados.");
        
        // Reload the history to ensure everything is in sync
        await loadEmployeeHistory();
      }
      
    } catch (error: any) {
      console.error("Erro ao excluir avaliação:", error);
      sonnerToast.error(`Não foi possível excluir a avaliação: ${error.message || "Erro desconhecido"}`);
      
      // Reload history to ensure UI is in sync with database
      await loadEmployeeHistory();
    } finally {
      setIsDeletingEvaluation(false);
    }
  }, [selectedEvaluation, loadEmployeeHistory]);

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
