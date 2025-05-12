
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlanoMitigacao } from "@/types/cliente";

/**
 * Get existing mitigation plan for a specific risk and company
 */
export const getPlanoMitigacao = async (
  empresaId: string, 
  riscoId: string
): Promise<PlanoMitigacao | null> => {
  try {
    // Verificamos se a tabela existe antes de tentar consultar
    const { data, error } = await supabase
      .from('planos_mitigacao')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('risco_id', riscoId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching mitigation plan:", error);
      return null;
    }

    return data as PlanoMitigacao | null;
  } catch (error) {
    console.error("Failed to fetch mitigation plan:", error);
    return null;
  }
};

/**
 * Get all mitigation plans for a specific company
 */
export const getPlanosMitigacaoByEmpresa = async (
  empresaId: string
): Promise<PlanoMitigacao[]> => {
  try {
    const { data, error } = await supabase
      .from('planos_mitigacao')
      .select('*')
      .eq('empresa_id', empresaId);

    if (error) {
      console.error("Error fetching mitigation plans:", error);
      return [];
    }

    return data as PlanoMitigacao[] || [];
  } catch (error) {
    console.error("Failed to fetch mitigation plans:", error);
    return [];
  }
};

/**
 * Create or update a mitigation plan
 */
export const savePlanoMitigacao = async (
  plano: PlanoMitigacao
): Promise<{ success: boolean; planoId?: string; error?: any }> => {
  try {
    // Check if a plan already exists for this company and risk
    const { data: existingPlan, error: checkError } = await supabase
      .from('planos_mitigacao')
      .select('id')
      .eq('empresa_id', plano.empresa_id)
      .eq('risco_id', plano.risco_id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking for existing plan:", checkError);
      return { success: false, error: checkError };
    }

    let result;

    if (existingPlan) {
      // Update existing plan
      const { data, error } = await supabase
        .from('planos_mitigacao')
        .update({
          medidas_controle: plano.medidas_controle,
          prazo: plano.prazo,
          responsavel: plano.responsavel,
          status: plano.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPlan.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating mitigation plan:", error);
        return { success: false, error };
      }

      result = { success: true, planoId: data.id };
    } else {
      // Insert new plan
      const { data, error } = await supabase
        .from('planos_mitigacao')
        .insert({
          empresa_id: plano.empresa_id,
          risco_id: plano.risco_id,
          medidas_controle: plano.medidas_controle,
          prazo: plano.prazo,
          responsavel: plano.responsavel,
          status: plano.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating mitigation plan:", error);
        return { success: false, error };
      }

      result = { success: true, planoId: data.id };
    }

    return result;
  } catch (error) {
    console.error("Failed to save mitigation plan:", error);
    return { success: false, error };
  }
};

/**
 * Get mitigation suggestions for a risk
 */
export const getMitigacoesPorRisco = async (riscoId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('mitigacoes')
      .select('descricao')
      .eq('risco_id', riscoId);

    if (error) {
      console.error("Error fetching mitigations for risk:", error);
      return [];
    }

    return data?.map(item => item.descricao) || [];
  } catch (error) {
    console.error("Failed to fetch mitigations:", error);
    return [];
  }
};
