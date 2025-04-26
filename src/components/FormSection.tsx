
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
  const orderedQuestions = [...section.questions].sort((a, b) => 
    (a.ordem || 0) - (b.ordem || 0)
  );

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
