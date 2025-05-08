
import { supabase } from "@/integrations/supabase/client";
import { Mitigation } from "@/types/form";

// Re-export everything from the main index file
export * from './index';

// Add the missing getMitigationsByRiskId function
export async function getMitigationsByRiskId(riskId: string): Promise<Mitigation[]> {
  try {
    if (!riskId) return [];
    
    console.log(`Fetching mitigations for risk ID: ${riskId}`);
    
    const { data, error } = await supabase
      .from('mitigacoes')
      .select('*')
      .eq('risco_id', riskId);
      
    if (error) {
      console.error('Error fetching mitigations:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} mitigations for risk ${riskId}`);
    
    return data as Mitigation[] || [];
  } catch (error) {
    console.error('Error in getMitigationsByRiskId:', error);
    return [];
  }
}
