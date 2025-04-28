
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { saveFormResult, getFormResultByEmployeeId } from "@/services/form";
import FormSelectionSection from "@/components/form/FormSelectionSection";
import FormContentSection from "@/components/form/FormContentSection";
import { useCompanySelection } from "@/hooks/form/useCompanySelection";
import { useEmployeeSelection } from "@/hooks/form/useEmployeeSelection";
import { useFormSelection } from "@/hooks/form/useFormSelection";
import { useFormQuestions } from "@/hooks/form/useFormQuestions";
import { useFormAnswers } from "@/hooks/form/useFormAnswers";
import { useEvaluationHistory } from "@/hooks/form/useEvaluationHistory";

const FormularioPage: React.FC = () => {
  // Custom hooks for forms
  const { 
    companies,
    selectedCompanyId, 
    setSelectedCompanyId 
  } = useCompanySelection();

  const {
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId
  } = useEmployeeSelection(selectedCompanyId);

  const {
    availableForms,
    selectedFormId,
    setSelectedFormId
  } = useFormSelection();

  const {
    questions,
    formSections,
  } = useFormQuestions(selectedFormId);

  const {
    answers,
    setAnswers,
    formResult,
    setFormResult,
    showResults,
    setShowResults,
    formComplete,
    setFormComplete,
  } = useFormAnswers();

  const {
    selectedEvaluation,
    setSelectedEvaluation,
    evaluationHistory,
    isLoadingHistory,
    showingHistoryView,
    setShowingHistoryView,
    loadEmployeeHistory,
    handleDeleteEvaluation,
    isDeletingEvaluation
  } = useEvaluationHistory(selectedEmployeeId);

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewEvaluation, setIsNewEvaluation] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Reset form when switching between employees
  useEffect(() => {
    resetForm();
    
    if (selectedEmployeeId) {
      // Load history when an employee is selected, don't show the form yet
      setShowForm(false);
    }
  }, [selectedEmployeeId]);

  const resetForm = () => {
    setAnswers({});
    setFormComplete(false);
    setShowResults(false);
    setSelectedEvaluation(null);
    setIsNewEvaluation(false);
    setShowForm(false);
  };

  const handleCompanyChange = (value: string) => {
    setSelectedCompanyId(value);
    setSelectedEmployeeId(undefined);
    resetForm();
    setShowingHistoryView(false);
  };

  const handleEmployeeChange = (value: string) => {
    setSelectedEmployeeId(value);
    resetForm();
    setShowingHistoryView(false);
  };

  const handleFormChange = (value: string) => {
    setSelectedFormId(value);
    setAnswers({});
    resetForm();
  };

  const handleNewEvaluation = () => {
    resetForm();
    setShowingHistoryView(false);
    setIsNewEvaluation(true);
    setShowForm(true);
    console.log("Iniciando nova avaliação");
  };
  
  const handleExitResults = () => {
    if (selectedEmployeeId) {
      // Recarregar o histórico do funcionário
      loadEmployeeHistory();
    }
    
    setShowResults(false);
    setFormComplete(false);
    setSelectedEvaluation(null);
  };

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
  const selectedFormTitle = availableForms.find(f => f.id === selectedFormId)?.titulo || "Formulário";

  const handleSaveAndComplete = async () => {
    if (!selectedFormId || !selectedEmployeeId || !selectedCompanyId) {
      sonnerToast.warning("Por favor, selecione empresa, funcionário e formulário antes de continuar");
      return;
    }

    // Validate all questions are answered
    const unansweredQuestions = questions.filter(q => 
      !answers[q.id] || answers[q.id].answer === null || answers[q.id].answer === undefined
    );
    
    if (unansweredQuestions.length > 0) {
      sonnerToast.warning(`Por favor, responda todas as ${unansweredQuestions.length} perguntas pendentes antes de concluir`);
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Count actual yes/no answers
      let totalYes = 0;
      let totalNo = 0;
      
      Object.values(answers).forEach(answer => {
        if (answer.answer === true) {
          totalYes++;
        } else if (answer.answer === false) {
          totalNo++;
        }
      });
      
      // Determine if we're editing an existing evaluation or creating a new one
      let existingFormResult = formResult;
      
      if (selectedEvaluation && !isNewEvaluation) {
        // We're editing an existing evaluation
        console.log(`Editing existing evaluation with ID: ${selectedEvaluation.id}`);
        existingFormResult = selectedEvaluation;
      } else if (!isNewEvaluation && evaluationHistory && evaluationHistory.length > 0 && !showForm) {
        // Check if there's an incomplete evaluation to continue working on
        const incompleteEvaluation = evaluationHistory.find(
          evaluation => evaluation.formulario_id === selectedFormId && !evaluation.is_complete
        );
        
        if (incompleteEvaluation) {
          console.log(`Continuing work on existing incomplete evaluation: ${incompleteEvaluation.id}`);
          existingFormResult = incompleteEvaluation;
        } 
      } else {
        console.log("Creating a new evaluation (isNewEvaluation flag is true)");
        // If we're creating a new evaluation, don't use existing formResult
        existingFormResult = null;
      }
      
      // Get existing analyst notes
      const notesAnalista = selectedEvaluation?.notas_analista || formResult?.notas_analista || '';
      
      // Prepare form result data
      const formResultData = {
        id: existingFormResult?.id || '',
        employeeId: selectedEmployeeId,
        empresa_id: selectedCompanyId,
        formulario_id: selectedFormId,
        answers,
        total_sim: totalYes,
        total_nao: totalNo,
        notas_analista: notesAnalista,
        is_complete: true, // Explicitly set to true for completed forms
        last_updated: new Date().toISOString(),
        created_at: existingFormResult?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log(`Saving form with ID: ${formResultData.id || 'new'}`);
      console.log(`Is new evaluation: ${isNewEvaluation}`);
      console.log(`Is complete: ${formResultData.is_complete}`);
      
      // Save form result
      await saveFormResult(formResultData);
      sonnerToast.success("Formulário salvo com sucesso!");
      
      // Get updated result
      const updatedResult = await getFormResultByEmployeeId(selectedEmployeeId, selectedFormId);
      
      if (updatedResult) {
        setFormResult(updatedResult);
        setShowResults(true);
        setFormComplete(true);
        setSelectedEvaluation(updatedResult);
        setIsNewEvaluation(false); // Reset new evaluation flag after saving
        
        // Reload history after completing to get the updated list
        await loadEmployeeHistory();
      }
    } catch (error: any) {
      console.error("Erro ao salvar o formulário:", error);
      sonnerToast.error(`Erro ao salvar o formulário: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Formulário">
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
          onNewEvaluation={handleNewEvaluation}
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
                  <Button onClick={handleNewEvaluation}>
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
                showingHistoryView={showingHistoryView && !isNewEvaluation}
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
                onNewEvaluation={handleNewEvaluation}
                onShowResults={() => setShowResults(true)}
                onSaveAndComplete={handleSaveAndComplete}
                onDeleteEvaluation={handleDeleteEvaluation}
                onEditEvaluation={(evaluation) => {
                  console.log("Editing evaluation:", evaluation.id);
                  setSelectedEvaluation(evaluation);
                  setFormResult(evaluation);
                  setAnswers(evaluation.answers || {});
                  setShowResults(false);
                  setShowingHistoryView(false);
                  setIsNewEvaluation(false);
                  setShowForm(true);
                }}
                onExitResults={handleExitResults}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default FormularioPage;
