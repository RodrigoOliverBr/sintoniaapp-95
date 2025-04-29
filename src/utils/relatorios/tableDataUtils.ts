
import { Question } from "@/types/form";

// Utility function to generate table data for the PDF report
export const generateTableData = (questions: Question[], answers: Record<string, any>): string[][] => {
  if (!questions || questions.length === 0) {
    return [];
  }
  
  // Transform questions and answers into a format suitable for the PDF table
  return questions.map(question => {
    const questionId = question.id;
    const answer = answers[questionId] || 'Não respondido';
    const observation = answers[`${questionId}_obs`] || 'Nenhuma observação';
    
    return [
      question.texto || 'Sem texto',
      typeof answer === 'object' ? JSON.stringify(answer) : answer.toString(),
      observation
    ];
  });
};
