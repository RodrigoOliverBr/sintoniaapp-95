
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
    const grouped: Record<string, { questions: Question[], yesCount: number }> = {};
    
    questions.forEach(question => {
      const severity = question.risco?.severidade?.nivel || "Desconhecida";
      
      if (!grouped[severity]) {
        grouped[severity] = { questions: [], yesCount: 0 };
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
              <span className="text-sm text-muted-foreground">Estado</span>
              <span className="text-lg font-semibold">{result.is_complete ? "Completo" : "Em andamento"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Concluído</span>
              <span className="text-lg font-semibold">{completionDate}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Riscos por Severidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(questionsBySeverity).map(([severity, data]) => (
                <Card key={severity}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col">
                      <h4 className="font-semibold">{severity}</h4>
                      <div className="mt-2 text-sm">
                        <div className="flex justify-between">
                          <span>Perguntas:</span>
                          <span>{data.questions.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Riscos identificados:</span>
                          <span>{data.yesCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Percentual:</span>
                          <span>
                            {data.questions.length > 0 
                              ? `${Math.round((data.yesCount / data.questions.length) * 100)}%` 
                              : "0%"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas do Analista</Label>
            <Textarea
              id="notes"
              value={result.notas_analista || ""}
              onChange={(e) => onNotesChange && onNotesChange(e.target.value)}
              placeholder="Adicione observações sobre esta avaliação"
              className="min-h-[200px]"
              readOnly={isReadOnly}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormResult;
