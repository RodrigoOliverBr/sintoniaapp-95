
import { supabase } from '@/integrations/supabase/client';
import { FormResult, Question, Risk, Severity, Mitigation, FormAnswer } from '@/types/form';

export async function getFormQuestions(formId: string): Promise<Question[]> {
  const { data: questions, error } = await supabase
    .from('perguntas')
    .select(`
      *,
      risco:riscos (
        *,
        severidade:severidade (*)
      ),
      pergunta_opcoes (
        id,
        texto,
        ordem,
        pergunta_id
      )
    `)
    .eq('formulario_id', formId)
    .order('ordem', { ascending: true })
    .order('secao')
    .order('id');

  if (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }

  return questions.map(q => ({
    id: q.id,
    texto: q.texto,
    risco_id: q.risco_id,
    secao: q.secao,
    secao_descricao: q.secao_descricao,
    ordem: q.ordem || 0,
    formulario_id: formId,
    opcoes: Array.isArray(q.opcoes) 
      ? q.opcoes.map(opt => {
          if (typeof opt === 'string') {
            return { label: opt, value: opt };
          } else if (typeof opt === 'object' && opt !== null) {
            return {
              label: (opt as any).label || (opt as any).text || String(opt),
              value: (opt as any).value || (opt as any).text || String(opt)
            };
          }
          return { label: String(opt), value: String(opt) };
        })
      : undefined,
    observacao_obrigatoria: q.observacao_obrigatoria,
    risco: q.risco ? {
      ...q.risco,
      severidade: q.risco.severidade ? {
        id: q.risco.severidade.id,
        nivel: q.risco.severidade.nivel,
        descricao: q.risco.severidade.descricao
      } : undefined
    } : undefined,
    pergunta_opcoes: q.pergunta_opcoes ? q.pergunta_opcoes.map(po => ({
      id: po.id,
      pergunta_id: po.pergunta_id,
      texto: po.texto,
      ordem: po.ordem
    })) : []
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

export function getFormStatusByEmployeeId(employeeId: string): 'completed' | 'pending' | 'error' {
  try {
    return 'pending';
  } catch (error) {
    console.error('Error checking form status:', error);
    return 'error';
  }
}

export async function saveFormResult(formData: FormResult): Promise<void> {
  const { employeeId, answers, total_sim, total_nao, is_complete, empresa_id } = formData;

  try {
    const { data: avaliacao, error: avaliacaoError } = await supabase
      .from('avaliacoes')
      .insert({
        funcionario_id: employeeId,
        empresa_id: empresa_id,
        total_sim,
        total_nao,
        is_complete,
        last_updated: new Date().toISOString()
      })
      .select()
      .single();

    if (avaliacaoError) {
      console.error('Erro ao salvar avaliação:', avaliacaoError);
      throw avaliacaoError;
    }

    const respostasToInsert = Object.entries(answers).map(([perguntaId, answer]) => ({
      avaliacao_id: avaliacao.id,
      pergunta_id: perguntaId,
      resposta: answer.answer,
      observacao: answer.observation || null,
      opcoes_selecionadas: answer.selectedOptions || null
    }));

    const { error: respostasError } = await supabase
      .from('respostas')
      .insert(respostasToInsert);

    if (respostasError) {
      console.error('Erro ao salvar respostas:', respostasError);
      throw respostasError;
    }

    for (const [perguntaId, resposta] of Object.entries(answers)) {
      if (resposta.selectedOptions && resposta.selectedOptions.length > 0) {
        const { data: perguntaOpcoes } = await supabase
          .from('pergunta_opcoes')
          .select('id, texto')
          .eq('pergunta_id', perguntaId);

        if (perguntaOpcoes) {
          const opcoesRespostas = [];
          for (const opcaoTexto of resposta.selectedOptions) {
            const opcao = perguntaOpcoes.find(o => o.texto === opcaoTexto);
            if (opcao) {
              opcoesRespostas.push({
                resposta_id: respostasError ? undefined : avaliacao.id,
                opcao_id: opcao.id,
                texto_outro: opcaoTexto === 'Outro' ? resposta.otherText : null
              });
            }
          }

          if (opcoesRespostas.length > 0) {
            const { error: opcoesError } = await supabase
              .from('resposta_opcoes')
              .insert(opcoesRespostas);

            if (opcoesError) {
              console.error('Erro ao salvar opções de resposta:', opcoesError);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Erro no processo de salvamento do formulário:', error);
    throw error;
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

interface Company {
  id: string;
  name: string;
  cpfCnpj: string;
  telefone?: string;
  email: string;
  address?: string;
  type: string;
  status: string;
  contact?: string;
  zipCode?: string;
  state?: string;
  city?: string;
  createdAt: string;
  updatedAt: string;
  departments: {
    id: string;
    name: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

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

export async function getDefaultRiskId(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('riscos')
      .select('id')
      .limit(1)
      .single();
    
    if (error) {
      console.error("Erro ao buscar risco padrão:", error);
      throw error;
    }
    
    return data.id;
  } catch (error) {
    console.error("Erro ao obter risco padrão:", error);
    throw new Error("Não foi possível obter um risco padrão para novas perguntas.");
  }
}
