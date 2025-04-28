
import { useState, useEffect } from "react";
import { FormResult } from "@/types/form";
import { getEmployeeFormHistory, deleteFormEvaluation } from "@/services/form";
import { useToast } from "@/hooks/use-toast";

export function useEvaluationHistory(selectedEmployeeId: string | undefined) {
  const [selectedEvaluation, setSelectedEvaluation] = useState<FormResult | null>(null);
  const [evaluationHistory, setEvaluationHistory] = useState<FormResult[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showingHistoryView, setShowingHistoryView] = useState(false);
  const { toast } = useToast();

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
      console.log(`Carregando histórico para o funcionário: ${selectedEmployeeId}`);
      const history = await getEmployeeFormHistory(selectedEmployeeId);
      console.log(`Histórico carregado: ${history.length} avaliações`);
      
      setEvaluationHistory(history);
      setShowingHistoryView(history.length > 0);
      
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
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
    try {
      setIsLoadingHistory(true);
      console.log(`Iniciando exclusão da avaliação: ${evaluationId}`);
      
      const deleteSuccess = await deleteFormEvaluation(evaluationId);
      
      if (deleteSuccess) {
        console.log("Exclusão bem-sucedida, atualizando estado local");
        
        // Atualizar estado local para feedback imediato
        setEvaluationHistory(prevEvaluations => {
          const updatedEvaluations = prevEvaluations.filter(
            evaluation => evaluation.id !== evaluationId
          );
          return updatedEvaluations;
        });
        
        // Limpar avaliação selecionada se necessário
        if (selectedEvaluation?.id === evaluationId) {
          setSelectedEvaluation(null);
        }
        
        toast({
          title: "Sucesso",
          description: "Avaliação excluída com sucesso.",
        });
        
        // Recarregar histórico para garantir sincronização
        await loadEmployeeHistory();
      } else {
        console.error("Falha ao excluir avaliação");
        toast({
          title: "Erro",
          description: "Não foi possível excluir a avaliação.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao excluir avaliação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a avaliação.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  return {
    selectedEvaluation,
    setSelectedEvaluation,
    evaluationHistory,
    setEvaluationHistory,
    isLoadingHistory,
    showingHistoryView,
    setShowingHistoryView,
    loadEmployeeHistory,
    handleDeleteEvaluation
  };
}
