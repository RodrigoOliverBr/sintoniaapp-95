
import { useState } from "react";
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

    // Validar que todas as perguntas foram respondidas
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
      // Contar respostas sim/não
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
      
      // Determinar se estamos editando uma avaliação existente ou criando uma nova
      let formResultToSave = existingFormResult;
      
      if (selectedEvaluation && !isNewEvaluation) {
        // Estamos editando uma avaliação existente
        console.log(`Editando avaliação existente com ID: ${selectedEvaluation.id}`);
        formResultToSave = selectedEvaluation;
      }
      
      // Preservar as notas do analista existentes
      const notesAnalista = selectedEvaluation?.notas_analista || formResult?.notas_analista || existingFormResult?.notas_analista || '';
      console.log(`Preservando notas do analista: "${notesAnalista}"`);
      
      // Preparar dados do resultado do formulário
      const formResultData = {
        id: formResultToSave?.id || '',
        employeeId: selectedEmployeeId,
        empresa_id: selectedCompanyId,
        formulario_id: selectedFormId,
        answers,
        total_sim: totalYes,
        total_nao: totalNo,
        notas_analista: notesAnalista,
        is_complete: true, // Explicitamente definido como true para formulários completos
        last_updated: new Date().toISOString(),
        created_at: formResultToSave?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log("Salvando os dados do formulário...");
      
      // Salvar resultado do formulário
      await saveFormResult(formResultData);
      sonnerToast.success("Formulário salvo com sucesso!");
      
      console.log("Dados salvos, obtendo resultado atualizado...");
      
      // Obter resultado atualizado
      const updatedResult = await getFormResultByEmployeeId(selectedEmployeeId, selectedFormId);
      
      if (updatedResult) {
        console.log("Resultado atualizado obtido com sucesso:", updatedResult.id);
        setFormResult(updatedResult);
        setShowResults(true);
        setFormComplete(true);
        setIsNewEvaluation(false); // Redefinir sinalizador de nova avaliação após salvar
        
        // Recarregar histórico após concluir para obter a lista atualizada
        console.log("Recarregando histórico de avaliações do funcionário...");
        await loadEmployeeHistory();
        
        return updatedResult;
      } else {
        console.warn("Não foi possível obter o resultado atualizado do servidor");
        // Se não conseguirmos obter o resultado atualizado, retornar o que temos
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
    setFormResult(null);
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
