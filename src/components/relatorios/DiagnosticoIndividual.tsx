
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question, FormResult } from "@/types/form";
import { SeverityBadge } from "@/components/SeverityBadge";
import AnalystObservations from "@/components/admin/reports/AnalystObservations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Employee } from "@/types/cadastro";

interface DiagnosticoIndividualProps {
  result: FormResult;
  questions: Question[];
  companyId?: string;
}

const DiagnosticoIndividual: React.FC<DiagnosticoIndividualProps> = ({
  result,
  questions,
  companyId
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(result.employeeId || "");
  const [loadedQuestions, setLoadedQuestions] = useState<Question[]>(questions);
  const [loadedResult, setLoadedResult] = useState<FormResult | null>(result);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (companyId) {
      loadEmployees(companyId);
    }
  }, [companyId]);

  useEffect(() => {
    if (selectedEmployeeId) {
      loadEvaluationData(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  const loadEmployees = async (companyId: string) => {
    setIsLoading(true);
    try {
      console.log("Loading employees for company:", companyId);
      
      const { data, error } = await supabase
        .from('funcionarios')
        .select('id, nome, cpf, empresa_id, cargo_id, cargo:cargos(nome)')
        .eq('empresa_id', companyId);
        
      if (error) {
        console.error("Error loading employees:", error);
        toast.error("Erro ao carregar funcionários");
        return;
      }
      
      console.log("Employees loaded:", data);
      
      if (data && data.length > 0) {
        // Transform the data to match the Employee type
        const transformedEmployees = data.map(item => ({
          id: item.id,
          name: item.nome,
          company_id: item.empresa_id,
          cpf: item.cpf,
          role: item.cargo ? item.cargo.nome : 'Sem cargo',
          email: '',
          departments: []
        }));
        
        setEmployees(transformedEmployees);
        
        // If there's no selected employee yet, select the first one
        if (!selectedEmployeeId && transformedEmployees.length > 0) {
          setSelectedEmployeeId(transformedEmployees[0].id);
        }
      }
    } catch (error) {
      console.error("Error in loadEmployees:", error);
      toast.error("Erro ao carregar funcionários");
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvaluationData = async (employeeId: string) => {
    setIsLoading(true);
    try {
      console.log("Loading evaluation data for employee:", employeeId);
      
      // Get the most recent completed evaluation for this employee
      const { data: evaluationData, error: evaluationError } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('funcionario_id', employeeId)
        .eq('is_complete', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (evaluationError) {
        console.error("Error loading evaluation:", evaluationError);
        // If there's no evaluation, don't show an error toast
        if (evaluationError.code !== 'PGRST116') {
          toast.error("Erro ao carregar avaliação");
        }
        setLoadedResult(null);
        return;
      }
      
      if (!evaluationData) {
        console.log("No evaluation found for employee:", employeeId);
        setLoadedResult(null);
        return;
      }
      
      console.log("Evaluation loaded:", evaluationData);
      
      // Get the form questions for this evaluation
      const { data: questionsData, error: questionsError } = await supabase
        .from('perguntas')
        .select('*')
        .eq('formulario_id', evaluationData.formulario_id);
        
      if (questionsError) {
        console.error("Error loading questions:", questionsError);
        toast.error("Erro ao carregar perguntas");
        return;
      }
      
      // Get the answers for this evaluation
      const { data: answersData, error: answersError } = await supabase
        .from('respostas')
        .select('*')
        .eq('avaliacao_id', evaluationData.id);
        
      if (answersError) {
        console.error("Error loading answers:", answersError);
        toast.error("Erro ao carregar respostas");
        return;
      }
      
      // Transform the data to match our expected types
      const formattedQuestions = questionsData.map(q => ({
        id: q.id,
        texto: q.texto,
        secao_id: q.secao_id,
        formulario_id: q.formulario_id,
        risco_id: q.risco_id,
        ordem_pergunta: q.ordem_pergunta,
        observacao_obrigatoria: q.observacao_obrigatoria,
        opcoes: q.opcoes as unknown as { label: string; value: string }[]
      }));
      
      // Build the answers object
      const answers: Record<string, any> = {};
      answersData.forEach(answer => {
        answers[answer.pergunta_id] = {
          questionId: answer.pergunta_id,
          answer: answer.resposta,
          observation: answer.observacao,
          selectedOptions: answer.opcoes_selecionadas
        };
      });
      
      // Build the FormResult object
      const formResult: FormResult = {
        id: evaluationData.id,
        employeeId: evaluationData.funcionario_id,
        empresa_id: evaluationData.empresa_id,
        formulario_id: evaluationData.formulario_id,
        answers,
        total_sim: evaluationData.total_sim,
        total_nao: evaluationData.total_nao,
        notas_analista: evaluationData.notas_analista,
        is_complete: evaluationData.is_complete,
        created_at: evaluationData.created_at,
        updated_at: evaluationData.updated_at,
        last_updated: evaluationData.last_updated
      };
      
      setLoadedQuestions(formattedQuestions);
      setLoadedResult(formResult);
      
      console.log("Loaded questions:", formattedQuestions);
      console.log("Loaded form result:", formResult);
      
    } catch (error) {
      console.error("Error in loadEvaluationData:", error);
      toast.error("Erro ao carregar dados da avaliação");
      setLoadedResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
  };

  // If we have no result or questions, show a placeholder
  if (!loadedResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico Individual</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando dados...</p>
              </div>
            </div>
          ) : employees.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium mb-4">Selecione um funcionário</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {employees.map(employee => (
                  <div 
                    key={employee.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                      selectedEmployeeId === employee.id ? 'bg-muted border-primary' : ''
                    }`}
                    onClick={() => handleEmployeeSelect(employee.id)}
                  >
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-muted-foreground">{employee.role}</div>
                  </div>
                ))}
              </div>
              {selectedEmployeeId && (
                <div className="mt-8 p-6 border rounded-lg bg-muted/40">
                  <p className="text-center text-muted-foreground">
                    Nenhuma avaliação encontrada para este funcionário.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              Selecione uma empresa e um funcionário para visualizar o diagnóstico individual.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Group questions by severity
  const severityGroups: Record<string, Question[]> = {};
  loadedQuestions.forEach(question => {
    // In a real implementation, we would fetch severity information from the database
    // Here we're just using a simple algorithm based on the question ID
    const severityId = parseInt(question.id.replace(/[^0-9]/g, '')) % 3;
    const severityLabel = ['low', 'medium', 'high'][severityId];
    
    if (!severityGroups[severityLabel]) {
      severityGroups[severityLabel] = [];
    }
    severityGroups[severityLabel].push(question);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnóstico Individual</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando dados...</p>
            </div>
          </div>
        ) : (
          <>
            {employees.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4">Selecione um funcionário</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {employees.map(employee => (
                    <div 
                      key={employee.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                        selectedEmployeeId === employee.id ? 'bg-muted border-primary' : ''
                      }`}
                      onClick={() => handleEmployeeSelect(employee.id)}
                    >
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">{employee.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          
            <div className="mb-6">
              <h3 className="text-lg font-medium">Informações da Avaliação</h3>
              <p>Data: {new Date(loadedResult.created_at).toLocaleDateString('pt-BR')}</p>
              <p>Total de Questões: {loadedQuestions.length}</p>
              <p>Respostas "Sim": {loadedResult.total_sim}</p>
              <p>Respostas "Não": {loadedResult.total_nao}</p>
            </div>

            {Object.entries(severityGroups).map(([severity, questions]) => (
              <div key={severity} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-medium">Riscos de Severidade {severity === 'low' ? 'Baixa' : severity === 'medium' ? 'Média' : 'Alta'}</h3>
                  <SeverityBadge severity={severity as 'low' | 'medium' | 'high'} />
                </div>
                
                <div className="space-y-4">
                  {questions.map(question => {
                    const answer = loadedResult.answers[question.id];
                    const isYes = answer?.answer === true;
                    return (
                      <div 
                        key={question.id} 
                        className={`p-4 border rounded-lg ${isYes ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{question.texto}</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${isYes ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {isYes ? 'Sim' : 'Não'}
                          </span>
                        </div>
                        
                        {answer?.observation && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 font-medium">Observação:</p>
                            <p className="text-sm text-gray-600">{answer.observation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="mt-8">
              <AnalystObservations 
                avaliacaoId={loadedResult.id} 
                initialValue={loadedResult.notas_analista || ""}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticoIndividual;
