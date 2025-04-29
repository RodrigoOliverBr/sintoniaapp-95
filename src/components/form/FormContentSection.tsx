
import React from "react";
import FormAllQuestions from "@/components/form/FormAllQuestions";
import FormResults from "@/components/FormResults";
import EmployeeFormHistory from "@/components/form/EmployeeFormHistory";
import { Employee } from "@/types/cadastro";
import { FormResult, Question } from "@/types/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface FormContentSectionProps {
  selectedEmployee: Employee | undefined;
  selectedFormId: string;
  showResults: boolean;
  showingHistoryView: boolean;
  selectedFormTitle: string;
  formSections: any[];
  answers: Record<string, any>;
  onAnswerChange: (questionId: string, answer: boolean | null) => void;
  onObservationChange: (questionId: string, observation: string) => void;
  onOptionsChange: (questionId: string, options: string[]) => void;
  selectedEvaluation: FormResult | null;
  formResult: FormResult | null;
  questions: Question[];
  onNotesChange: (notes: string) => void;
  evaluationHistory: FormResult[];
  formComplete: boolean;
  isSubmitting: boolean;
  isDeletingEvaluation?: boolean;
  onNewEvaluation: () => void;
  onShowResults: () => void;
  onSaveAndComplete: () => void;
  onDeleteEvaluation: (evaluationId: string) => Promise<void>;
  onEditEvaluation?: (evaluation: FormResult) => void;
  onExitResults?: () => void;
}

const FormContentSection: React.FC<FormContentSectionProps> = ({
  selectedEmployee,
  selectedFormId,
  showResults,
  showingHistoryView,
  selectedFormTitle,
  formSections,
  answers,
  onAnswerChange,
  onObservationChange,
  onOptionsChange,
  selectedEvaluation,
  formResult,
  questions,
  onNotesChange,
  evaluationHistory,
  formComplete,
  isSubmitting,
  isDeletingEvaluation,
  onNewEvaluation,
  onShowResults,
  onSaveAndComplete,
  onDeleteEvaluation,
  onEditEvaluation,
  onExitResults
}) => {
  
  if (!showResults && showingHistoryView) {
    return (
      <EmployeeFormHistory
        evaluations={evaluationHistory}
        onShowResults={(evaluation) => {
          // This is the key fix - show results in read-only mode
          if (selectedEvaluation?.id !== evaluation.id || !showResults) {
            if (onEditEvaluation) {
              // Set the selected evaluation but don't enter edit mode
              onEditEvaluation(evaluation);
              onShowResults(); // Show results view with the selected evaluation
            }
          }
        }}
        onNewEvaluation={onNewEvaluation}
        onDeleteEvaluation={onDeleteEvaluation}
        onEditEvaluation={(evaluation) => {
          if (onEditEvaluation) onEditEvaluation(evaluation);
        }}
        isDeletingEvaluation={isDeletingEvaluation}
      />
    );
  }

  if (showResults) {
    // When viewing results from history, make it read-only
    // When viewing results after completing a form or editing, allow editing notes
    const shouldBeReadOnly = selectedEvaluation !== null && showingHistoryView;
    
    return (
      <div className="space-y-4">
        {onExitResults && (
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              onClick={onExitResults}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar ao formulário
            </Button>
          </div>
        )}
        
        <FormResults 
          result={selectedEvaluation || formResult!}
          questions={questions}
          onNotesChange={onNotesChange}
          isReadOnly={shouldBeReadOnly}
        />
      </div>
    );
  }

  // Get employee name safely
  const getEmployeeName = () => {
    if (!selectedEmployee) return "Funcionário não selecionado";
    // Check for both 'name' and 'nome' properties
    return selectedEmployee.name || (selectedEmployee as any).nome || "Funcionário";
  };
  
  // Get employee role safely
  const getEmployeeRole = () => {
    if (!selectedEmployee) return "Não especificado";
    // Check for both 'role' and 'cargo_id' properties
    return selectedEmployee.role || (selectedEmployee as any).cargo_id ? "Cargo especificado" : "Não especificado";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-bold text-primary mb-1">
          Avaliação para: {getEmployeeName()}
        </h2>
        <p className="text-sm text-muted-foreground">
          Cargo: {getEmployeeRole()}
        </p>
        <p className="text-sm text-muted-foreground">
          Formulário: {selectedFormTitle}
        </p>
      </div>
      
      {formSections && formSections.length > 0 ? (
        <FormAllQuestions 
          sections={formSections}
          questions={questions}
          answers={answers}
          onAnswerChange={onAnswerChange}
          onObservationChange={onObservationChange}
          onOptionsChange={onOptionsChange}
          onSaveAndComplete={onSaveAndComplete}
          isSubmitting={isSubmitting}
        />
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Nenhuma pergunta encontrada
          </h3>
          <p className="text-muted-foreground">
            Não há perguntas configuradas para este formulário.
          </p>
        </div>
      )}
    </div>
  );
};

export default FormContentSection;
