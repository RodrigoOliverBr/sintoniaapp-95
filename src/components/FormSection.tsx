
import React from "react";
import { FormAnswer, Question } from "@/types/form";
import QuestionComponent from "./QuestionComponent";
import { Card } from "@/components/ui/card";

interface FormSectionProps {
  section: {
    title: string;
    questions: Question[];
  };
  answers: Record<string, FormAnswer>;
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
  // Sort questions by the ordem property
  const orderedQuestions = [...section.questions].sort((a, b) => {
    // If both have order 0 or equal, don't change the order
    if ((a.ordem === 0 && b.ordem === 0) || a.ordem === b.ordem) {
      return 0;
    }
    // If only one has order 0, put it last
    if (a.ordem === 0) return 1;
    if (b.ordem === 0) return -1;
    // Sort normally by numbers
    return (a.ordem || 0) - (b.ordem || 0);
  });

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
              answer={answers[question.id]}
              onChange={onAnswerChange}
              onObservationChange={onObservationChange}
              onOptionsChange={onOptionsChange}
            />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FormSection;
