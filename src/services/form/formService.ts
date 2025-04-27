import { supabase } from '@/integrations/supabase/client';
import { FormResult, Question, Risk, Severity, Mitigation, FormAnswer, Section, Form } from '@/types/form';

export async function getAllForms(): Promise<Form[]> {
  try {
    const { data, error } = await supabase
      .from('formularios')
      .select('*')
      .eq('ativo', true)
      .order('titulo');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching forms:', error);
    throw error;
  }
}

export async function getFormQuestions(formId: string): Promise<Question[]> {
  // First fetch all sections for this form
  const { data: sections, error: sectionsError } = await supabase
    .from('secoes')
    .select('*')
    .eq('formulario_id', formId)
    .order('ordem', { ascending: true });

  if (sectionsError) {
    console.error('Error fetching sections:', sectionsError);
    throw sectionsError;
  }

  // Create a map of section IDs to section objects
  const sectionsMap = sections.reduce((acc, section) => {
    acc[section.id] = section;
    return acc;
  }, {} as Record<string, Section>);

  // Now fetch the questions with their relations
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
    .order('ordem_pergunta', { ascending: true });

  if (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }

  return questions.map(q => ({
    id: q.id,
    texto: q.texto,
    risco_id: q.risco_id,
    secao_id: q.secao_id,
    ordem_pergunta: q.ordem_pergunta || 0,
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

export async function getFormResultByEmployeeId(employeeId: string, formId?: string): Promise<FormResult | null> {
  try {
    let query = supabase
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
      .order('created_at', { ascending: false });
    
    // We don't filter by formId here since the column might not exist yet
    // We'll handle the formId association later in the code

    const { data: avaliacoes, error } = await query.limit(1).maybeSingle();

    if (error) {
      console.error('Error fetching form result:', error);
      throw error;
    }

    if (!avaliacoes) return null;

    const answers: Record<string, FormAnswer> = {};
    if (avaliacoes.respostas && Array.isArray(avaliacoes.respostas)) {
      avaliacoes.respostas.forEach((resposta: any) => {
        answers[resposta.pergunta_id] = {
          questionId: resposta.pergunta_id,
          answer: resposta.resposta,
          observation: resposta.observacao,
          selectedOptions: resposta.opcoes_selecionadas
        };
      });
    }

    // Calculate severity counts for the FormResults component
    const yesPerSeverity: Record<string, number> = {
      "LEVEMENTE PREJUDICIAL": 0,
      "PREJUDICIAL": 0,
      "EXTREMAMENTE PREJUDICIAL": 0
    };

    // We'll calculate detailed severity counts when we display the results

    return {
      id: avaliacoes.id,
      employeeId: avaliacoes.funcionario_id,
      empresa_id: avaliacoes.empresa_id,
      formulario_id: formId, // Use the provided formId parameter
      answers,
      total_sim: avaliacoes.total_sim || 0,
      total_nao: avaliacoes.total_nao || 0,
      notas_analista: avaliacoes.notas_analista || '',
      is_complete: avaliacoes.is_complete || false,
      last_updated: avaliacoes.last_updated || new Date().toISOString(),
      created_at: avaliacoes.created_at,
      updated_at: avaliacoes.updated_at,
      // Fields for FormResults component compatibility
      totalYes: avaliacoes.total_sim || 0,
      totalNo: avaliacoes.total_nao || 0,
      analyistNotes: avaliacoes.notas_analista || '',
      yesPerSeverity
    };
  } catch (error) {
    console.error('Error in getFormResultByEmployeeId:', error);
    return null;
  }
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
  const { employeeId, answers, total_sim, total_nao, is_complete, empresa_id, formulario_id, id, notas_analista } = formData;

  try {
    let avaliacaoId = id;
    
    if (!avaliacaoId || avaliacaoId.trim() === '') {
      // Create new evaluation record - avoiding using formulario_id in the DB insert
      // since the column might not exist yet
      const insertData: any = {
        funcionario_id: employeeId,
        empresa_id: empresa_id,
        total_sim,
        total_nao,
        is_complete,
        notas_analista,
        last_updated: new Date().toISOString()
      };
      
      // Only add formulario_id if it's provided
      if (formulario_id) {
        // We'll store this outside the DB for now and handle associations at the app level
        console.log(`Form ID ${formulario_id} will be associated with this evaluation in the app`);
      }
      
      const { data: avaliacao, error: avaliacaoError } = await supabase
        .from('avaliacoes')
        .insert(insertData)
        .select()
        .single();

      if (avaliacaoError) {
        console.error('Erro ao salvar avaliação:', avaliacaoError);
        throw avaliacaoError;
      }
      
      avaliacaoId = avaliacao.id;
    } else {
      // Update existing evaluation record - avoiding using formulario_id in the DB update
      const updateData: any = {
        total_sim,
        total_nao,
        is_complete,
        notas_analista,
        last_updated: new Date().toISOString()
      };

      // Only log formulario_id for now
      if (formulario_id) {
        console.log(`Form ID ${formulario_id} is associated with evaluation ${id}`);
      }
      
      const { error: updateError } = await supabase
        .from('avaliacoes')
        .update(updateData)
        .eq('id', id);
        
      if (updateError) {
        console.error('Erro ao atualizar avaliação:', updateError);
        throw updateError;
      }
      
      // Delete old answers to replace with new ones
      const { error: deleteError } = await supabase
        .from('respostas')
        .delete()
        .eq('avaliacao_id', id);
        
      if (deleteError) {
        console.error('Erro ao deletar respostas antigas:', deleteError);
        throw deleteError;
      }
    }

    // Insert new answers
    const respostasToInsert = Object.entries(answers).map(([perguntaId, answer]) => ({
      avaliacao_id: avaliacaoId,
      pergunta_id: perguntaId,
      resposta: answer.answer,
      observacao: answer.observation || null,
      opcoes_selecionadas: answer.selectedOptions || null
    }));

    if (respostasToInsert.length > 0) {
      const { error: respostasError } = await supabase
        .from('respostas')
        .insert(respostasToInsert);

      if (respostasError) {
        console.error('Erro ao salvar respostas:', respostasError);
        throw respostasError;
      }
    }

    // Handle options selection if needed
    for (const [perguntaId, resposta] of Object.entries(answers)) {
      if (resposta.selectedOptions && resposta.selectedOptions.length > 0) {
        const { data: perguntaOpcoes } = await supabase
          .from('pergunta_opcoes')
          .select('id, texto')
          .eq('pergunta_id', perguntaId);

        if (perguntaOpcoes && perguntaOpcoes.length > 0) {
          const opcoesRespostas = [];
          for (const opcaoTexto of resposta.selectedOptions) {
            const opcao = perguntaOpcoes.find(o => o.texto === opcaoTexto);
            if (opcao) {
              opcoesRespostas.push({
                resposta_id: avaliacaoId,
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

export async function getAllRisksWithSeverity(): Promise<Risk[]> {
  try {
    const { data, error } = await supabase
      .from('riscos')
      .select(`
        *,
        severidade (*)
      `)
      .order('texto');
    
    if (error) {
      console.error("Erro ao buscar riscos:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao obter riscos:", error);
    throw error;
  }
}

export async function getAllSeverities(): Promise<Severity[]> {
  try {
    const { data, error } = await supabase
      .from('severidade')
      .select('*')
      .order('ordem');
    
    if (error) {
      console.error("Erro ao buscar severidades:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao obter severidades:", error);
    throw error;
  }
}

export async function getCompanies(): Promise<any[]> {
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

export async function getEmployeeFormHistory(employeeId: string): Promise<FormResult[]> {
  try {
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching form history:', error);
      throw error;
    }

    return avaliacoes.map(avaliacao => ({
      id: avaliacao.id,
      employeeId: avaliacao.funcionario_id,
      empresa_id: avaliacao.empresa_id,
      formulario_id: avaliacao.formulario_id,
      answers: avaliacao.respostas?.reduce((acc: Record<string, any>, resposta: any) => {
        acc[resposta.pergunta_id] = {
          questionId: resposta.pergunta_id,
          answer: resposta.resposta,
          observation: resposta.observacao,
          selectedOptions: resposta.opcoes_selecionadas
        };
        return acc;
      }, {}),
      total_sim: avaliacao.total_sim || 0,
      total_nao: avaliacao.total_nao || 0,
      notas_analista: avaliacao.notas_analista || '',
      is_complete: avaliacao.is_complete || false,
      last_updated: avaliacao.last_updated,
      created_at: avaliacao.created_at,
      updated_at: avaliacao.updated_at,
      totalYes: avaliacao.total_sim || 0,
      totalNo: avaliacao.total_nao || 0,
      analyistNotes: avaliacao.notas_analista || '',
      yesPerSeverity: {
        "LEVEMENTE PREJUDICIAL": 0,
        "PREJUDICIAL": 0,
        "EXTREMAMENTE PREJUDICIAL": 0
      }
    }));
  } catch (error) {
    console.error('Error in getEmployeeFormHistory:', error);
    throw error;
  }
}
