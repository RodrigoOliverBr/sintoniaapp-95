
import React from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import FormSelector from "@/components/form/FormSelector";
import EmployeeFormHistory from "@/components/form/EmployeeFormHistory";
import FormContent from "@/components/form/FormContent";
import FormActions from "@/components/form/FormActions";
import { useFormData } from "@/hooks/useFormData";
import { useFormSubmission } from "@/hooks/useFormSubmission";

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
    isLoadingHistory,
    showingHistoryView,
    setShowingHistoryView
  } = useFormData();

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

  const handleAnswerChange = (questionId: string, answer: boolean | null) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], questionId, answer: answer === null ? false : answer }
    }));
  };

  const handleObservationChange = (questionId: string, observation: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], questionId, observation }
    }));
  };

  const handleOptionsChange = (questionId: string, selectedOptions: string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], questionId, selectedOptions }
    }));
  };

  const handleAnalystNotesChange = (notes: string) => {
    if (formResult) {
      setFormResult({
        ...formResult,
        notas_analista: notes,
        analyistNotes: notes
      });
    }
  };

  const moveToNextSection = () => {
    const currentSectionIndex = formSections.findIndex(section => section.title === currentSection);
    if (currentSectionIndex < formSections.length - 1) {
      setCurrentSection(formSections[currentSectionIndex + 1].title);
      return true;
    }
    return false;
  };

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
        moveToNextSection
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
          const hasMoreSections = moveToNextSection();
          if (!hasMoreSections) {
            setFormComplete(true);
          }
        },
        moveToNextSection
      }
    );
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

  return (
    <Layout title="Formulário">
      <div className="container mx-auto py-6 space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-muted/40">
            <CardTitle className="text-2xl text-primary">
              {showResults ? "Resultado da Avaliação" : "Preenchimento do Formulário"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {showResults 
                ? "Visualize os resultados da avaliação e adicione suas observações." 
                : "Selecione a empresa, o funcionário e o formulário para preencher."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <FormSelector
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

            {selectedEmployeeId && selectedEmployee && selectedFormId && (
              <div className="mt-6">
                {!showResults && showingHistoryView ? (
                  <EmployeeFormHistory
                    evaluations={evaluationHistory}
                    onShowResults={(evaluation) => {
                      setSelectedEvaluation(evaluation);
                      setShowResults(true);
                      setShowingHistoryView(true);
                    }}
                    onNewEvaluation={handleNewEvaluation}
                  />
                ) : (
                  <FormContent 
                    showResults={showResults}
                    showingHistoryView={showingHistoryView}
                    selectedEmployee={selectedEmployee}
                    selectedFormTitle={selectedFormTitle}
                    currentSection={currentSection}
                    formSections={formSections}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                    onObservationChange={handleObservationChange}
                    onOptionsChange={handleOptionsChange}
                    selectedEvaluation={selectedEvaluation}
                    formResult={formResult}
                    questions={questions}
                    onNotesChange={handleAnalystNotesChange}
                  />
                )}
              </div>
            )}
          </CardContent>

          {selectedEmployeeId && selectedFormId && !isLoadingHistory && (
            <FormActions
              showResults={showResults}
              formComplete={formComplete}
              isSubmitting={isSubmitting}
              isLastSection={isLastSection}
              showingHistory={showingHistoryView && !showResults}
              onNewEvaluation={handleNewEvaluation}
              onShowResults={() => setShowResults(true)}
              onCompleteForm={handleSaveAndComplete}
              onSaveForm={handleSaveAndContinue}
            />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default FormularioPage;
