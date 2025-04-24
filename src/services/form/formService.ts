
import { supabase } from '@/integrations/supabase/client';
import { FormResult, Question, Risk, Severity, Mitigation } from '@/types/form';
import { Database } from '@/integrations/supabase/types';

export async function getFormQuestions(formId: string): Promise<Question[]> {
  const { data: questions, error } = await supabase
    .from('perguntas')
    .select(`
      *,
      risco:riscos (
        *,
        severidade:severidade (*)
      )
    `)
    .eq('formulario_id', formId)
    .order('ordem');

  if (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }

  return questions;
}

export async function getFormResultByEmployeeId(employeeId: string): Promise<FormResult | null> {
  const { data: avaliacoes, error } = await supabase
    .from('avaliacoes')
    .select(`
      *,
      respostas:respostas (
        pergunta_id,
        resposta,
        observacao,
        opcoes_selecionadas
      )
    `)
    .eq('funcionario_id', employeeId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No results found
    }
    console.error('Error fetching form result:', error);
    throw error;
  }

  if (!avaliacoes) return null;

  // Transform respostas array into a Record<string, FormAnswer>
  const answers: Record<string, FormAnswer> = {};
  avaliacoes.respostas?.forEach((resposta: any) => {
    answers[resposta.pergunta_id] = {
      questionId: resposta.pergunta_id,
      answer: resposta.resposta,
      observation: resposta.observacao,
      selectedOptions: resposta.opcoes_selecionadas
    };
  });

  return {
    ...avaliacoes,
    answers
  };
}

export async function saveFormResult(formData: FormResult): Promise<void> {
  const { employeeId, answers, total_sim, total_nao, is_complete } = formData;

  // Start a Supabase transaction
  const { data: avaliacao, error: avaliacaoError } = await supabase
    .from('avaliacoes')
    .insert({
      funcionario_id: employeeId,
      total_sim,
      total_nao,
      is_complete
    })
    .select()
    .single();

  if (avaliacaoError) {
    console.error('Error saving avaliacao:', avaliacaoError);
    throw avaliacaoError;
  }

  // Prepare respostas records
  const respostasToInsert = Object.entries(answers).map(([questionId, answer]) => ({
    avaliacao_id: avaliacao.id,
    pergunta_id: questionId,
    resposta: answer.answer,
    observacao: answer.observation,
    opcoes_selecionadas: answer.selectedOptions
  }));

  // Insert all respostas
  const { error: respostasError } = await supabase
    .from('respostas')
    .insert(respostasToInsert);

  if (respostasError) {
    console.error('Error saving respostas:', respostasError);
    throw respostasError;
  }
}

export async function getMitigationsByRiskId(riskId: string): Promise<Mitigation[]> {
  const { data: mitigacoes, error } = await supabase
    .from('mitigacoes')
    .select('*')
    .eq('risco_id', riskId);

  if (error) {
    console.error('Error fetching mitigations:', error);
    throw error;
  }

  return mitigacoes;
}
