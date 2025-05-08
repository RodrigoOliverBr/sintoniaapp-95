
import React from "react";
import { useFormPageContext } from "@/contexts/FormPageContext";
import FormSelectionSection from "@/components/form/FormSelectionSection";
import FormContentSection from "@/components/form/FormContentSection";
import { Button } from "@/components/ui/button";

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
    formSections,
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
    formResult,
    evaluationHistory,
    
    // Handlers
    handleCompanyChange,
    handleEmployeeChange,
    handleFormChange,
    handleNewEvaluation,
    handleExitResults,
    handleSaveAndComplete,
    handleDeleteEvaluation,
    setSelectedEvaluation,
    setFormResult,
    setAnswers,
    setShowResults,
    setShowingHistoryView,
    setShowForm
  } = useFormPageContext();

  // Handler to view results in read-only mode
  const handleViewResults = () => {
    setShowResults(true);
    // Don't change other state - just show the results view
  };

  // Handler to edit an evaluation
  const handleEditEvaluation = (evaluation) => {
    console.log("Editing evaluation:", evaluation.id);
    setSelectedEvaluation(evaluation);
    setFormResult(evaluation);
    setAnswers(evaluation.answers || {});
    setShowResults(false);  // Turn off results view
    setShowingHistoryView(false);  // Exit history view
    setShowForm(true);  // Show the form for editing
  };

  // Explicit handler for the new evaluation button
  const handleStartNewEvaluation = () => {
    console.log("Starting new evaluation from the button");
    handleNewEvaluation();
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
        isLoadingHistory={isLoadingHistory}
        showNewEvaluationButton={selectedEmployeeId !== undefined}
        onNewEvaluation={handleStartNewEvaluation}
      />

      {selectedEmployeeId && selectedEmployee && selectedFormId && (
        <>
          {/* Show New Evaluation Button if form is not yet shown */}
          {!showForm && !showResults && !showingHistoryView && (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                {evaluationHistory && evaluationHistory.length > 0 
                  ? "Este funcionário já possui avaliações anteriores."
                  : "Iniciar nova avaliação para este funcionário?"
                }
              </h3>
              <div className="flex gap-4 justify-center">
                {evaluationHistory && evaluationHistory.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setShowingHistoryView(true)}
                  >
                    Ver Histórico
                  </Button>
                )}
                <Button onClick={handleStartNewEvaluation} type="button">
                  Nova Avaliação
                </Button>
              </div>
            </div>
          )}

          {/* Show Form Content when appropriate */}
          {(showForm || showResults || showingHistoryView) && (
            <FormContentSection
              selectedEmployee={selectedEmployee}
              selectedFormId={selectedFormId}
              showResults={showResults}
              showingHistoryView={showingHistoryView}
              selectedFormTitle={selectedFormTitle}
              formSections={formSections}
              answers={answers}
              onAnswerChange={(questionId, answer) => {
                setAnswers(prev => ({
                  ...prev,
                  [questionId]: { 
                    ...prev[questionId], 
                    questionId, 
                    answer: answer 
                  }
                }));
              }}
              onObservationChange={(questionId, observation) => {
                setAnswers(prev => ({
                  ...prev,
                  [questionId]: { 
                    ...prev[questionId], 
                    questionId, 
                    observation 
                  }
                }));
              }}
              onOptionsChange={(questionId, selectedOptions) => {
                setAnswers(prev => ({
                  ...prev,
                  [questionId]: { 
                    ...prev[questionId], 
                    questionId, 
                    selectedOptions 
                  }
                }));
              }}
              selectedEvaluation={selectedEvaluation}
              formResult={formResult}
              questions={questions}
              onNotesChange={(notes) => {
                console.log("Updating notes:", notes);
                if (selectedEvaluation) {
                  setSelectedEvaluation({
                    ...selectedEvaluation,
                    notas_analista: notes,
                    analyistNotes: notes
                  });
                } else if (formResult) {
                  setFormResult({
                    ...formResult,
                    notas_analista: notes,
                    analyistNotes: notes
                  });
                }
              }}
              evaluationHistory={evaluationHistory || []}
              formComplete={formComplete}
              isSubmitting={isSubmitting}
              isDeletingEvaluation={isDeletingEvaluation}
              onNewEvaluation={handleStartNewEvaluation}
              onShowResults={handleViewResults}
              onSaveAndComplete={handleSaveAndComplete}
              onDeleteEvaluation={handleDeleteEvaluation}
              onEditEvaluation={handleEditEvaluation}
              onExitResults={handleExitResults}
            />
          )}
        </>
      )}
    </div>
  );
};

export default FormPageWrapper;
