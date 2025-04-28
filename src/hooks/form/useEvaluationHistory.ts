
import { useState, useEffect, useCallback } from "react";
import { FormResult } from "@/types/form";
import { getEmployeeFormHistory, deleteFormEvaluation } from "@/services";
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

  // New implementation of delete using direct database operations
  const handleDeleteEvaluation = useCallback(async (evaluationId: string) => {
    if (!evaluationId) {
      sonnerToast.error("ID da avaliação não fornecido");
      return;
    }

    setIsDeletingEvaluation(true);
    
    try {
      console.log(`Iniciando processo de exclusão para a avaliação ID: ${evaluationId}`);
      
      // 1. First verify the evaluation exists
      const { data: existingEvaluation, error: checkError } = await supabase
        .from('avaliacoes')
        .select('id')
        .eq('id', evaluationId)
        .single();
      
      if (checkError || !existingEvaluation) {
        console.error("Avaliação não encontrada:", checkError || "Não existe");
        throw new Error("Avaliação não encontrada");
      }
      
      // 2. Delete related responses (this will cascade to resposta_opcoes)
      const { error: responsesError } = await supabase
        .from('respostas')
        .delete()
        .eq('avaliacao_id', evaluationId);
      
      if (responsesError) {
        console.error("Erro ao excluir respostas:", responsesError);
        throw responsesError;
      }
      
      // 3. Delete reports linked to this evaluation
      const { error: reportsError } = await supabase
        .from('relatorios')
        .delete()
        .eq('avaliacao_id', evaluationId);
      
      if (reportsError) {
        console.error("Erro ao excluir relatórios:", reportsError);
        // We continue even if reports deletion fails
      }
      
      // 4. Finally delete the evaluation itself
      const { error: evaluationError } = await supabase
        .from('avaliacoes')
        .delete()
        .eq('id', evaluationId);
      
      if (evaluationError) {
        console.error("Erro ao excluir avaliação:", evaluationError);
        throw evaluationError;
      }
      
      console.log("Avaliação excluída com sucesso");
      sonnerToast.success("Avaliação excluída com sucesso");
      
      // 5. Update local state by removing deleted evaluation
      setEvaluationHistory(prev => prev.filter(item => item.id !== evaluationId));
      
      // If evaluation history is now empty, hide the history view
      setEvaluationHistory(current => {
        const updated = current.filter(item => item.id !== evaluationId);
        if (updated.length === 0) {
          setShowingHistoryView(false);
        }
        return updated;
      });
    } catch (error) {
      console.error("Erro ao excluir avaliação:", error);
      sonnerToast.error(`Erro ao excluir avaliação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsDeletingEvaluation(false);
    }
  }, []);

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
