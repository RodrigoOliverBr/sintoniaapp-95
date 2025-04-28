
import { supabase } from "@/integrations/supabase/client";
import { FormResult } from "@/types/form";

// Get form status by employee ID
export async function getFormStatusByEmployeeId(employeeId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('avaliacoes')
      .select('*')
      .eq('funcionario_id', employeeId);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting form status:', error);
    throw error;
  }
}

// Get all form results
export async function getFormResults(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('avaliacoes')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting form results:', error);
    throw error;
  }
}

// Get all available forms
export async function getAllForms() {
  try {
    const { data, error } = await supabase
      .from('formularios')
      .select('*')
      .eq('ativo', true);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching forms:', error);
    throw error;
  }
}
