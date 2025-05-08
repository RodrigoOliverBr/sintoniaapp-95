
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

// Add the missing functions that were referenced but not defined
export const getFormResultByEmployeeId = async (employeeId: string, formId?: string): Promise<FormResult | null> => {
  try {
    console.log(`Fetching form result for employee ${employeeId}${formId ? ` and form ${formId}` : ''}`);
    
    let query = supabase
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
    
    // Add form filter if provided
    if (formId) {
      query = query.eq('formulario_id', formId);
    }
    
    const { data, error } = await query.limit(1).maybeSingle();
    
    if (error) {
      console.error("Error fetching form result:", error);
      return null;
    }
    
    if (!data) {
      console.log("No form result found for employee:", employeeId);
      return null;
    }
    
    // Fetch responses for this evaluation
    const { data: respostas, error: respostasError } = await supabase
      .from('respostas')
      .select(`
        id,
        avaliacao_id,
        pergunta_id,
        resposta,
        observacao,
        opcoes_selecionadas,
        pergunta:perguntas (
          id,
          texto,
          risco:riscos (
            id,
            texto,
            severidade:severidade (
              id,
              nivel,
              descricao
            )
          )
        )
      `)
      .eq('avaliacao_id', data.id);
    
    if (respostasError) {
      console.error("Error fetching responses:", respostasError);
    }
    
    // Create the FormResult object
    const formResult = mapAvaliacaoToFormResult({
      ...data,
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
    console.error("Error in getFormResultByEmployeeId:", error);
    return null;
  }
};

export const saveFormResult = async (formResult: FormResult): Promise<FormResult | null> => {
  try {
    console.log("Saving form result:", formResult.id || "new");
    
    // Determine if this is a new evaluation or an update
    const isNew = !formResult.id || formResult.id === '';
    
    // Prepare the record for upsert
    const avaliacaoRecord = {
      id: isNew ? undefined : formResult.id,
      funcionario_id: formResult.employeeId,
      empresa_id: formResult.empresa_id,
      formulario_id: formResult.formulario_id,
      total_sim: formResult.total_sim || formResult.totalYes || 0,
      total_nao: formResult.total_nao || formResult.totalNo || 0,
      is_complete: formResult.is_complete || false,
      notas_analista: formResult.notas_analista || formResult.analyistNotes || '',
      last_updated: new Date().toISOString()
    };
    
    console.log("Saving evaluation record:", avaliacaoRecord);
    
    let avaliacaoId = formResult.id;
    
    // Insert or update the evaluation
    if (isNew) {
      const { data: newAvaliacao, error } = await supabase
        .from('avaliacoes')
        .insert(avaliacaoRecord)
        .select()
        .single();
      
      if (error) {
        console.error("Error creating evaluation:", error);
        return null;
      }
      
      avaliacaoId = newAvaliacao.id;
      console.log("Created new evaluation with ID:", avaliacaoId);
    } else {
      const { error } = await supabase
        .from('avaliacoes')
        .update(avaliacaoRecord)
        .eq('id', avaliacaoId);
      
      if (error) {
        console.error("Error updating evaluation:", error);
        return null;
      }
      
      console.log("Updated evaluation with ID:", avaliacaoId);
    }
    
    // Now handle responses
    if (formResult.answers && Object.keys(formResult.answers).length > 0) {
      console.log(`Processing ${Object.keys(formResult.answers).length} answers`);
      
      // First, get existing responses for this evaluation
      const { data: existingResponses, error: fetchError } = await supabase
        .from('respostas')
        .select('id, pergunta_id')
        .eq('avaliacao_id', avaliacaoId);
      
      if (fetchError) {
        console.error("Error fetching existing responses:", fetchError);
      }
      
      // Create a map of existing responses by question ID
      const existingResponseMap = new Map();
      existingResponses?.forEach(resp => {
        existingResponseMap.set(resp.pergunta_id, resp.id);
      });
      
      // Process each answer
      for (const [perguntaId, answer] of Object.entries(formResult.answers)) {
        const existingResponseId = existingResponseMap.get(perguntaId);
        
        const responseRecord = {
          avaliacao_id: avaliacaoId,
          pergunta_id: perguntaId,
          resposta: answer.answer,
          observacao: answer.observation || null,
          opcoes_selecionadas: answer.selectedOptions || null
        };
        
        if (existingResponseId) {
          // Update existing response
          const { error } = await supabase
            .from('respostas')
            .update(responseRecord)
            .eq('id', existingResponseId);
          
          if (error) {
            console.error(`Error updating response for question ${perguntaId}:`, error);
          }
        } else {
          // Insert new response
          const { error } = await supabase
            .from('respostas')
            .insert(responseRecord);
          
          if (error) {
            console.error(`Error inserting response for question ${perguntaId}:`, error);
          }
        }
      }
    }
    
    // Return the updated form result
    return getFormResultByEmployeeId(formResult.employeeId, formResult.formulario_id);
    
  } catch (error) {
    console.error("Error in saveFormResult:", error);
    return null;
  }
};

export const getEmployeeFormHistory = async (employeeId: string): Promise<FormResult[]> => {
  try {
    console.log("Fetching form history for employee:", employeeId);
    
    const { data, error } = await supabase
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
      console.error("Error fetching employee form history:", error);
      return [];
    }
    
    // Map to FormResult objects
    const formResults: FormResult[] = data?.map(mapAvaliacaoToFormResult) || [];
    
    return formResults;
  } catch (error) {
    console.error("Error in getEmployeeFormHistory:", error);
    return [];
  }
};
