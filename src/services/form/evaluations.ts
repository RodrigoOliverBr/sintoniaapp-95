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
    // Get the most recent evaluation for this employee
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
      
    if (formId) {
      query = query.eq('formulario_id', formId);
    }
    
    const { data: avaliacoes, error } = await query.limit(1).maybeSingle();

    if (error) {
      console.error('Error fetching form result:', error);
      throw error;
    }

    if (!avaliacoes) return null;

    // Convert responses to answers format
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
      formulario_id: avaliacoes.formulario_id || formId || "",
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
    if (!employeeId) {
      console.log('No employee ID provided for history');
      return [];
    }
    
    console.log(`Carregando histórico para o funcionário: ${employeeId}`);
    
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
    
    console.log(`Histórico carregado: ${avaliacoes.length} avaliações`);

    return avaliacoes.map(avaliacao => {
      // Convert responses to answers format
      const answers: Record<string, FormAnswer> = {};
      if (avaliacao.respostas && Array.isArray(avaliacao.respostas)) {
        avaliacao.respostas.forEach((resposta: any) => {
          answers[resposta.pergunta_id] = {
            questionId: resposta.pergunta_id,
            answer: resposta.resposta,
            observation: resposta.observacao,
            selectedOptions: resposta.opcoes_selecionadas
          };
        });
      }
      
      return {
        id: avaliacao.id,
        employeeId: avaliacao.funcionario_id,
        empresa_id: avaliacao.empresa_id,
        formulario_id: avaliacao.formulario_id || "",
        answers,
        total_sim: avaliacao.total_sim || 0,
        total_nao: avaliacao.total_nao || 0,
        notas_analista: avaliacao.notas_analista || '',
        is_complete: avaliacao.is_complete || false,
        last_updated: avaliacao.last_updated || avaliacao.updated_at,
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
      };
    });
  } catch (error) {
    console.error('Error in getEmployeeFormHistory:', error);
    return [];
  }
}

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

  console.log('Iniciando processo de salvamento do formulário');
  console.log('Form ID:', formulario_id);
  console.log('Respostas:', Object.keys(answers).length);
  
  try {
    let avaliacaoId = id;
    
    if (!avaliacaoId || avaliacaoId.trim() === '') {
      console.log('Creating new evaluation');
      // Check if there's an existing draft for this employee and form
      const { data: existingDraft, error: findError } = await supabase
        .from('avaliacoes')
        .select('id')
        .eq('funcionario_id', employeeId)
        .eq('is_complete', false)
        .eq('formulario_id', formulario_id)
        .maybeSingle();
        
      if (findError) {
        console.error('Error checking for existing draft:', findError);
      }
      
      if (existingDraft) {
        // Use the existing draft instead of creating a new one
        avaliacaoId = existingDraft.id;
        console.log(`Found existing draft: ${avaliacaoId}, will update it instead`);
        
        const updateData = {
          total_sim,
          total_nao,
          is_complete,
          notas_analista,
          formulario_id,
          last_updated: new Date().toISOString()
        };
        
        const { error: updateError } = await supabase
          .from('avaliacoes')
          .update(updateData)
          .eq('id', avaliacaoId);
          
        if (updateError) {
          console.error('Error updating existing draft:', updateError);
          throw updateError;
        }
      } else {
        // Insert new evaluation
        const insertData = {
          funcionario_id: employeeId,
          empresa_id,
          formulario_id,
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
          console.error('Error saving new evaluation:', avaliacaoError);
          throw avaliacaoError;
        }
        
        avaliacaoId = avaliacao.id;
        console.log(`Created new evaluation with ID: ${avaliacaoId}`);
      }
    } else {
      console.log(`Updating existing evaluation with ID: ${avaliacaoId}`);
      // Update existing evaluation
      const updateData = {
        total_sim,
        total_nao,
        is_complete,
        notas_analista,
        formulario_id,
        last_updated: new Date().toISOString()
      };
      
      const { error: updateError } = await supabase
        .from('avaliacoes')
        .update(updateData)
        .eq('id', id);
        
      if (updateError) {
        console.error('Error updating evaluation:', updateError);
        throw updateError;
      }
    }

    // First delete all existing responses for this evaluation to prevent duplicates
    console.log('Clearing previous responses for evaluation:', avaliacaoId);
    const { error: deleteError } = await supabase
      .from('respostas')
      .delete()
      .eq('avaliacao_id', avaliacaoId);
      
    if (deleteError) {
      console.error('Error deleting previous responses:', deleteError);
      throw deleteError;
    }

    // Insert all answers - this fixes the duplication issue
    const respostasToInsert = Object.entries(answers).map(([perguntaId, answer]) => ({
      avaliacao_id: avaliacaoId,
      pergunta_id: perguntaId,
      resposta: answer.answer,
      observacao: answer.observation || null,
      opcoes_selecionadas: answer.selectedOptions || null
    }));

    console.log(`Inserting ${respostasToInsert.length} responses`);
    if (respostasToInsert.length > 0) {
      // Insert in smaller batches to avoid any payload size issues
      const batchSize = 50;
      for (let i = 0; i < respostasToInsert.length; i += batchSize) {
        const batch = respostasToInsert.slice(i, i + batchSize);
        console.log(`Inserting batch ${i / batchSize + 1} with ${batch.length} responses`);
        
        const { error: respostasError } = await supabase
          .from('respostas')
          .insert(batch);

        if (respostasError) {
          console.error('Error saving responses batch:', respostasError);
          throw respostasError;
        }
      }
    }

    // If the form is complete, create a report
    if (is_complete) {
      console.log('Form is complete, creating report');
      await createReportForEvaluation(avaliacaoId, empresa_id);
    }
    
    console.log('Form data saved successfully');
  } catch (error) {
    console.error('Error in saving form:', error);
    throw error;
  }
}

export async function deleteFormEvaluation(evaluationId: string): Promise<boolean> {
  try {
    console.log(`Starting deletion process for evaluation: ${evaluationId}`);
    
    // 1. First, check if the evaluation exists
    const { data: existingEvaluation, error: checkError } = await supabase
      .from('avaliacoes')
      .select('id')
      .eq('id', evaluationId)
      .single();
    
    if (checkError || !existingEvaluation) {
      console.error('Evaluation not found or error checking:', checkError);
      return false;
    }
    
    console.log(`Evaluation ${evaluationId} found, proceeding with deletion`);
    
    // 2. Delete related reports (if any)
    console.log('Deleting reports');
    const { error: deleteReportsError } = await supabase
      .from('relatorios')
      .delete()
      .eq('avaliacao_id', evaluationId);
      
    if (deleteReportsError) {
      console.error('Error deleting reports:', deleteReportsError);
      // Continue with the deletion process even if this step fails
    }
    
    // 3. Delete all responses for this evaluation
    console.log('Deleting responses');
    const { error: deleteResponsesError } = await supabase
      .from('respostas')
      .delete()
      .eq('avaliacao_id', evaluationId);
      
    if (deleteResponsesError) {
      console.error('Error deleting responses:', deleteResponsesError);
      return false;
    }
    
    // 4. Finally, delete the evaluation itself
    console.log('Deleting the evaluation');
    const { error: deleteEvaluationError } = await supabase
      .from('avaliacoes')
      .delete()
      .eq('id', evaluationId);
    
    if (deleteEvaluationError) {
      console.error('Error deleting evaluation:', deleteEvaluationError);
      return false;
    }
    
    console.log(`Evaluation ${evaluationId} deleted successfully`);
    return true;
  } catch (error) {
    console.error('Complete error in the evaluation deletion process:', error);
    return false;
  }
}
