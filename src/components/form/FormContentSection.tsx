
import React from "react";
import { Question, Section } from "@/types/form";
import { Employee } from "@/types/cadastro";
import FormAllQuestions from "./FormAllQuestions";
import FormResultComponent from "./FormResult";
import EmployeeFormHistory from "./EmployeeFormHistory";
import { FormResult } from "@/types/form";

interface FormContentSectionProps {
  // Data
  selectedEmployee: Employee;
  selectedFormId: string;
  selectedFormTitle: string;
  sections: Section[];
  questions: Question[];
  answers: Record<string, any>;
  evaluationHistory: FormResult[];
  
  // State
  showResults: boolean;
  showingHistoryView: boolean;
  formComplete: boolean;
  isSubmitting: boolean;
  isDeletingEvaluation: boolean;
  
  // Evaluation data
  selectedEvaluation: FormResult | null;
  formResult: FormResult | null;
  
  // Event handlers
  onAnswerChange: (questionId: string, answer: boolean | null) => void;
  onObservationChange: (questionId: string, observation: string) => void;
  onOptionsChange: (questionId: string, selectedOptions: string[]) => void;
  onNotesChange: (notes: string) => void;
  onNewEvaluation: () => void;
  onShowResults: (evaluation: FormResult) => void;
  onSaveAndComplete: () => void;
  onSaveAndExit: () => void;
  onDeleteEvaluation: (evaluationId: string) => Promise<void>;
  onEditEvaluation: (evaluation: FormResult) => void;
  onExitResults: () => void;
}

const FormContentSection: React.FC<FormContentSectionProps> = ({
  // Data
  selectedEmployee,
  selectedFormId,
  selectedFormTitle,
  sections,
  questions,
  answers,
  evaluationHistory,
  
  // State
  showResults,
  showingHistoryView,
  formComplete,
  isSubmitting,
  isDeletingEvaluation,
  
  // Evaluation data
  selectedEvaluation,
  formResult,
  
  // Event handlers
  onAnswerChange,
  onObservationChange,
  onOptionsChange,
  onNotesChange,
  onNewEvaluation,
  onShowResults,
  onSaveAndComplete,
  onSaveAndExit,
  onDeleteEvaluation,
  onEditEvaluation,
  onExitResults,
}) => {
  // View history
  if (showingHistoryView && !showResults) {
    return (
      <EmployeeFormHistory
        evaluations={evaluationHistory}
        onShowResults={onShowResults}
        onNewEvaluation={onNewEvaluation}
        onDeleteEvaluation={onDeleteEvaluation}
        onEditEvaluation={onEditEvaluation}
        isDeletingEvaluation={isDeletingEvaluation}
      />
    );
  }
  
  // View results
  if (showResults) {
    return (
      <FormResultComponent 
        result={selectedEvaluation || formResult!}
        questions={questions}
        onNotesChange={onNotesChange}
        isReadOnly={showingHistoryView} // Make fields read-only when viewing history
      />
    );
  }
  
  // Show the form with all questions
  return (
    <FormAllQuestions
      sections={sections}
      questions={questions}
      answers={answers}
      onAnswerChange={onAnswerChange}
      onObservationChange={onObservationChange}
      onSaveAndComplete={onSaveAndComplete}
      onSaveAndExit={onSaveAndExit}
      isSubmitting={isSubmitting}
    />
  );
};

export default FormContentSection;
