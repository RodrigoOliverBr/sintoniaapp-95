
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Question, Section } from "@/types/form";
import QuestionComponent from "@/components/QuestionComponent";
import { X, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface FormAllQuestionsProps {
  sections: Section[];
  questions: Question[];
  answers: Record<string, any>;
  onAnswerChange: (questionId: string, answer: boolean | null) => void;
  onObservationChange: (questionId: string, observation: string) => void;
  onSaveAndComplete: () => void;
  onSaveAndExit: () => void;
  isSubmitting: boolean;
}

const FormAllQuestions: React.FC<FormAllQuestionsProps> = ({
  sections,
  questions,
  answers,
  onAnswerChange,
  onObservationChange,
  onSaveAndComplete,
  onSaveAndExit,
  isSubmitting
}) => {
  // Track if buttons have been clicked to prevent double submissions
  const [hasClicked, setHasClicked] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

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

  // Função para marcar todas as perguntas como "Não"
  const markAllAsNo = () => {
    console.log("Marcando todas as perguntas como NÃO");
    setMarkingAll(true);
    
    // Percorrer todas as perguntas no array questions
    questions.forEach(question => {
      // Verificar se a resposta é diferente de "false" antes de alterar
      // (para evitar chamadas desnecessárias se já estiver marcado como "Não")
      if (answers[question.id]?.answer !== false) {
        onAnswerChange(question.id, false);
      }
    });
    
    setMarkingAll(false);
    console.log("Todas as perguntas foram marcadas como NÃO");
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

  // Function to get severity class based on risk level
  const getSeverityClass = (question: Question) => {
    const severity = question.risco?.severidade?.nivel || "";
    
    if (severity.includes("EXTREMAMENTE")) {
      return "border-l-4 border-red-500";
    } else if (severity.includes("PREJUDICIAL")) {
      return "border-l-4 border-orange-500";
    } else if (severity.includes("LEVEMENTE")) {
      return "border-l-4 border-yellow-500";
    }
    
    return "";
  };

  return (
    <div className="space-y-10">
      {/* Botão "Marcar Todas como Não" */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <Button 
          onClick={markAllAsNo}
          variant="outline"
          className="flex items-center gap-2"
          disabled={markingAll}
        >
          <X size={16} /> 
          Marcar Todas como Não
        </Button>
        <span className="text-sm text-muted-foreground ml-4">
          Clique para definir todas as perguntas como "Não" de uma vez
        </span>
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
                <Card 
                  key={question.id} 
                  className={`overflow-hidden ${getSeverityClass(question)}`}
                >
                  <CardContent className="pt-6">
                    <QuestionComponent
                      question={question}
                      answer={answers[question.id]?.answer}
                      observations={answers[question.id]?.observation || ""}
                      selectedOptions={answers[question.id]?.selectedOptions || []}
                      onAnswerChange={(answer) => onAnswerChange(question.id, answer)}
                      onObservationChange={(observation) => onObservationChange(question.id, observation)}
                      onOptionsChange={() => {}}
                    />
                    {question.risco?.severidade && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Severidade: </span>
                        <span 
                          className={
                            question.risco.severidade.nivel.includes("EXTREMAMENTE") 
                              ? "text-red-600 font-semibold" 
                              : question.risco.severidade.nivel.includes("PREJUDICIAL")
                                ? "text-orange-600 font-semibold"
                                : "text-yellow-600 font-semibold"
                          }
                        >
                          {question.risco.severidade.nivel}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
      
      <div className="flex justify-between pb-8 gap-4">
        <Button 
          onClick={onSaveAndExit}
          variant="outline"
          size="lg"
          className="w-full md:w-auto"
          disabled={isSubmitting || hasClicked}
        >
          <Save className="mr-2 h-4 w-4" />
          Salvar e Sair
        </Button>

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
