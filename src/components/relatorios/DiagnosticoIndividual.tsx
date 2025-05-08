
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormResult, Question } from "@/types/form";
import SeverityBadge from "@/components/SeverityBadge";

interface DiagnosticoIndividualProps {
  result: FormResult;
  questions: Question[];
  companyId?: string;
}

const DiagnosticoIndividual: React.FC<DiagnosticoIndividualProps> = ({ 
  result, 
  questions 
}) => {
  // Check if we have valid data
  const hasQuestions = Array.isArray(questions) && questions.length > 0;
  const hasAnswers = result?.answers && Object.keys(result.answers).length > 0;
  
  // Group questions by risk if both data points exist
  const questionsByRisk = hasQuestions && hasAnswers ? Object.entries(result.answers)
    .filter(([_, answer]) => answer.answer === true) // Only show "Yes" answers
    .reduce((acc, [questionId, answer]) => {
      // Find the question details
      const question = questions.find(q => q.id === questionId);
      
      if (!question || !question.risco) return acc;

      const riscoId = question.risco.id;
      if (!acc[riscoId]) {
        acc[riscoId] = {
          risco: question.risco,
          questions: []
        };
      }
      
      acc[riscoId].questions.push({
        question,
        answer
      });
      
      return acc;
    }, {} as Record<string, { risco: any, questions: Array<{question: Question, answer: any}> }>) : {};

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Diagnóstico Individual por Risco</CardTitle>
      </CardHeader>
      <CardContent className="pl-2 pb-4">
        {hasQuestions && hasAnswers ? (
          <ScrollArea className="h-[500px] w-full pr-2">
            <div className="space-y-4">
              {Object.entries(questionsByRisk).map(([riscoId, { risco, questions }]) => (
                <div key={riscoId} className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{risco.texto}</h3>
                    {risco.severidade && <SeverityBadge severity={risco.severidade} />}
                  </div>
                  <ul className="list-disc pl-5 space-y-2">
                    {questions.map(({ question, answer }) => (
                      <li key={question.id}>
                        <p className="font-medium">{question.texto}</p>
                        {answer.observation && (
                          <p className="text-sm italic mt-1">
                            Observação: {answer.observation}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              
              {Object.keys(questionsByRisk).length === 0 && (
                <div className="text-center p-8 text-gray-500">
                  Nenhuma resposta "Sim" encontrada para exibir riscos.
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center p-8 text-gray-500">
            {!hasQuestions 
              ? "Nenhuma pergunta disponível." 
              : !hasAnswers 
                ? "Nenhuma resposta disponível." 
                : "Dados insuficientes para gerar o diagnóstico."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticoIndividual;
