
import React, { useEffect, useState, useCallback } from "react";
import { FormResult, Question } from "@/types/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ResultsActions } from "./results/ResultsActions";
import { AnswersChart } from "./charts/AnswersChart";
import { SeverityChart } from "./charts/SeverityChart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { updateAnalystNotes } from "@/services/form/evaluations";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface FormResultsProps {
  result: FormResult;
  questions?: Question[];
  onNotesChange: (notes: string) => void;
  isReadOnly?: boolean;
}

const FormResults: React.FC<FormResultsProps> = ({ result, questions = [], onNotesChange, isReadOnly = false }) => {
  const [severityCounts, setSeverityCounts] = useState({
    light: 0,
    medium: 0,
    high: 0
  });
  
  const navigate = useNavigate();
  const [notes, setNotes] = useState(result.notas_analista || result.analyistNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setNotes(result.notas_analista || result.analyistNotes || '');
  }, [result]);

  const saveNotes = async (value: string) => {
    if (!result.id || isReadOnly) return false;
    
    try {
      setIsSaving(true);
      await updateAnalystNotes(result.id, value);
      onNotesChange(value);
      return true;
    } catch (error) {
      console.error("Error saving notes:", error);
      sonnerToast.error("Não foi possível salvar as observações.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const debouncedSave = useCallback(async (value: string) => {
    if (!result.id || isReadOnly) return;
    await saveNotes(value);
  }, [result.id, onNotesChange, isReadOnly]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setNotes(newValue);
    
    onNotesChange(newValue);
    
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    if (!isReadOnly) {
      const timeout = setTimeout(() => {
        debouncedSave(newValue);
      }, 2000);
      setSaveTimeout(timeout);
    }
  };

  const handleBlur = async () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      setSaveTimeout(null);
    }
    
    if (!isReadOnly && result.id) {
      await debouncedSave(notes);
    }
  };

  // Handle return to home with saving
  const handleReturnToHome = async () => {
    // Save notes before navigating
    if (!isReadOnly && result.id) {
      setIsSaving(true);
      try {
        const success = await saveNotes(notes);
        if (success) {
          sonnerToast.success("Observações salvas com sucesso!");
        }
      } catch (error) {
        console.error("Error saving notes:", error);
      } finally {
        setIsSaving(false);
        // Navigate regardless of save success to ensure user can exit
        navigate("/");
      }
    } else {
      // If read-only, just navigate
      navigate("/");
    }
  };

  const calculateActualCounts = () => {
    let yes = 0;
    let no = 0;

    if (result.answers) {
      Object.values(result.answers).forEach(answer => {
        if (answer.answer === true) yes++;
        if (answer.answer === false) no++;
      });
    }
    
    return { yes, no };
  };

  const actualCounts = calculateActualCounts();

  const getYesQuestions = () => {
    if (!result.answers || !questions.length) return [];
    
    const yesQuestions: Question[] = [];
    
    Object.entries(result.answers).forEach(([questionId, answer]) => {
      if (answer.answer === true) {
        const question = questions.find(q => q.id === questionId);
        if (question) {
          yesQuestions.push(question);
        }
      }
    });
    
    return yesQuestions;
  };
  
  const yesQuestions = getYesQuestions();
  
  useEffect(() => {
    const counts = {
      light: 0,
      medium: 0,
      high: 0
    };
    
    if (questions && result.answers) {
      yesQuestions.forEach(question => {
        if (question.risco?.severidade?.nivel) {
          const level = question.risco.severidade.nivel;
          if (level === "LEVEMENTE PREJUDICIAL") {
            counts.light += 1;
          } else if (level === "PREJUDICIAL") {
            counts.medium += 1;
          } else if (level === "EXTREMAMENTE PREJUDICIAL") {
            counts.high += 1;
          }
        }
      });
    }
    
    setSeverityCounts(counts);
  }, [questions, result.answers, yesQuestions]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data desconhecida";
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Data inválida";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:pt-0">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="outline" 
          onClick={handleReturnToHome}
          className="flex items-center gap-2"
          disabled={isSaving}
        >
          <ArrowLeft size={16} />
          {isSaving ? "Salvando..." : "Voltar para Início"}
        </Button>
        <ResultsActions onPrint={handlePrint} />
      </div>

      {isReadOnly && (
        <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você está visualizando os resultados em modo somente leitura. Para fazer alterações, use o botão "Editar" ou clique em "Voltar para Início".
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Informações da Avaliação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de criação</p>
              <p>{formatDate(result.created_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Última atualização</p>
              <p>{formatDate(result.last_updated || result.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo das Respostas</CardTitle>
          </CardHeader>
          <CardContent>
            <AnswersChart yesCount={actualCounts.yes} noCount={actualCounts.no} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Níveis de Severidade</CardTitle>
          </CardHeader>
          <CardContent>
            <SeverityChart severityCounts={severityCounts} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questões com Resposta "Sim"</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[300px] overflow-y-auto">
          {yesQuestions.length > 0 ? (
            <ul className="space-y-3">
              {yesQuestions.map((question, index) => (
                <li key={question.id} className={index > 0 ? "pt-3 border-t" : ""}>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>{question.texto}</span>
                  </div>
                  {result.answers?.[question.id]?.observation && (
                    <div className="ml-7 mt-1 text-sm text-gray-600 italic">
                      Observação: {result.answers[question.id].observation}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma questão foi respondida com "Sim".
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Observações e Recomendações do Analista</span>
            {isSaving && !isReadOnly && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>Salvando...</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Digite aqui suas observações e recomendações para melhorar o ambiente psicossocial..."
            className="min-h-[200px]"
            value={notes}
            onChange={handleNotesChange}
            onBlur={handleBlur}
            readOnly={isReadOnly}
          />
          {!isReadOnly && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-500">
                As observações são salvas automaticamente após você parar de digitar ou ao sair do campo.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormResults;
