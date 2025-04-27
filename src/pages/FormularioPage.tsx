import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCompanies, getEmployeesByCompany } from "@/services";
import { getFormQuestions, getFormResultByEmployeeId, saveFormResult } from "@/services/form/formService";
import { Company, Employee } from "@/types/cadastro";
import { Question, FormAnswer, FormResult, Section } from "@/types/form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormSection from "@/components/FormSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProgressHeader from "@/components/form/ProgressHeader";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";

const FormularioPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>("");
  const [formResult, setFormResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, FormAnswer>>({});
  const [currentSection, setCurrentSection] = useState<string>("");
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
  }, [toast]);

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
      if (selectedEmployeeId) {
        try {
          const formResultData = await getFormResultByEmployeeId(selectedEmployeeId);
          setFormResult(formResultData);
          
          if (formResultData && formResultData.answers) {
            setAnswers(formResultData.answers);
          } else {
            setAnswers({});
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
      }
    };

    loadFormResult();
  }, [selectedEmployeeId, toast]);

  useEffect(() => {
    const loadFormQuestions = async () => {
      try {
        const formId = 'a3b97a26-405e-4e13-9339-557db4099351';
        
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('secoes')
          .select('*')
          .eq('formulario_id', formId)
          .order('ordem', { ascending: true });
        
        if (sectionsError) throw sectionsError;
        
        const sectionsMap = sectionsData.reduce((acc, section) => {
          acc[section.id] = section;
          return acc;
        }, {} as Record<string, Section>);
        
        const questionsData = await getFormQuestions(formId);
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
  }, [toast]);

  const handleCompanyChange = (value: string) => {
    setSelectedCompanyId(value);
    setSelectedEmployeeId(undefined);
  };

  const handleEmployeeChange = (value: string) => {
    setSelectedEmployeeId(value);
  };

  const [questions, setQuestions] = useState<Question[]>([]);
  const [formSections, setFormSections] = useState<{title: string, description?: string, ordem: number, questions: Question[]}[]>([]);
  
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

  const handleSaveForm = async () => {
    setIsSubmitting(true);
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
      
      const formResultData: FormResult = {
        id: '',
        employeeId: selectedEmployeeId!,
        empresa_id: selectedCompanyId!,
        answers,
        total_sim: totalYes,
        total_nao: totalNo,
        is_complete: true,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await saveFormResult(formResultData);
      
      toast({
        title: "Sucesso",
        description: "Formulário salvo com sucesso!",
      });
      
      setFormResult(formResultData);

      const currentIndex = formSections.findIndex(s => s.title === currentSection);
      if (currentIndex < formSections.length - 1) {
        setCurrentSection(formSections[currentIndex + 1].title);
      } else {
        toast({
          title: "Parabéns!",
          description: "Você completou todas as seções do formulário!",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar o formulário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o formulário",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Formulário">
      <div className="container mx-auto py-6 space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-muted/40">
            <CardTitle className="text-2xl text-primary">Preenchimento do Formulário</CardTitle>
            <CardDescription className="text-muted-foreground">
              Selecione a empresa e o funcionário para preencher o formulário.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
            </div>

            {selectedEmployeeId && selectedEmployee && (
              <div className="mt-6">
                <ProgressHeader 
                  employeeName={selectedEmployee.name}
                  jobRole={selectedEmployee.role || ""}
                  currentSection={formSections.findIndex(s => s.title === currentSection) + 1}
                  totalSections={formSections.length}
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
              </div>
            )}
          </CardContent>

          {selectedEmployeeId && (
            <div className="flex justify-end p-6 bg-muted/40 border-t">
              <Button 
                onClick={handleSaveForm} 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Salvando..." : "Salvar Formulário"}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default FormularioPage;
