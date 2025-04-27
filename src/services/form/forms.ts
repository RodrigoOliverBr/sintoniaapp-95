
import { supabase } from '@/integrations/supabase/client';
import { Form } from '@/types/form';

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

