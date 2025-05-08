
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormResult, Question } from "@/types/form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FormResultProps {
  result: FormResult;
  questions: Question[];
  onNotesChange?: (notes: string) => void;
  isReadOnly?: boolean;
}

const FormResult: React.FC<FormResultProps> = ({
  result,
  questions,
  onNotesChange,
  isReadOnly = false
}) => {
  // Group questions by severity
  const questionsBySeverity = React.useMemo(() => {
    const grouped: Record<string, { 
      questions: Question[], 
      yesCount: number, 
      color: string,
      textColor: string
    }> = {
      "EXTREMAMENTE PREJUDICIAL": { 
        questions: [], 
        yesCount: 0, 
        color: "bg-red-100", 
        textColor: "text-red-700" 
      },
      "PREJUDICIAL": { 
        questions: [], 
        yesCount: 0, 
        color: "bg-orange-100", 
        textColor: "text-orange-700"
      },
      "LEVEMENTE PREJUDICIAL": { 
        questions: [], 
        yesCount: 0, 
        color: "bg-yellow-100", 
        textColor: "text-yellow-700"
      },
      "Desconhecida": { 
        questions: [], 
        yesCount: 0, 
        color: "bg-gray-100", 
        textColor: "text-gray-700"
      }
    };
    
    questions.forEach(question => {
      const severity = question.risco?.severidade?.nivel || "Desconhecida";
      
      if (!grouped[severity]) {
        grouped[severity] = { 
          questions: [], 
          yesCount: 0, 
          color: "bg-gray-100", 
          textColor: "text-gray-700"
        };
      }
      
      grouped[severity].questions.push(question);
      
      // Count 'yes' answers for this severity
      if (result.respostas) {
        const answer = result.respostas.find(r => r.pergunta_id === question.id);
        if (answer && answer.resposta === true) {
          grouped[severity].yesCount += 1;
        }
      }
    });
    
    return grouped;
  }, [questions, result]);

  // Calculate completion date
  const completionDate = result.last_updated ? (
    formatDistanceToNow(parseISO(result.last_updated), { 
      addSuffix: true,
      locale: ptBR 
    })
  ) : "Desconhecida";

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onNotesChange) {
      onNotesChange(e.target.value);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resultado da Avaliação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total SIM</span>
              <span className="text-lg font-semibold">{result.total_sim}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total NÃO</span>
              <span className="text-lg font-semibold">{result.total_nao}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="text-lg font-semibold">
                {result.is_complete ? "Completa" : "Em andamento"}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Atualizada</span>
              <span className="text-lg font-semibold">{completionDate}</span>
            </div>
          </div>
          
          <div className="pt-4">
            <h3 className="text-lg font-semibold mb-4">Respostas por Severidade</h3>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              {Object.entries(questionsBySeverity)
                .filter(([severity]) => severity !== "Desconhecida")
                .sort(([sevA], [sevB]) => {
                  if (sevA === "EXTREMAMENTE PREJUDICIAL") return -1;
                  if (sevB === "EXTREMAMENTE PREJUDICIAL") return 1;
                  if (sevA === "PREJUDICIAL") return -1;
                  if (sevB === "PREJUDICIAL") return 1;
                  return 0;
                })
                .map(([severity, data]) => (
                <div key={severity} className={`p-4 rounded-lg ${data.color}`}>
                  <div className={`text-sm font-medium mb-1 ${data.textColor}`}>
                    {severity}
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-2xl font-bold">
                      {data.yesCount}/{data.questions.length}
                    </div>
                    <div className="text-sm font-medium">
                      {((data.yesCount / data.questions.length) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            <h3 className="text-lg font-semibold mb-4">Observações do Analista</h3>
            <Textarea 
              value={result.notas_analista || ""} 
              onChange={handleNotesChange}
              placeholder="Adicione observações sobre a avaliação aqui..."
              readOnly={isReadOnly}
              className="min-h-[150px]"
            />
          </div>
          
          <div className="pt-4">
            <h3 className="text-lg font-semibold mb-4">Detalhes das Respostas</h3>
            {Object.entries(questionsBySeverity)
              .filter(([severity, data]) => data.questions.length > 0)
              .map(([severity, data]) => (
                <div key={severity} className="mb-6">
                  <h4 className={`font-semibold mb-2 ${data.textColor}`}>
                    {severity}
                  </h4>
                  <div className="space-y-3">
                    {data.questions.map(question => {
                      const response = result.respostas?.find(r => r.pergunta_id === question.id);
                      return (
                        <div key={question.id} className="border-b pb-3">
                          <div className="flex justify-between">
                            <span>{question.texto}</span>
                            <span className={
                              response?.resposta === true 
                                ? "font-medium text-green-600" 
                                : "font-medium text-gray-600"
                            }>
                              {response?.resposta === true ? "SIM" : "NÃO"}
                            </span>
                          </div>
                          {response?.observacao && (
                            <div className="mt-1 text-sm text-gray-600">
                              <span className="font-medium">Observação: </span>
                              {response.observacao}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormResult;
