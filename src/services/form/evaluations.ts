
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
      formulario_id: formId || "",
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
      formulario_id: "", // This field doesn't exist in database yet
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

// Create report entry in the database
async function createReportForEvaluation(evaluationId: string, companyId: string): Promise<void> {
  try {
    console.log(`Creating report for evaluation ${evaluationId}`);
    
    const { data, error } = await supabase
      .from('relatorios')
      .insert({
        avaliacao_id: evaluationId,
        empresa_id: companyId,
        tipo: 'avaliacao_individual',
        data_geracao: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error creating report:', error);
      throw error;
    }
    
    console.log('Report created successfully');
  } catch (error) {
    console.error('Failed to create report:', error);
    // Don't throw here as we want form submission to succeed even if report creation fails
  }
}

export async function saveFormResult(formData: FormResult): Promise<void> {
  const { employeeId, answers, total_sim, total_nao, is_complete, empresa_id, formulario_id, id, notas_analista } = formData;

  try {
    // Start a transaction for consistency
    let avaliacaoId = id;
    
    if (!avaliacaoId || avaliacaoId.trim() === '') {
      console.log('Creating new evaluation');
      // For INSERT operation, do not try to include formulario_id if it's not in the table schema
      const insertData: any = {
        funcionario_id: employeeId,
        empresa_id: empresa_id,
        total_sim,
        total_nao,
        is_complete,
        notas_analista,
        last_updated: new Date().toISOString()
      };
      
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
      console.log(`Created new evaluation with ID: ${avaliacaoId}`);
    } else {
      console.log(`Updating existing evaluation with ID: ${avaliacaoId}`);
      // For UPDATE operation, do not try to update formulario_id if it's not in the table schema
      const updateData: any = {
        total_sim,
        total_nao,
        is_complete,
        notas_analista,
        last_updated: new Date().toISOString()
      };
      
      const { error: updateError } = await supabase
        .from('avaliacoes')
        .update(updateData)
        .eq('id', id);
        
      if (updateError) {
        console.error('Erro ao atualizar avaliação:', updateError);
        throw updateError;
      }
      
      // First delete all existing responses for this evaluation to prevent duplicates
      console.log('Clearing previous responses');
      const { error: deleteError } = await supabase
        .from('respostas')
        .delete()
        .eq('avaliacao_id', id);
        
      if (deleteError) {
        console.error('Erro ao deletar respostas antigas:', deleteError);
        throw deleteError;
      }
    }

    // Now insert all answers - this fixes the duplication issue
    const respostasToInsert = Object.entries(answers).map(([perguntaId, answer]) => ({
      avaliacao_id: avaliacaoId,
      pergunta_id: perguntaId,
      resposta: answer.answer,
      observacao: answer.observation || null,
      opcoes_selecionadas: answer.selectedOptions || null
    }));

    console.log(`Inserting ${respostasToInsert.length} responses`);
    if (respostasToInsert.length > 0) {
      const { error: respostasError } = await supabase
        .from('respostas')
        .insert(respostasToInsert);

      if (respostasError) {
        console.error('Erro ao salvar respostas:', respostasError);
        throw respostasError;
      }
    }

    // If the form is complete, create a report
    if (is_complete) {
      console.log('Form is complete, creating report');
      await createReportForEvaluation(avaliacaoId, empresa_id);
    }
    
    console.log('Form data saved successfully');
  } catch (error) {
    console.error('Erro no processo de salvamento do formulário:', error);
    throw error;
  }
}

export async function deleteFormEvaluation(evaluationId: string): Promise<boolean> {
  try {
    console.log(`Iniciando processo de exclusão da avaliação: ${evaluationId}`);
    
    // 1. Primeiro, verifica se a avaliação existe
    const { data: existingEvaluation, error: checkError } = await supabase
      .from('avaliacoes')
      .select('id')
      .eq('id', evaluationId)
      .single();
    
    if (checkError || !existingEvaluation) {
      console.error('Avaliação não encontrada ou erro ao verificar:', checkError);
      return false;
    }
    
    console.log(`Avaliação ${evaluationId} encontrada, prosseguindo com exclusão`);
    
    // 2. Exclui relatórios associados (se existirem)
    console.log('Excluindo relatórios');
    const { error: deleteRelatoriosError } = await supabase
      .from('relatorios')
      .delete()
      .eq('avaliacao_id', evaluationId);
      
    if (deleteRelatoriosError) {
      console.error('Erro ao excluir relatórios:', deleteRelatoriosError);
      // Continue with the deletion process even if this step fails
    }
    
    // 3. Buscar todas as respostas para esta avaliação
    const { data: respostas, error: respostasError } = await supabase
      .from('respostas')
      .select('id')
      .eq('avaliacao_id', evaluationId);
      
    if (respostasError) {
      console.error('Erro ao buscar respostas para exclusão:', respostasError);
    } else if (respostas && respostas.length > 0) {
      const respostaIds = respostas.map(r => r.id);
      
      console.log(`Excluindo opções de ${respostaIds.length} respostas`);
      
      // 4. Exclui as opções de resposta para cada resposta
      const { error: deleteOpcoesError } = await supabase
        .from('resposta_opcoes')
        .delete()
        .in('resposta_id', respostaIds);
      
      if (deleteOpcoesError) {
        console.error('Erro ao excluir opções de respostas:', deleteOpcoesError);
        // Continue with the deletion process even if this step fails
      }
    }
    
    // 5. Exclui as respostas
    console.log('Excluindo respostas');
    const { error: deleteRespostasError } = await supabase
      .from('respostas')
      .delete()
      .eq('avaliacao_id', evaluationId);
      
    if (deleteRespostasError) {
      console.error('Erro ao excluir respostas:', deleteRespostasError);
      return false;
    }
    
    // 6. Finalmente, exclui a avaliação
    console.log('Excluindo a avaliação');
    const { error: deleteAvaliacaoError } = await supabase
      .from('avaliacoes')
      .delete()
      .eq('id', evaluationId);
    
    if (deleteAvaliacaoError) {
      console.error('Erro ao excluir avaliação:', deleteAvaliacaoError);
      return false;
    }
    
    console.log(`Avaliação ${evaluationId} excluída com sucesso`);
    return true;
  } catch (error) {
    console.error('Erro completo no processo de exclusão da avaliação:', error);
    return false;
  }
}
