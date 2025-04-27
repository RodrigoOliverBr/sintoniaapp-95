
import React from "react";
import { FormResult, Question } from "@/types/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ResultsActions } from "./results/ResultsActions";
import { AnswersChart } from "./charts/AnswersChart";
import { SeverityChart } from "./charts/SeverityChart";
import { RiskIndicator } from "./results/RiskIndicator";

interface FormResultsProps {
  result: FormResult;
  questions?: Question[];
  onNotesChange: (notes: string) => void;
}

function calculateSeverityCounts(result: FormResult, questions: Question[] = []): { light: number; medium: number; high: number } {
  const counts = {
    light: 0,
    medium: 0,
    high: 0
  };

  if (!result.answers || !questions.length) return counts;

  Object.entries(result.answers).forEach(([questionId, answer]) => {
    if (answer.answer === true) {
      const question = questions.find(q => q.id === questionId);
      if (question?.risco?.severidade?.nivel) {
        switch (question.risco.severidade.nivel) {
          case "LEVEMENTE PREJUDICIAL":
            counts.light++;
            break;
          case "PREJUDICIAL":
            counts.medium++;
            break;
          case "EXTREMAMENTE PREJUDICIAL":
            counts.high++;
            break;
        }
      }
    }
  });

  return counts;
}

const FormResults: React.FC<FormResultsProps> = ({ result, questions = [], onNotesChange }) => {
  const totalYes = result.total_sim || 0;
  const totalNo = result.total_nao || 0;
  const severityCounts = calculateSeverityCounts(result, questions);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:pt-0">
      <ResultsActions onPrint={handlePrint} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Respostas</CardTitle>
          </CardHeader>
          <CardContent>
            <AnswersChart yesCount={totalYes} noCount={totalNo} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severidade</CardTitle>
          </CardHeader>
          <CardContent>
            <SeverityChart severityCounts={severityCounts} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nível de Risco</CardTitle>
        </CardHeader>
        <CardContent>
          <RiskIndicator score={calculateRiskScore(result, questions)} />
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
            value={result.notas_analista || result.analyistNotes || ''}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

function calculateRiskScore(result: FormResult, questions: Question[]): number {
  if (!result.answers || questions.length === 0) return 0;
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  Object.entries(result.answers).forEach(([questionId, answer]) => {
    if (answer.answer === true) {
      const question = questions.find(q => q.id === questionId);
      if (question?.risco?.severidade?.nivel) {
        let weight = 1;
        if (question.risco.severidade.nivel === "PREJUDICIAL") {
          weight = 2;
        } else if (question.risco.severidade.nivel === "EXTREMAMENTE PREJUDICIAL") {
          weight = 3;
        }
        weightedSum += weight;
      }
    }
  });
  
  return (weightedSum / (questions.length * 3)) * 100;
}

export default FormResults;
