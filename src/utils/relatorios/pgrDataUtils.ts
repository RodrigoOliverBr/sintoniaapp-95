
import { Question } from "@/types/form";

interface PGRSection {
  title: string;
  questions: Question[];
}

// Utility function to generate PGR data structure from questions and answers
export const generatePGRData = (questions: Question[], answers: Record<string, any>): PGRSection[] => {
  // For now, returning a placeholder structure
  // This would typically group questions by section/category and format them for the report
  
  // Placeholder data for the report
  const sections: PGRSection[] = [
    {
      title: "Identificação de Riscos Psicossociais",
      questions: questions.filter(q => q.categoria === 'risco_psicossocial' || !q.categoria)
    },
    {
      title: "Avaliação de Fatores Organizacionais",
      questions: questions.filter(q => q.categoria === 'organizacional')
    },
    {
      title: "Medidas de Controle e Prevenção",
      questions: questions.filter(q => q.categoria === 'prevencao')
    }
  ];
  
  return sections;
};
