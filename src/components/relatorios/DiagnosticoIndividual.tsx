
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormResult, Question } from "@/types/form";
import SeverityBadge from "@/components/SeverityBadge";
import { AvaliacaoResposta } from '@/types/avaliacao';

interface DiagnosticoIndividualProps {
  result: FormResult;
  questions: Question[];
  companyId?: string;
  respostas?: AvaliacaoResposta[];
}

const DiagnosticoIndividual: React.FC<DiagnosticoIndividualProps> = ({ 
  result, 
  questions,
  respostas
}) => {
  // Check if we have valid data
  const hasQuestions = Array.isArray(questions) && questions.length > 0;
  const hasAnswers = (result?.answers && Object.keys(result.answers).length > 0) || 
                    (result?.respostas && result.respostas.length > 0) ||
                    (respostas && respostas.length > 0);
  
  // Função para obter todas as respostas disponíveis, priorizando as mais recentes
  const getAllResponses = () => {
    if (respostas && respostas.length > 0) {
      return respostas;
    } else if (result?.respostas && result.respostas.length > 0) {
      return result.respostas;
    }
    return [];
  };
  
  // Agrupar por questionId as respostas "Sim"
  const getYesResponsesByQuestionId = () => {
    const allResponses = getAllResponses();
    if (allResponses.length > 0) {
      return allResponses
        .filter(resposta => resposta.resposta === true)
        .reduce((acc, resposta) => {
          acc[resposta.pergunta_id] = resposta;
          return acc;
        }, {} as Record<string, AvaliacaoResposta>);
    }
    
    // Se não temos respostas no formato antigo, usar o formato novo (answers)
    if (result?.answers) {
      const yesResponsesMap: Record<string, any> = {};
      
      Object.entries(result.answers).forEach(([questionId, answer]) => {
        if (answer.answer === true) {
          yesResponsesMap[questionId] = {
            pergunta_id: questionId,
            resposta: true,
            observacao: answer.observation || "",
            id: `temp-${questionId}`,
            avaliacao_id: result.id
          };
        }
      });
      
      return yesResponsesMap;
    }
    
    return {};
  };
  
  // Group questions by risk if both data points exist
  const questionsByRisk = hasQuestions && hasAnswers ? (() => {
    const yesResponses = getYesResponsesByQuestionId();
    const risksMap: Record<string, { risco: any, questions: Array<{question: Question, answer: any}> }> = {};
    
    // Verificar respostas positivas
    questions.forEach(question => {
      // Se esta pergunta tem uma resposta "Sim"
      if (question.id in yesResponses || 
         (result?.answers?.[question.id]?.answer === true)) {
        
        if (!question.risco_id || !question.risco) return;
        
        const riscoId = question.risco_id;
        if (!risksMap[riscoId]) {
          risksMap[riscoId] = {
            risco: question.risco,
            questions: []
          };
        }
        
        risksMap[riscoId].questions.push({
          question,
          answer: yesResponses[question.id] || result?.answers?.[question.id] || { observation: "" }
        });
      }
    });
    
    return risksMap;
  })() : {};

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
                        {(answer.observacao || answer.observation) && (
                          <p className="text-sm italic mt-1">
                            Observação: {answer.observacao || answer.observation}
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
