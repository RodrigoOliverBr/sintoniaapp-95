
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

  // Reset form when switching between employees
  useEffect(() => {
    resetForm();
  }, [selectedEmployeeId]);

  const resetForm = () => {
    setAnswers({});
    setFormComplete(false);
    setShowResults(false);
    setSelectedEvaluation(null);
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
      // Count yes/no answers
      let totalYes = 0;
      let totalNo = 0;
      
      Object.values(answers).forEach(answer => {
        if (answer.answer === true) {
          totalYes++;
        } else if (answer.answer === false) {
          totalNo++;
        }
      });
      
      // Check if we already have an evaluation result with the same employee and form
      let existingFormResult = formResult;
      if (evaluationHistory && evaluationHistory.length > 0) {
        // Don't create duplicate evaluations
        const existingEvaluation = evaluationHistory.find(
          evaluation => evaluation.formulario_id === selectedFormId && !evaluation.is_complete
        );
        
        if (existingEvaluation) {
          // Update existing evaluation instead of creating a new one
          existingFormResult = existingEvaluation;
        }
      }
      
      // Make sure to save analyst notes that might have been added
      const notesAnalista = formResult?.notas_analista || '';
      
      // Prepare form result data - ensure is_complete is set to true
      const formResultData = {
        id: existingFormResult?.id || '',
        employeeId: selectedEmployeeId,
        empresa_id: selectedCompanyId,
        formulario_id: selectedFormId,
        answers,
        total_sim: totalYes,
        total_nao: totalNo,
        notas_analista: notesAnalista,
        is_complete: true, // Explicitly set to true to ensure report generation
        last_updated: new Date().toISOString(),
        created_at: existingFormResult?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log("Saving form with is_complete=true to trigger report generation");
      console.log("Analyst notes:", notesAnalista);
      
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
        
        // Reload history after completing
        loadEmployeeHistory();
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
        />

        {selectedEmployeeId && selectedEmployee && selectedFormId && (
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
              if (formResult) {
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
              setSelectedEvaluation(evaluation);
              setShowResults(false);
              setAnswers(evaluation.answers || {});
              setShowingHistoryView(false);
            }}
            onExitResults={handleExitResults}
          />
        )}
      </div>
    </Layout>
  );
};

export default FormularioPage;
