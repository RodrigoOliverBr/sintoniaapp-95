
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormResult as FormResultType, Question } from "@/types/form"; 
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { updateAnalystNotes } from "@/services/form/formService";

interface FormResultProps {
  result: FormResultType;
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
  const [notes, setNotes] = useState(result.notas_analista || "");
  const [isSaving, setIsSaving] = useState(false);

  const getQuestionById = (id: string) => {
    return questions.find(q => q.id === id);
  };

  const handleSaveNotes = async () => {
    if (!result.id) return;

    try {
      setIsSaving(true);
      await updateAnalystNotes(result.id, notes);
      toast.success("Notas salvas com sucesso!");
      
      // Call the parent handler if provided
      if (onNotesChange) {
        onNotesChange(notes);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Erro ao salvar as notas");
    } finally {
      setIsSaving(false);
    }
  };

  // Count severities
  const countSeverities = () => {
    const counts = {
      extremamente: 0,
      prejudicial: 0,
      levemente: 0
    };

    // If there are respostas in the result
    if (result.respostas) {
      result.respostas.forEach(resposta => {
        if (resposta.resposta === true) {
          const question = getQuestionById(resposta.pergunta_id);
          if (question?.risco?.severidade?.nivel) {
            const nivel = question.risco.severidade.nivel;
            if (nivel.includes('EXTREMAMENTE')) {
              counts.extremamente++;
            } else if (nivel.includes('PREJUDICIAL')) {
              counts.prejudicial++;
            } else if (nivel.includes('LEVEMENTE')) {
              counts.levemente++;
            }
          }
        }
      });
    }

    return counts;
  };

  const severityCounts = countSeverities();
  const hasResponses = result.respostas && result.respostas.length > 0;
  const totalYes = result.total_sim || 0;
  const totalNo = result.total_nao || 0;
  const totalQuestions = totalYes + totalNo;
  const percentYes = totalQuestions > 0 ? (totalYes / totalQuestions) * 100 : 0;

  // Get responses that have "yes" answers
  const yesResponses = hasResponses 
    ? result.respostas!.filter(r => r.resposta === true) 
    : [];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Resumo da Avaliação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-md">
              <div className="text-sm text-gray-500 mb-1">Total de Respostas</div>
              <div className="text-2xl font-bold">{totalQuestions}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-md">
              <div className="text-sm text-gray-500 mb-1">Respostas "Sim"</div>
              <div className="text-2xl font-bold text-green-600">{totalYes}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-md">
              <div className="text-sm text-gray-500 mb-1">Respostas "Não"</div>
              <div className="text-2xl font-bold text-red-600">{totalNo}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm font-medium mb-2">Distribuição de Respostas</div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-500 h-4 rounded-full" 
                style={{ width: `${percentYes}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>{percentYes.toFixed(1)}% Sim</span>
              <span>{(100 - percentYes).toFixed(1)}% Não</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-medium">Respostas "Sim" por Nível de Severidade</div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-red-200 bg-red-50 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Extremamente Prejudicial</div>
                  <Badge variant="destructive" className="ml-2">{severityCounts.extremamente}</Badge>
                </div>
              </div>
              
              <div className="border border-orange-200 bg-orange-50 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Prejudicial</div>
                  <Badge className="ml-2 bg-orange-500">{severityCounts.prejudicial}</Badge>
                </div>
              </div>
              
              <div className="border border-yellow-200 bg-yellow-50 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Levemente Prejudicial</div>
                  <Badge className="ml-2 bg-yellow-500">{severityCounts.levemente}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Notas do Analista</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione suas observações e análises aqui..."
            className="min-h-[150px]"
            disabled={isReadOnly || isSaving}
          />
          {!isReadOnly && (
            <Button 
              onClick={handleSaveNotes} 
              className="mt-4"
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar Notas"}
            </Button>
          )}
        </CardContent>
      </Card>

      {yesResponses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Respostas "Sim" Detalhadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {yesResponses.map((resposta) => {
                const question = getQuestionById(resposta.pergunta_id);
                if (!question) return null;
                
                const severity = question.risco?.severidade?.nivel;
                let severityIcon = <AlertCircle className="text-yellow-500" />;
                let severityClass = "bg-yellow-50 border-yellow-200";
                
                if (severity?.includes('EXTREMAMENTE')) {
                  severityIcon = <AlertCircle className="text-red-500" />;
                  severityClass = "bg-red-50 border-red-200";
                } else if (severity?.includes('PREJUDICIAL')) {
                  severityIcon = <AlertCircle className="text-orange-500" />;
                  severityClass = "bg-orange-50 border-orange-200";
                }
                
                return (
                  <div key={resposta.id} className={`border p-4 rounded-md ${severityClass}`}>
                    <div className="flex gap-2 items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{question.texto}</div>
                        
                        <div className="flex items-center mt-2 text-sm">
                          {severityIcon}
                          <span className="ml-1">{severity}</span>
                        </div>
                        
                        {resposta.observacao && (
                          <div className="mt-2 text-sm bg-white p-2 rounded border">
                            <span className="font-medium">Observação: </span>
                            {resposta.observacao}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FormResult;
