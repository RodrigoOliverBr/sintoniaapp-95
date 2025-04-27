
import React from "react";
import Layout from "@/components/Layout";
import { useFormData } from "@/hooks/useFormData";
import { useFormSubmission } from "@/hooks/useFormSubmission";
import FormSelectionSection from "@/components/form/FormSelectionSection";
import FormContentSection from "@/components/form/FormContentSection";
import { useToast } from "@/hooks/use-toast";
import { deleteFormEvaluation } from "@/services/form";

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
    setEvaluationHistory,
    isLoadingHistory,
    showingHistoryView,
    setShowingHistoryView,
    loadEmployeeHistory
  } = useFormData();

  const { toast } = useToast();
  const { isSubmitting, handleSaveForm } = useFormSubmission();

  const handleCompanyChange = (value: string) => {
    setSelectedCompanyId(value);
    setSelectedEmployeeId(undefined);
    setShowResults(false);
    setFormComplete(false);
    setShowingHistoryView(false);
  };

  const handleEmployeeChange = (value: string) => {
    setSelectedEmployeeId(value);
    setShowResults(false);
    setSelectedEvaluation(null);
    setFormComplete(false);
    setAnswers({});
    setShowingHistoryView(false);
  };

  const handleFormChange = (value: string) => {
    setSelectedFormId(value);
    setAnswers({});
    setCurrentSection("");
    setShowResults(false);
    setFormComplete(false);
  };

  const handleNewEvaluation = () => {
    setSelectedEvaluation(null);
    setShowResults(false);
    setFormComplete(false);
    setAnswers({});
    setShowingHistoryView(false);
    if (formSections.length > 0) {
      setCurrentSection(formSections[0].title);
    }
  };

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
  const selectedFormTitle = availableForms.find(f => f.id === selectedFormId)?.titulo || "Formulário";
  const isLastSection = formSections.findIndex(section => section.title === currentSection) === formSections.length - 1;

  const handleSaveAndComplete = () => {
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

  const handleDeleteEvaluation = async (evaluationId: string) => {
    try {
      // Chamar o serviço para excluir a avaliação no banco de dados
      await deleteFormEvaluation(evaluationId);
      
      // Atualizar o estado local para refletir a exclusão
      setEvaluationHistory(prev => prev.filter(evaluation => evaluation.id !== evaluationId));
      
      // Limpar o estado se a avaliação selecionada foi excluída
      if (selectedEvaluation && selectedEvaluation.id === evaluationId) {
        setSelectedEvaluation(null);
        setShowResults(false);
      }
      
      // Recarregar o histórico para garantir sincronização com o banco de dados
      if (selectedEmployeeId) {
        await loadEmployeeHistory();
      }
      
      toast({
        title: "Sucesso",
        description: "Avaliação excluída com sucesso.",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao excluir avaliação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a avaliação.",
        variant: "destructive",
      });
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
            evaluationHistory={evaluationHistory}
            formComplete={formComplete}
            isSubmitting={isSubmitting}
            isLastSection={isLastSection}
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
          />
        )}
      </div>
    </Layout>
  );
};

export default FormularioPage;
