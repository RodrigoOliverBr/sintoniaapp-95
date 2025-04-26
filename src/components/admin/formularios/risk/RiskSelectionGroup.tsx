
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Risk } from "@/types/form";
import SeverityBadge from "@/components/SeverityBadge";

interface RiskSelectionGroupProps {
  risks: Risk[];
  selectedRiskId: string;
  onRiskChange: (riskId: string) => void;
}

const RiskSelectionGroup: React.FC<RiskSelectionGroupProps> = ({
  risks,
  selectedRiskId,
  onRiskChange,
}) => {
  const sortedRisks = [...risks].sort((a, b) => {
    if (a.severidade && b.severidade) {
      // Usamos o operador de encadeamento opcional para acessar ordem com segurança
      return (a.severidade?.ordem ?? 0) - (b.severidade?.ordem ?? 0);
    }
    return 0;
  });

  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      <RadioGroup
        value={selectedRiskId}
        onValueChange={onRiskChange}
        className="space-y-3"
      >
        <div className="space-y-3">
          {sortedRisks.map((risk) => (
            <div key={risk.id} className="flex items-center space-x-2">
              <RadioGroupItem value={risk.id} id={risk.id} />
              <Label
                htmlFor={risk.id}
                className="flex flex-1 items-center justify-between cursor-pointer hover:bg-muted rounded-md p-2"
              >
                <span className="text-sm">{risk.texto}</span>
                {risk.severidade && <SeverityBadge severity={risk.severidade} />}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </ScrollArea>
  );
};

export default RiskSelectionGroup;
