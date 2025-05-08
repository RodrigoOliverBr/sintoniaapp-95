
import React from "react";
import { useFormPageContext } from "@/contexts/FormPageContext";
import FormSelectionSection from "@/components/form/FormSelectionSection";
import FormContentSection from "@/components/form/FormContentSection";
import FormAllQuestions from "@/components/form/FormAllQuestions";
import EmployeeFormHistory from "@/components/form/EmployeeFormHistory";
import FormResult from "@/components/form/FormResult";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const FormPageWrapper: React.FC = () => {
  const {
    // Selection props
    companies,
    employees,
    availableForms,
    selectedCompanyId,
    selectedEmployeeId,
    selectedFormId,
    
    // Form content props
    selectedEmployee,
    selectedFormTitle,
    sections,
    answers,
    questions,
    
    // State flags
    showResults,
    showForm,
    showingHistoryView,
    formComplete,
    isSubmitting,
    isLoadingHistory,
    isDeletingEvaluation,
    
    // Form data
    selectedEvaluation,
    currentEvaluation,
    evaluationHistory,
    
    // Handlers
    handleCompanyChange,
    handleEmployeeChange,
    handleFormChange,
    handleNewEvaluation,
    handleExitResults,
    handleSaveAndComplete,
    handleSaveAndExit,
    handleDeleteEvaluation,
    setAnswers,
  } = useFormPageContext();

  const handleAnswerChange = (questionId: string, answer: boolean | null) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { 
        ...prev[questionId], 
        questionId, 
        answer 
      }
    }));
  };

  const handleObservationChange = (questionId: string, observation: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { 
        ...prev[questionId], 
        questionId, 
        observation 
      }
    }));
  };

  const handleViewResults = (evaluation: any) => {
    console.log("Viewing evaluation:", evaluation);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <FormSelectionSection
        companies={companies}
        employees={employees}
        availableForms={availableForms}
        selectedCompanyId={selectedCompanyId}
        selectedEmployeeId={selectedEmployeeId}
        selectedFormId={selectedFormId}
        onCompanyChange={handleCompanyChange}
        onEmployeeChange={handleEmployeeChange}
        onFormChange={handleFormChange}
      />

      {/* Show the appropriate content based on state */}
      {selectedEmployeeId && selectedEmployee && (
        <>
          {/* Show evaluation history when available */}
          {showingHistoryView && !showResults && (
            <EmployeeFormHistory 
              evaluations={evaluationHistory}
              onShowResults={handleViewResults}
              onNewEvaluation={handleNewEvaluation}
              onDeleteEvaluation={handleDeleteEvaluation}
              isDeletingEvaluation={isDeletingEvaluation}
            />
          )}
          
          {/* Show form results */}
          {showResults && (currentEvaluation || selectedEvaluation) && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handleExitResults}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {showingHistoryView ? "Voltar ao histórico" : "Voltar ao formulário"}
                </Button>
              </div>
              
              <FormResult
                result={selectedEvaluation || currentEvaluation!}
                questions={questions}
                isReadOnly={showingHistoryView}
              />
            </div>
          )}
          
          {/* Show the form with all questions */}
          {showForm && !showResults && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <h2 className="text-xl font-bold text-primary">
                  {selectedFormTitle}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Funcionário: {selectedEmployee.nome || "Não selecionado"}
                </p>
              </div>
              
              {/* Show all questions on a single screen */}
              <FormAllQuestions
                sections={sections}
                questions={questions}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                onObservationChange={handleObservationChange}
                onSaveAndComplete={handleSaveAndComplete}
                onSaveAndExit={handleSaveAndExit}
                isSubmitting={isSubmitting}
              />
            </div>
          )}
          
          {/* Default state - Show CTA to start evaluation if no actions happening */}
          {!showForm && !showResults && !showingHistoryView && (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                {evaluationHistory && evaluationHistory.length > 0 
                  ? "Este funcionário já possui avaliações anteriores."
                  : "Iniciar nova avaliação para este funcionário?"
                }
              </h3>
              <Button onClick={handleNewEvaluation} className="mt-4">
                Nova Avaliação
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FormPageWrapper;
