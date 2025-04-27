
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ClipboardCheck } from "lucide-react";
import { FormResult } from "@/types/form";

interface EmployeeFormHistoryProps {
  evaluations: FormResult[];
  onShowResults: (evaluation: FormResult) => void;
  onNewEvaluation: () => void;
}

const EmployeeFormHistory: React.FC<EmployeeFormHistoryProps> = ({
  evaluations,
  onShowResults,
  onNewEvaluation,
}) => {
  if (evaluations.length === 0) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Sem Avaliações</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            Este funcionário ainda não possui avaliações registradas.
          </p>
          <Button onClick={onNewEvaluation}>
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Iniciar Nova Avaliação
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getRiskLevel = (evaluation: FormResult) => {
    const score = calculateRiskScore(evaluation);
    if (score < 20) return { level: "Baixo", color: "text-green-600" };
    if (score < 40) return { level: "Moderado", color: "text-yellow-600" };
    if (score < 60) return { level: "Considerável", color: "text-orange-600" };
    if (score < 80) return { level: "Alto", color: "text-red-600" };
    return { level: "Extremo", color: "text-red-800" };
  };

  const calculateRiskScore = (evaluation: FormResult): number => {
    if (!evaluation.total_sim && !evaluation.totalYes) return 0;
    
    const totalYes = evaluation.total_sim || evaluation.totalYes || 0;
    const totalQuestions = 
      (evaluation.total_sim || 0) + (evaluation.total_nao || 0) || 
      (evaluation.totalYes || 0) + (evaluation.totalNo || 0);
    
    if (totalQuestions === 0) return 0;
    return (totalYes / totalQuestions) * 100;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Histórico de Avaliações</h3>
      <div className="grid gap-4">
        {evaluations.map((evaluation) => {
          const { level, color } = getRiskLevel(evaluation);
          return (
            <Card key={evaluation.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="font-medium">
                    Avaliação {format(new Date(evaluation.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  <p className={`${color} font-medium`}>
                    Nível de Risco: {level}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Última atualização: {format(new Date(evaluation.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <Button onClick={() => onShowResults(evaluation)} className="ml-4">
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Resultados
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="flex justify-end mt-6">
        <Button onClick={onNewEvaluation} variant="outline">
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Nova Avaliação
        </Button>
      </div>
    </div>
  );
};

export default EmployeeFormHistory;
