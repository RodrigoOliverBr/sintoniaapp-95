
import { supabase } from '@/integrations/supabase/client';
import { Risk, Severity, Mitigation } from '@/types/form';

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

