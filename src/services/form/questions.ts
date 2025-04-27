
import { supabase } from '@/integrations/supabase/client';
import { Question, Section } from '@/types/form';

export async function getFormQuestions(formId: string): Promise<Question[]> {
  // First fetch all sections for this form
  const { data: sections, error: sectionsError } = await supabase
    .from('secoes')
    .select('*')
    .eq('formulario_id', formId)
    .order('ordem', { ascending: true });

  if (sectionsError) {
    console.error('Error fetching sections:', sectionsError);
    throw sectionsError;
  }

  // Create a map of section IDs to section objects
  const sectionsMap = sections.reduce((acc, section) => {
    acc[section.id] = section;
    return acc;
  }, {} as Record<string, Section>);

  // Now fetch the questions with their relations
  const { data: questions, error } = await supabase
    .from('perguntas')
    .select(`
      *,
      risco:riscos (
        *,
        severidade:severidade (*)
      ),
      pergunta_opcoes (
        id,
        texto,
        ordem,
        pergunta_id
      )
    `)
    .eq('formulario_id', formId)
    .order('ordem_pergunta', { ascending: true });

  if (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }

  return questions.map(q => ({
    id: q.id,
    texto: q.texto,
    risco_id: q.risco_id,
    secao_id: q.secao_id,
    ordem_pergunta: q.ordem_pergunta || 0,
    formulario_id: formId,
    opcoes: Array.isArray(q.opcoes) 
      ? q.opcoes.map(opt => {
          if (typeof opt === 'string') {
            return { label: opt, value: opt };
          } else if (typeof opt === 'object' && opt !== null) {
            return {
              label: (opt as any).label || (opt as any).text || String(opt),
              value: (opt as any).value || (opt as any).text || String(opt)
            };
          }
          return { label: String(opt), value: String(opt) };
        })
      : undefined,
    observacao_obrigatoria: q.observacao_obrigatoria,
    risco: q.risco ? {
      ...q.risco,
      severidade: q.risco.severidade ? {
        id: q.risco.severidade.id,
        nivel: q.risco.severidade.nivel,
        descricao: q.risco.severidade.descricao
      } : undefined
    } : undefined,
    pergunta_opcoes: q.pergunta_opcoes ? q.pergunta_opcoes.map(po => ({
      id: po.id,
      pergunta_id: po.pergunta_id,
      texto: po.texto,
      ordem: po.ordem
    })) : []
  }));
}

