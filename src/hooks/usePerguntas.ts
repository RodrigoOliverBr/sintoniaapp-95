
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
        .eq('formulario_id', formularioId);

      if (error) throw error;

      // Transformar os dados para corresponder ao tipo Question
      const transformedData = data.map((item: any) => ({
        id: item.id,
        texto: item.texto,
        risco_id: item.risco_id,
        secao: item.secao,
        secao_descricao: item.secao_descricao,
        ordem: item.ordem || 0,
        ordem_pergunta: item.ordem_pergunta || 0,
        formulario_id: item.formulario_id,
        opcoes: item.opcoes 
          ? typeof item.opcoes === 'string' 
            ? JSON.parse(item.opcoes) 
            : item.opcoes 
          : undefined,
        observacao_obrigatoria: item.observacao_obrigatoria,
        risco: item.risco,
        pergunta_opcoes: item.pergunta_opcoes,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      console.log("Fetched questions:", transformedData);
      setPerguntas(transformedData);
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
