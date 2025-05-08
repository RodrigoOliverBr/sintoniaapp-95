
import { FormResult } from '@/types/form';
import { supabase } from '@/integrations/supabase/client';
import { Avaliacao, AvaliacaoResposta } from '@/types/avaliacao';
import { toast } from 'sonner';

// Delete evaluation and all associated data
export const deleteFormEvaluation = async (evaluationId: string): Promise<void> => {
  try {
    console.log('Deleting evaluation:', evaluationId);
    
    // Delete respostas first
    const { error: deleteRespostasError } = await supabase
      .from('respostas')
      .delete()
      .eq('avaliacao_id', evaluationId);
    
    if (deleteRespostasError) {
      console.error('Error deleting respostas:', deleteRespostasError);
      throw new Error('Erro ao excluir respostas');
    }
    
    // Then delete the evaluation
    const { error: deleteAvaliacaoError } = await supabase
      .from('avaliacoes')
      .delete()
      .eq('id', evaluationId);
    
    if (deleteAvaliacaoError) {
      console.error('Error deleting evaluation:', deleteAvaliacaoError);
      throw new Error('Erro ao excluir avaliação');
    }
    
    console.log('Evaluation deleted successfully');
  } catch (error) {
    console.error('Error in deleteFormEvaluation:', error);
    throw error;
  }
};

// Update only analyst notes for an evaluation
export const updateAnalystNotes = async (evaluationId: string, notes: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('avaliacoes')
      .update({ notas_analista: notes, last_updated: new Date().toISOString() })
      .eq('id', evaluationId);
    
    if (error) {
      console.error('Error updating analyst notes:', error);
      throw new Error('Erro ao atualizar observações do analista');
    }
  } catch (error) {
    console.error('Error in updateAnalystNotes:', error);
    throw error;
  }
};

// Get form result by employee ID and form ID
export const getFormResultByEmployeeId = async (employeeId: string, formId: string): Promise<FormResult | null> => {
  try {
    // First get the evaluation
    const { data: avaliacaoData, error: avaliacaoError } = await supabase
      .from('avaliacoes')
      .select('*')
      .eq('funcionario_id', employeeId)
      .eq('formulario_id', formId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (avaliacaoError) {
      if (avaliacaoError.code === 'PGRST116') {
        // No data found is not an error in this case
        console.log('No evaluation found for employee', employeeId, 'and form', formId);
        return null;
      }
      console.error('Error fetching evaluation:', avaliacaoError);
      throw avaliacaoError;
    }
    
    if (!avaliacaoData) return null;
    
    // Then get all responses for this evaluation
    const { data: respostasData, error: respostasError } = await supabase
      .from('respostas')
      .select(`
        id,
        pergunta_id,
        resposta,
        observacao,
        opcoes_selecionadas
      `)
      .eq('avaliacao_id', avaliacaoData.id);
    
    if (respostasError) {
      console.error('Error fetching responses:', respostasError);
      throw respostasError;
    }
    
    // Convert responses to the answers format
    const answers: Record<string, any> = {};
    
    respostasData.forEach((resposta) => {
      answers[resposta.pergunta_id] = {
        questionId: resposta.pergunta_id,
        answer: resposta.resposta,
        observation: resposta.observacao,
        selectedOptions: resposta.opcoes_selecionadas || []
      };
    });
    
    // Create and return the FormResult
    return {
      id: avaliacaoData.id,
      employeeId: avaliacaoData.funcionario_id,
      empresa_id: avaliacaoData.empresa_id,
      formulario_id: avaliacaoData.formulario_id,
      totalYes: avaliacaoData.total_sim,
      totalNo: avaliacaoData.total_nao,
      total_sim: avaliacaoData.total_sim,
      total_nao: avaliacaoData.total_nao,
      isComplete: avaliacaoData.is_complete,
      is_complete: avaliacaoData.is_complete,
      analyistNotes: avaliacaoData.notas_analista,
      notas_analista: avaliacaoData.notas_analista,
      created_at: avaliacaoData.created_at,
      updated_at: avaliacaoData.updated_at,
      last_updated: avaliacaoData.last_updated,
      answers,
      respostas: respostasData as AvaliacaoResposta[]
    };
  } catch (error) {
    console.error('Error in getFormResultByEmployeeId:', error);
    return null;
  }
};

// Save a form result (create or update)
export const saveFormResult = async (formResult: FormResult): Promise<void> => {
  try {
    const now = new Date().toISOString();
    const { id, employeeId, empresa_id, formulario_id, totalYes, totalNo, total_sim, total_nao, isComplete, is_complete, analyistNotes, notas_analista, answers } = formResult;
    
    // Prepare data for the avaliacoes table
    const avaliacaoData = {
      funcionario_id: employeeId,
      empresa_id,
      formulario_id,
      total_sim: total_sim || totalYes || 0,
      total_nao: total_nao || totalNo || 0,
      is_complete: is_complete || isComplete || false,
      notas_analista: notas_analista || analyistNotes || "",
      last_updated: now,
    };

    let avaliacaoId = id;
    
    if (!avaliacaoId) {
      // Create new evaluation
      const { data, error } = await supabase
        .from('avaliacoes')
        .insert({
          ...avaliacaoData,
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Error creating evaluation:', error);
        throw error;
      }
      
      avaliacaoId = data.id;
    } else {
      // Update existing evaluation
      const { error } = await supabase
        .from('avaliacoes')
        .update({
          ...avaliacaoData,
          updated_at: now,
        })
        .eq('id', avaliacaoId);
      
      if (error) {
        console.error('Error updating evaluation:', error);
        throw error;
      }
    }

    // Delete existing responses
    const { error: deleteError } = await supabase
      .from('respostas')
      .delete()
      .eq('avaliacao_id', avaliacaoId);
    
    if (deleteError) {
      console.error('Error deleting existing responses:', deleteError);
      throw deleteError;
    }
    
    // Insert new responses
    if (answers && Object.keys(answers).length > 0) {
      const respostasToInsert = Object.entries(answers).map(([perguntaId, answer]) => ({
        avaliacao_id: avaliacaoId,
        pergunta_id: perguntaId,
        resposta: answer.answer,
        observacao: answer.observation || '',
        opcoes_selecionadas: answer.selectedOptions || [],
        created_at: now,
        updated_at: now,
      }));
      
      const { error: insertError } = await supabase
        .from('respostas')
        .insert(respostasToInsert);
      
      if (insertError) {
        console.error('Error inserting responses:', insertError);
        throw insertError;
      }
    }
    
    console.log(`Saved form result. Evaluation ID: ${avaliacaoId}, Answers: ${Object.keys(answers || {}).length}`);
  } catch (error) {
    console.error('Error in saveFormResult:', error);
    throw error;
  }
};

// Get employee form evaluation history
export const getEmployeeFormHistory = async (employeeId: string): Promise<FormResult[]> => {
  try {
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
      console.error('Error fetching employee evaluations:', error);
      throw error;
    }
    
    // Convert to FormResult format
    return data.map(avaliacao => ({
      id: avaliacao.id,
      employeeId: avaliacao.funcionario_id,
      empresa_id: avaliacao.empresa_id,
      formulario_id: avaliacao.formulario_id,
      totalYes: avaliacao.total_sim,
      totalNo: avaliacao.total_nao,
      total_sim: avaliacao.total_sim,
      total_nao: avaliacao.total_nao,
      isComplete: avaliacao.is_complete,
      is_complete: avaliacao.is_complete,
      analyistNotes: avaliacao.notas_analista,
      notas_analista: avaliacao.notas_analista,
      created_at: avaliacao.created_at,
      updated_at: avaliacao.updated_at,
      last_updated: avaliacao.last_updated,
    }));
  } catch (error) {
    console.error('Error in getEmployeeFormHistory:', error);
    return [];
  }
};

// Fetch a single evaluation by ID
export const fetchEvaluation = async (evaluationId: string): Promise<FormResult | null> => {
  try {
    // Get the evaluation
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
      .eq('id', evaluationId)
      .single();
    
    if (error) {
      console.error('Error fetching evaluation:', error);
      return null;
    }
    
    // Get the responses for this evaluation
    const { data: respostas, error: respostasError } = await supabase
      .from('respostas')
      .select(`
        id, 
        pergunta_id, 
        resposta, 
        observacao, 
        opcoes_selecionadas
      `)
      .eq('avaliacao_id', evaluationId);
    
    if (respostasError) {
      console.error('Error fetching responses:', respostasError);
      return null;
    }
    
    // Convert responses to answers format
    const answers: Record<string, any> = {};
    
    respostas.forEach((resposta) => {
      answers[resposta.pergunta_id] = {
        answer: resposta.resposta,
        observation: resposta.observacao,
        selectedOptions: resposta.opcoes_selecionadas
      };
    });
    
    return {
      id: data.id,
      employeeId: data.funcionario_id,
      empresa_id: data.empresa_id,
      formulario_id: data.formulario_id,
      totalYes: data.total_sim,
      totalNo: data.total_nao,
      total_sim: data.total_sim,
      total_nao: data.total_nao,
      isComplete: data.is_complete,
      is_complete: data.is_complete,
      analyistNotes: data.notas_analista,
      notas_analista: data.notas_analista,
      created_at: data.created_at,
      updated_at: data.updated_at,
      last_updated: data.last_updated,
      answers
    };
  } catch (error) {
    console.error('Error in fetchEvaluation:', error);
    return null;
  }
};

// Fetch all evaluations for an employee
export const fetchEmployeeEvaluations = async (employeeId: string): Promise<FormResult[]> => {
  return getEmployeeFormHistory(employeeId);
};

// Fetch latest evaluation for an employee
export const fetchLatestEmployeeEvaluation = async (employeeId: string, formId: string): Promise<FormResult | null> => {
  return getFormResultByEmployeeId(employeeId, formId);
};
