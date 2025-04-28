
import React from "react";
import FormSection from "@/components/FormSection";
import FormResults from "@/components/FormResults";
import ProgressHeader from "@/components/form/ProgressHeader";
import FormNavigation from "@/components/form/FormNavigation";
import { FormResult } from "@/types/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface FormContentProps {
  showResults: boolean;
  showingHistoryView: boolean;
  selectedEmployee: any;
  selectedFormTitle: string;
  currentSection: string;
  formSections: any[];
  answers: Record<string, any>;
  onAnswerChange: (questionId: string, answer: boolean | null) => void;
  onObservationChange: (questionId: string, observation: string) => void;
  onOptionsChange: (questionId: string, options: string[]) => void;
  selectedEvaluation: FormResult | null;
  formResult: FormResult | null;
  questions: any[];
  onNotesChange: (notes: string) => void;
  onSectionChange: (sectionTitle: string) => void;
  onExitResults?: () => void;
  isReadOnly?: boolean;
}

const FormContent: React.FC<FormContentProps> = ({
  showResults,
  showingHistoryView,
  selectedEmployee,
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
  onExitResults,
  isReadOnly = false,
}) => {
  if (!showResults) {
    return (
      <>
        <ProgressHeader 
          employeeName={selectedEmployee.name}
          jobRole={selectedEmployee.role || ""}
          currentSection={formSections.findIndex(s => s.title === currentSection) + 1}
          totalSections={formSections.length}
          formTitle={selectedFormTitle}
        />

        <div className="space-y-6">
          <FormNavigation
            sections={formSections}
            currentSection={currentSection}
            onSectionChange={onSectionChange}
          />

          {formSections.map((section) => (
            section.title === currentSection && (
              <FormSection
                key={section.title}
                section={section}
                answers={answers}
                onAnswerChange={onAnswerChange}
                onObservationChange={onObservationChange}
                onOptionsChange={onOptionsChange}
              />
            )
          ))}
        </div>
      </>
    );
  }

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
        isReadOnly={isReadOnly || showingHistoryView} // Make fields read-only when viewing history
      />
    </div>
  );
};

export default FormContent;
