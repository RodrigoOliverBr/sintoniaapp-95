
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Company, Employee } from "@/types/cadastro";
import { Form, Section, Question, FormResult, Answer } from "@/types/form";
import { getAllForms, getFormSections, getFormQuestions, saveFormResult, getEmployeeEvaluations, getEvaluationById, deleteEvaluation } from "@/services/form/formService";

export function useFormPage() {
  // Toast notifications
  const { toast } = useToast();

  // Selection state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>();
  const [selectedFormId, setSelectedFormId] = useState<string | undefined>();
  
  // Form state
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  
  // Answers state
  const [answers, setAnswers] = useState<Record<string, { answer: boolean | null; observation: string }>>({});
  
  // Evaluation state
  const [evaluationHistory, setEvaluationHistory] = useState<FormResult[]>([]);
  const [currentEvaluation, setCurrentEvaluation] = useState<FormResult | null>(null);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [isEditingEvaluation, setIsEditingEvaluation] = useState(false);
  
  // UI state
  const [showForm, setShowForm] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Load companies on mount
  useEffect(() => {
    loadCompanies();
    loadForms();
  }, []);
  
  // Load employees when company is selected
  useEffect(() => {
    if (selectedCompanyId) {
      loadEmployees(selectedCompanyId);
    } else {
      setEmployees([]);
      setSelectedEmployeeId(undefined);
    }
  }, [selectedCompanyId]);
  
  // Load form details when form is selected
  useEffect(() => {
    if (selectedFormId) {
      loadFormDetails(selectedFormId);
    } else {
      setSections([]);
      setQuestions([]);
      setCurrentSectionIndex(0);
    }
  }, [selectedFormId]);
  
  // Load employee evaluation history when employee is selected
  useEffect(() => {
    if (selectedEmployeeId) {
      loadEmployeeHistory();
    } else {
      setEvaluationHistory([]);
      setCurrentEvaluation(null);
    }
  }, [selectedEmployeeId]);
  
  // Reset form state when changes occur
  useEffect(() => {
    // Reset form state when changing selections
    setAnswers({});
    setCurrentEvaluation(null);
    setIsViewingHistory(false);
    setIsEditingEvaluation(false);
    setShowForm(false);
    setShowResults(false);
    setCurrentSectionIndex(0);
  }, [selectedCompanyId, selectedEmployeeId, selectedFormId]);
  
  // Initialize answers with questions
  useEffect(() => {
    if (questions.length > 0 && !isEditingEvaluation) {
      const initialAnswers: Record<string, { answer: boolean | null; observation: string }> = {};
      questions.forEach(question => {
        initialAnswers[question.id] = { answer: null, observation: "" };
      });
      setAnswers(initialAnswers);
    }
  }, [questions, isEditingEvaluation]);
  
  // Load answers when editing an evaluation
  useEffect(() => {
    if (isEditingEvaluation && currentEvaluation && currentEvaluation.respostas) {
      const editAnswers: Record<string, { answer: boolean | null; observation: string }> = {};
      
      // First initialize all questions with null answers
      questions.forEach(question => {
        editAnswers[question.id] = { answer: null, observation: "" };
      });
      
      // Then fill in the actual answers
      currentEvaluation.respostas.forEach(response => {
        editAnswers[response.pergunta_id] = { 
          answer: response.resposta, 
          observation: response.observacao || "" 
        };
      });
      
      setAnswers(editAnswers);
    }
  }, [isEditingEvaluation, currentEvaluation, questions]);

  // API FUNCTIONS

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('empresas').select('*');
      
      if (error) throw error;
      
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadEmployees = async (companyId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('empresa_id', companyId);
      
      if (error) throw error;
      
      setEmployees(data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os funcionários",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadForms = async () => {
    try {
      const forms = await getAllForms();
      setAvailableForms(forms);
    } catch (error) {
      console.error('Error loading forms:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os formulários",
        variant: "destructive",
      });
    }
  };
  
  const loadFormDetails = async (formId: string) => {
    try {
      setIsLoading(true);
      
      // Load sections
      const sectionsData = await getFormSections(formId);
      setSections(sectionsData);
      
      // Load questions with risks
      const questionsData = await getFormQuestions(formId);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error loading form details:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do formulário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadEmployeeHistory = async () => {
    if (!selectedEmployeeId) return;
    
    try {
      setIsLoadingHistory(true);
      const history = await getEmployeeEvaluations(selectedEmployeeId);
      setEvaluationHistory(history);
    } catch (error) {
      console.error('Error loading employee history:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de avaliações",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // ACTION HANDLERS

  const handleCompanyChange = useCallback((companyId: string) => {
    setSelectedCompanyId(companyId);
  }, []);
  
  const handleEmployeeChange = useCallback((employeeId: string) => {
    setSelectedEmployeeId(employeeId);
  }, []);
  
  const handleFormChange = useCallback((formId: string) => {
    setSelectedFormId(formId);
  }, []);
  
  const handleSectionNavigate = useCallback((index: number) => {
    setCurrentSectionIndex(index);
  }, []);
  
  const handleAnswerChange = useCallback((questionId: string, answer: boolean | null) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], answer }
    }));
  }, []);
  
  const handleObservationChange = useCallback((questionId: string, observation: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], observation }
    }));
  }, []);
  
  const handleNotesChange = useCallback((notes: string) => {
    setCurrentEvaluation(prev => prev ? {
      ...prev,
      notas_analista: notes
    } : null);
  }, []);
  
  const handleNewEvaluation = useCallback(() => {
    setCurrentEvaluation(null);
    setIsViewingHistory(false);
    setIsEditingEvaluation(false);
    setShowResults(false);
    setShowForm(true);
    
    // Reset answers
    const initialAnswers: Record<string, { answer: boolean | null; observation: string }> = {};
    questions.forEach(question => {
      initialAnswers[question.id] = { answer: null, observation: "" };
    });
    setAnswers(initialAnswers);
    
    // Start at the first section
    setCurrentSectionIndex(0);
  }, [questions]);
  
  const handleViewEvaluation = useCallback(async (evaluation: FormResult) => {
    try {
      setIsLoading(true);
      
      // Load complete evaluation with answers
      const fullEvaluation = await getEvaluationById(evaluation.id);
      
      if (fullEvaluation) {
        setCurrentEvaluation(fullEvaluation);
        setShowResults(true);
        setShowForm(false);
        setIsViewingHistory(true);
        setIsEditingEvaluation(false);
      }
    } catch (error) {
      console.error('Error loading evaluation details:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da avaliação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleEditEvaluation = useCallback(async (evaluation: FormResult) => {
    try {
      setIsLoading(true);
      
      // Load complete evaluation with answers
      const fullEvaluation = await getEvaluationById(evaluation.id);
      
      if (fullEvaluation) {
        setCurrentEvaluation(fullEvaluation);
        setShowResults(false);
        setShowForm(true);
        setIsViewingHistory(false);
        setIsEditingEvaluation(true);
      }
    } catch (error) {
      console.error('Error loading evaluation for edit:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a avaliação para edição",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleDeleteEvaluation = useCallback(async (evaluationId: string) => {
    try {
      setIsDeleting(true);
      await deleteEvaluation(evaluationId);
      
      sonnerToast.success("Avaliação excluída com sucesso");
      
      // Refresh the history
      await loadEmployeeHistory();
      
      // If the current evaluation was deleted, reset the state
      if (currentEvaluation?.id === evaluationId) {
        setCurrentEvaluation(null);
        setShowResults(false);
        setShowForm(false);
        setIsViewingHistory(false);
        setIsEditingEvaluation(false);
      }
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a avaliação",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [currentEvaluation, loadEmployeeHistory]);
  
  const handleShowHistory = useCallback(() => {
    setShowForm(false);
    setShowResults(false);
    setIsViewingHistory(true);
    setIsEditingEvaluation(false);
  }, []);
  
  const handleSaveAndComplete = useCallback(async () => {
    if (!selectedEmployeeId || !selectedCompanyId || !selectedFormId) {
      sonnerToast.warning("Por favor, selecione empresa, funcionário e formulário antes de continuar");
      return;
    }
    
    // Check if all questions have been answered
    const unansweredQuestions = Object.values(answers).filter(a => a.answer === null);
    
    if (unansweredQuestions.length > 0) {
      sonnerToast.warning(`Por favor, responda todas as ${unansweredQuestions.length} perguntas pendentes antes de concluir`);
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Count yes/no answers
      let totalYes = 0;
      let totalNo = 0;
      
      Object.values(answers).forEach(answer => {
        if (answer.answer === true) totalYes++;
        else if (answer.answer === false) totalNo++;
      });
      
      // Prepare evaluation data
      const evaluationData = {
        id: currentEvaluation?.id,
        funcionario_id: selectedEmployeeId,
        empresa_id: selectedCompanyId,
        formulario_id: selectedFormId,
        total_sim: totalYes,
        total_nao: totalNo,
        is_complete: true,
        notas_analista: currentEvaluation?.notas_analista || "",
        answers
      };
      
      // Save the evaluation
      const evaluationId = await saveFormResult(evaluationData);
      
      // Show success message
      sonnerToast.success("Avaliação salva com sucesso");
      
      // Reload employee history
      await loadEmployeeHistory();
      
      // Load the saved evaluation
      const savedEvaluation = await getEvaluationById(evaluationId);
      
      if (savedEvaluation) {
        setCurrentEvaluation(savedEvaluation);
        setShowResults(true);
        setShowForm(false);
        setIsViewingHistory(false);
        setIsEditingEvaluation(false);
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a avaliação",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [selectedEmployeeId, selectedCompanyId, selectedFormId, answers, currentEvaluation, loadEmployeeHistory]);
  
  // COMPUTED VALUES
  
  const selectedCompany = selectedCompanyId 
    ? companies.find(c => c.id === selectedCompanyId) 
    : undefined;
    
  const selectedEmployee = selectedEmployeeId 
    ? employees.find(e => e.id === selectedEmployeeId) 
    : undefined;
    
  const selectedForm = selectedFormId 
    ? availableForms.find(f => f.id === selectedFormId) 
    : undefined;
    
  const currentSection = sections[currentSectionIndex];
  
  const sectionQuestions = currentSection
    ? questions.filter(q => q.secao_id === currentSection.id)
    : [];
    
  return {
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
    selectedCompany,
    selectedEmployee,
    selectedForm,
    currentSection,
    currentSectionIndex,
    sectionQuestions,
    
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
    setSelectedCompanyId,
    setSelectedEmployeeId,
    setSelectedFormId,
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
    handleSaveAndComplete,
    
    // Helper functions
    loadEmployeeHistory
  };
}
