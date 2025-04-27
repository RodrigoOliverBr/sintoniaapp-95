import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCompanies, getEmployeesByCompany } from "@/services";
import { getFormQuestions, getFormResultByEmployeeId, saveFormResult, getAllForms } from "@/services/form/formService";
import { Company, Employee } from "@/types/cadastro";
import { Question, FormAnswer, FormResult, Section, Form } from "@/types/form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormSection from "@/components/FormSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProgressHeader from "@/components/form/ProgressHeader";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";
import { AlertTriangle } from "lucide-react";
import FormResults from "@/components/FormResults";

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
  }, [toast]);

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
  }, [selectedCompanyId, toast]);

  useEffect(() => {
    const loadFormResult = async () => {
      if (selectedEmployeeId && selectedFormId) {
        try {
          const formResultData = await getFormResultByEmployeeId(selectedEmployeeId, selectedFormId);
          setFormResult(formResultData);
          
          if (formResultData && formResultData.answers) {
            setAnswers(formResultData.answers);
            if (formResultData.is_complete) {
              setShowResults(true);
            } else {
              setShowResults(false);
            }
          } else {
            setAnswers({});
            setShowResults(false);
          }
        } catch (error) {
          console.error("Erro ao carregar resultado do formulário:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar o resultado do formulário",
            variant: "destructive",
          });
        }
      } else {
        setFormResult(null);
        setAnswers({});
        setShowResults(false);
      }
    };

    loadFormResult();
  }, [selectedEmployeeId, selectedFormId, toast]);

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
        
        const sectionsMap = sectionsData.reduce((acc, section) => {
          acc[section.id] = section;
          return acc;
        }, {} as Record<string, Section>);
        
        const questionsData = await getFormQuestions(selectedFormId);
        setQuestions(questionsData);
        
        const sectionGroups = sectionsData.map(section => {
          return {
            title: section.titulo,
            description: section.descricao,
            ordem: section.ordem || 0,
            questions: questionsData.filter(q => q.secao_id === section.id)
          };
        });
        
        const orderedSections = sectionGroups.sort((a, b) => a.ordem - b.ordem);
        setFormSections(orderedSections);
        
        setCurrentSection("");
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
  }, [selectedFormId, toast]);

  const handleCompanyChange = (value: string) => {
    setSelectedCompanyId(value);
    setSelectedEmployeeId(undefined);
    setShowResults(false);
  };

  const handleEmployeeChange = (value: string) => {
    setSelectedEmployeeId(value);
  };

  const handleFormChange = (value: string) => {
    setSelectedFormId(value);
    setAnswers({});
    setCurrentSection("");
    setError(null);
    setShowResults(false);
  };
  
  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  useEffect(() => {
    if (formSections.length > 0 && !currentSection) {
      setCurrentSection(formSections[0].title);
    }
  }, [formSections, currentSection]);

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

  const handleSaveForm = async () => {
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
      
      const isComplete = true;
      
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

      if (isComplete) {
        setShowResults(true);
      } else {
        const currentIndex = formSections.findIndex(s => s.title === currentSection);
        if (currentIndex < formSections.length - 1) {
          setCurrentSection(formSections[currentIndex + 1].title);
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

  const handleNewEvaluation = () => {
    setShowResults(false);
    setAnswers({});
    if (formSections.length > 0) {
      setCurrentSection(formSections[0].title);
    }
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                <Select onValueChange={handleCompanyChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="max-h-[200px]">
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Funcionário</label>
                <Select onValueChange={handleEmployeeChange} value={selectedEmployeeId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="max-h-[200px]">
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Formulário</label>
                <Select onValueChange={handleFormChange} value={selectedFormId} disabled={availableForms.length <= 1}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o formulário" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="max-h-[200px]">
                      {availableForms.map((form) => (
                        <SelectItem key={form.id} value={form.id}>
                          {form.titulo}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedEmployeeId && selectedEmployee && selectedFormId && (
              <div className="mt-6">
                {!showResults ? (
                  <>
                    <ProgressHeader 
                      employeeName={selectedEmployee.name}
                      jobRole={selectedEmployee.role || ""}
                      currentSection={formSections.findIndex(s => s.title === currentSection) + 1}
                      totalSections={formSections.length}
                      formTitle={selectedFormTitle}
                    />

                    <div className="space-y-6">
                      <ScrollArea className="w-full">
                        <ToggleGroup
                          type="single"
                          value={currentSection}
                          onValueChange={(value) => value && setCurrentSection(value)}
                          className="flex justify-start p-1 bg-muted/40 rounded-lg w-full"
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
                ) : (
                  <FormResults 
                    result={formResult!} 
                    questions={questions}
                    onNotesChange={handleAnalystNotesChange} 
                  />
                )}
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md flex items-center gap-2 mt-6">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <p>{error}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          {selectedEmployeeId && selectedFormId && (
            <div className="flex justify-end p-6 bg-muted/40 border-t">
              {showResults ? (
                <Button 
                  onClick={handleNewEvaluation}
                  variant="outline"
                  className="w-full sm:w-auto mr-2"
                >
                  Nova Avaliação
                </Button>
              ) : null}
              
              <Button 
                onClick={handleSaveForm} 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Salvando..." : showResults ? "Atualizar Resultados" : "Salvar Formulário"}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default FormularioPage;
