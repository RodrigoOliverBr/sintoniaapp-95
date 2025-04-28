
import { supabase } from '@/integrations/supabase/client';

// Define the Form interface to match what's coming from the database
interface Form {
  id: string;
  titulo: string;
  descricao?: string;
  version?: string;
  ativo?: boolean;
  created_at: string;
  updated_at: string;
}

export async function getAllForms(): Promise<Form[]> {
  try {
    const { data, error } = await supabase
      .from('formularios')
      .select('*')
      .eq('ativo', true)
      .order('titulo');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching forms:', error);
    throw error;
  }
}
