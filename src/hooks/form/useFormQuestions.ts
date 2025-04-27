
import { useState, useEffect } from "react";
import { Question, Section } from "@/types/form";
import { getFormQuestions } from "@/services/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useFormQuestions(selectedFormId: string) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formSections, setFormSections] = useState<{title: string, description?: string, ordem: number, questions: Question[]}[]>([]);
  const [currentSection, setCurrentSection] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (selectedFormId) {
      loadFormQuestions();
    }
  }, [selectedFormId]);

  useEffect(() => {
    if (formSections.length > 0 && !currentSection) {
      setCurrentSection(formSections[0].title);
    }
  }, [formSections]);

  const loadFormQuestions = async () => {
    try {
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('secoes')
        .select('*')
        .eq('formulario_id', selectedFormId)
        .order('ordem', { ascending: true });
      
      if (sectionsError) throw sectionsError;
      
      console.log('Fetched sections:', sectionsData.length, sectionsData);
      
      const questionsData = await getFormQuestions(selectedFormId);
      setQuestions(questionsData);
      
      console.log('Fetched questions:', questionsData.length);
      
      const sectionGroups = sectionsData.map(section => ({
        title: section.titulo,
        description: section.descricao,
        ordem: section.ordem || 0,
        questions: questionsData.filter(q => q.secao_id === section.id)
      }));
      
      const orderedSections = sectionGroups.sort((a, b) => a.ordem - b.ordem);
      console.log('Ordered sections:', orderedSections.length, orderedSections.map(s => s.title));
      
      setFormSections(orderedSections);
      
      if (orderedSections.length > 0 && !currentSection) {
        setCurrentSection(orderedSections[0].title);
      }
    } catch (error) {
      console.error("Erro ao carregar perguntas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as perguntas do formulário",
        variant: "destructive",
      });
    }
  };

  return {
    questions,
    formSections,
    currentSection,
    setCurrentSection,
  };
}
