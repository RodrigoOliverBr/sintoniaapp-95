
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Question, FormAnswer, Section } from "@/types/form";
import QuestionComponent from "@/components/QuestionComponent";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, Save } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || "");

  // Calculate completion progress
  const totalQuestions = questions.length;
  const answeredQuestions = Object.values(answers).filter(a => a.answer !== null).length;
  const completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  // Group questions by section
  const questionsBySection = sections.reduce((acc, section) => {
    acc[section.id] = {
      ...section,
      questions: questions.filter(q => q.secao_id === section.id)
        .sort((a, b) => (a.ordem_pergunta || 0) - (b.ordem_pergunta || 0))
    };
    return acc;
  }, {} as Record<string, Section & { questions: Question[] }>);

  // Order sections by their ordem
  const orderedSections = [...sections].sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="space-y-8">
      <div className="bg-white p-4 rounded-md shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Progresso da Avaliação</h3>
          <span className="text-sm font-medium">{completionPercentage}% completo</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {orderedSections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "outline"}
            onClick={() => setActiveSection(section.id)}
            className="text-sm"
          >
            {section.titulo}
            {questionsBySection[section.id]?.questions?.every(q => answers[q.id]?.answer !== null) && (
              <Check className="ml-2 h-4 w-4 text-green-500" />
            )}
          </Button>
        ))}
      </div>

      {orderedSections.map((section) => (
        <div 
          key={section.id} 
          className={`space-y-6 ${activeSection === section.id ? "block" : "hidden"}`}
        >
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-primary">{section.titulo}</h2>
            {section.descricao && (
              <p className="text-muted-foreground">{section.descricao}</p>
            )}
          </div>
          
          <div className="space-y-4">
            {questionsBySection[section.id]?.questions?.map((question) => (
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

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => {
                const currentIndex = orderedSections.findIndex(s => s.id === activeSection);
                if (currentIndex > 0) {
                  setActiveSection(orderedSections[currentIndex - 1].id);
                }
              }}
              disabled={orderedSections.findIndex(s => s.id === activeSection) === 0}
            >
              Seção Anterior
            </Button>
            
            <Button
              onClick={() => {
                const currentIndex = orderedSections.findIndex(s => s.id === activeSection);
                if (currentIndex < orderedSections.length - 1) {
                  setActiveSection(orderedSections[currentIndex + 1].id);
                }
              }}
              disabled={orderedSections.findIndex(s => s.id === activeSection) === orderedSections.length - 1}
            >
              Próxima Seção
            </Button>
          </div>
          
          <Separator />
        </div>
      ))}
      
      <div className="sticky bottom-0 flex justify-end p-6 bg-white border-t shadow-md">
        <Button
          onClick={onSaveAndComplete}
          className="bg-primary hover:bg-primary/90"
          disabled={isSubmitting || totalQuestions !== answeredQuestions}
        >
          {isSubmitting ? (
            "Salvando..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Concluir e Salvar Avaliação
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FormAllQuestions;
