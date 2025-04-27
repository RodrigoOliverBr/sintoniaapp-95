
import React from "react";
import { FormResult, Question } from "@/types/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { BarChart } from "@/components/ui/BarChart";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormResultsProps {
  result: FormResult;
  questions?: Question[];
  onNotesChange: (notes: string) => void;
}

const FormResults: React.FC<FormResultsProps> = ({ result, questions = [], onNotesChange }) => {
  const { toast } = useToast();
  
  // Map database fields to component expected fields if not already set
  if (!result.totalYes) result.totalYes = result.total_sim;
  if (!result.totalNo) result.totalNo = result.total_nao;
  if (!result.analyistNotes) result.analyistNotes = result.notas_analista || '';
  
  // Calculate severity counts based on questions and answers
  if (!result.yesPerSeverity) {
    result.yesPerSeverity = {
      "LEVEMENTE PREJUDICIAL": 0,
      "PREJUDICIAL": 0,
      "EXTREMAMENTE PREJUDICIAL": 0
    };
    
    // If we have questions, calculate the severity counts
    if (questions.length > 0) {
      Object.entries(result.answers).forEach(([questionId, answer]) => {
        if (answer.answer) {
          const question = questions.find(q => q.id === questionId);
          if (question?.risco?.severidade?.nivel) {
            const severityLevel = question.risco.severidade.nivel;
            result.yesPerSeverity![severityLevel] = (result.yesPerSeverity![severityLevel] || 0) + 1;
          }
        }
      });
    }
  }
  
  // Dados para o gráfico
  const chartData = [
    {
      name: "Sim",
      total: result.totalYes || 0,
    },
    {
      name: "Não",
      total: result.totalNo || 0,
    },
  ];

  const severityChartData = [
    {
      name: "Lev. Prejud.",
      total: result.yesPerSeverity["LEVEMENTE PREJUDICIAL"] || 0,
    },
    {
      name: "Prejudicial",
      total: result.yesPerSeverity["PREJUDICIAL"] || 0,
    },
    {
      name: "Extrema. Prej.",
      total: result.yesPerSeverity["EXTREMAMENTE PREJUDICIAL"] || 0,
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    toast({
      title: "Exportação em PDF",
      description: "A funcionalidade de exportação em PDF será implementada em breve."
    });
  };

  // Calcular a pontuação de risco total
  const riskScore = calculateRiskScore(result, questions);

  return (
    <div className="space-y-6 print:pt-0">
      <div className="flex items-center justify-between print:hidden">
        <h2 className="text-2xl font-bold">Resultado da Avaliação</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="flex items-center gap-1">
            <Printer className="h-4 w-4 mr-1" />
            Imprimir
          </Button>
          <Button variant="default" onClick={handleExportPDF} className="flex items-center gap-1">
            <Download className="h-4 w-4 mr-1" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Respostas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <BarChart
                data={chartData}
                index="name"
                categories={["total"]}
                colors={["#1EAEDB"]}
                valueFormatter={(value) => `${value} resposta(s)`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-esocial-lightGray p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Sim</p>
                <p className="text-2xl font-bold text-esocial-blue">{result.totalYes || 0}</p>
              </div>
              <div className="bg-esocial-lightGray p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Não</p>
                <p className="text-2xl font-bold text-esocial-darkGray">{result.totalNo || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <BarChart
                data={severityChartData}
                index="name"
                categories={["total"]}
                colors={["#FFD700", "#FF8C00", "#FF4500"]}
                valueFormatter={(value) => `${value}`}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-6">
              <div className="bg-severity-light/10 p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Levemente Prejudicial</p>
                <p className="text-lg font-bold text-severity-light">
                  {result.yesPerSeverity["LEVEMENTE PREJUDICIAL"] || 0}
                </p>
              </div>
              <div className="bg-severity-medium/10 p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Prejudicial</p>
                <p className="text-lg font-bold text-severity-medium">
                  {result.yesPerSeverity["PREJUDICIAL"] || 0}
                </p>
              </div>
              <div className="bg-severity-high/10 p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Extremamente Prejudicial</p>
                <p className="text-lg font-bold text-severity-high">
                  {result.yesPerSeverity["EXTREMAMENTE PREJUDICIAL"] || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nível de Risco</CardTitle>
        </CardHeader>
        <CardContent>
          <RiskIndicator score={riskScore} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações e Recomendações do Analista</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Digite aqui suas observações e recomendações para melhorar o ambiente psicossocial..."
            className="min-h-[200px]"
            value={result.analyistNotes || ""}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

const RiskIndicator: React.FC<{ score: number }> = ({ score }) => {
  const getRiskLevel = () => {
    if (score < 20) return { level: "Baixo", color: "#4CAF50", width: "20%" };
    if (score < 40) return { level: "Moderado", color: "#FFC107", width: "40%" };
    if (score < 60) return { level: "Considerável", color: "#FF9800", width: "60%" };
    if (score < 80) return { level: "Alto", color: "#FF5722", width: "80%" };
    return { level: "Extremo", color: "#F44336", width: "100%" };
  };

  const risk = getRiskLevel();

  return (
    <div className="space-y-2">
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: risk.width, backgroundColor: risk.color }}
        ></div>
      </div>
      <div className="flex justify-between text-xs">
        <span>Baixo</span>
        <span>Moderado</span>
        <span>Considerável</span>
        <span>Alto</span>
        <span>Extremo</span>
      </div>
      <div className="mt-4 text-center">
        <div className="text-sm text-muted-foreground">Nível de risco</div>
        <div className="text-2xl font-bold" style={{ color: risk.color }}>
          {risk.level} ({score.toFixed(0)}%)
        </div>
      </div>
    </div>
  );
};

function calculateRiskScore(result: FormResult, questions: Question[]): number {
  if ((!result.total_sim && !result.totalYes) || questions.length === 0) return 0;
  
  // Calculate using the formula provided
  // Score = Σ(respostas Sim × peso) / (total de perguntas × 3) × 100
  
  let weightedSum = 0;
  let totalQuestions = questions.length;
  
  // Count answers by severity
  Object.entries(result.answers || {}).forEach(([questionId, answer]) => {
    if (answer.answer === true) {
      const question = questions.find(q => q.id === questionId);
      if (question?.risco?.severidade?.nivel) {
        const severityLevel = question.risco.severidade.nivel;
        let weight = 1; // Default weight
        
        if (severityLevel === "PREJUDICIAL") {
          weight = 2;
        } else if (severityLevel === "EXTREMAMENTE PREJUDICIAL") {
          weight = 3;
        }
        
        weightedSum += weight;
      }
    }
  });
  
  // Calculate the risk score as a percentage
  // (weightedSum / (totalQuestions * 3)) * 100
  return (weightedSum / (totalQuestions * 3)) * 100;
}

export default FormResults;
