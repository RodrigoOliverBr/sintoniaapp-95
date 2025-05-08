
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FormNavigationProps {
  currentSectionIndex: number;
  sections: any[];
  onNavigate: (index: number) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

const FormNavigation: React.FC<FormNavigationProps> = ({
  currentSectionIndex,
  sections,
  onNavigate,
  onSave,
  isSaving = false,
}) => {
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sections.length - 1;

  return (
    <div className="flex justify-between items-center">
      <Button
        variant="outline"
        onClick={() => onNavigate(currentSectionIndex - 1)}
        disabled={isFirstSection || isSaving}
        className="flex items-center gap-2"
      >
        <ChevronLeft size={16} />
        Anterior
      </Button>

      <div className="text-sm text-muted-foreground">
        Seção {currentSectionIndex + 1} de {sections.length}
      </div>

      {isLastSection && onSave ? (
        <Button
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "Salvando..." : "Concluir"}
        </Button>
      ) : (
        <Button
          onClick={() => onNavigate(currentSectionIndex + 1)}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          Próxima
          <ChevronRight size={16} />
        </Button>
      )}
    </div>
  );
};

export default FormNavigation;
