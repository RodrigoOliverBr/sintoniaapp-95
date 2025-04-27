import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getFormQuestions, getAllForms } from "@/services/form";
import { getEmployeeFormHistory, getFormResultByEmployeeId, saveFormResult } from "@/services/form";
import { getCompanies, getEmployeesByCompany } from "@/services";
import { Company, Employee } from "@/types/cadastro";
import { Question, FormAnswer, FormResult, Form, Section } from "@/types/form";
import { useToast } from "@/hooks/use-toast";
import FormSection from "@/components/FormSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProgressHeader from "@/components/form/ProgressHeader";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import FormResults from "@/components/FormResults";
import FormSelector from "@/components/form/FormSelector";
import FormActions from "@/components/form/FormActions";
import EmployeeFormHistory from "@/components/form/EmployeeFormHistory";
import { toast as sonnerToast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const FormularioPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>("");
  const [formResult, setFormResult] = useState<FormResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, FormAnswer>>({});
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

    loadCompanies();
    loadAvailableForms();
  }, []);

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

  useEffect(() => {
    const loadEmployees = async () => {
      if (selectedCompanyId) {
        try {
          const employeesData = await getEmployeesByCompany(selectedCompanyId);
          setEmployees(employeesData);
        } catch (error) {
          console.error("Erro ao carregar funcionários:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os funcionários",
            variant: "destructive",
          });
        }
      } else {
        setEmployees([]);
      }
    };

    loadEmployees();
  }, [selectedCompanyId]);

  useEffect(() => {
    const loadEmployeeHistory = async () => {
      if (selectedEmployeeId) {
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
      }
    };

    loadEmployeeHistory();

    setCurrentSection("");
    setFormResult(null);
  }, [selectedEmployeeId]);

  useEffect(() => {
    const loadFormQuestions = async () => {
      if (!selectedFormId) return;
      
      try {
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('secoes')
          .select('*')
          .eq('formulario_id', selectedFormId)
          .order('ordem', { ascending: true });
        
        if (sectionsError) throw sectionsError;
        
        console.log('Fetched sections:', sectionsData.length, sectionsData);
        
        const sectionsMap = sectionsData.reduce((acc, section) => {
          acc[section.id] = section;
          return acc;
        }, {} as Record<string, Section>);
        
        const questionsData = await getFormQuestions(selectedFormId);
        setQuestions(questionsData);
        
        console.log('Fetched questions:', questionsData.length);
        
        const sectionGroups = sectionsData.map(section => {
          const sectionQuestions = questionsData.filter(q => q.secao_id === section.id);
          console.log(`Section ${section.titulo} has ${sectionQuestions.length} questions`);
          
          return {
            title: section.titulo,
            description: section.descricao,
            ordem: section.ordem || 0,
            questions: sectionQuestions
          };
        });
        
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

    loadFormQuestions();
  }, [selectedFormId]);

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
    setError(null);
    setShowResults(false);
    setFormComplete(false);
  };
  
  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  useEffect(() => {
    if (formSections.length > 0 && !currentSection) {
      setCurrentSection(formSections[0].title);
    }
  }, [formSections]);

  const handleAnswerChange = (questionId: string, answer: boolean | null) => {
    setAnswers(prev => {
      const result = { ...prev };
      if (!result[questionId]) {
        result[questionId] = { questionId, answer: answer === null ? false : answer, observation: '' };
      } else {
        result[questionId] = { ...result[questionId], answer: answer === null ? false : answer };
      }
      return result;
    });
  };

  const handleObservationChange = (questionId: string, observation: string) => {
    setAnswers(prev => {
      const result: Record<string, FormAnswer> = { ...prev };
      
      if (!result[questionId]) {
        result[questionId] = { questionId, answer: false, observation };
      } else {
        result[questionId] = { ...result[questionId], observation };
      }
      
      return result;
    });
  };

  const handleOptionsChange = (questionId: string, selectedOptions: string[]) => {
    setAnswers(prev => {
      const result: Record<string, FormAnswer> = { ...prev };
      
      if (!result[questionId]) {
        result[questionId] = { questionId, answer: false, selectedOptions };
      } else {
        result[questionId] = { ...result[questionId], selectedOptions };
      }
      
      return result;
    });
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

  const handleSaveForm = async (completeForm: boolean = false) => {
    if (!selectedFormId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um formulário",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      let totalYes = 0;
      let totalNo = 0;
      
      Object.values(answers).forEach(answer => {
        if (answer.answer === true) {
          totalYes++;
        } else if (answer.answer === false) {
          totalNo++;
        }
      });
      
      const isComplete = completeForm;
      
      const formResultData: FormResult = {
        id: formResult?.id || '',
        employeeId: selectedEmployeeId!,
        empresa_id: selectedCompanyId!,
        formulario_id: selectedFormId,
        answers,
        total_sim: totalYes,
        total_nao: totalNo,
        notas_analista: formResult?.notas_analista || '',
        is_complete: isComplete,
        last_updated: new Date().toISOString(),
        created_at: formResult?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await saveFormResult(formResultData);
      
      sonnerToast.success("Formulário salvo com sucesso!");
      
      const updatedResult = await getFormResultByEmployeeId(selectedEmployeeId!, selectedFormId);
      setFormResult(updatedResult);

      const history = await getEmployeeFormHistory(selectedEmployeeId!);
      setEvaluationHistory(history);

      if (completeForm) {
        setShowResults(true);
        setFormComplete(true);
        setSelectedEvaluation(updatedResult);
      } else {
        const hasMoreSections = moveToNextSection();
        if (!hasMoreSections) {
          setFormComplete(true);
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar o formulário:", error);
      setError(error?.message || "Não foi possível salvar o formulário");
      toast({
        title: "Erro",
        description: "Não foi possível salvar o formulário",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteForm = () => {
    handleSaveForm(true);
  };

  const handleShowResults = (evaluation: FormResult) => {
    setSelectedEvaluation(evaluation);
    setShowResults(true);
    setShowingHistoryView(true);
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

  const isLastSection = () => {
    const currentSectionIndex = formSections.findIndex(section => section.title === currentSection);
    return currentSectionIndex === formSections.length - 1;
  };

  const selectedFormTitle = availableForms.find(f => f.id === selectedFormId)?.titulo || "Formulário";
  
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
                {!showResults ? (
                  showingHistoryView ? (
                    <EmployeeFormHistory
                      evaluations={evaluationHistory}
                      onShowResults={handleShowResults}
                      onNewEvaluation={handleNewEvaluation}
                    />
                  ) : (
                    <>
                      <ProgressHeader 
                        employeeName={selectedEmployee.name}
                        jobRole={selectedEmployee.role || ""}
                        currentSection={formSections.findIndex(s => s.title === currentSection) + 1}
                        totalSections={formSections.length}
                        formTitle={selectedFormTitle}
                      />

                      <div className="space-y-6">
                        <ScrollArea className="w-full overflow-auto">
                          <ToggleGroup
                            type="single"
                            value={currentSection}
                            onValueChange={(value) => value && setCurrentSection(value)}
                            className="flex justify-start p-1 bg-muted/40 rounded-lg w-full min-w-max"
                          >
                            {formSections.map((section) => (
                              <ToggleGroupItem
                                key={section.title}
                                value={section.title}
                                className="flex-1 whitespace-nowrap px-4"
                              >
                                {section.title}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        </ScrollArea>

                        {formSections.map((section) => (
                          section.title === currentSection && (
                            <FormSection
                              key={section.title}
                              section={section}
                              answers={answers}
                              onAnswerChange={handleAnswerChange}
                              onObservationChange={handleObservationChange}
                              onOptionsChange={handleOptionsChange}
                            />
                          )
                        ))}
                      </div>
                    </>
                  )
                ) : (
                  <FormResults 
                    result={selectedEvaluation || formResult!}
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
              isLastSection={isLastSection()}
              showingHistory={showingHistoryView && !showResults}
              onNewEvaluation={handleNewEvaluation}
              onShowResults={() => setShowResults(true)}
              onCompleteForm={handleCompleteForm}
              onSaveForm={() => handleSaveForm(false)}
            />
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default FormularioPage;
