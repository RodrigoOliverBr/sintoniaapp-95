
import { useState } from "react";
import { FormResult } from "@/types/avaliacao";
import { saveFormResult, getFormResultByEmployeeId } from "@/services/form";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

export function useFormSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSaveForm = async (
    formData: {
      selectedFormId: string;
      selectedEmployeeId: string;
      selectedCompanyId: string;
      answers: Record<string, any>;
      formResult: FormResult | null;
    },
    options: {
      completeForm?: boolean;
      onSuccess: (updatedResult: FormResult) => void;
      moveToNextSection: () => boolean;
    }
  ) => {
    const { selectedFormId, selectedEmployeeId, selectedCompanyId, answers, formResult } = formData;
    const { completeForm = false, onSuccess, moveToNextSection } = options;

    if (!selectedFormId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um formulário",
        variant: "destructive",
      });
      return;
    }

    // Validate that all questions have been answered
    const unansweredQuestions = Object.values(answers).filter(
      answer => answer.answer === null || answer.answer === undefined
    );

    if (unansweredQuestions.length > 0) {
      toast({
        title: "Atenção",
        description: "Por favor, responda todas as perguntas antes de prosseguir",
        variant: "destructive", // Changed from "warning" to "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Iniciando salvamento do formulário');
      console.log(`FormID: ${selectedFormId}, EmployeeID: ${selectedEmployeeId}, CompanyID: ${selectedCompanyId}`);
      console.log(`Respostas: ${Object.keys(answers).length}`);
      
      let totalYes = 0;
      let totalNo = 0;
      
      Object.values(answers).forEach(answer => {
        if (answer.answer === true) {
          totalYes++;
        } else if (answer.answer === false) {
          totalNo++;
        }
      });
      
      console.log(`Total SIM: ${totalYes}, Total NÃO: ${totalNo}, Completo: ${completeForm}`);
      
      const isComplete = completeForm;
      
      const formResultData: FormResult = {
        id: formResult?.id || '',
        employeeId: selectedEmployeeId,
        empresa_id: selectedCompanyId,
        formulario_id: selectedFormId,
        answers,
        total_sim: totalYes,
        total_nao: totalNo,
        notas_analista: formResult?.notas_analista || '',
        is_complete: isComplete,
        last_updated: new Date().toISOString(),
        created_at: formResult?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        totalYes,
        totalNo,
        analyistNotes: formResult?.analyistNotes || '',
        yesPerSeverity: formResult?.yesPerSeverity || {
          "LEVEMENTE PREJUDICIAL": 0,
          "PREJUDICIAL": 0,
          "EXTREMAMENTE PREJUDICIAL": 0
        }
      };
      
      await saveFormResult(formResultData);
      
      console.log('Formulário salvo com sucesso');
      sonnerToast.success("Formulário salvo com sucesso!");
      
      const updatedResult = await getFormResultByEmployeeId(selectedEmployeeId, selectedFormId);
      
      if (updatedResult) {
        console.log('Resultado atualizado recebido:', updatedResult);
        onSuccess(updatedResult);

        if (!completeForm) {
          moveToNextSection();
        }
      } else {
        console.warn('Não foi possível obter o resultado atualizado');
        // Se não conseguir obter o resultado atualizado, use o formResultData como um backup
        onSuccess(formResultData);
      }
    } catch (error: any) {
      console.error("Erro ao salvar o formulário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o formulário: " + (error.message || "Erro desconhecido"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSaveForm,
  };
}
