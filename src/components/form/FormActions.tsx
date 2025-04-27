
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, ClipboardCheck } from "lucide-react";

interface FormActionsProps {
  showResults: boolean;
  formComplete: boolean;
  isSubmitting: boolean;
  isLastSection: boolean;
  showingHistory: boolean; // New prop to determine if we're showing the history view
  onNewEvaluation: () => void;
  onShowResults: () => void;
  onCompleteForm: () => void;
  onSaveForm: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({
  showResults,
  formComplete,
  isSubmitting,
  isLastSection,
  showingHistory, // New prop
  onNewEvaluation,
  onShowResults,
  onCompleteForm,
  onSaveForm,
}) => {
  return (
    <div className="flex justify-end p-6 bg-muted/40 border-t">
      {showResults ? (
        <Button 
          onClick={onNewEvaluation}
          variant="outline"
          className="w-full sm:w-auto mr-2"
        >
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Nova Avaliação
        </Button>
      ) : formComplete ? (
        <Button 
          onClick={onShowResults}
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          Verificar Resultados
        </Button>
      ) : (
        <>
          {isLastSection && !showingHistory && (
            <Button
              onClick={onCompleteForm}
              className="w-full sm:w-auto mr-2 bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              <Check className="h-4 w-4 mr-2" />
              Concluir Formulário
            </Button>
          )}
          {/* Only show Save button if we're not in history view */}
          {!showingHistory && (
            <Button 
              onClick={onSaveForm} 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Salvando..." : (isLastSection ? "Salvar" : "Salvar e Avançar")}
              {!isLastSection && !isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default FormActions;
