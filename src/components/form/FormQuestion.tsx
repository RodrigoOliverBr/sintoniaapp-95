
import React from "react";
import { Question, Mitigation } from "@/types/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getMitigationsByRiskId } from "@/services/form/formService";

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
  const [isOpen, setIsOpen] = React.useState(false);
  const [mitigations, setMitigations] = React.useState<Mitigation[]>([]);

  React.useEffect(() => {
    if (question.risco_id && answer === true) {
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
  }, [question.risco_id, answer]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-700 mb-2">
                Risco: {question.risco?.texto}
              </div>
              <h3 className="text-base font-medium mb-2">{question.texto}</h3>
              <div className="mb-4">
                {question.risco?.severidade && (
                  <SeverityBadge nivel={question.risco.severidade.nivel} />
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <RadioGroup
                value={answer === null ? undefined : answer.toString()}
                onValueChange={(value) => {
                  if (!readOnly) {
                    onAnswerChange(value === "true" ? true : value === "false" ? false : null);
                  }
                }}
                className="flex space-x-4"
                disabled={readOnly}
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

          {answer === true && mitigations.length > 0 && (
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

          {(question.observacao_obrigatoria || observation) && (
            <div className="mt-4 border-t pt-4">
              <Label htmlFor={`observation-${question.id}`} className="mb-2 block text-sm font-medium">
                Observações {question.observacao_obrigatoria && answer === true ? "(obrigatório)" : ""}
              </Label>
              <Textarea
                id={`observation-${question.id}`}
                placeholder="Digite observações adicionais aqui..."
                value={observation}
                onChange={(e) => {
                  if (!readOnly) {
                    onObservationChange(e.target.value);
                  }
                }}
                className="min-h-[80px] w-full"
                readOnly={readOnly}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper component to display severity badges
const SeverityBadge: React.FC<{ nivel: string }> = ({ nivel }) => {
  let variant: "default" | "destructive" | "outline" | "secondary" = "default";
  
  switch (nivel) {
    case "LEVEMENTE PREJUDICIAL":
      variant = "secondary";
      break;
    case "PREJUDICIAL":
      variant = "default";
      break;
    case "EXTREMAMENTE PREJUDICIAL":
      variant = "destructive";
      break;
    default:
      variant = "outline";
  }
  
  return <Badge variant={variant}>{nivel}</Badge>;
};

export default FormQuestion;
