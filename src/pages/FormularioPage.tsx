import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getJobRoles, getCompanies, getEmployeesByCompany, getEmployees, getFormResultByEmployeeId, saveFormResult } from "@/services/storageService";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { FormAnswer, FormResult } from "@/types/form";
import { formData } from "@/data/formData";
import FormSection from "@/components/FormSection";
import FormResults from "@/components/FormResults";
import { Card } from "@/components/ui/card";
import { Company, Employee, JobRole } from "@/types/cadastro";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowLeft } from "lucide-react";
import NewEmployeeModal from "@/components/modals/NewEmployeeModal";
import { useToast } from "@/hooks/use-toast";

const FormularioPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const employeeIdFromUrl = searchParams.get('employeeId');
  
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);
  const [isEditingExistingResponses, setIsEditingExistingResponses] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formAnswers, setFormAnswers] = useState<Record<number, FormAnswer>>({});
  const [showResults, setShowResults] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formResult, setFormResult] = useState<FormResult>({
    answers: {},
    totalYes: 0,
    totalNo: 0,
    severityCounts: {
      "LEVEMENTE PREJUDICIAL": 0,
      "PREJUDICIAL": 0,
      "EXTREMAMENTE PREJUDICIAL": 0,
    },
    yesPerSeverity: {
      "LEVEMENTE PREJUDICIAL": 0,
      "PREJUDICIAL": 0,
      "EXTREMAMENTE PREJUDICIAL": 0,
    },
    analyistNotes: ""
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const loadedCompanies = await getCompanies();
        setCompanies(loadedCompanies || []);
        
        const loadedJobRoles = await getJobRoles();
        setJobRoles(loadedJobRoles || []);

        if (employeeIdFromUrl) {
          const allEmployees = await getEmployees();
          const employee = allEmployees?.find(e => e.id === employeeIdFromUrl);
          
          if (employee) {
            setSelectedCompanyId(employee.companyId);
            setSelectedEmployeeId(employeeIdFromUrl);
            setSelectedEmployee(employee);
            setIsEditingExistingResponses(true);
            
            const existingResult = getFormResultByEmployeeId(employeeIdFromUrl);
            if (existingResult) {
              setFormAnswers(existingResult.answers);
              setFormResult({
                answers: existingResult.answers,
                totalYes: existingResult.totalYes,
                totalNo: existingResult.totalNo,
                severityCounts: existingResult.severityCounts,
                yesPerSeverity: existingResult.yesPerSeverity,
                analyistNotes: existingResult.analyistNotes
              });
              setShowForm(true);
              if (existingResult.isComplete) {
                setShowResults(true);
              }
            }
          } else {
            toast({
              variant: "destructive",
              title: "Funcionário não encontrado",
              description: "O funcionário especificado não foi encontrado."
            });
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar os dados iniciais."
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [employeeIdFromUrl, toast]);

  useEffect(() => {
    const loadEmployees = async () => {
      if (selectedCompanyId) {
        try {
          const employeesForCompany = await getEmployeesByCompany(selectedCompanyId);
          setEmployees(employeesForCompany || []);
          
          if (!isEditingExistingResponses) {
            setSelectedEmployeeId("");
            setSelectedEmployee(null);
            setShowForm(false);
          }
        } catch (error) {
          console.error("Error loading employees:", error);
        }
      }
    };
    
    loadEmployees();
  }, [selectedCompanyId, isEditingExistingResponses]);

  useEffect(() => {
    const updateSelectedEmployee = async () => {
      if (selectedEmployeeId && employees.length > 0) {
        const employee = employees.find(e => e.id === selectedEmployeeId);
        setSelectedEmployee(employee || null);
        setShowForm(!!employee);
        
        if (!isEditingExistingResponses) {
          setFormAnswers({});
          setCurrentStep(1);
          setShowResults(false);
        }
        
        if (isEditingExistingResponses) {
          setIsEditingExistingResponses(false);
        }
      }
    };
    
    updateSelectedEmployee();
  }, [selectedEmployeeId, employees, isEditingExistingResponses]);

  useEffect(() => {
    calculateResults();
    
    if (selectedEmployeeId && Object.keys(formAnswers).length > 0) {
      saveFormResult();
    }
  }, [formAnswers, selectedEmployeeId]);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
  };

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    
    const existingResult = getFormResultByEmployeeId(employeeId);
    if (existingResult) {
      setFormAnswers(existingResult.answers);
      setFormResult({
        answers: existingResult.answers,
        totalYes: existingResult.totalYes,
        totalNo: existingResult.totalNo,
        severityCounts: existingResult.severityCounts,
        yesPerSeverity: existingResult.yesPerSeverity,
        analyistNotes: existingResult.analyistNotes
      });
      setShowResults(false);
      setCurrentStep(1);
    } else {
      setFormAnswers({});
      setFormResult({
        answers: {},
        totalYes: 0,
        totalNo: 0,
        severityCounts: {
          "LEVEMENTE PREJUDICIAL": 0,
          "PREJUDICIAL": 0,
          "EXTREMAMENTE PREJUDICIAL": 0,
        },
        yesPerSeverity: {
          "LEVEMENTE PREJUDICIAL": 0,
          "PREJUDICIAL": 0,
          "EXTREMAMENTE PREJUDICIAL": 0,
        },
        analyistNotes: ""
      });
    }
  };

  const handleEmployeeAdded = async () => {
    if (selectedCompanyId) {
      const employeesForCompany = await getEmployeesByCompany(selectedCompanyId);
      setEmployees(employeesForCompany || []);
    }
  };

  const handleAnswerChange = (questionId: number, answer: boolean | null) => {
    setFormAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        answer,
        observation: prev[questionId]?.observation || "",
        selectedOptions: prev[questionId]?.selectedOptions || []
      }
    }));
  };

  const handleObservationChange = (questionId: number, observation: string) => {
    setFormAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        observation
      }
    }));
  };

  const handleOptionsChange = (questionId: number, selectedOptions: string[]) => {
    setFormAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOptions
      }
    }));
  };

  const handleAnalystNotesChange = (notes: string) => {
    setFormResult(prev => ({
      ...prev,
      analyistNotes: notes
    }));
    
    if (selectedEmployeeId) {
      saveFormResult(selectedEmployeeId, {
        ...formResult,
        analyistNotes: notes
      });
    }
  };

  const calculateResults = () => {
    let totalYes = 0;
    let totalNo = 0;
    const severityCounts = {
      "LEVEMENTE PREJUDICIAL": 0,
      "PREJUDICIAL": 0,
      "EXTREMAMENTE PREJUDICIAL": 0,
    };
    const yesPerSeverity = {
      "LEVEMENTE PREJUDICIAL": 0,
      "PREJUDICIAL": 0,
      "EXTREMAMENTE PREJUDICIAL": 0,
    };

    const allQuestions = formData.sections.flatMap(section => section.questions);
    
    Object.values(formAnswers).forEach(answer => {
      const question = allQuestions.find(q => q.id === answer.questionId);
      
      if (answer.answer === true) {
        totalYes++;
        if (question) {
          yesPerSeverity[question.severity]++;
        }
      } else if (answer.answer === false) {
        totalNo++;
      }
      
      if (question) {
        severityCounts[question.severity]++;
      }
    });

    setFormResult(prev => ({
      ...prev,
      answers: formAnswers,
      totalYes,
      totalNo,
      severityCounts,
      yesPerSeverity,
    }));
  };

  const handleNextStep = () => {
    const nextStep = currentStep + 1;
    if (nextStep <= formData.sections.length) {
      setCurrentStep(nextStep);
      window.scrollTo(0, 0);
    } else {
      setShowResults(true);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    const prevStep = currentStep - 1;
    if (prevStep > 0) {
      setCurrentStep(prevStep);
      window.scrollTo(0, 0);
    }
  };

  const handleRestart = () => {
    setFormAnswers({});
    setCurrentStep(1);
    setShowResults(false);
    window.scrollTo(0, 0);
  };

  const handleBackToEmployeeList = () => {
    window.history.pushState({}, '', '/cadastros/funcionarios');
    window.location.reload();
  };

  const getJobRoleById = (roleId: string) => {
    return jobRoles.find(role => role.id === roleId);
  };

  const isSectionComplete = () => {
    const currentSection = formData.sections[currentStep - 1];
    if (!currentSection) return true;
    
    const sectionQuestionIds = currentSection.questions.map(q => q.id);
    return sectionQuestionIds.every(id => 
      formAnswers[id] && formAnswers[id].answer !== null
    );
  };

  const progress = Math.round((currentStep / formData.sections.length) * 100);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 text-center">
          <p className="text-lg">Carregando dados...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Formulário de Avaliação</h1>
          {employeeIdFromUrl && (
            <Button 
              variant="outline" 
              onClick={handleBackToEmployeeList}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para lista de funcionários
            </Button>
          )}
        </div>
        
        <p className="text-lg mb-8">
          Utilize este formulário para realizar a avaliação de riscos ocupacionais para um funcionário.
        </p>

        {!employeeIdFromUrl && (
          <Card className="p-6 mb-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Selecione a Empresa</label>
                <Select value={selectedCompanyId} onValueChange={handleCompanyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies && companies.length > 0 ? companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    )) : <SelectItem value="none" disabled>Nenhuma empresa encontrada</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Selecione o Funcionário</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select 
                      value={selectedEmployeeId} 
                      onValueChange={handleEmployeeChange}
                      disabled={!selectedCompanyId || employees.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={!selectedCompanyId 
                          ? "Selecione uma empresa primeiro" 
                          : employees.length === 0 
                            ? "Nenhum funcionário cadastrado" 
                            : "Escolha um funcionário"} 
                        />
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
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setIsNewEmployeeModalOpen(true)}
                    disabled={!selectedCompanyId}
                    title="Adicionar novo funcionário"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {showForm && !showResults && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Avaliação para: {selectedEmployee?.name}</h2>
              <p className="text-gray-600">
                Função: {getJobRoleById(selectedEmployee?.roleId || "")?.name || "N/A"}
              </p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Seção {currentStep} de {formData.sections.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {progress}% completo
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-esocial-blue h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {formData.sections[currentStep - 1] && (
              <FormSection
                section={formData.sections[currentStep - 1]}
                answers={formAnswers}
                onAnswerChange={handleAnswerChange}
                onObservationChange={handleObservationChange}
                onOptionsChange={handleOptionsChange}
              />
            )}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={!isSectionComplete()}
              >
                {currentStep < formData.sections.length ? "Próximo" : "Ver Resultados"}
              </Button>
            </div>
          </>
        )}

        {showForm && showResults && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Resultados da Avaliação para: {selectedEmployee?.name}</h2>
              <p className="text-gray-600">
                Função: {getJobRoleById(selectedEmployee?.roleId || "")?.name || "N/A"}
              </p>
            </div>

            <FormResults 
              result={formResult} 
              onNotesChange={handleAnalystNotesChange} 
            />
            
            <div className="flex justify-center mt-8">
              <Button 
                variant="outline" 
                onClick={handleRestart}
                className="w-full md:w-auto"
              >
                Iniciar Nova Avaliação para {selectedEmployee?.name}
              </Button>
            </div>
          </>
        )}

        {!showForm && (
          <Card className="p-6 text-center">
            <p className="text-lg mb-4">Selecione uma empresa e um funcionário para iniciar a avaliação.</p>
          </Card>
        )}

        {isNewEmployeeModalOpen && (
          <NewEmployeeModal
            open={isNewEmployeeModalOpen}
            onOpenChange={setIsNewEmployeeModalOpen}
            onEmployeeAdded={handleEmployeeAdded}
            preselectedCompanyId={selectedCompanyId}
          />
        )}
      </div>
    </Layout>
  );
};

export default FormularioPage;
