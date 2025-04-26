
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Question } from "@/types/form";

interface PerguntasHookProps {
  formularioId: string;
}

export const usePerguntas = ({ formularioId }: PerguntasHookProps) => {
  const [perguntas, setPerguntas] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPerguntas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('perguntas')
        .select(`
          *,
          risco:riscos (
            *,
            severidade:severidade (*)
          ),
          pergunta_opcoes(*)
        `)
        .eq('formulario_id', formularioId)
        .order('secao');

      if (error) throw error;

      setPerguntas(data);
    } catch (error) {
      console.error("Erro ao carregar perguntas:", error);
      toast.error("Erro ao carregar perguntas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerguntas();
  }, [formularioId]);

  return {
    perguntas,
    loading,
    refreshPerguntas: fetchPerguntas
  };
};
