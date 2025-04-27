import { supabase } from '@/integrations/supabase/client';
import { FormResult, FormAnswer } from '@/types/form';

export function getFormStatusByEmployeeId(employeeId: string): 'completed' | 'pending' | 'error' {
  try {
    if (!employeeId) return 'error';
    
    return 'pending';
  } catch (error) {
    console.error('Error in getFormStatusByEmployeeId:', error);
    return 'error';
  }
}

export async function getFormResults(companyId?: string): Promise<any[]> {
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
        ),
        funcionario:funcionarios (*)
      `)
      .order('created_at', { ascending: false });
    
    if (companyId) {
      query = query.eq('empresa_id', companyId);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching form results:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFormResults:', error);
    return [];
  }
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

    return {
      id: avaliacoes.id,
      employeeId: avaliacoes.funcionario_id,
      empresa_id: avaliacoes.empresa_id,
      formulario_id: formId || avaliacoes.formulario_id || "",
      answers,
      total_sim: avaliacoes.total_sim || 0,
      total_nao: avaliacoes.total_nao || 0,
      notas_analista: avaliacoes.notas_analista || '',
      is_complete: avaliacoes.is_complete || false,
      last_updated: avaliacoes.last_updated || new Date().toISOString(),
      created_at: avaliacoes.created_at,
      updated_at: avaliacoes.updated_at,
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
      formulario_id: avaliacao.formulario_id || "",
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
      notas_analista: avaliacoes.notas_analista || '',
      is_complete: avaliacao.is_complete || false,
      last_updated: avaliacao.last_updated,
      created_at: avaliacao.created_at,
      updated_at: avaliacao.updated_at,
      totalYes: avaliacao.total_sim || 0,
      totalNo: avaliacao.total_nao || 0,
      analyistNotes: avaliacoes.notas_analista || '',
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

export async function saveFormResult(formData: FormResult): Promise<void> {
  const { employeeId, answers, total_sim, total_nao, is_complete, empresa_id, formulario_id, id, notas_analista } = formData;

  try {
    let avaliacaoId = id;
    
    if (!avaliacaoId || avaliacaoId.trim() === '') {
      const insertData: any = {
        funcionario_id: employeeId,
        empresa_id: empresa_id,
        total_sim,
        total_nao,
        is_complete,
        notas_analista,
        last_updated: new Date().toISOString()
      };
      
      if (formulario_id) {
        insertData.formulario_id = formulario_id;
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
      const updateData: any = {
        total_sim,
        total_nao,
        is_complete,
        notas_analista,
        last_updated: new Date().toISOString()
      };

      if (formulario_id) {
        updateData.formulario_id = formulario_id;
      }
      
      const { error: updateError } = await supabase
        .from('avaliacoes')
        .update(updateData)
        .eq('id', id);
        
      if (updateError) {
        console.error('Erro ao atualizar avaliação:', updateError);
        throw updateError;
      }
      
      const { error: deleteError } = await supabase
        .from('respostas')
        .delete()
        .eq('avaliacao_id', id);
        
      if (deleteError) {
        console.error('Erro ao deletar respostas antigas:', deleteError);
        throw deleteError;
      }
    }

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
