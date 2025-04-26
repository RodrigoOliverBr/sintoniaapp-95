
import React from 'react';
import { Mitigation } from '@/types/form';
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface MitigationsListProps {
  mitigations: Mitigation[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, text: string) => void;
}

const MitigationsList: React.FC<MitigationsListProps> = ({
  mitigations,
  onAdd,
  onRemove,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Ações de Mitigação</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Mitigação
        </Button>
      </div>
      
      {mitigations.map((mitigation, index) => (
        <div key={index} className="flex gap-2">
          <Textarea
            value={mitigation.texto}
            onChange={(e) => onChange(index, e.target.value)}
            placeholder="Digite a ação de mitigação..."
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default MitigationsList;
