
import React from "react";
import { FormSection as FormSectionType, FormAnswer, Question } from "@/types/form";
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
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-primary">{section.title}</h2>
      </div>

      <div className="space-y-4">
        {section.questions.map((question) => (
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
