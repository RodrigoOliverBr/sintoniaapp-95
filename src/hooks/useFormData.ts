
import { useState, useEffect } from "react";
import { Question, Form, FormResult, Section } from "@/types/form";
import { Company, Employee } from "@/types/cadastro";
import { getCompanies, getEmployeesByCompany } from "@/services";
import { getAllForms, getFormQuestions } from "@/services/form";
import { getEmployeeFormHistory } from "@/services/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useFormData() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>("");
  const [formResult, setFormResult] = useState<FormResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentSection, setCurrentSection] = useState<string>("");
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formSections, setFormSections] = useState<{title: string, description?: string, ordem: number, questions: Question[]}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [formComplete, setFormComplete] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<FormResult | null>(null);
  const [evaluationHistory, setEvaluationHistory] = useState<FormResult[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showingHistoryView, setShowingHistoryView] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCompanies();
    loadAvailableForms();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadEmployees();
    } else {
      setEmployees([]);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    if (selectedEmployeeId) {
      loadEmployeeHistory();
    }
  }, [selectedEmployeeId]);

  useEffect(() => {
    if (selectedFormId) {
      loadFormQuestions();
    }
  }, [selectedFormId]);

  useEffect(() => {
    if (formSections.length > 0 && !currentSection) {
      setCurrentSection(formSections[0].title);
    }
  }, [formSections]);

  const loadCompanies = async () => {
    try {
      const companiesData = await getCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas",
        variant: "destructive",
      });
    }
  };

  const loadEmployees = async () => {
    try {
      const employeesData = await getEmployeesByCompany(selectedCompanyId!);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os funcionários",
        variant: "destructive",
      });
    }
  };

  const loadAvailableForms = async () => {
    try {
      const forms = await getAllForms();
      setAvailableForms(forms);
      
      if (forms.length > 0) {
        setSelectedFormId(forms[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar formulários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os formulários disponíveis",
        variant: "destructive",
      });
    }
  };

  const loadEmployeeHistory = async () => {
    if (!selectedEmployeeId) return;

    setIsLoadingHistory(true);
    try {
      const history = await getEmployeeFormHistory(selectedEmployeeId);
      setEvaluationHistory(history);
      setSelectedEvaluation(null);
      setShowResults(false);
      setFormComplete(false);
      setAnswers({});
      
      if (history.length > 0) {
        setShowingHistoryView(true);
      } else {
        setShowingHistoryView(false);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de avaliações",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadFormQuestions = async () => {
    try {
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('secoes')
        .select('*')
        .eq('formulario_id', selectedFormId)
        .order('ordem', { ascending: true });
      
      if (sectionsError) throw sectionsError;
      
      console.log('Fetched sections:', sectionsData.length, sectionsData);
      
      const questionsData = await getFormQuestions(selectedFormId);
      setQuestions(questionsData);
      
      console.log('Fetched questions:', questionsData.length);
      
      const sectionGroups = sectionsData.map(section => ({
        title: section.titulo,
        description: section.descricao,
        ordem: section.ordem || 0,
        questions: questionsData.filter(q => q.secao_id === section.id)
      }));
      
      const orderedSections = sectionGroups.sort((a, b) => a.ordem - b.ordem);
      console.log('Ordered sections:', orderedSections.length, orderedSections.map(s => s.title));
      
      setFormSections(orderedSections);
      
      if (orderedSections.length > 0 && !currentSection) {
        setCurrentSection(orderedSections[0].title);
      }
      
      setError(null);
    } catch (error) {
      console.error("Erro ao carregar perguntas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as perguntas do formulário",
        variant: "destructive",
      });
    }
  };

  return {
    companies,
    employees,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedEmployeeId,
    setSelectedEmployeeId,
    formResult,
    setFormResult,
    isSubmitting,
    setIsSubmitting,
    answers,
    setAnswers,
    currentSection,
    setCurrentSection,
    availableForms,
    selectedFormId,
    setSelectedFormId,
    questions,
    formSections,
    error,
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
    setShowingHistoryView
  };
}
