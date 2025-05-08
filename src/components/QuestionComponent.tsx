
import React from "react";
import { Question } from "@/types/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface QuestionComponentProps {
  question: Question;
  answer: boolean | null;
  observations: string;
  selectedOptions: string[];
  onAnswerChange: (answer: boolean | null) => void;
  onObservationChange: (observation: string) => void;
  onOptionsChange: (options: string[]) => void;
}

const QuestionComponent: React.FC<QuestionComponentProps> = ({
  question,
  answer,
  observations,
  onAnswerChange,
  onObservationChange,
}) => {
  // Determine badge color based on severity
  const getSeverityBadge = () => {
    if (!question.risco?.severidade) return null;
    
    const severity = question.risco.severidade.nivel;
    
    if (severity.includes("EXTREMAMENTE")) {
      return <Badge variant="destructive">{severity}</Badge>;
    } else if (severity.includes("PREJUDICIAL")) {
      return <Badge className="bg-orange-500">{severity}</Badge>;
    } else {
      return <Badge className="bg-yellow-500">{severity}</Badge>;
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-start gap-4 mb-4">
        <span className="text-lg font-medium">{question.texto}</span>
        {getSeverityBadge()}
      </div>
      
      <div className="mt-4">
        <RadioGroup
          value={answer === null ? undefined : answer.toString()}
          onValueChange={(value) => onAnswerChange(value === "true")}
          className="flex items-center space-x-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id={`no-${question.id}`} />
            <Label 
              htmlFor={`no-${question.id}`} 
              className="font-normal text-base"
            >
              Não
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id={`yes-${question.id}`} />
            <Label 
              htmlFor={`yes-${question.id}`} 
              className="font-normal text-base"
            >
              Sim
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {(answer === true || question.observacao_obrigatoria) && (
        <div className="mt-4">
          <Label htmlFor={`observation-${question.id}`} className="block mb-2">
            Observação {question.observacao_obrigatoria && <span className="text-red-500">*</span>}
          </Label>
          <Textarea 
            id={`observation-${question.id}`}
            placeholder="Adicione uma observação para esta resposta..."
            value={observations}
            onChange={(e) => onObservationChange(e.target.value)}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default QuestionComponent;
