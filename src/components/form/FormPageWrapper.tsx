
import React from "react";
import { useFormPageContext } from "@/contexts/FormPageContext";
import FormSelectionSection from "@/components/form/FormSelectionSection";
import FormContentSection from "@/components/form/FormContentSection";
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

  const handleOptionsChange = (questionId: string, selectedOptions: string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { 
        ...prev[questionId], 
        questionId, 
        selectedOptions 
      }
    }));
  };

  const handleNotesChange = (notes: string) => {
    // Handle notes change logic here
    console.log("Notes changed:", notes);
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
              
              <FormContentSection
                selectedEmployee={selectedEmployee}
                selectedFormId={selectedFormId}
                selectedFormTitle={selectedFormTitle}
                sections={sections}
                questions={questions}
                answers={answers}
                evaluationHistory={evaluationHistory}
                showResults={showResults}
                showingHistoryView={showingHistoryView}
                formComplete={formComplete}
                isSubmitting={isSubmitting}
                isDeletingEvaluation={isDeletingEvaluation}
                selectedEvaluation={selectedEvaluation}
                formResult={currentEvaluation}
                onAnswerChange={handleAnswerChange}
                onObservationChange={handleObservationChange}
                onOptionsChange={handleOptionsChange}
                onNotesChange={handleNotesChange}
                onNewEvaluation={handleNewEvaluation}
                onShowResults={() => {}}
                onSaveAndComplete={handleSaveAndComplete}
                onSaveAndExit={handleSaveAndExit}
                onDeleteEvaluation={handleDeleteEvaluation}
                onEditEvaluation={() => {}}
                onExitResults={handleExitResults}
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
              
              <FormContentSection
                selectedEmployee={selectedEmployee}
                selectedFormId={selectedFormId}
                selectedFormTitle={selectedFormTitle}
                sections={sections}
                questions={questions}
                answers={answers}
                evaluationHistory={evaluationHistory}
                showResults={showResults}
                showingHistoryView={showingHistoryView}
                formComplete={formComplete}
                isSubmitting={isSubmitting}
                isDeletingEvaluation={isDeletingEvaluation}
                selectedEvaluation={selectedEvaluation}
                formResult={currentEvaluation}
                onAnswerChange={handleAnswerChange}
                onObservationChange={handleObservationChange}
                onOptionsChange={handleOptionsChange}
                onNotesChange={handleNotesChange}
                onNewEvaluation={handleNewEvaluation}
                onShowResults={() => {}}
                onSaveAndComplete={handleSaveAndComplete}
                onSaveAndExit={handleSaveAndExit}
                onDeleteEvaluation={handleDeleteEvaluation}
                onEditEvaluation={() => {}}
                onExitResults={handleExitResults}
              />
            </div>
          )}
          
          {/* If there's evaluation history, show it automatically */}
          {!showForm && !showResults && evaluationHistory.length > 0 && (
            <FormContentSection
              selectedEmployee={selectedEmployee}
              selectedFormId={selectedFormId}
              selectedFormTitle={selectedFormTitle}
              sections={sections}
              questions={questions}
              answers={answers}
              evaluationHistory={evaluationHistory}
              showResults={showResults}
              showingHistoryView={true}
              formComplete={formComplete}
              isSubmitting={isSubmitting}
              isDeletingEvaluation={isDeletingEvaluation}
              selectedEvaluation={selectedEvaluation}
              formResult={currentEvaluation}
              onAnswerChange={handleAnswerChange}
              onObservationChange={handleObservationChange}
              onOptionsChange={handleOptionsChange}
              onNotesChange={handleNotesChange}
              onNewEvaluation={handleNewEvaluation}
              onShowResults={() => {}}
              onSaveAndComplete={handleSaveAndComplete}
              onSaveAndExit={handleSaveAndExit}
              onDeleteEvaluation={handleDeleteEvaluation}
              onEditEvaluation={() => {}}
              onExitResults={handleExitResults}
            />
          )}
          
          {/* Default state - Show CTA to start evaluation if no actions happening */}
          {!showForm && !showResults && !showingHistoryView && evaluationHistory.length === 0 && (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Iniciar nova avaliação para este funcionário?
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
