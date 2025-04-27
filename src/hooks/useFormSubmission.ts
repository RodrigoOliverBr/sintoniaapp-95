
import { useState } from "react";
import { FormResult, Question } from "@/types/form";
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

    setIsSubmitting(true);
    
    try {
      let totalYes = 0;
      let totalNo = 0;
      
      Object.values(answers).forEach(answer => {
        if (answer.answer === true) {
          totalYes++;
        } else if (answer.answer === false) {
          totalNo++;
        }
      });
      
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
        updated_at: new Date().toISOString()
      };
      
      await saveFormResult(formResultData);
      
      sonnerToast.success("Formulário salvo com sucesso!");
      
      const updatedResult = await getFormResultByEmployeeId(selectedEmployeeId, selectedFormId);
      
      if (updatedResult) {
        onSuccess(updatedResult);

        if (!completeForm) {
          moveToNextSection();
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar o formulário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o formulário",
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
