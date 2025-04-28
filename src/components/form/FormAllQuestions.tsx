
import React from "react";
import { Button } from "@/components/ui/button";
import FormSection from "@/components/FormSection";
import { FormAnswer, Question, Section } from "@/types/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FormAllQuestionsProps {
  sections: Section[];
  questions: Question[];
  answers: Record<string, FormAnswer>;
  onAnswerChange: (questionId: string, answer: boolean | null) => void;
  onObservationChange: (questionId: string, observation: string) => void;
  onOptionsChange: (questionId: string, options: string[]) => void;
  onSaveAndComplete: () => void;
  isSubmitting: boolean;
}

const FormAllQuestions: React.FC<FormAllQuestionsProps> = ({
  sections,
  questions,
  answers,
  onAnswerChange,
  onObservationChange,
  onOptionsChange,
  onSaveAndComplete,
  isSubmitting
}) => {
  // Count answered questions for progress calculation
  const answeredCount = Object.values(answers).filter(a => a.answer !== null && a.answer !== undefined).length;
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? Math.floor((answeredCount / totalQuestions) * 100) : 0;

  // Check if all questions are answered
  const allAnswered = answeredCount === totalQuestions && totalQuestions > 0;

  // Group questions by section
  const getSectionQuestions = (sectionId: string) => {
    return questions.filter(q => q.secao_id === sectionId);
  };

  const formattedSections = sections.map(section => ({
    title: section.titulo,
    description: section.descricao,
    questions: getSectionQuestions(section.id)
  }));

  return (
    <div className="space-y-8">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Progresso do formulário</h3>
          <span className="text-sm font-medium">{progress}% completo</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {answeredCount} de {totalQuestions} perguntas respondidas
        </div>
      </div>

      {formattedSections.map((section) => (
        section.questions.length > 0 && (
          <div key={section.title} className="border rounded-lg p-4 bg-white">
            <FormSection
              section={section}
              answers={answers}
              onAnswerChange={onAnswerChange}
              onObservationChange={onObservationChange}
              onOptionsChange={onOptionsChange}
            />
          </div>
        )
      ))}

      <div className="flex justify-center mt-8 sticky bottom-0 bg-background p-4 border-t">
        <Button 
          onClick={onSaveAndComplete} 
          disabled={isSubmitting || !allAnswered}
          className="w-full md:w-auto px-8"
        >
          {isSubmitting ? "Salvando..." : "Salvar e Concluir"}
        </Button>
      </div>

      {!allAnswered && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor, responda todas as perguntas antes de concluir o formulário.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FormAllQuestions;
