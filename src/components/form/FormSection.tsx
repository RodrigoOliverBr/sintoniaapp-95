
import React from "react";
import { Question, Section } from "@/types/form";
import FormQuestion from "@/components/form/FormQuestion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface FormSectionProps {
  section: Section;
  questions: Question[];
  answers: Record<string, { answer: boolean | null; observation: string }>;
  onAnswerChange: (questionId: string, answer: boolean | null) => void;
  onObservationChange: (questionId: string, observation: string) => void;
  readOnly?: boolean;
}

const FormSection: React.FC<FormSectionProps> = ({
  section,
  questions,
  answers,
  onAnswerChange,
  onObservationChange,
  readOnly = false
}) => {
  const sectionQuestions = questions.filter(q => q.secao_id === section.id);
  
  // Sort questions by ordem_pergunta
  const sortedQuestions = [...sectionQuestions].sort((a, b) => {
    if (!a.ordem_pergunta && !b.ordem_pergunta) return 0;
    if (!a.ordem_pergunta) return 1;
    if (!b.ordem_pergunta) return -1;
    return a.ordem_pergunta - b.ordem_pergunta;
  });

  if (sortedQuestions.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">Não há perguntas nesta seção.</p>
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{section.titulo}</CardTitle>
        {section.descricao && (
          <CardDescription>{section.descricao}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {sortedQuestions.map((question) => (
          <FormQuestion
            key={question.id}
            question={question}
            answer={answers[question.id]?.answer ?? null}
            observation={answers[question.id]?.observation ?? ""}
            onAnswerChange={(answer) => onAnswerChange(question.id, answer)}
            onObservationChange={(observation) => onObservationChange(question.id, observation)}
            readOnly={readOnly}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default FormSection;
