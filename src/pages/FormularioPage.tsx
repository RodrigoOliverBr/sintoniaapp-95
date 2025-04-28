
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useFormData } from "@/hooks/useFormData";
import FormSelectionSection from "@/components/form/FormSelectionSection";
import FormContentSection from "@/components/form/FormContentSection";
import { toast as sonnerToast } from "sonner";
import { saveFormResult, getFormResultByEmployeeId } from "@/services/form";

const FormularioPage: React.FC = () => {
  const {
    companies,
    employees,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedEmployeeId,
    setSelectedEmployeeId,
    formResult,
    setFormResult,
    answers,
    setAnswers,
    availableForms,
    selectedFormId,
    setSelectedFormId,
    questions,
    formSections,
    showResults,
    setShowResults,
    formComplete,
    setFormComplete,
    selectedEvaluation,
    setSelectedEvaluation,
    evaluationHistory,
    resetForm,
    isLoadingHistory,
    showingHistoryView,
    setShowingHistoryView,
    loadEmployeeHistory,
    handleDeleteEvaluation,
    isDeletingEvaluation
  } = useFormData();

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when switching between employees
  useEffect(() => {
    resetForm();
  }, [selectedEmployeeId]);

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
      
      console.log(`Total SIM: ${totalYes}, Total NÃO: ${totalNo}`);
      
      // Prepare form result data
      const formResultData = {
        id: formResult?.id || '',
        employeeId: selectedEmployeeId,
        empresa_id: selectedCompanyId,
        formulario_id: selectedFormId,
        answers,
        total_sim: totalYes,
        total_nao: totalNo,
        notas_analista: formResult?.notas_analista || '',
        is_complete: true,
        last_updated: new Date().toISOString(),
        created_at: formResult?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
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
