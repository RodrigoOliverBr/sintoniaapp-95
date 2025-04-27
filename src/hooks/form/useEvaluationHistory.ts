
import { useState, useEffect } from "react";
import { FormResult } from "@/types/form";
import { getEmployeeFormHistory } from "@/services/form";
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
      
      if (history.length > 0) {
        if (showingHistoryView) {
          console.log("Mantendo visualização de histórico");
        } else {
          console.log("Ativando visualização de histórico");
          setShowingHistoryView(true);
        }
      } else {
        console.log("Desativando visualização de histórico - sem avaliações");
        setShowingHistoryView(false);
      }
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

  return {
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
