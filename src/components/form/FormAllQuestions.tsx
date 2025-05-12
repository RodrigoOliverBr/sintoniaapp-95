
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Question } from "@/types/form";
import QuestionComponent from "@/components/QuestionComponent";
import { XCircle } from "lucide-react";

interface FormAllQuestionsProps {
  sections: any[];
  questions: Question[];
  answers: Record<string, any>;
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
  // Track if the button has been clicked to prevent double submissions
  const [hasClicked, setHasClicked] = useState(false);

  const handleSaveClick = () => {
    // Set button as clicked to prevent double submissions
    setHasClicked(true);
    
    // Call the actual save function
    onSaveAndComplete();
    
    // Reset the button after a short delay (for cases where the submission fails)
    setTimeout(() => {
      setHasClicked(false);
    }, 3000);
  };

  // Get questions for each section
  const getQuestionsForSection = (sectionId: string) => {
    return questions.filter(q => q.secao_id === sectionId);
  };

  // Sort sections by ordem field
  const sortedSections = [...sections].sort((a, b) => {
    // Handle cases where orden might be 0 or undefined
    if (!a.ordem && !b.ordem) return 0;
    if (!a.ordem) return 1;
    if (!b.ordem) return -1;
    return a.ordem - b.ordem;
  });

  // Function to mark all questions as "No"
  const handleMarkAllAsNo = () => {
    questions.forEach(question => {
      onAnswerChange(question.id, false);
    });
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          onClick={handleMarkAllAsNo}
          className="flex items-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          Marcar todas como Não
        </Button>
      </div>

      {sortedSections.map(section => {
        const sectionQuestions = getQuestionsForSection(section.id);
        
        if (sectionQuestions.length === 0) return null;
        
        return (
          <div key={section.id} className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2 text-primary">
              {section.titulo}
            </h3>
            {section.descricao && (
              <p className="text-muted-foreground mb-6">
                {section.descricao}
              </p>
            )}
            
            <div className="space-y-6">
              {sectionQuestions
                .sort((a, b) => (a.ordem_pergunta || 0) - (b.ordem_pergunta || 0))
                .map((question) => (
                <QuestionComponent
                  key={question.id}
                  question={question}
                  answer={answers[question.id]?.answer}
                  observations={answers[question.id]?.observation || ""}
                  selectedOptions={answers[question.id]?.selectedOptions || []}
                  onAnswerChange={(answer) => onAnswerChange(question.id, answer)}
                  onObservationChange={(observation) => onObservationChange(question.id, observation)}
                  onOptionsChange={(options) => onOptionsChange(question.id, options)}
                />
              ))}
            </div>
          </div>
        );
      })}
      
      <div className="flex justify-end pb-8">
        <Button 
          onClick={handleSaveClick} 
          size="lg" 
          className="w-full md:w-auto"
          disabled={isSubmitting || hasClicked}
        >
          {isSubmitting ? "Salvando..." : "Concluir Avaliação"}
        </Button>
      </div>
    </div>
  );
};

export default FormAllQuestions;
