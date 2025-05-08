
import { supabase } from "@/integrations/supabase/client";
import { Form, Section, Question, Risk, Severity, Mitigation, FormResult, Answer } from "@/types/form";

// Get all active forms
export async function getAllForms(): Promise<Form[]> {
  try {
    const { data, error } = await supabase
      .from('formularios')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching forms:', error);
    throw error;
  }
}

// Get sections for a form
export async function getFormSections(formId: string): Promise<Section[]> {
  try {
    const { data, error } = await supabase
      .from('secoes')
      .select('*')
      .eq('formulario_id', formId)
      .order('ordem', { ascending: true });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching form sections:', error);
    throw error;
  }
}

// Get questions for a form
export async function getFormQuestions(formId: string): Promise<Question[]> {
  try {
    const { data, error } = await supabase
      .from('perguntas')
      .select(`
        *,
        risco:riscos (
          *,
          severidade:severidade (*)
        )
      `)
      .eq('formulario_id', formId);

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching form questions:', error);
    throw error;
  }
}

// Get risk mitigations
export async function getMitigationsByRiskId(riskId: string): Promise<Mitigation[]> {
  try {
    const { data, error } = await supabase
      .from('mitigacoes')
      .select('*')
      .eq('risco_id', riskId);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching mitigations:', error);
    throw error;
  }
}

// Save form evaluation result
export async function saveFormResult(evaluation: {
  id?: string;
  funcionario_id: string;
  empresa_id: string;
  formulario_id: string;
  total_sim: number;
  total_nao: number;
  is_complete: boolean;
  notas_analista?: string;
  answers: Record<string, {
    questionId: string;
    answer: boolean | null;
    observation?: string;
  }>;
}): Promise<string> {
  try {
    // First, save or update the evaluation
    let evaluationId = evaluation.id;
    
    if (!evaluationId) {
      // Create new evaluation
      const { data: newEvaluation, error: evalError } = await supabase
        .from('avaliacoes')
        .insert({
          funcionario_id: evaluation.funcionario_id,
          empresa_id: evaluation.empresa_id,
          formulario_id: evaluation.formulario_id,
          total_sim: evaluation.total_sim,
          total_nao: evaluation.total_nao,
          is_complete: evaluation.is_complete,
          notas_analista: evaluation.notas_analista || ''
        })
        .select('id')
        .single();
        
      if (evalError) throw evalError;
      
      evaluationId = newEvaluation.id;
    } else {
      // Update existing evaluation
      const { error: evalError } = await supabase
        .from('avaliacoes')
        .update({
          total_sim: evaluation.total_sim,
          total_nao: evaluation.total_nao,
          is_complete: evaluation.is_complete,
          notas_analista: evaluation.notas_analista || ''
        })
        .eq('id', evaluationId);
        
      if (evalError) throw evalError;
    }
    
    // If updating an existing evaluation, delete the old answers
    if (evaluation.id) {
      const { error: deleteError } = await supabase
        .from('respostas')
        .delete()
        .eq('avaliacao_id', evaluationId);
        
      if (deleteError) throw deleteError;
    }
    
    // Insert the new answers
    const answers = Object.values(evaluation.answers).map(answer => ({
      avaliacao_id: evaluationId,
      pergunta_id: answer.questionId,
      resposta: answer.answer,
      observacao: answer.observation || '',
      opcoes_selecionadas: [] // Add selected options if needed
    }));
    
    if (answers.length > 0) {
      const { error: answersError } = await supabase
        .from('respostas')
        .insert(answers);
        
      if (answersError) throw answersError;
    }
    
    return evaluationId;
  } catch (error) {
    console.error('Error saving form result:', error);
    throw error;
  }
}

// Get evaluation history for an employee
export async function getEmployeeEvaluations(employeeId: string): Promise<FormResult[]> {
  try {
    const { data, error } = await supabase
      .from('avaliacoes')
      .select(`
        *,
        respostas:respostas (*)
      `)
      .eq('funcionario_id', employeeId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching employee evaluations:', error);
    throw error;
  }
}

// Get evaluation by ID
export async function getEvaluationById(evaluationId: string): Promise<FormResult | null> {
  try {
    const { data, error } = await supabase
      .from('avaliacoes')
      .select(`
        *,
        respostas:respostas (*)
      `)
      .eq('id', evaluationId)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return null;
  }
}

// Delete an evaluation
export async function deleteEvaluation(evaluationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('avaliacoes')
      .delete()
      .eq('id', evaluationId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting evaluation:', error);
    throw error;
  }
}
