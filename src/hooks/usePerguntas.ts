
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Question } from "@/types/form";

interface PerguntasHookProps {
  formularioId: string;
  filtroSecao?: string;
  filtroRisco?: string;
}

export const usePerguntas = ({ formularioId, filtroSecao, filtroRisco }: PerguntasHookProps) => {
  const [perguntas, setPerguntas] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPerguntas = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('perguntas')
        .select(`
          *,
          risco:riscos (
            *,
            severidade:severidade (*)
          )
        `)
        .eq('formulario_id', formularioId);

      if (filtroSecao && filtroSecao !== "all") {
        query = query.eq('secao', filtroSecao);
      }

      if (filtroRisco && filtroRisco !== "all") {
        query = query.eq('risco_id', filtroRisco);
      }

      const { data, error } = await query.order('secao');

      if (error) throw error;
      setPerguntas(data || []);
    } catch (error) {
      console.error("Erro ao carregar perguntas:", error);
      toast.error("Erro ao carregar perguntas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerguntas();
  }, [formularioId, filtroSecao, filtroRisco]);

  return {
    perguntas,
    loading,
    refreshPerguntas: fetchPerguntas
  };
};
