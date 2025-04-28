import { supabase } from "@/integrations/supabase/client";
import { FormResult } from "@/types/form";

async function createReportForEvaluation(evaluationId: string, companyId: string, formId: string): Promise<void> {
  try {
    console.log(`Checking if a report is needed for evaluation ${evaluationId}`);
    
    // Check if a report already exists for this evaluation
    const { data: existingReport, error: checkError } = await supabase
      .from('relatorios')
      .select('id')
      .eq('avaliacao_id', evaluationId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for existing report:', checkError);
    }
    
    // Only create a new report if one doesn't already exist
    if (!existingReport) {
      console.log(`No existing report found, creating new report for evaluation ${evaluationId}`);
      
      const { data, error } = await supabase
        .from('relatorios')
        .insert({
          avaliacao_id: evaluationId,
          empresa_id: companyId,
          tipo: 'avaliacao_individual',
          data_geracao: new Date().toISOString(),
          observacoes: `Relatório gerado automaticamente para a avaliação ${evaluationId} do formulário ${formId}`
        });
        
      if (error) {
        console.error('Error creating report:', error);
        throw error;
      }
      
      console.log('Report created successfully');
    } else {
      console.log(`Report for evaluation ${evaluationId} already exists (ID: ${existingReport.id}), not creating a new one`);
    }
  } catch (error) {
    console.error('Failed to create report:', error);
    // Don't throw here as we want form submission to succeed even if report creation fails
  }
}

export async function saveFormResult(formData: FormResult): Promise<void> {
  const { employeeId, answers, total_sim, total_nao, is_complete, empresa_id, formulario_id, id, notas_analista } = formData;

  console.log('Iniciando processo de salvamento do formulário');
  console.log('Form ID:', formulario_id);
  console.log('Employee ID:', employeeId);
  console.log('Evaluation ID:', id || 'new');
  console.log('Is complete:', is_complete);
  console.log('Analyst notes present:', !!notas_analista);
  console.log('Total sim:', total_sim);
  console.log('Total não:', total_nao);
  
  try {
    let avaliacaoId = id;
    
    if (!avaliacaoId || avaliacaoId.trim() === '') {
      console.log('Creating new evaluation since no ID was provided');
      
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
      
      console.log(`Successfully updated evaluation: ${avaliacaoId}`);
    }

    // First check existing responses to perform update or insert strategy
    console.log('Fetching existing responses for evaluation:', avaliacaoId);
    const { data: existingResponses, error: fetchError } = await supabase
      .from('respostas')
      .select('id, pergunta_id')
      .eq('avaliacao_id', avaliacaoId);
      
    if (fetchError) {
      console.error('Error fetching existing responses:', fetchError);
      throw fetchError;
    }
      
    // Create a map of existing responses by question ID
    const existingResponsesMap = new Map();
    existingResponses?.forEach(response => {
      existingResponsesMap.set(response.pergunta_id, response.id);
    });
    
    console.log(`Found ${existingResponsesMap.size} existing responses`);
    
    // Track which questions have been processed
    const processedQuestionIds = new Set<string>();
    
    // Prepare arrays for inserts and updates
    const responsesToInsert: any[] = [];
    const responsesToUpdate: any[] = [];
    
    // Process each answer - either update existing or insert new
    Object.entries(answers).forEach(([perguntaId, answer]) => {
      processedQuestionIds.add(perguntaId);
      
      const responseData = {
        avaliacao_id: avaliacaoId,
        pergunta_id: perguntaId,
        resposta: answer.answer,
        observacao: answer.observation || null,
        opcoes_selecionadas: answer.selectedOptions || null
      };
      
      // If a response for this question already exists, update it
      if (existingResponsesMap.has(perguntaId)) {
        const responseId = existingResponsesMap.get(perguntaId);
        responsesToUpdate.push({
          id: responseId,
          ...responseData
        });
      } else {
        // Otherwise insert a new response
        responsesToInsert.push(responseData);
      }
    });
    
    // Find responses that need to be deleted (no longer in answers)
    const responsesToDelete = existingResponses
      ?.filter(response => !processedQuestionIds.has(response.pergunta_id))
      .map(response => response.id) || [];
      
    console.log(`Will update ${responsesToUpdate.length} responses`);
    console.log(`Will insert ${responsesToInsert.length} responses`);
    console.log(`Will delete ${responsesToDelete.length} responses`);
    
    // Process updates in batches
    if (responsesToUpdate.length > 0) {
      const batchSize = 50;
      for (let i = 0; i < responsesToUpdate.length; i += batchSize) {
        const batch = responsesToUpdate.slice(i, i + batchSize);
        console.log(`Updating batch ${i / batchSize + 1} with ${batch.length} responses`);
        
        for (const response of batch) {
          const { error: updateError } = await supabase
            .from('respostas')
            .update({
              resposta: response.resposta,
              observacao: response.observacao,
              opcoes_selecionadas: response.opcoes_selecionadas
            })
            .eq('id', response.id);
            
          if (updateError) {
            console.error(`Error updating response ${response.id}:`, updateError);
            throw updateError;
          }
        }
      }
    }
    
    // Process inserts in batches
    if (responsesToInsert.length > 0) {
      const batchSize = 50;
      for (let i = 0; i < responsesToInsert.length; i += batchSize) {
        const batch = responsesToInsert.slice(i, i + batchSize);
        console.log(`Inserting batch ${i / batchSize + 1} with ${batch.length} responses`);
        
        const { error: insertError } = await supabase
          .from('respostas')
          .insert(batch);
          
        if (insertError) {
          console.error('Error inserting responses batch:', insertError);
          throw insertError;
        }
      }
    }
    
    // Process deletes if any
    if (responsesToDelete.length > 0) {
      console.log(`Deleting ${responsesToDelete.length} outdated responses`);
      
      for (const responseId of responsesToDelete) {
        const { error: deleteError } = await supabase
          .from('respostas')
          .delete()
          .eq('id', responseId);
          
        if (deleteError) {
          console.error(`Error deleting response ${responseId}:`, deleteError);
          throw deleteError;
        }
      }
    }

    // If the form is complete, ensure we have a report
    if (is_complete) {
      console.log('Form is complete, checking/creating report');
      await createReportForEvaluation(avaliacaoId, empresa_id, formulario_id);
    } else {
      console.log('Form is not complete, skipping report creation');
    }
    
    console.log('Form data saved successfully');
  } catch (error) {
    console.error('Error in saving form:', error);
    throw error;
  }
}

// Get evaluation by employee ID and form ID
export async function getFormResultByEmployeeId(employeeId: string, formId: string): Promise<FormResult | null> {
  try {
    // First check for completed evaluations
    const { data: completedEvaluation, error: completedError } = await supabase
      .from('avaliacoes')
      .select('*')
      .eq('funcionario_id', employeeId)
      .eq('formulario_id', formId)
      .eq('is_complete', true)
      .order('created_at', { ascending: false })
      .maybeSingle();
      
    if (completedError) {
      console.error('Error fetching completed evaluations:', completedError);
      throw completedError;
    }
    
    if (completedEvaluation) {
      return await getFullEvaluation(completedEvaluation);
    }

    // No completed evaluation found, check for drafts
    const { data: draftEvaluation, error: draftError } = await supabase
      .from('avaliacoes')
      .select('*')
      .eq('funcionario_id', employeeId)
      .eq('formulario_id', formId)
      .eq('is_complete', false)
      .order('created_at', { ascending: false })
      .maybeSingle();
      
    if (draftError) {
      console.error('Error fetching draft evaluations:', draftError);
      throw draftError;
    }
    
    if (draftEvaluation) {
      return await getFullEvaluation(draftEvaluation);
    }
      
    // No evaluations found
    return null;
  } catch (error) {
    console.error('Error in getFormResultByEmployeeId:', error);
    throw error;
  }
}

// Get employee evaluation history
export async function getEmployeeFormHistory(employeeId: string): Promise<FormResult[]> {
  try {
    const { data: evaluations, error } = await supabase
      .from('avaliacoes')
      .select('*')
      .eq('funcionario_id', employeeId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching employee evaluation history:', error);
      throw error;
    }
    
    if (!evaluations || evaluations.length === 0) {
      return [];
    }

    // Get full evaluation data for each evaluation
    const fullEvaluations = await Promise.all(
      evaluations.map((evaluation) => getFullEvaluation(evaluation))
    );
    
    return fullEvaluations;
  } catch (error) {
    console.error('Error in getEmployeeFormHistory:', error);
    throw error;
  }
}

// The delete method is now only a wrapper, the main implementation is in useEvaluationHistory
export async function deleteFormEvaluation(evaluationId: string): Promise<void> {
  try {
    console.log(`Legacy deleteFormEvaluation called for ID: ${evaluationId}`);
    
    // Delete responses first (and resposta_opcoes via cascade)
    const { error: responsesError } = await supabase
      .from('respostas')
      .delete()
      .eq('avaliacao_id', evaluationId);
      
    if (responsesError) {
      console.error('Error deleting responses:', responsesError);
      throw responsesError;
    }
    
    // Delete reports linked to this evaluation
    const { error: reportsError } = await supabase
      .from('relatorios')
      .delete()
      .eq('avaliacao_id', evaluationId);
      
    if (reportsError) {
      console.error('Error deleting reports:', reportsError);
      // Continue even if reports deletion fails
    }
    
    // Finally delete the evaluation itself
    const { error: evaluationError } = await supabase
      .from('avaliacoes')
      .delete()
      .eq('id', evaluationId);
      
    if (evaluationError) {
      console.error('Error deleting evaluation:', evaluationError);
      throw evaluationError;
    }
    
    console.log(`Evaluation ${evaluationId} deleted successfully`);
  } catch (error) {
    console.error('Error in deleteFormEvaluation:', error);
    throw error;
  }
}

// Helper function to get the full evaluation data with answers
async function getFullEvaluation(evaluation: any): Promise<FormResult> {
  try {
    // Get all responses for this evaluation
    const { data: responses, error: responsesError } = await supabase
      .from('respostas')
      .select('*')
      .eq('avaliacao_id', evaluation.id);
      
    if (responsesError) {
      console.error('Error fetching responses:', responsesError);
      throw responsesError;
    }
    
    // Format responses into the answers object expected by FormResult
    const answers: Record<string, any> = {};
    
    if (responses) {
      responses.forEach((response) => {
        answers[response.pergunta_id] = {
          questionId: response.pergunta_id,
          answer: response.resposta,
          observation: response.observacao || '',
          selectedOptions: response.opcoes_selecionadas || []
        };
      });
    }

    // Count actual yes/no answers based on the responses
    let total_sim = 0;
    let total_nao = 0;
    
    if (responses) {
      responses.forEach((response) => {
        if (response.resposta === true) total_sim++;
        if (response.resposta === false) total_nao++;
      });
    }
    
    // Return the full evaluation object with updated counts
    return {
      id: evaluation.id,
      employeeId: evaluation.funcionario_id,
      empresa_id: evaluation.empresa_id,
      formulario_id: evaluation.formulario_id,
      total_sim: total_sim, // Use the calculated value
      total_nao: total_nao, // Use the calculated value
      notas_analista: evaluation.notas_analista || '',
      analyistNotes: evaluation.notas_analista || '',
      answers,
      is_complete: evaluation.is_complete || false,
      created_at: evaluation.created_at,
      updated_at: evaluation.updated_at,
      last_updated: evaluation.last_updated || evaluation.updated_at
    };
  } catch (error) {
    console.error('Error in getFullEvaluation:', error);
    throw error;
  }
}
