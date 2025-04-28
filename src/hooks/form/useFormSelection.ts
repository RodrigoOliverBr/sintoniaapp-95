
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export function useFormSelection() {
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const { data, error } = await supabase
        .from("formularios")
        .select("*")
        .eq("ativo", true);

      if (error) throw error;

      setAvailableForms(data || []);
      
      if (data && data.length > 0) {
        // Automatically select the first form if none is selected
        if (!selectedFormId) {
          setSelectedFormId(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading forms:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os formulários disponíveis",
        variant: "destructive"
      });
    }
  };

  return {
    availableForms,
    selectedFormId,
    setSelectedFormId
  };
}
