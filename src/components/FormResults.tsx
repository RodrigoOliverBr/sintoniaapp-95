
import React from "react";
import { FormResult, Question } from "@/types/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ResultsActions } from "./results/ResultsActions";
import { AnswersChart } from "./charts/AnswersChart";
import { SeverityChart } from "./charts/SeverityChart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface FormResultsProps {
  result: FormResult;
  questions?: Question[];
  onNotesChange: (notes: string) => void;
  isReadOnly?: boolean;
}

const FormResults: React.FC<FormResultsProps> = ({ result, questions = [], onNotesChange, isReadOnly = false }) => {
  // Make sure we're using the actual values from the result, not the default ones
  const totalYes = result.total_sim || 0;
  const totalNo = result.total_nao || 0;

  const handlePrint = () => {
    window.print();
  };

  // Calculate the actual yes/no counts from the answers object
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

  // Get the actual counts from the answers
  const actualCounts = calculateActualCounts();

  // Get the notes from either field (notas_analista or analyistNotes)
  const notes = result.notas_analista || result.analyistNotes || '';

  // Get questions that were answered with "Yes"
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
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data desconhecida";
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm");
  };

  return (
    <div className="space-y-6 print:pt-0">
      <ResultsActions onPrint={handlePrint} />

      {isReadOnly && (
        <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você está visualizando os resultados em modo somente leitura. Para fazer alterações, use o botão "Editar" ou clique em "Sair" para retornar ao formulário.
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
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded text-center">
                <div className="text-lg font-medium text-blue-500">Sim</div>
                <div className="text-3xl font-bold text-blue-700">{actualCounts.yes}</div>
              </div>
              <div className="bg-gray-100 p-4 rounded text-center">
                <div className="text-lg font-medium text-gray-500">Não</div>
                <div className="text-3xl font-bold text-gray-700">{actualCounts.no}</div>
              </div>
            </div>
          </CardContent>
        </Card>

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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Observações e Recomendações do Analista</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Digite aqui suas observações e recomendações para melhorar o ambiente psicossocial..."
            className="min-h-[200px]"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            readOnly={isReadOnly}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FormResults;
