
import React from "react";
import { Question } from "@/types/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface FormQuestionProps {
  question: Question;
  answer: boolean | null;
  observation: string;
  onAnswerChange: (answer: boolean | null) => void;
  onObservationChange: (observation: string) => void;
  readOnly?: boolean;
}

const FormQuestion: React.FC<FormQuestionProps> = ({
  question,
  answer,
  observation,
  onAnswerChange,
  onObservationChange,
  readOnly = false
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
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-4">
          <div className="text-base font-medium">{question.texto}</div>
          {getSeverityBadge()}
        </div>
        
        <RadioGroup
          value={answer === null ? undefined : answer.toString()}
          onValueChange={(value) => onAnswerChange(value === "true")}
          disabled={readOnly}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id={`no-${question.id}`} />
            <Label htmlFor={`no-${question.id}`} className="font-normal">Não</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id={`yes-${question.id}`} />
            <Label htmlFor={`yes-${question.id}`} className="font-normal">Sim</Label>
          </div>
        </RadioGroup>
        
        {(answer === true || question.observacao_obrigatoria) && (
          <div className="space-y-2 mt-2">
            <Label htmlFor={`observation-${question.id}`}>
              Observação {question.observacao_obrigatoria && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={`observation-${question.id}`}
              placeholder="Adicione uma observação..."
              value={observation}
              onChange={(e) => onObservationChange(e.target.value)}
              disabled={readOnly}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FormQuestion;
