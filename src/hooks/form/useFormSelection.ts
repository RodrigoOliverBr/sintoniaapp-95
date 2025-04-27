
import { useState, useEffect } from "react";
import { Form } from "@/types/form";
import { getAllForms } from "@/services/form";
import { useToast } from "@/hooks/use-toast";

export function useFormSelection() {
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadAvailableForms();
  }, []);

  const loadAvailableForms = async () => {
    try {
      const forms = await getAllForms();
      setAvailableForms(forms);
      
      if (forms.length > 0) {
        setSelectedFormId(forms[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar formulários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os formulários disponíveis",
        variant: "destructive",
      });
    }
  };

  return {
    availableForms,
    selectedFormId, 
    setSelectedFormId,
  };
}
