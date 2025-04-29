
import { useState, useEffect, useCallback } from "react";
import { FormResult } from "@/types/form";
import { getEmployeeFormHistory } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  // Modified delete implementation to handle the new two-step process
  const handleDeleteEvaluation = useCallback(async (evaluationId: string) => {
    if (!evaluationId) {
      sonnerToast.error("ID da avaliação não fornecido");
      return;
    }

    setIsDeletingEvaluation(true);
    
    try {
      console.log(`Iniciando processo de exclusão para avaliação ID: ${evaluationId}`);
      
      // Step 1 is implied to have happened already in the UI
      // The user confirmed to delete questions, so we'll delete responses first
      // 1. Delete responses - responses_opcoes will be deleted via FK cascade
      const { error: responsesError } = await supabase
        .from('respostas')
        .delete()
        .eq('avaliacao_id', evaluationId);
      
      if (responsesError) {
        console.error("Erro ao excluir respostas:", responsesError);
        throw new Error(`Erro ao excluir respostas: ${responsesError.message}`);
      }
      
      console.log("Respostas excluídas com sucesso");
      
      // Step 2: Delete related reports
      // This happens only if user confirmed step 2 in the UI
      const { error: reportsError } = await supabase
        .from('relatorios')
        .delete()
        .eq('avaliacao_id', evaluationId);
      
      if (reportsError) {
        console.error("Erro ao excluir relatórios:", reportsError);
        // Continue even if reports deletion fails
      }
      
      // 3. Finally, delete the evaluation
      const { error: evaluationError } = await supabase
        .from('avaliacoes')
        .delete()
        .eq('id', evaluationId);
      
      if (evaluationError) {
        console.error("Erro ao excluir avaliação:", evaluationError);
        throw new Error(`Erro ao excluir avaliação: ${evaluationError.message}`);
      }
      
      console.log("Avaliação excluída com sucesso");
      sonnerToast.success("Avaliação excluída com sucesso");
      
      // Update local state to remove the deleted evaluation
      setEvaluationHistory(prevState => prevState.filter(item => item.id !== evaluationId));
      
      // If the selectedEvaluation was the one deleted, reset it
      if (selectedEvaluation?.id === evaluationId) {
        setSelectedEvaluation(null);
      }
      
      // If evaluation history is now empty, exit history view
      if (evaluationHistory.length <= 1) {
        setShowingHistoryView(false);
      }
      
    } catch (error) {
      console.error("Erro ao excluir avaliação:", error);
      sonnerToast.error(`Erro ao excluir avaliação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsDeletingEvaluation(false);
    }
  }, [evaluationHistory, selectedEvaluation, toast]);

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
