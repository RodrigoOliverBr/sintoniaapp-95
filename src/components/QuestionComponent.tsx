
import React, { useEffect, useState } from "react";
import { Question, FormAnswer, Mitigation } from "@/types/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardContent } from "@/components/ui/card";
import SeverityBadge from "./SeverityBadge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getMitigationsByRiskId } from "@/services/form/formService";

interface QuestionComponentProps {
  question: Question;
  answer: FormAnswer | undefined;
  onChange: (questionId: string, value: boolean | null) => void;
  onObservationChange: (questionId: string, observation: string) => void;
  onOptionsChange: (questionId: string, options: string[]) => void;
}

const QuestionComponent: React.FC<QuestionComponentProps> = ({
  question,
  answer,
  onChange,
  onObservationChange,
  onOptionsChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mitigations, setMitigations] = useState<Mitigation[]>([]);

  useEffect(() => {
    if (question.risco_id && answer?.answer === true) {
      const loadMitigations = async () => {
        try {
          const mitigationData = await getMitigationsByRiskId(question.risco_id);
          setMitigations(mitigationData);
        } catch (error) {
          console.error("Error loading mitigations:", error);
        }
      };
      loadMitigations();
    }
  }, [question.risco_id, answer?.answer]);

  return (
    <CardContent className="pt-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
          <div className="flex-1">
            <div className="text-sm font-medium text-esocial-blue mb-2">
              Risco: {question.risco?.texto}
            </div>
            <h3 className="text-base font-medium mb-2">{question.texto}</h3>
            <div className="mb-4">
              {question.risco?.severidade && (
                <SeverityBadge severity={question.risco.severidade} />
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <RadioGroup
              value={answer?.answer === null ? undefined : answer?.answer?.toString()}
              onValueChange={(value) => onChange(question.id, value === "true")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`q${question.id}-sim`} />
                <Label htmlFor={`q${question.id}-sim`}>Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`q${question.id}-nao`} />
                <Label htmlFor={`q${question.id}-nao`}>Não</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {answer?.answer === true && mitigations.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="w-full"
            >
              <div className="flex items-center space-x-2 py-2">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-between"
                  >
                    <span>Ações de mitigação</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="bg-muted/50 rounded-md p-4 mt-2">
                <ul className="space-y-2 list-disc pl-4">
                  {mitigations.map((mitigation) => (
                    <li key={mitigation.id} className="text-sm">
                      {mitigation.texto}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {question.observacao_obrigatoria && answer?.answer === true && (
          <div className="mt-4 border-t pt-4">
            <Label htmlFor={`observation-${question.id}`} className="mb-2 block text-sm font-medium">
              Observações (obrigatório)
            </Label>
            <Textarea
              id={`observation-${question.id}`}
              placeholder="Digite observações adicionais aqui..."
              value={answer?.observation || ""}
              onChange={(e) => onObservationChange(question.id, e.target.value)}
              className="min-h-[80px] w-full"
            />
          </div>
        )}
      </div>
    </CardContent>
  );
};

export default QuestionComponent;
