
import React from "react";
import { Button } from "@/components/ui/button";
import FormSection from "@/components/FormSection";
import { FormAnswer, Question } from "@/types/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FormAllQuestionsProps {
  sections: any[];
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

  if (!sections || sections.length === 0 || !questions || questions.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Nenhuma pergunta encontrada
        </h3>
        <p className="text-muted-foreground">
          Não há perguntas configuradas para este formulário.
        </p>
      </div>
    );
  }

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

      {sections.map((section) => (
        section.questions && section.questions.length > 0 && (
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
