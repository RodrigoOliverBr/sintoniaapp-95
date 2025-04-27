
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Question, Section } from "@/types/form";

interface PerguntasHookProps {
  formularioId: string;
}

export const usePerguntas = ({ formularioId }: PerguntasHookProps) => {
  const [perguntas, setPerguntas] = useState<Question[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch sections first
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('secoes')
        .select('*')
        .eq('formulario_id', formularioId)
        .order('ordem');

      if (sectionsError) throw sectionsError;
      setSections(sectionsData || []);

      // Fetch questions with their relations
      const { data: questionsData, error: questionsError } = await supabase
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

      if (questionsError) throw questionsError;

      const transformedData = questionsData.map((item: any) => ({
        id: item.id,
        texto: item.texto,
        risco_id: item.risco_id,
        secao_id: item.secao_id,
        secao: item.secao, // Keep for backward compatibility
        secao_descricao: item.secao_descricao, // Keep for backward compatibility
        ordem: item.ordem || 0, // Keep for backward compatibility
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

      setPerguntas(transformedData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formularioId) {
      fetchData();
    }
  }, [formularioId]);

  return {
    perguntas,
    sections,
    loading,
    refreshPerguntas: fetchData
  };
};
