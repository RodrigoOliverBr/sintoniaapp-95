
import React, { useEffect } from "react";
import Layout from "@/components/Layout";
import { useFormData } from "@/hooks/useFormData";
import { useFormSubmission } from "@/hooks/useFormSubmission";
import FormSelectionSection from "@/components/form/FormSelectionSection";
import FormContentSection from "@/components/form/FormContentSection";
import { toast as sonnerToast } from "sonner";

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
    currentSection,
    setCurrentSection,
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

  const { isSubmitting, handleSaveForm } = useFormSubmission();

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
    setCurrentSection("");
    resetForm();
  };

  const handleNewEvaluation = () => {
    resetForm();
    setShowingHistoryView(false);
    if (formSections.length > 0) {
      setCurrentSection(formSections[0].title);
    }
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
  const isLastSection = formSections.findIndex(section => section.title === currentSection) === formSections.length - 1;

  const handleSaveAndComplete = () => {
    // Verificar se há respostas para todas as perguntas
    const allQuestionsAnswered = questions.every(q => answers[q.id] && answers[q.id].answer !== null);
    
    if (!allQuestionsAnswered) {
      sonnerToast.warning("Por favor, responda todas as perguntas antes de concluir o formulário");
      return;
    }
    
    handleSaveForm(
      {
        selectedFormId,
        selectedEmployeeId: selectedEmployeeId!,
        selectedCompanyId: selectedCompanyId!,
        answers,
        formResult
      },
      {
        completeForm: true,
        onSuccess: (updatedResult) => {
          setFormResult(updatedResult);
          setShowResults(true);
          setFormComplete(true);
          setSelectedEvaluation(updatedResult);
          
          // Mostrar mensagem de sucesso
          sonnerToast.success("Formulário concluído com sucesso!");
          
          // Após completar o formulário, também recarregamos o histórico
          loadEmployeeHistory();
        },
        moveToNextSection: () => {
          const currentIndex = formSections.findIndex(s => s.title === currentSection);
          if (currentIndex < formSections.length - 1) {
            setCurrentSection(formSections[currentIndex + 1].title);
            return true;
          }
          return false;
        }
      }
    );
  };

  const handleSaveAndContinue = () => {
    // Verificar se há respostas para todas as perguntas da seção atual
    const currentSectionQuestions = formSections
      .find(s => s.title === currentSection)?.questions || [];
    
    const allCurrentSectionQuestionsAnswered = currentSectionQuestions
      .every(q => answers[q.id] && answers[q.id].answer !== null);
    
    if (!allCurrentSectionQuestionsAnswered) {
      sonnerToast.warning("Por favor, responda todas as perguntas desta seção antes de continuar");
      return;
    }
    
    handleSaveForm(
      {
        selectedFormId,
        selectedEmployeeId: selectedEmployeeId!,
        selectedCompanyId: selectedCompanyId!,
        answers,
        formResult
      },
      {
        onSuccess: (updatedResult) => {
          setFormResult(updatedResult);
          
          const currentIndex = formSections.findIndex(s => s.title === currentSection);
          if (currentIndex < formSections.length - 1) {
            setCurrentSection(formSections[currentIndex + 1].title);
          } else {
            setFormComplete(true);
          }
          
          sonnerToast.success("Dados salvos com sucesso!");
        },
        moveToNextSection: () => {
          const currentIndex = formSections.findIndex(s => s.title === currentSection);
          if (currentIndex < formSections.length - 1) {
            setCurrentSection(formSections[currentIndex + 1].title);
            return true;
          }
          return false;
        }
      }
    );
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
            currentSection={currentSection}
            formSections={formSections}
            answers={answers}
            onAnswerChange={(questionId, answer) => {
              setAnswers(prev => ({
                ...prev,
                [questionId]: { ...prev[questionId], questionId, answer: answer === null ? false : answer }
              }));
            }}
            onObservationChange={(questionId, observation) => {
              setAnswers(prev => ({
                ...prev,
                [questionId]: { ...prev[questionId], questionId, observation }
              }));
            }}
            onOptionsChange={(questionId, selectedOptions) => {
              setAnswers(prev => ({
                ...prev,
                [questionId]: { ...prev[questionId], questionId, selectedOptions }
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
            onSectionChange={setCurrentSection}
            evaluationHistory={evaluationHistory || []}
            formComplete={formComplete}
            isSubmitting={isSubmitting}
            isLastSection={isLastSection}
            isDeletingEvaluation={isDeletingEvaluation}
            onNewEvaluation={handleNewEvaluation}
            onShowResults={() => setShowResults(true)}
            onCompleteForm={handleSaveAndComplete}
            onSaveForm={handleSaveAndContinue}
            onDeleteEvaluation={handleDeleteEvaluation}
            onEditEvaluation={(evaluation) => {
              setSelectedEvaluation(evaluation);
              setShowResults(false);
              setAnswers(evaluation.answers || {});
              if (formSections.length > 0) {
                setCurrentSection(formSections[0].title);
              }
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
