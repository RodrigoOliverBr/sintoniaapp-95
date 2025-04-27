
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
  
  // Ensure all required fields exist in the result object
  const processedResult = {
    totalYes: result.total_sim || result.totalYes || 0,
    totalNo: result.total_nao || result.totalNo || 0,
    analyistNotes: result.notas_analista || result.analyistNotes || '',
  };
  
  // Calculate severity counts based on questions and answers
  const severityCounts = {
    "LEVEMENTE PREJUDICIAL": 0,
    "PREJUDICIAL": 0,
    "EXTREMAMENTE PREJUDICIAL": 0
  };
  
  // Calculate the counts from actual answers
  if (questions.length > 0 && result.answers) {
    Object.entries(result.answers).forEach(([questionId, answer]) => {
      if (answer.answer === true) {
        const question = questions.find(q => q.id === questionId);
        if (question?.risco?.severidade?.nivel) {
          const severityLevel = question.risco.severidade.nivel;
          severityCounts[severityLevel] = (severityCounts[severityLevel] || 0) + 1;
        }
      }
    });
  }
  
  // Update the result with calculated severity counts
  result.yesPerSeverity = severityCounts;
  
  // Dados para o gráfico de respostas - simplificados para evitar duplicações
  const chartData = [
    {
      name: "Sim",
      total: processedResult.totalYes,
    },
    {
      name: "Não",
      total: processedResult.totalNo,
    },
  ];

  // Dados para o gráfico de severidade - simplificados para evitar duplicações
  const severityChartData = [
    {
      name: "Lev. Prejud.",
      total: severityCounts["LEVEMENTE PREJUDICIAL"] || 0,
    },
    {
      name: "Prejudicial",
      total: severityCounts["PREJUDICIAL"] || 0,
    },
    {
      name: "Extrema. Prej.",
      total: severityCounts["EXTREMAMENTE PREJUDICIAL"] || 0,
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
                <p className="text-2xl font-bold text-esocial-blue">{processedResult.totalYes}</p>
              </div>
              <div className="bg-esocial-lightGray p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Não</p>
                <p className="text-2xl font-bold text-esocial-darkGray">{processedResult.totalNo}</p>
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
                  {severityCounts["LEVEMENTE PREJUDICIAL"]}
                </p>
              </div>
              <div className="bg-severity-medium/10 p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Prejudicial</p>
                <p className="text-lg font-bold text-severity-medium">
                  {severityCounts["PREJUDICIAL"]}
                </p>
              </div>
              <div className="bg-severity-high/10 p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Extremamente Prejudicial</p>
                <p className="text-lg font-bold text-severity-high">
                  {severityCounts["EXTREMAMENTE PREJUDICIAL"]}
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
            value={processedResult.analyistNotes}
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
  if (!result.answers || questions.length === 0) return 0;
  
  // Calculate using the formula: 
  // Score = Σ(respostas Sim × peso) / (total de perguntas × 3) × 100
  
  let weightedSum = 0;
  let totalQuestions = questions.length;
  
  // Calculate weighted sum from actual answers
  Object.entries(result.answers).forEach(([questionId, answer]) => {
    if (answer.answer === true) {
      const question = questions.find(q => q.id === questionId);
      if (question?.risco?.severidade?.nivel) {
        const severityLevel = question.risco.severidade.nivel;
        let weight = 1; // Default weight for LEVEMENTE PREJUDICIAL
        
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
  return (weightedSum / (totalQuestions * 3)) * 100;
}

export default FormResults;
