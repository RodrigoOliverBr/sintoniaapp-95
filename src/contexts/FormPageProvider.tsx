
import React, { useState, useEffect, useCallback } from "react";
import { FormPageContext } from "./FormPageContext";
import { useFormSelections } from "@/hooks/form/useFormSelections";
import { FormResult, Section, Question } from "@/types/form";
import { getFormSections, getFormQuestions, getEmployeeEvaluations, deleteEvaluation, getEvaluationById } from "@/services/form/formService";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

interface FormPageProviderProps {
  children: React.ReactNode;
}

export const FormPageProvider: React.FC<FormPageProviderProps> = ({ children }) => {
  const { toast } = useToast();
  
  // Form selections from hook
  const {
    companies,
    employees,
    availableForms,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedEmployeeId,
    setSelectedEmployeeId,
    selectedFormId,
    setSelectedFormId,
    handleCompanyChange,
    handleEmployeeChange,
    handleFormChange,
    selectedEmployee,
    selectedFormTitle
  } = useFormSelections();
  
  // Form data state
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showForm, setShowForm] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  const [evaluationHistory, setEvaluationHistory] = useState<FormResult[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<FormResult | null>(null);
  const [currentEvaluation, setCurrentEvaluation] = useState<FormResult | null>(null);
  
  // UI state
  const [showingHistoryView, setShowingHistoryView] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isDeletingEvaluation, setIsDeletingEvaluation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewEvaluation, setIsNewEvaluation] = useState(true);
  
  // Load form sections and questions when form ID changes
  useEffect(() => {
    if (selectedFormId) {
      loadFormDetails();
    }
  }, [selectedFormId]);
  
  // Load employee evaluation history when employee ID changes
  useEffect(() => {
    if (selectedEmployeeId) {
      loadEmployeeHistory();
    }
  }, [selectedEmployeeId]);
  
  // Load form details
  const loadFormDetails = async () => {
    try {
      // Get form sections
      const sectionsData = await getFormSections(selectedFormId);
      setSections(sectionsData);
      
      // Get form questions with risk data
      const questionsData = await getFormQuestions(selectedFormId);
      setQuestions(questionsData);
      
      // Initialize answers
      const initialAnswers: Record<string, any> = {};
      questionsData.forEach(question => {
        initialAnswers[question.id] = {
          questionId: question.id,
          answer: false, // Default to "No" as requested
          observation: ""
        };
      });
      
      setAnswers(initialAnswers);
    } catch (error) {
      console.error("Error loading form details:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do formulário",
        variant: "destructive",
      });
    }
  };
  
  // Load employee evaluation history
  const loadEmployeeHistory = async () => {
    if (!selectedEmployeeId) return;
    
    try {
      setIsLoadingHistory(true);
      const history = await getEmployeeEvaluations(selectedEmployeeId);
      setEvaluationHistory(history);
      
      // If there are evaluations, show history view
      if (history.length > 0 && !showForm && !showResults) {
        setShowingHistoryView(true);
      }
    } catch (error) {
      console.error("Error loading employee history:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de avaliações",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };
  
  // Delete evaluation
  const handleDeleteEvaluation = async (evaluationId: string) => {
    try {
      setIsDeletingEvaluation(true);
      await deleteEvaluation(evaluationId);
      
      // Refresh the history
      await loadEmployeeHistory();
      
      sonnerToast.success("Avaliação excluída com sucesso");
      
      // Reset state if deleted evaluation is the selected one
      if (selectedEvaluation?.id === evaluationId) {
        setSelectedEvaluation(null);
        setShowResults(false);
      }
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a avaliação",
        variant: "destructive",
      });
    } finally {
      setIsDeletingEvaluation(false);
    }
  };
  
  // Start a new evaluation
  const handleNewEvaluation = useCallback(() => {
    setIsNewEvaluation(true);
    setSelectedEvaluation(null);
    setCurrentEvaluation(null);
    setShowingHistoryView(false);
    setShowResults(false);
    setShowForm(true);
    setFormComplete(false);
    
    // Reset answers to default "No"
    const initialAnswers: Record<string, any> = {};
    questions.forEach(question => {
      initialAnswers[question.id] = {
        questionId: question.id,
        answer: false, // Default to "No" as requested
        observation: ""
      };
    });
    
    setAnswers(initialAnswers);
  }, [questions]);
  
  // Handle going back from results view
  const handleExitResults = useCallback(() => {
    if (showingHistoryView) {
      setShowResults(false);
      setShowingHistoryView(true);
    } else {
      setShowResults(false);
      setShowForm(true);
    }
  }, [showingHistoryView]);
  
  // Save and complete the form
  const handleSaveAndComplete = useCallback(async () => {
    if (!selectedEmployeeId || !selectedCompanyId || !selectedFormId) {
      toast({
        title: "Atenção",
        description: "Selecione empresa, funcionário e formulário antes de continuar",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Count yes/no answers
      let totalYes = 0;
      let totalNo = 0;
      
      Object.values(answers).forEach(answer => {
        if (answer.answer === true) totalYes++;
        else if (answer.answer === false) totalNo++;
      });
      
      // Prepare evaluation data
      const evaluationData = {
        id: selectedEvaluation?.id,
        funcionario_id: selectedEmployeeId,
        empresa_id: selectedCompanyId,
        formulario_id: selectedFormId,
        total_sim: totalYes,
        total_nao: totalNo,
        is_complete: true,
        notas_analista: currentEvaluation?.notas_analista || selectedEvaluation?.notas_analista || "",
        answers
      };
      
      // Save the evaluation using formService
      const evaluationId = await saveFormResult(evaluationData);
      console.log("Saved evaluation with ID:", evaluationId);
      
      // Show success message
      sonnerToast.success("Avaliação salva com sucesso");
      
      // Load the complete evaluation with answers
      const savedEvaluation = await getEvaluationById(evaluationId);
      
      if (savedEvaluation) {
        setCurrentEvaluation(savedEvaluation);
        setSelectedEvaluation(savedEvaluation);
        setShowResults(true);
        setShowForm(false);
        setFormComplete(true);
      }
      
      // Refresh the evaluation history
      await loadEmployeeHistory();
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o formulário",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedEmployeeId, 
    selectedCompanyId, 
    selectedFormId, 
    answers,
    selectedEvaluation,
    currentEvaluation,
    toast
  ]);
  
  // Save and exit
  const handleSaveAndExit = useCallback(async () => {
    if (!selectedEmployeeId || !selectedCompanyId || !selectedFormId) {
      toast({
        title: "Atenção",
        description: "Selecione empresa, funcionário e formulário antes de continuar",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Count yes/no answers
      let totalYes = 0;
      let totalNo = 0;
      
      Object.values(answers).forEach(answer => {
        if (answer.answer === true) totalYes++;
        else if (answer.answer === false) totalNo++;
      });
      
      // Prepare evaluation data - incomplete
      const evaluationData = {
        id: selectedEvaluation?.id,
        funcionario_id: selectedEmployeeId,
        empresa_id: selectedCompanyId,
        formulario_id: selectedFormId,
        total_sim: totalYes,
        total_nao: totalNo,
        is_complete: false, // Save as incomplete
        notas_analista: currentEvaluation?.notas_analista || selectedEvaluation?.notas_analista || "",
        answers
      };
      
      // Save the evaluation
      await saveFormResult(evaluationData);
      
      // Show success message
      sonnerToast.success("Avaliação salva com sucesso");
      
      // Reset form state
      setShowForm(false);
      setShowResults(false);
      setShowingHistoryView(false);
      setSelectedEvaluation(null);
      setCurrentEvaluation(null);
      
      // Refresh evaluation history
      await loadEmployeeHistory();
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o formulário",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedEmployeeId, 
    selectedCompanyId, 
    selectedFormId, 
    answers,
    selectedEvaluation,
    currentEvaluation,
    toast
  ]);

  // The context value
  const formPageData = {
    // Form selections
    companies,
    employees,
    availableForms,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedEmployeeId,
    setSelectedEmployeeId,
    selectedFormId,
    setSelectedFormId,
    
    // Form data
    sections,
    questions,
    answers,
    setAnswers,
    showForm,
    setShowForm,
    showResults,
    setShowResults,
    formComplete,
    setFormComplete,
    currentEvaluation,
    setCurrentEvaluation,
    
    // History
    evaluationHistory,
    selectedEvaluation,
    setSelectedEvaluation,
    showingHistoryView,
    setShowingHistoryView,
    isLoadingHistory,
    isDeletingEvaluation,
    
    // Actions
    handleCompanyChange,
    handleEmployeeChange,
    handleFormChange,
    handleNewEvaluation,
    handleExitResults,
    handleSaveAndComplete,
    handleSaveAndExit,
    handleDeleteEvaluation,
    loadEmployeeHistory,
    
    // Status
    isSubmitting,
    isNewEvaluation,
    setIsNewEvaluation,
    
    // Derived data
    selectedEmployee,
    selectedFormTitle
  };
  
  return (
    <FormPageContext.Provider value={formPageData}>
      {children}
    </FormPageContext.Provider>
  );
};
