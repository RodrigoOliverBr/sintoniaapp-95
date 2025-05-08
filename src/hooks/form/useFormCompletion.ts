
import { useState } from "react";
import { FormResult } from "@/types/form";
import { saveFormResult, getEvaluationById } from "@/services/form/formService";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

export function useFormCompletion() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewEvaluation, setIsNewEvaluation] = useState(true);
  const { toast } = useToast();

  const handleSaveAndComplete = async ({
    selectedFormId,
    selectedEmployeeId,
    selectedCompanyId,
    answers,
    existingFormResult,
    selectedEvaluation,
    loadEmployeeHistory
  }: {
    selectedFormId: string;
    selectedEmployeeId: string;
    selectedCompanyId: string;
    answers: Record<string, any>;
    existingFormResult: FormResult | null;
    selectedEvaluation: FormResult | null;
    loadEmployeeHistory: () => Promise<void>;
  }) => {
    if (!selectedFormId || !selectedEmployeeId || !selectedCompanyId) {
      toast({
        title: "Atenção",
        description: "Selecione empresa, funcionário e formulário antes de continuar.",
        variant: "destructive",
      });
      return null;
    }

    // Validate answers
    const unansweredQuestions = Object.values(answers).filter(answer => 
      answer.answer === null || answer.answer === undefined
    );

    if (unansweredQuestions.length > 0) {
      toast({
        title: "Atenção",
        description: `Por favor, responda todas as ${unansweredQuestions.length} perguntas antes de concluir.`,
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsSubmitting(true);

      // Count yes/no answers
      let totalYes = 0;
      let totalNo = 0;
      
      Object.values(answers).forEach(answer => {
        if (answer.answer === true) totalYes++;
        else if (answer.answer === false) totalNo++;
      });

      // Map form result data to the structure expected by saveFormResult
      const evaluationData = {
        id: selectedEvaluation?.id || existingFormResult?.id,
        funcionario_id: selectedEmployeeId,
        empresa_id: selectedCompanyId,
        formulario_id: selectedFormId,
        total_sim: totalYes,
        total_nao: totalNo,
        is_complete: true,
        notas_analista: existingFormResult?.notas_analista || selectedEvaluation?.notas_analista || "",
        answers
      };
      
      // Save the evaluation
      const evaluationId = await saveFormResult(evaluationData);
      console.log("Form saved with ID:", evaluationId);
      
      // Success message
      sonnerToast.success("Formulário salvo com sucesso!");
      
      // Refresh evaluation history
      if (loadEmployeeHistory) {
        await loadEmployeeHistory();
      }
      
      // Get the updated evaluation with all data
      const updatedResult = await getEvaluationById(evaluationId);
      return updatedResult;
    } catch (error: any) {
      console.error("Error saving form:", error);
      
      toast({
        title: "Erro",
        description: `Não foi possível salvar o formulário: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFormState = () => {
    setIsNewEvaluation(true);
  };

  return {
    isSubmitting,
    isNewEvaluation,
    setIsNewEvaluation,
    handleSaveAndComplete,
    resetFormState,
  };
}
