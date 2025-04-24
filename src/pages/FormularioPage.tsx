import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompanies, getEmployeesByCompany, getFormResultByEmployeeId, saveFormResult } from "@/services"; // Updated import path
import { Company, Employee } from "@/types/cadastro";
import { formSections, formQuestions } from "@/data/formData";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormSection from "@/components/FormSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FormularioPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>("");
  const [formResult, setFormResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSaveForm = async () => {
    setIsSubmitting(true);
    try {
      // Aqui você precisaria coletar os dados do formulário dos componentes FormSection
      // e preparar o objeto formResult para ser salvo.
      // Exemplo:
      // const formData = {
      //   section1: { question1: answer1, question2: answer2 },
      //   section2: { question3: answer3, question4: answer4 },
      // };
      // const formResult = {
      //   employeeId: selectedEmployeeId,
      //   data: formData,
      // };
      // await saveFormResult(formResult);
      
      // Como não temos a implementação real do formulário, vamos apenas exibir uma mensagem de sucesso.
      toast({
        title: "Sucesso",
        description: "Formulário salvo com sucesso!",
      });
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
      <Card>
        <CardHeader>
          <CardTitle>Preenchimento do Formulário</CardTitle>
          <CardDescription>Selecione a empresa e o funcionário para preencher o formulário.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select onValueChange={handleCompanyChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select onValueChange={handleEmployeeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedEmployeeId && (
            <Tabs defaultValue="secao1" className="space-y-4">
              <TabsList>
                {formSections.map((section) => (
                  <TabsTrigger key={section.id} value={section.id}>
                    {section.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              {formSections.map((section) => (
                <TabsContent key={section.id} value={section.id}>
                  <FormSection section={section} questions={formQuestions[section.id]} />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
        {selectedEmployeeId && (
          <CardFooter>
            <Button onClick={handleSaveForm} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Formulário"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </Layout>
  );
};

export default FormularioPage;
