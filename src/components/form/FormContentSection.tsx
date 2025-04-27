import React from "react";
import FormContent from "@/components/form/FormContent";
import EmployeeFormHistory from "@/components/form/EmployeeFormHistory";
import FormActions from "@/components/form/FormActions";
import { Employee, Form } from "@/types/cadastro";
import { FormResult, Question } from "@/types/form";

interface FormContentSectionProps {
  selectedEmployee: Employee | undefined;
  selectedFormId: string;
  showResults: boolean;
  showingHistoryView: boolean;
  selectedFormTitle: string;
  currentSection: string;
  formSections: any[];
  answers: Record<string, any>;
  onAnswerChange: (questionId: string, answer: boolean | null) => void;
  onObservationChange: (questionId: string, observation: string) => void;
  onOptionsChange: (questionId: string, options: string[]) => void;
  selectedEvaluation: FormResult | null;
  formResult: FormResult | null;
  questions: Question[];
  onNotesChange: (notes: string) => void;
  onSectionChange: (section: string) => void;
  evaluationHistory: FormResult[];
  formComplete: boolean;
  isSubmitting: boolean;
  isLastSection: boolean;
  onNewEvaluation: () => void;
  onShowResults: () => void;
  onCompleteForm: () => void;
  onSaveForm: () => void;
  onDeleteEvaluation: (evaluationId: string) => Promise<void>;
  onEditEvaluation?: (evaluation: FormResult) => void;
}

const FormContentSection: React.FC<FormContentSectionProps> = ({
  selectedEmployee,
  selectedFormId,
  showResults,
  showingHistoryView,
  selectedFormTitle,
  currentSection,
  formSections,
  answers,
  onAnswerChange,
  onObservationChange,
  onOptionsChange,
  selectedEvaluation,
  formResult,
  questions,
  onNotesChange,
  onSectionChange,
  evaluationHistory,
  formComplete,
  isSubmitting,
  isLastSection,
  onNewEvaluation,
  onShowResults,
  onCompleteForm,
  onSaveForm,
  onDeleteEvaluation,
  onEditEvaluation
}) => {
  if (!showResults && showingHistoryView) {
    return (
      <EmployeeFormHistory
        evaluations={evaluationHistory}
        onShowResults={(evaluation) => {
          onEditEvaluation(evaluation);
          onShowResults();
        }}
        onNewEvaluation={onNewEvaluation}
        onDeleteEvaluation={onDeleteEvaluation}
        onEditEvaluation={onEditEvaluation}
      />
    );
  }

  return (
    <>
      <FormContent
        showResults={showResults}
        showingHistoryView={showingHistoryView}
        selectedEmployee={selectedEmployee}
        selectedFormTitle={selectedFormTitle}
        currentSection={currentSection}
        formSections={formSections}
        answers={answers}
        onAnswerChange={onAnswerChange}
        onObservationChange={onObservationChange}
        onOptionsChange={onOptionsChange}
        selectedEvaluation={selectedEvaluation}
        formResult={formResult}
        questions={questions}
        onNotesChange={onNotesChange}
        onSectionChange={onSectionChange}
      />
      
      {selectedFormId && (
        <FormActions
          showResults={showResults}
          formComplete={formComplete}
          isSubmitting={isSubmitting}
          isLastSection={isLastSection}
          showingHistory={showingHistoryView && !showResults}
          onNewEvaluation={onNewEvaluation}
          onShowResults={onShowResults}
          onCompleteForm={onCompleteForm}
          onSaveForm={onSaveForm}
        />
      )}
    </>
  );
};

export default FormContentSection;
