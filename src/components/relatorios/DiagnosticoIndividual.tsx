
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormResult, Question } from "@/types/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/cadastro";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import AnalystObservations from "@/components/admin/reports/AnalystObservations";
import { Skeleton } from "@/components/ui/skeleton";

interface DiagnosticoIndividualProps {
  result?: FormResult;
  questions?: Question[];
  companyId?: string;
}

const DiagnosticoIndividual: React.FC<DiagnosticoIndividualProps> = ({ 
  result,
  questions,
  companyId 
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [employeeFormResults, setEmployeeFormResults] = useState<FormResult[]>([]);
  const [selectedFormResult, setSelectedFormResult] = useState<FormResult | null>(null);
  const [employeeQuestions, setEmployeeQuestions] = useState<Question[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  
  // Load employees when companyId changes
  useEffect(() => {
    if (companyId) {
      loadEmployees();
    }
  }, [companyId]);
  
  // Load form results when employee is selected
  useEffect(() => {
    if (selectedEmployeeId) {
      loadEmployeeFormResults();
    } else {
      setEmployeeFormResults([]);
      setSelectedFormResult(null);
    }
  }, [selectedEmployeeId]);
  
  // Load questions when form result is selected
  useEffect(() => {
    if (selectedFormResult?.formulario_id) {
      loadFormQuestions(selectedFormResult.formulario_id);
    } else {
      setEmployeeQuestions([]);
    }
  }, [selectedFormResult]);
  
  // Load employees for the selected company
  const loadEmployees = async () => {
    if (!companyId) return;
    
    setIsLoadingEmployees(true);
    try {
      console.log("Carregando funcionários para empresa:", companyId);
      
      const { data, error } = await supabase
        .from('funcionarios')
        .select('*, cargos(nome)')
        .eq('empresa_id', companyId);
        
      if (error) {
        console.error("Erro ao carregar funcionários:", error);
        toast.error("Erro ao carregar funcionários");
        return;
      }
      
      console.log("Funcionários carregados:", data?.length);
      
      if (data) {
        const formattedEmployees: Employee[] = data.map(emp => ({
          id: emp.id,
          nome: emp.nome,
          cpf: emp.cpf || "",
          empresa_id: emp.empresa_id,
          cargo: emp.cargos?.nome || "Sem cargo",
          cargo_id: emp.cargo_id || "",
          email: "",
          telefone: ""
        }));
        
        setEmployees(formattedEmployees);
      }
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      toast.error("Erro ao carregar funcionários");
    } finally {
      setIsLoadingEmployees(false);
    }
  };
  
  // Load form results for the selected employee
  const loadEmployeeFormResults = async () => {
    if (!selectedEmployeeId) return;
    
    setIsLoadingResults(true);
    try {
      console.log("Carregando resultados para funcionário:", selectedEmployeeId);
      
      const { data, error } = await supabase
        .from('avaliacoes')
        .select(`
          *,
          formularios(titulo)
        `)
        .eq('funcionario_id', selectedEmployeeId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Erro ao carregar avaliações:", error);
        toast.error("Erro ao carregar avaliações");
        return;
      }
      
      console.log("Avaliações carregadas:", data);
      
      if (data && data.length > 0) {
        // Load answers for each evaluation
        const resultsWithAnswers = await Promise.all(
          data.map(async (avaliacao) => {
            try {
              const { data: respostas, error: respostasError } = await supabase
                .from('respostas')
                .select('*')
                .eq('avaliacao_id', avaliacao.id);
                
              if (respostasError) throw respostasError;
              
              // Format answers object
              const answersObj: Record<string, { answer: boolean, questionId: string }> = {};
              respostas?.forEach(resp => {
                answersObj[resp.pergunta_id] = {
                  answer: resp.resposta,
                  questionId: resp.pergunta_id
                };
              });
              
              return {
                id: avaliacao.id,
                employeeId: avaliacao.funcionario_id,
                empresa_id: avaliacao.empresa_id,
                formulario_id: avaliacao.formulario_id,
                formulario_titulo: avaliacao.formularios?.titulo || "Formulário",
                created_at: avaliacao.created_at,
                updated_at: avaliacao.updated_at,
                notas_analista: avaliacao.notas_analista,
                is_complete: avaliacao.is_complete,
                total_sim: avaliacao.total_sim || 0,
                total_nao: avaliacao.total_nao || 0,
                last_updated: avaliacao.last_updated || avaliacao.updated_at,
                answers: answersObj
              } as FormResult;
            } catch (error) {
              console.error("Erro ao carregar respostas:", error);
              return null;
            }
          })
        );
        
        const validResults = resultsWithAnswers.filter(Boolean) as FormResult[];
        setEmployeeFormResults(validResults);
        
        // Automatically select the most recent form result
        if (validResults.length > 0) {
          setSelectedFormResult(validResults[0]);
        }
      } else {
        setEmployeeFormResults([]);
        setSelectedFormResult(null);
      }
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
      toast.error("Erro ao carregar avaliações");
    } finally {
      setIsLoadingResults(false);
    }
  };
  
  // Load questions for the selected form
  const loadFormQuestions = async (formId: string) => {
    try {
      console.log("Carregando perguntas para formulário:", formId);
      
      const { data, error } = await supabase
        .from('perguntas')
        .select('*')
        .eq('formulario_id', formId);
        
      if (error) {
        console.error("Erro ao carregar perguntas:", error);
        return;
      }
      
      console.log("Perguntas carregadas:", data?.length);
      
      if (data) {
        setEmployeeQuestions(data);
      }
    } catch (error) {
      console.error("Erro ao carregar perguntas:", error);
    }
  };
  
  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
  };
  
  const handleFormResultChange = (formResultId: string) => {
    const selectedResult = employeeFormResults.find(r => r.id === formResultId);
    setSelectedFormResult(selectedResult || null);
  };
  
  // Use the provided result and questions if available
  const displayResult = selectedFormResult || result;
  const displayQuestions = employeeQuestions.length > 0 ? employeeQuestions : questions || [];
  
  if (!companyId && !result) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        Selecione uma empresa para visualizar o diagnóstico individual.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnóstico Individual</CardTitle>
        <CardDescription>
          Visualize as respostas individuais e o diagnóstico do funcionário.
        </CardDescription>
        
        {companyId && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Funcionário</label>
              <Select 
                value={selectedEmployeeId} 
                onValueChange={handleEmployeeChange}
                disabled={isLoadingEmployees}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingEmployees ? (
                    <div className="p-2">Carregando...</div>
                  ) : employees.length === 0 ? (
                    <div className="p-2">Nenhum funcionário encontrado</div>
                  ) : (
                    employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.nome} - {emp.cargo}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {selectedEmployeeId && (
              <div>
                <label className="text-sm font-medium">Avaliação</label>
                <Select 
                  value={selectedFormResult?.id || ""} 
                  onValueChange={handleFormResultChange}
                  disabled={isLoadingResults}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma avaliação" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingResults ? (
                      <div className="p-2">Carregando...</div>
                    ) : employeeFormResults.length === 0 ? (
                      <div className="p-2">Nenhuma avaliação encontrada</div>
                    ) : (
                      employeeFormResults.map(result => (
                        <SelectItem key={result.id} value={result.id}>
                          {result.formulario_titulo} - {new Date(result.created_at).toLocaleDateString()}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {isLoadingResults ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : displayResult ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Sim</p>
                <p className="text-3xl font-bold text-primary">{displayResult.total_sim}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Não</p>
                <p className="text-3xl font-bold text-red-500">{displayResult.total_nao}</p>
              </div>
            </div>
            
            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-4 space-y-4">
                {displayQuestions.map((question) => {
                  const answer = displayResult.answers[question.id]?.answer;
                  return (
                    <div key={question.id} className="pb-4 border-b">
                      <p className="font-medium mb-2">{question.texto}</p>
                      <p className={answer ? "text-primary font-medium" : "text-red-500 font-medium"}>
                        Resposta: {answer ? "Sim" : "Não"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            
            <div className="mt-6">
              {selectedFormResult && (
                <AnalystObservations 
                  avaliacaoId={selectedFormResult.id}
                  initialValue={selectedFormResult.notas_analista}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            {selectedEmployeeId ? 
              "Selecione uma avaliação para visualizar o diagnóstico." :
              "Selecione um funcionário para visualizar o diagnóstico."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticoIndividual;
