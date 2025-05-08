
import { supabase } from "@/integrations/supabase/client";
import { Avaliacao, FormResult } from "@/types/avaliacao";

// Helper function to convert database Avaliacao to frontend FormResult
const mapAvaliacaoToFormResult = (avaliacao: Avaliacao): FormResult => {
  return {
    id: avaliacao.id,
    employeeId: avaliacao.funcionario_id,
    totalYes: avaliacao.total_sim,
    totalNo: avaliacao.total_nao,
    isComplete: avaliacao.is_complete,
    created_at: avaliacao.created_at,
    updated_at: avaliacao.updated_at,
    last_updated: avaliacao.last_updated,
    notas_analista: avaliacao.notas_analista,
    analyistNotes: avaliacao.notas_analista, // Alias for compatibility
    respostas: avaliacao.respostas,
    answers: {} // Initialize empty to maintain compatibility
  };
};

export const fetchEvaluation = async (evaluationId: string): Promise<FormResult | null> => {
  try {
    console.log("Fetching evaluation with ID:", evaluationId);
    
    const { data: avaliacao, error } = await supabase
      .from('avaliacoes')
      .select(`
        id, 
        funcionario_id,
        empresa_id,
        formulario_id,
        total_sim,
        total_nao,
        is_complete,
        notas_analista,
        created_at,
        updated_at,
        last_updated
      `)
      .eq('id', evaluationId)
      .single();
      
    if (error) {
      console.error("Error fetching evaluation:", error);
      return null;
    }
    
    if (!avaliacao) {
      console.log("No evaluation found with ID:", evaluationId);
      return null;
    }
    
    // Now fetch the responses
    const { data: respostas, error: respostasError } = await supabase
      .from('respostas')
      .select(`
        id,
        avaliacao_id,
        pergunta_id,
        resposta,
        observacao,
        opcoes_selecionadas,
        created_at,
        updated_at
      `)
      .eq('avaliacao_id', evaluationId);
      
    if (respostasError) {
      console.error("Error fetching responses:", respostasError);
    }
    
    // Create a FormResult object with the fetched data
    const formResult: FormResult = mapAvaliacaoToFormResult({
      ...avaliacao,
      respostas: respostas || []
    });
    
    // Also convert responses to the answers format expected by frontend
    const answers: Record<string, any> = {};
    
    respostas?.forEach(resposta => {
      answers[resposta.pergunta_id] = {
        answer: resposta.resposta,
        observation: resposta.observacao,
        selectedOptions: resposta.opcoes_selecionadas
      };
    });
    
    formResult.answers = answers;
    
    return formResult;
  } catch (error) {
    console.error("Error in fetchEvaluation:", error);
    return null;
  }
};

export const fetchEmployeeEvaluations = async (employeeId: string): Promise<FormResult[]> => {
  try {
    console.log("Fetching evaluations for employee:", employeeId);
    
    const { data: avaliacoes, error } = await supabase
      .from('avaliacoes')
      .select(`
        id, 
        funcionario_id,
        empresa_id,
        formulario_id,
        total_sim,
        total_nao,
        is_complete,
        notas_analista,
        created_at,
        updated_at,
        last_updated
      `)
      .eq('funcionario_id', employeeId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching employee evaluations:", error);
      return [];
    }
    
    // Map to FormResult objects
    const formResults: FormResult[] = avaliacoes?.map(mapAvaliacaoToFormResult) || [];
    
    return formResults;
  } catch (error) {
    console.error("Error in fetchEmployeeEvaluations:", error);
    return [];
  }
};

export const deleteFormEvaluation = async (evaluationId: string): Promise<boolean> => {
  try {
    console.log("Deleting evaluation with ID:", evaluationId);
    
    // First, delete all responses associated with this evaluation
    const { error: responsesError } = await supabase
      .from('respostas')
      .delete()
      .eq('avaliacao_id', evaluationId);
      
    if (responsesError) {
      console.error("Error deleting responses:", responsesError);
      return false;
    }
    
    // Then, delete the evaluation itself
    const { error } = await supabase
      .from('avaliacoes')
      .delete()
      .eq('id', evaluationId);
      
    if (error) {
      console.error("Error deleting evaluation:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteFormEvaluation:", error);
    return false;
  }
};

export const updateAnalystNotes = async (evaluationId: string, notes: string): Promise<boolean> => {
  try {
    console.log("Updating analyst notes for evaluation:", evaluationId);
    console.log("New notes:", notes);
    
    const { error } = await supabase
      .from('avaliacoes')
      .update({ notas_analista: notes })
      .eq('id', evaluationId);
      
    if (error) {
      console.error("Error updating analyst notes:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateAnalystNotes:", error);
    return false;
  }
};

export const fetchLatestEmployeeEvaluation = async (employeeId: string): Promise<FormResult | null> => {
  try {
    console.log("Fetching latest evaluation for employee:", employeeId);
    
    const { data: avaliacao, error } = await supabase
      .from('avaliacoes')
      .select(`
        id, 
        funcionario_id,
        empresa_id,
        formulario_id,
        total_sim,
        total_nao,
        is_complete,
        notas_analista,
        created_at,
        updated_at,
        last_updated
      `)
      .eq('funcionario_id', employeeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      console.error("Error fetching latest evaluation:", error);
      return null;
    }
    
    // Convert to FormResult
    const formResult = mapAvaliacaoToFormResult(avaliacao);
    
    return formResult;
  } catch (error) {
    console.error("Error in fetchLatestEmployeeEvaluation:", error);
    return null;
  }
};
