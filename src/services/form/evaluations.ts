
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
  
  try {
    let avaliacaoId = id;
    
    if (!avaliacaoId || avaliacaoId.trim() === '') {
      console.log('Creating new evaluation since no ID was provided');
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
        console.log(`Found existing draft: ${avaliacaoId}, will update it instead of creating new`);
        
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
        
        console.log(`Updated existing draft evaluation: ${avaliacaoId}`);
      } else {
        // Insert new evaluation
        console.log('No existing draft found, creating brand new evaluation');
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
      
      console.log(`Successfully updated evaluation: ${avaliacaoId}`);
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
