
import { supabase } from "@/integrations/supabase/client";
import { Avaliacao, AvaliacaoResposta, FormResult } from "@/types/avaliacao";
import { toast as sonnerToast } from "sonner";

/**
 * Deleta uma avaliação pelo seu ID
 */
export async function deleteFormEvaluation(evaluationId: string): Promise<void> {
  if (!evaluationId) {
    throw new Error("ID de avaliação inválido");
  }

  // A função trigger delete_avaliacao_related_data cuidará de deletar todos os dados relacionados
  const { error } = await supabase
    .from("avaliacoes")
    .delete()
    .eq("id", evaluationId);

  if (error) {
    console.error("Erro ao excluir avaliação:", error);
    throw error;
  }
}

/**
 * Atualiza as notas do analista para uma avaliação
 */
export async function updateAnalystNotes(
  evaluationId: string,
  notes: string
): Promise<void> {
  if (!evaluationId) {
    throw new Error("ID de avaliação inválido");
  }

  const { error } = await supabase
    .from("avaliacoes")
    .update({ notas_analista: notes, last_updated: new Date().toISOString() })
    .eq("id", evaluationId);

  if (error) {
    console.error("Erro ao atualizar notas do analista:", error);
    throw error;
  }
}

/**
 * Busca o resultado do formulário para um funcionário específico
 */
export async function getFormResultByEmployeeId(
  employeeId: string,
  formId?: string
): Promise<FormResult | null> {
  try {
    let query = supabase
      .from("avaliacoes")
      .select(`
        id,
        funcionario_id,
        empresa_id,
        formulario_id,
        total_sim,
        total_nao,
        is_complete,
        notas_analista,
        created_at,
        updated_at,
        last_updated
      `)
      .eq("funcionario_id", employeeId)
      .order("created_at", { ascending: false })
      .limit(1);
    
    // Se um ID de formulário for fornecido, filtrar por ele
    if (formId) {
      query = query.eq("formulario_id", formId);
    }

    const { data: avaliacao, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 é o código retornado quando nenhum resultado é encontrado
      console.error("Erro ao buscar avaliação:", error);
      throw error;
    }

    if (!avaliacao) {
      return null;
    }

    // Buscar respostas associadas a esta avaliação
    const { data: respostas, error: respostasError } = await supabase
      .from("respostas")
      .select(`
        id,
        avaliacao_id,
        pergunta_id,
        resposta,
        observacao,
        opcoes_selecionadas,
        created_at,
        updated_at
      `)
      .eq("avaliacao_id", avaliacao.id);

    if (respostasError) {
      console.error("Erro ao buscar respostas da avaliação:", respostasError);
    }

    // Mapear avaliacoes para FormResult
    return {
      id: avaliacao.id,
      employeeId: avaliacao.funcionario_id,
      empresa_id: avaliacao.empresa_id,
      formulario_id: avaliacao.formulario_id || "",
      total_sim: avaliacao.total_sim,
      total_nao: avaliacao.total_nao,
      notas_analista: avaliacao.notas_analista || "",
      is_complete: avaliacao.is_complete || false,
      created_at: avaliacao.created_at,
      updated_at: avaliacao.updated_at,
      last_updated: avaliacao.last_updated,
      
      // Propriedades para compatibilidade com interface FormResult
      totalYes: avaliacao.total_sim,
      totalNo: avaliacao.total_nao,
      analyistNotes: avaliacao.notas_analista || "",
      respostas: respostas as AvaliacaoResposta[] || [],
      
      // Placeholder para contagens de severidade, a ser preenchido posteriormente
      yesPerSeverity: {}
    };
  } catch (error) {
    console.error("Erro ao buscar resultado do formulário:", error);
    return null;
  }
}

/**
 * Salva o resultado do formulário
 */
export async function saveFormResult(formResult: FormResult): Promise<void> {
  try {
    if (!formResult.employeeId || !formResult.empresa_id) {
      throw new Error("ID do funcionário e ID da empresa são obrigatórios");
    }

    // Se temos um ID de avaliação, atualizar o registro existente
    const isUpdate = !!formResult.id;
    
    // Preparar dados para inserção ou atualização
    const avaliacaoData = {
      id: formResult.id || undefined, // Remover se for undefined para gerar novo ID
      funcionario_id: formResult.employeeId,
      empresa_id: formResult.empresa_id,
      formulario_id: formResult.formulario_id || null,
      total_sim: formResult.total_sim || formResult.totalYes || 0,
      total_nao: formResult.total_nao || formResult.totalNo || 0,
      notas_analista: formResult.notas_analista || formResult.analyistNotes || null,
      is_complete: formResult.is_complete || false,
      last_updated: new Date().toISOString(),
    };

    let avaliacaoId = formResult.id;

    // Inserir ou atualizar avaliação
    if (isUpdate) {
      const { error } = await supabase
        .from("avaliacoes")
        .update(avaliacaoData)
        .eq("id", formResult.id);

      if (error) {
        console.error("Erro ao atualizar avaliação:", error);
        throw error;
      }
    } else {
      // Se não for atualização, inserir novo registro
      const { data, error } = await supabase
        .from("avaliacoes")
        .insert(avaliacaoData)
        .select("id")
        .single();

      if (error) {
        console.error("Erro ao inserir avaliação:", error);
        throw error;
      }

      avaliacaoId = data.id;
    }

    // Se temos respostas para salvar
    if (formResult.answers && Object.keys(formResult.answers).length > 0) {
      // Se estamos atualizando, primeiro deletar respostas existentes
      if (isUpdate) {
        const { error } = await supabase
          .from("respostas")
          .delete()
          .eq("avaliacao_id", avaliacaoId);

        if (error) {
          console.error("Erro ao deletar respostas existentes:", error);
          throw error;
        }
      }

      // Preparar dados de respostas para inserção
      const respostasData = Object.entries(formResult.answers).map(
        ([perguntaId, dados]) => ({
          pergunta_id: perguntaId,
          avaliacao_id: avaliacaoId,
          resposta: dados.answer,
          observacao: dados.observation || null,
          opcoes_selecionadas: dados.selectedOptions || null,
        })
      );

      // Inserir novas respostas
      const { error } = await supabase
        .from("respostas")
        .insert(respostasData);

      if (error) {
        console.error("Erro ao inserir respostas:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Erro ao salvar resultado do formulário:", error);
    throw error;
  }
}

/**
 * Busca o histórico de avaliações de um funcionário
 */
export async function getEmployeeFormHistory(
  employeeId: string
): Promise<FormResult[]> {
  try {
    const { data: avaliacoes, error } = await supabase
      .from("avaliacoes")
      .select(`
        id,
        funcionario_id,
        empresa_id,
        formulario_id,
        total_sim,
        total_nao,
        is_complete,
        notas_analista,
        created_at,
        updated_at,
        last_updated
      `)
      .eq("funcionario_id", employeeId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar histórico de avaliações:", error);
      throw error;
    }

    // Mapear as avaliações para o formato FormResult
    return avaliacoes.map((avaliacao) => ({
      id: avaliacao.id,
      employeeId: avaliacao.funcionario_id,
      empresa_id: avaliacao.empresa_id,
      formulario_id: avaliacao.formulario_id || "",
      total_sim: avaliacao.total_sim,
      total_nao: avaliacao.total_nao,
      notas_analista: avaliacao.notas_analista || "",
      is_complete: avaliacao.is_complete || false,
      created_at: avaliacao.created_at,
      updated_at: avaliacao.updated_at,
      last_updated: avaliacao.last_updated,
      
      // Propriedades para compatibilidade
      totalYes: avaliacao.total_sim,
      totalNo: avaliacao.total_nao,
      analyistNotes: avaliacao.notas_analista || "",
    }));
  } catch (error) {
    console.error("Erro ao buscar histórico de avaliações:", error);
    return [];
  }
}

/**
 * Busca uma avaliação específica pelo ID
 */
export async function fetchEvaluation(evaluationId: string): Promise<FormResult | null> {
  try {
    const { data: avaliacao, error } = await supabase
      .from("avaliacoes")
      .select(`
        id,
        funcionario_id,
        empresa_id,
        formulario_id,
        total_sim,
        total_nao,
        is_complete,
        notas_analista,
        created_at,
        updated_at,
        last_updated
      `)
      .eq("id", evaluationId)
      .single();

    if (error) {
      console.error("Erro ao buscar avaliação:", error);
      throw error;
    }

    // Buscar respostas associadas a esta avaliação
    const { data: respostas, error: respostasError } = await supabase
      .from("respostas")
      .select(`
        id,
        avaliacao_id,
        pergunta_id,
        resposta,
        observacao,
        opcoes_selecionadas,
        created_at,
        updated_at
      `)
      .eq("avaliacao_id", evaluationId);

    if (respostasError) {
      console.error("Erro ao buscar respostas da avaliação:", respostasError);
    }

    // Converter as respostas em um formato de objeto answers para uso no formulário
    const answers: Record<string, any> = {};
    
    if (respostas) {
      respostas.forEach((resposta) => {
        answers[resposta.pergunta_id] = {
          answer: resposta.resposta,
          observation: resposta.observacao || "",
          selectedOptions: resposta.opcoes_selecionadas || [],
        };
      });
    }

    // Retornar no formato FormResult
    return {
      id: avaliacao.id,
      employeeId: avaliacao.funcionario_id,
      empresa_id: avaliacao.empresa_id,
      formulario_id: avaliacao.formulario_id || "",
      total_sim: avaliacao.total_sim,
      total_nao: avaliacao.total_nao,
      notas_analista: avaliacao.notas_analista || "",
      is_complete: avaliacao.is_complete || false,
      created_at: avaliacao.created_at,
      updated_at: avaliacao.updated_at,
      last_updated: avaliacao.last_updated,

      // Propriedades adicionais para interface
      totalYes: avaliacao.total_sim,
      totalNo: avaliacao.total_nao,
      analyistNotes: avaliacao.notas_analista || "",
      answers,
      respostas: respostas as AvaliacaoResposta[] || [],
    };
  } catch (error) {
    console.error("Erro ao buscar avaliação:", error);
    return null;
  }
}

/**
 * Busca todas as avaliações de um funcionário
 */
export async function fetchEmployeeEvaluations(employeeId: string): Promise<FormResult[]> {
  return getEmployeeFormHistory(employeeId);
}

/**
 * Busca a avaliação mais recente de um funcionário
 */
export async function fetchLatestEmployeeEvaluation(
  employeeId: string,
  formId?: string
): Promise<FormResult | null> {
  return getFormResultByEmployeeId(employeeId, formId);
}
