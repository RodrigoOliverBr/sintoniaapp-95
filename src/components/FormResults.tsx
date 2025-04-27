
import React from "react";
import { FormResult, Question } from "@/types/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ResultsActions } from "./results/ResultsActions";
import { ResultsStatisticsChart } from "./results/ResultsStatisticsChart";
import { ResultsSeverityChart } from "./results/ResultsSeverityChart";
import { RiskIndicator } from "./results/RiskIndicator";

interface FormResultsProps {
  result: FormResult;
  questions?: Question[];
  onNotesChange: (notes: string) => void;
}

function calculateRiskScore(result: FormResult, questions: Question[]): number {
  if (!result.answers || questions.length === 0) return 0;
  
  let weightedSum = 0;
  let totalQuestions = questions.length;
  
  Object.entries(result.answers).forEach(([questionId, answer]) => {
    if (answer.answer === true) {
      const question = questions.find(q => q.id === questionId);
      if (question?.risco?.severidade?.nivel) {
        const severityLevel = question.risco.severidade.nivel;
        let weight = 1;
        
        if (severityLevel === "PREJUDICIAL") {
          weight = 2;
        } else if (severityLevel === "EXTREMAMENTE PREJUDICIAL") {
          weight = 3;
        }
        
        weightedSum += weight;
      }
    }
  });
  
  return (weightedSum / (totalQuestions * 3)) * 100;
}

const FormResults: React.FC<FormResultsProps> = ({ result, questions = [], onNotesChange }) => {
  const processedResult = {
    totalYes: result.total_sim || result.totalYes || 0,
    totalNo: result.total_nao || result.totalNo || 0,
    analyistNotes: result.notas_analista || result.analyistNotes || '',
  };
  
  const severityCounts = {
    "LEVEMENTE PREJUDICIAL": 0,
    "PREJUDICIAL": 0,
    "EXTREMAMENTE PREJUDICIAL": 0
  };
  
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
  
  const handlePrint = () => {
    window.print();
  };

  const riskScore = calculateRiskScore(result, questions);

  return (
    <div className="space-y-6 print:pt-0">
      <ResultsActions onPrint={handlePrint} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Respostas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultsStatisticsChart
              totalYes={processedResult.totalYes}
              totalNo={processedResult.totalNo}
            />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-esocial-lightGray p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Sim</p>
                <p className="text-2xl font-bold text-esocial-blue">
                  {processedResult.totalYes}
                </p>
              </div>
              <div className="bg-esocial-lightGray p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Não</p>
                <p className="text-2xl font-bold text-esocial-darkGray">
                  {processedResult.totalNo}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severidade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultsSeverityChart severityCounts={severityCounts} />
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

export default FormResults;
