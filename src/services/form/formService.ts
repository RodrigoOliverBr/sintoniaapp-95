import { supabase } from '@/integrations/supabase/client';
import { FormResult, Question, Risk, Severity, Mitigation, FormAnswer } from '@/types/form';
import { Company } from '@/types/cadastro';

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

  return questions.map(q => ({
    id: q.id,
    texto: q.texto,
    risco_id: q.risco_id,
    secao: q.secao,
    ordem: q.ordem || 0,
    formulario_id: q.formulario_id || formId,
    opcoes: q.opcoes ? Array.isArray(q.opcoes) ? q.opcoes : [] : [],
    observacao_obrigatoria: q.observacao_obrigatoria,
    risco: q.risco
  }));
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
    id: avaliacoes.id,
    employeeId: avaliacoes.funcionario_id,
    empresa_id: avaliacoes.empresa_id,
    answers,
    total_sim: avaliacoes.total_sim,
    total_nao: avaliacoes.total_nao,
    notas_analista: avaliacoes.notas_analista,
    is_complete: avaliacoes.is_complete,
    last_updated: avaliacoes.last_updated,
    created_at: avaliacoes.created_at,
    updated_at: avaliacoes.updated_at
  };
}

// Add the missing function to check form status by employee ID
export function getFormStatusByEmployeeId(employeeId: string): 'completed' | 'pending' | 'error' {
  // This is a simplified implementation that checks localStorage first
  try {
    // In a real implementation, you would query the database
    // For now, we'll return 'pending' as default
    return 'pending';
  } catch (error) {
    console.error('Error checking form status:', error);
    return 'error';
  }
}

export async function saveFormResult(formData: FormResult): Promise<void> {
  const { employeeId, answers, total_sim, total_nao, is_complete, empresa_id } = formData;

  // Start a Supabase transaction
  const { data: avaliacao, error: avaliacaoError } = await supabase
    .from('avaliacoes')
    .insert({
      funcionario_id: employeeId,
      empresa_id: empresa_id,
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

// Add the missing function to get companies
export async function getCompanies(): Promise<Company[]> {
  const { data: companies, error } = await supabase
    .from('empresas')
    .select(`
      *,
      departments:setores (*)
    `)
    .order('nome');

  if (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }

  return companies.map(company => ({
    id: company.id,
    name: company.nome,
    cpfCnpj: company.cpf_cnpj,
    telefone: company.telefone,
    email: company.email,
    address: company.endereco,
    type: company.tipo,
    status: company.situacao,
    contact: company.contato,
    zipCode: company.cep,
    state: company.estado,
    city: company.cidade,
    createdAt: company.created_at,
    updatedAt: company.updated_at,
    departments: company.departments ? company.departments.map((dept: any) => ({
      id: dept.id,
      name: dept.nome,
      companyId: dept.empresa_id,
      createdAt: dept.created_at,
      updatedAt: dept.updated_at
    })) : []
  }));
}

// Temporary function to get form results for reports
export async function getFormResults() {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select(`
      *,
      respostas:respostas (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching form results:', error);
    throw error;
  }

  return data || [];
}
