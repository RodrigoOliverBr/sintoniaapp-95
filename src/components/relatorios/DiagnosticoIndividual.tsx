
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question, FormAnswer } from '@/types/form';
import { getFormResultByEmployeeId } from '@/services';
import SeverityBadge from '../SeverityBadge';
import { Skeleton } from '../ui/skeleton';

interface DiagnosticoIndividualProps {
  questions: Question[];
  employeeId?: string;
}

const DiagnosticoIndividual: React.FC<DiagnosticoIndividualProps> = ({
  questions,
  employeeId
}) => {
  const [answers, setAnswers] = useState<Record<string, FormAnswer>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEmployeeAnswers = async () => {
      if (!employeeId) return;
      
      setLoading(true);
      try {
        const result = await getFormResultByEmployeeId(employeeId);
        if (result && result.answers) {
          setAnswers(result.answers);
        } else {
          setAnswers({});
        }
      } catch (error) {
        console.error("Erro ao carregar respostas:", error);
        setAnswers({});
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeAnswers();
  }, [employeeId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico Individual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnóstico Individual</CardTitle>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma pergunta disponível para diagnóstico.</p>
        ) : (
          <div className="space-y-6">
            {questions.map((question) => {
              const answer = answers[question.id];
              const hasAnswer = !!answer;
              
              return (
                <div key={question.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-medium">{question.texto}</h3>
                      {question.risco?.severidade && (
                        <div className="mt-1">
                          <SeverityBadge severity={question.risco.severidade} />
                        </div>
                      )}
                    </div>
                    
                    <div className="min-w-[80px] text-right">
                      {hasAnswer ? (
                        <span className={`font-medium ${answer.answer ? 'text-red-500' : 'text-green-500'}`}>
                          {answer.answer ? 'Sim' : 'Não'}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">Não respondido</span>
                      )}
                    </div>
                  </div>
                  
                  {hasAnswer && answer.answer && (
                    <div className="mt-3 pl-4 border-l-2 border-muted">
                      {answer.selectedOptions && answer.selectedOptions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Situações selecionadas:</p>
                          <ul className="list-disc pl-5 text-sm text-muted-foreground">
                            {answer.selectedOptions.map((option, idx) => {
                              const optionLabel = question.opcoes?.find(o => o.value === option)?.label || option;
                              return <li key={idx}>{optionLabel}</li>;
                            })}
                          </ul>
                        </div>
                      )}
                      
                      {answer.observation && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Observação:</p>
                          <p className="text-sm text-muted-foreground">{answer.observation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticoIndividual;
