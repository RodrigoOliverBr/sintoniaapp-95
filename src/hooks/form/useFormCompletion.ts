
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { saveFormResult, getFormResultByEmployeeId } from "@/services/form";
import { FormResult } from "@/types/form";

export function useFormCompletion() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  const [isNewEvaluation, setIsNewEvaluation] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [formResult, setFormResult] = useState<FormResult | null>(null);

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
      sonnerToast.warning("Por favor, selecione empresa, funcionário e formulário antes de continuar");
      return null;
    }

    // Validate all questions are answered
    const unansweredQuestions = Object.values(answers).filter(
      answer => answer.answer === null || answer.answer === undefined
    );
    
    if (unansweredQuestions.length > 0) {
      sonnerToast.warning(`Por favor, responda todas as ${unansweredQuestions.length} perguntas pendentes antes de concluir`);
      return null;
    }
    
    setIsSubmitting(true);
    console.log("Iniciando o processo de salvamento da avaliação...");

    try {
      // Count actual yes/no answers
      let totalYes = 0;
      let totalNo = 0;
      
      Object.values(answers).forEach(answer => {
        if (answer.answer === true) {
          totalYes++;
        } else if (answer.answer === false) {
          totalNo++;
        }
      });
      
      console.log(`Total de respostas SIM: ${totalYes}, NÃO: ${totalNo}`);
      
      // Determine if we're editing an existing evaluation or creating a new one
      let formResultToSave = existingFormResult;
      
      if (selectedEvaluation && !isNewEvaluation) {
        // We're editing an existing evaluation
        console.log(`Editando avaliação existente com ID: ${selectedEvaluation.id}`);
        formResultToSave = selectedEvaluation;
      }
      
      // Get existing analyst notes
      const notesAnalista = selectedEvaluation?.notas_analista || formResult?.notas_analista || '';
      
      // Prepare form result data
      const formResultData = {
        id: formResultToSave?.id || '',
        employeeId: selectedEmployeeId,
        empresa_id: selectedCompanyId,
        formulario_id: selectedFormId,
        answers,
        total_sim: totalYes,
        total_nao: totalNo,
        notas_analista: notesAnalista,
        is_complete: true, // Explicitly set to true for completed forms
        last_updated: new Date().toISOString(),
        created_at: formResultToSave?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log("Salvando os dados do formulário...");
      
      // Save form result
      await saveFormResult(formResultData);
      sonnerToast.success("Formulário salvo com sucesso!");
      
      console.log("Dados salvos, obtendo resultado atualizado...");
      
      // Get updated result
      const updatedResult = await getFormResultByEmployeeId(selectedEmployeeId, selectedFormId);
      
      if (updatedResult) {
        console.log("Resultado atualizado obtido com sucesso:", updatedResult.id);
        setFormResult(updatedResult);
        setShowResults(true);
        setFormComplete(true);
        setIsNewEvaluation(false); // Reset new evaluation flag after saving
        
        // Reload history after completing to get the updated list
        console.log("Recarregando histórico de avaliações do funcionário...");
        await loadEmployeeHistory();
        
        return updatedResult;
      } else {
        console.warn("Não foi possível obter o resultado atualizado do servidor");
        // If we can't get the updated result, return what we have
        return formResultData;
      }
    } catch (error: any) {
      console.error("Erro ao salvar o formulário:", error);
      sonnerToast.error(`Erro ao salvar o formulário: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
    
    return null;
  };

  const resetFormState = () => {
    setFormComplete(false);
    setShowResults(false);
    setIsNewEvaluation(false);
  };

  return {
    isSubmitting,
    formComplete,
    setFormComplete,
    isNewEvaluation,
    setIsNewEvaluation,
    showResults,
    setShowResults,
    formResult,
    setFormResult,
    handleSaveAndComplete,
    resetFormState
  };
}
