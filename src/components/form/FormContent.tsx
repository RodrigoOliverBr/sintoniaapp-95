
import React from "react";
import FormSection from "@/components/FormSection";
import FormResults from "@/components/FormResults";
import ProgressHeader from "@/components/form/ProgressHeader";
import FormNavigation from "@/components/form/FormNavigation";
import { FormResult } from "@/types/form";

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
            onSectionChange={(value) => setCurrentSection(value)}
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
    <FormResults 
      result={selectedEvaluation || formResult!}
      questions={questions}
      onNotesChange={onNotesChange}
    />
  );
};

export default FormContent;
