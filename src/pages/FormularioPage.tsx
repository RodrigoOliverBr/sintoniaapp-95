
import React from "react";
import { useFormPage } from "@/hooks/form/useFormPage";
import Layout from "@/components/Layout";
import FormSelectionSection from "@/components/form/FormSelectionSection";
import EmployeeEvaluationHistory from "@/components/form/EmployeeEvaluationHistory";
import FormSection from "@/components/form/FormSection";
import FormNavigation from "@/components/form/FormNavigation";
import FormResult from "@/components/form/FormResult";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const FormularioPage: React.FC = () => {
  const {
    // Data
    companies,
    employees,
    availableForms,
    sections,
    questions,
    evaluationHistory,
    
    // Selection state
    selectedCompanyId,
    selectedEmployeeId,
    selectedFormId,
    selectedEmployee,
    selectedForm,
    currentSection,
    currentSectionIndex,
    
    // Form state
    answers,
    currentEvaluation,
    showForm,
    showResults,
    isViewingHistory,
    
    // Loading state
    isLoading,
    isSaving,
    isDeleting,
    isLoadingHistory,
    
    // Actions
    handleCompanyChange,
    handleEmployeeChange,
    handleFormChange,
    handleSectionNavigate,
    handleAnswerChange,
    handleObservationChange,
    handleNotesChange,
    handleNewEvaluation,
    handleViewEvaluation,
    handleEditEvaluation,
    handleDeleteEvaluation,
    handleShowHistory,
    handleSaveAndComplete
  } = useFormPage();

  const renderContent = () => {
    // If employee is selected but no form is being shown yet
    if (selectedEmployeeId && !showForm && !showResults && !isViewingHistory) {
      return (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            {evaluationHistory.length > 0 
              ? "Este funcionário já possui avaliações anteriores."
              : "Iniciar nova avaliação para este funcionário?"
            }
          </h3>
          <div className="flex gap-4 justify-center">
            {evaluationHistory.length > 0 && (
              <Button
                variant="outline"
                onClick={handleShowHistory}
              >
                Ver Histórico
              </Button>
            )}
            <Button onClick={handleNewEvaluation}>
              Nova Avaliação
            </Button>
          </div>
        </div>
      );
    }
    
    // Show evaluation history
    if (isViewingHistory && !showResults) {
      return (
        <EmployeeEvaluationHistory
          evaluations={evaluationHistory}
          onViewEvaluation={handleViewEvaluation}
          onEditEvaluation={handleEditEvaluation}
          onDeleteEvaluation={handleDeleteEvaluation}
          onNewEvaluation={handleNewEvaluation}
          isLoading={isLoadingHistory}
          isDeleting={isDeleting}
        />
      );
    }
    
    // Show form results
    if (showResults) {
      return (
        <>
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => {
                if (isViewingHistory) handleShowHistory();
                else handleNewEvaluation();
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {isViewingHistory ? "Voltar ao histórico" : "Voltar ao formulário"}
            </Button>
          </div>
          
          {currentEvaluation && (
            <FormResult
              result={currentEvaluation}
              questions={questions}
              onNotesChange={handleNotesChange}
              isReadOnly={isViewingHistory}
            />
          )}
        </>
      );
    }
    
    // Show the form
    if (showForm && currentSection && selectedForm) {
      return (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <h2 className="text-xl font-bold text-primary">
              {selectedForm.titulo}
            </h2>
            <p className="text-sm text-muted-foreground">
              Funcionário: {selectedEmployee?.nome || "Não selecionado"}
            </p>
          </div>
          
          <FormNavigation
            sections={sections}
            currentSectionIndex={currentSectionIndex}
            onNavigate={handleSectionNavigate}
            onSave={handleSaveAndComplete}
            isSaving={isSaving}
          />
          
          <FormSection
            section={currentSection}
            questions={questions}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onObservationChange={handleObservationChange}
          />
        </div>
      );
    }
    
    // Default empty state
    return null;
  };

  return (
    <Layout title="Formulário de Avaliação">
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
          showNewEvaluationButton={!!selectedEmployeeId && !!selectedFormId}
          onNewEvaluation={handleNewEvaluation}
          isLoading={isLoading}
        />
        
        {renderContent()}
      </div>
    </Layout>
  );
};

export default FormularioPage;
