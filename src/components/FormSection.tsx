
import React from "react";
import { Question } from "@/types/form";
import QuestionComponent from "./QuestionComponent";
import { Card } from "@/components/ui/card";

interface FormSectionProps {
  section: {
    id: string;
    title: string;
    questions: Question[];
  };
  answers: Record<string, any>;
  onAnswerChange: (questionId: string, answer: boolean | null) => void;
  onObservationChange: (questionId: string, observation: string) => void;
  onOptionsChange: (questionId: string, options: string[]) => void;
}

const FormSection: React.FC<FormSectionProps> = ({
  section,
  answers,
  onAnswerChange,
  onObservationChange,
  onOptionsChange,
}) => {
  const questionsToShow = section.questions || [];
  
  const orderedQuestions = [...questionsToShow].sort((a, b) => {
    if ((a.ordem_pergunta === 0 && b.ordem_pergunta === 0) || a.ordem_pergunta === b.ordem_pergunta) {
      return 0;
    }
    if (a.ordem_pergunta === 0) return 1;
    if (b.ordem_pergunta === 0) return -1;
    return (a.ordem_pergunta || 0) - (b.ordem_pergunta || 0);
  });

  if (orderedQuestions.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">Não há perguntas nesta seção.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-primary">{section.title}</h2>
      </div>

      <div className="space-y-4">
        {orderedQuestions.map((question) => (
          <Card key={question.id} className="overflow-hidden">
            <QuestionComponent
              question={question}
              answer={answers[question.id]?.answer}
              observations={answers[question.id]?.observation || ""}
              selectedOptions={answers[question.id]?.selectedOptions || []}
              onAnswerChange={(answer) => onAnswerChange(question.id, answer)}
              onObservationChange={(observation) => onObservationChange(question.id, observation)}
              onOptionsChange={(options) => onOptionsChange(question.id, options)}
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FormSection;
