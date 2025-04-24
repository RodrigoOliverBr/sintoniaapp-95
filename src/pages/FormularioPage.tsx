import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCompanies, getEmployeesByCompany, getFormResultByEmployeeId, saveFormResult } from "@/services"; 
import { Company, Employee } from "@/types/cadastro";
import { formSections, formData } from "@/data/formData";
import { FormAnswer } from "@/types/form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormSection from "@/components/FormSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const FormularioPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>("");
  const [formResult, setFormResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<number, FormAnswer>>({});
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
          
          // Initialize answers from loaded form result if available
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

  const handleCompanyChange = (value: string) => {
    setSelectedCompanyId(value);
    setSelectedEmployeeId(undefined);
  };

  const handleEmployeeChange = (value: string) => {
    setSelectedEmployeeId(value);
  };

  const handleAnswerChange = (questionId: number, answer: boolean | null) => {
    setAnswers(prev => {
      // Create a safe copy to work with
      const result: Record<number, FormAnswer> = { ...prev };
      
      // If the current entry doesn't exist, create it
      if (!result[questionId]) {
        result[questionId] = { questionId, answer: answer === null ? false : answer, observation: '' };
      } else {
        // Update the existing entry
        result[questionId] = { ...result[questionId], answer: answer === null ? false : answer };
      }
      
      return result;
    });
  };

  const handleObservationChange = (questionId: number, observation: string) => {
    setAnswers(prev => {
      // Create a safe copy to work with
      const result: Record<number, FormAnswer> = { ...prev };
      
      // If the current entry doesn't exist, create it
      if (!result[questionId]) {
        result[questionId] = { questionId, answer: false, observation };
      } else {
        // Update the existing entry
        result[questionId] = { ...result[questionId], observation };
      }
      
      return result;
    });
  };

  const handleOptionsChange = (questionId: number, selectedOptions: string[]) => {
    setAnswers(prev => {
      // Create a safe copy to work with
      const result: Record<number, FormAnswer> = { ...prev };
      
      // If the current entry doesn't exist, create it
      if (!result[questionId]) {
        result[questionId] = { questionId, answer: false, selectedOptions };
      } else {
        // Update the existing entry
        result[questionId] = { ...result[questionId], selectedOptions };
      }
      
      return result;
    });
  };

  const handleSaveForm = async () => {
    setIsSubmitting(true);
    try {
      // Calculate summary statistics
      let totalYes = 0;
      let totalNo = 0;
      let severityCounts = {
        "LEVEMENTE PREJUDICIAL": 0,
        "PREJUDICIAL": 0,
        "EXTREMAMENTE PREJUDICIAL": 0
      };
      
      let yesPerSeverity = {
        "LEVEMENTE PREJUDICIAL": 0,
        "PREJUDICIAL": 0,
        "EXTREMAMENTE PREJUDICIAL": 0
      };
      
      // Count answers by severity
      formData.sections.forEach(section => {
        section.questions.forEach(question => {
          const answer = answers[question.id];
          if (answer) {
            if (answer.answer === true) {
              totalYes++;
              yesPerSeverity[question.severity]++;
            } else if (answer.answer === false) {
              totalNo++;
            }
          }
        });
      });
      
      // Prepare form result object
      const formResultData = {
        employeeId: selectedEmployeeId,
        answers,
        totalYes,
        totalNo,
        severityCounts,
        yesPerSeverity,
        isComplete: true,
        lastUpdated: Date.now(),
        analyistNotes: ""
      };
      
      await saveFormResult(formResultData);
      
      toast({
        title: "Sucesso",
        description: "Formulário salvo com sucesso!",
      });
      
      // Refresh form result data
      setFormResult(formResultData);
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

            {selectedEmployeeId && (
              <div className="mt-6">
                <Tabs defaultValue={formSections[0]?.title} className="w-full">
                  <ScrollArea className="w-full">
                    <TabsList className="w-full justify-start mb-6 bg-muted/40 p-1 rounded-lg flex-wrap">
                      {formSections.map((section) => (
                        <TabsTrigger
                          key={section.title}
                          value={section.title}
                          className="px-4 py-2 text-sm"
                        >
                          {section.title}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </ScrollArea>

                  {formSections.map((section) => {
                    const dataSection = formData.sections.find(s => s.title === section.title);
                    return (
                      <TabsContent key={section.title} value={section.title}>
                        {dataSection && (
                          <FormSection
                            section={dataSection}
                            answers={answers}
                            onAnswerChange={handleAnswerChange}
                            onObservationChange={handleObservationChange}
                            onOptionsChange={handleOptionsChange}
                          />
                        )}
                      </TabsContent>
                    );
                  })}
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
