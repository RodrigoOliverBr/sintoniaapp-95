
import { useState } from "react";
import { FormResult } from "@/types/form";
import { saveFormResult, getFormResultByEmployeeId } from "@/services/form";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      // Count yes/no answers
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
      const now = new Date().toISOString();
      
      // First, check if the evaluation exists in the database
      let evaluationId = formResult?.id;
      let newEvaluation = false;
      
      if (!evaluationId) {
        console.log("Creating new evaluation record");
        newEvaluation = true;
        
        // Create a new evaluation
        const { data: newEval, error: newEvalError } = await supabase
          .from('avaliacoes')
          .insert([
            {
              funcionario_id: selectedEmployeeId,
              empresa_id: selectedCompanyId,
              formulario_id: selectedFormId,
              total_sim: totalYes,
              total_nao: totalNo,
              is_complete: isComplete,
              notas_analista: formResult?.notas_analista || '',
              created_at: now,
              updated_at: now,
              last_updated: now
            }
          ])
          .select('id')
          .single();
        
        if (newEvalError) {
          console.error("Error creating evaluation:", newEvalError);
          throw newEvalError;
        }
        
        evaluationId = newEval?.id;
        console.log("New evaluation created with ID:", evaluationId);
      } else {
        console.log("Updating existing evaluation:", evaluationId);
        
        // Update existing evaluation
        const { error: updateError } = await supabase
          .from('avaliacoes')
          .update({
            total_sim: totalYes,
            total_nao: totalNo,
            is_complete: isComplete,
            updated_at: now,
            last_updated: now
          })
          .eq('id', evaluationId);
        
        if (updateError) {
          console.error("Error updating evaluation:", updateError);
          throw updateError;
        }
      }
      
      if (!evaluationId) {
        throw new Error("Failed to create or update evaluation record");
      }
      
      // Save answers to the respostas table
      console.log("Saving answers to respostas table...");
      
      // For new evaluations or when updating all answers, first delete any existing answers
      if (newEvaluation === false) {
        const { error: deleteError } = await supabase
          .from('respostas')
          .delete()
          .eq('avaliacao_id', evaluationId);
        
        if (deleteError) {
          console.error("Error clearing existing answers:", deleteError);
          throw deleteError;
        }
      }
      
      // Prepare answers for insertion
      const answerInserts = Object.entries(answers).map(([questionId, answerData]: [string, any]) => ({
        avaliacao_id: evaluationId,
        pergunta_id: questionId,
        resposta: answerData.answer,
        observacao: answerData.observation || '',
        opcoes_selecionadas: answerData.selectedOptions || [],
        created_at: now,
        updated_at: now
      }));
      
      if (answerInserts.length > 0) {
        const { error: insertError } = await supabase
          .from('respostas')
          .insert(answerInserts);
        
        if (insertError) {
          console.error("Error inserting answers:", insertError);
          throw insertError;
        }
        
        console.log(`Saved ${answerInserts.length} answers`);
      }
      
      // Create the FormResult object to return
      const formResultData: FormResult = {
        id: evaluationId,
        employeeId: selectedEmployeeId,
        empresa_id: selectedCompanyId,
        formulario_id: selectedFormId,
        answers,
        total_sim: totalYes,
        total_nao: totalNo,
        is_complete: isComplete,
        notas_analista: formResult?.notas_analista || '',
        last_updated: now,
        created_at: formResult?.created_at || now,
        updated_at: now
      };
      
      sonnerToast.success("Formulário salvo com sucesso!");
      console.log("Form saved successfully");
      
      // Get updated result for returning to the caller
      const updatedResult = await getFormResultByEmployeeId(selectedEmployeeId, selectedFormId);
      
      if (updatedResult) {
        onSuccess(updatedResult);
        
        if (!completeForm) {
          moveToNextSection();
        }
      } else {
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
