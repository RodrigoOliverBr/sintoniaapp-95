
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from "recharts";
import { getDepartmentsByCompany, getFormResultByEmployeeId, getEmployeesByCompany } from "@/services";
import { Department, Employee } from "@/types/cadastro";
import { FormResult, Question, Section } from "@/types/form";

// Interface for section data with count of "yes" answers
interface SectionData {
  sectionId: string;
  title: string;
  yesCount: number;
  totalCount: number;
  percentual: number;
}

// Interface for risk data with count of "yes" answers
interface RiskData {
  riskId: string;
  text: string;
  yesCount: number;
  totalCount: number;
  percentual: number;
}

// Interface for question data with yes counts by department
interface QuestionByDepartmentData {
  questionId: string;
  questionText: string;
  sectionTitle: string;
  departmentYesCounts: {
    [departmentId: string]: {
      count: number;
      total: number;
      percentual: number;
    }
  }
}

const getRiskColor = (value: number) => {
  if (value <= 20) return "#4ade80"; // Verde para valores até 20%
  if (value <= 29) return "#facc15"; // Amarelo para valores entre 21% e 29%
  return "#f87171"; // Vermelho para valores acima de 30%
};

const getBackgroundColor = (value: number) => {
  if (value <= 20) return "bg-green-100"; // Verde claro para valores até 20%
  if (value <= 29) return "bg-yellow-100"; // Amarelo claro para valores entre 21% e 29%
  return "bg-red-100"; // Vermelho claro para valores acima de 30%
};

const getTextColor = (value: number) => {
  if (value <= 20) return "text-green-800"; // Verde escuro para valores até 20%
  if (value <= 29) return "text-yellow-800"; // Amarelo escuro para valores entre 21% e 29%
  return "text-red-800"; // Vermelho escuro para valores acima de 30%
};

interface MapaRiscoPsicossocialProps {
  companyId: string;
  departmentId: string;
  dateRange: { from?: Date; to?: Date };
}

export default function MapaRiscoPsicossocial({ 
  companyId, 
  departmentId, 
  dateRange 
}: MapaRiscoPsicossocialProps) {
  const [sectionData, setSectionData] = useState<SectionData[]>([]);
  const [riskData, setRiskData] = useState<RiskData[]>([]);
  const [questionByDepartment, setQuestionByDepartment] = useState<QuestionByDepartmentData[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get company departments
        const departmentsData = await getDepartmentsByCompany(companyId);
        setDepartments(departmentsData);
        
        // Get employees from the company
        const employees = await getEmployeesByCompany(companyId);
        
        // Get all form data needed for sections and questions
        const { data: sectionsData } = await supabase
          .from('secoes')
          .select('*')
          .order('ordem');
        
        const { data: questionsData } = await supabase
          .from('perguntas')
          .select(`
            *,
            risco:riscos (
              *,
              severidade:severidade (*)
            )
          `);
        
        const sections = sectionsData || [];
        const questions = questionsData || [];
        
        // Group questions by section
        const questionsBySection = sections.map(section => {
          return {
            sectionId: section.id,
            title: section.titulo,
            questions: questions.filter(q => q.secao_id === section.id)
          };
        });
        
        // Group questions by risk
        const questionsByRisk: Record<string, Question[]> = {};
        questions.forEach(q => {
          if (!q.risco_id) return;
          
          if (!questionsByRisk[q.risco_id]) {
            questionsByRisk[q.risco_id] = [];
          }
          questionsByRisk[q.risco_id].push(q);
        });
        
        // Initialize data structures
        const sectionResults: Record<string, { yes: number, total: number }> = {};
        const riskResults: Record<string, { yes: number, total: number, text: string }> = {};
        const questionsByDeptResults: Record<string, { 
          text: string, 
          sectionTitle: string, 
          departmentCounts: Record<string, { yes: number, total: number }> 
        }> = {};
        
        // Process each employee's evaluation
        for (const employee of employees) {
          // Get completed evaluations for this employee
          const { data: evaluations } = await supabase
            .from('avaliacoes')
            .select('*')
            .eq('funcionario_id', employee.id)
            .eq('is_complete', true);
            
          if (!evaluations || evaluations.length === 0) continue;
          
          // Get the latest evaluation
          const latestEvaluation = evaluations.reduce((latest, current) => 
            new Date(current.updated_at) > new Date(latest.updated_at) ? current : latest
          );
          
          // Get responses for this evaluation
          const { data: responses } = await supabase
            .from('respostas')
            .select('*')
            .eq('avaliacao_id', latestEvaluation.id);
            
          if (!responses) continue;
          
          // Get employee departments
          const { data: employeeDepartments } = await supabase
            .from('employee_departments')
            .select('department_id')
            .eq('employee_id', employee.id);
            
          const employeeDeptIds = employeeDepartments?.map(ed => ed.department_id) || [];
          
          // Process responses
          for (const response of responses) {
            const question = questions.find(q => q.id === response.pergunta_id);
            if (!question) continue;
            
            const sectionId = question.secao_id;
            const riskId = question.risco_id;
            const section = sections.find(s => s.id === sectionId);
            
            if (!sectionId || !section) continue;
            
            // Initialize section data if needed
            if (!sectionResults[sectionId]) {
              sectionResults[sectionId] = { yes: 0, total: 0 };
            }
            
            // Initialize risk data if needed
            if (riskId && !riskResults[riskId] && question.risco) {
              riskResults[riskId] = { 
                yes: 0, 
                total: 0,
                text: question.risco.texto
              };
            }
            
            // Initialize question by department data if needed
            if (!questionsByDeptResults[question.id]) {
              questionsByDeptResults[question.id] = {
                text: question.texto,
                sectionTitle: section.titulo,
                departmentCounts: {}
              };
              
              // Initialize counts for each department
              departments.forEach(dept => {
                questionsByDeptResults[question.id].departmentCounts[dept.id] = { yes: 0, total: 0 };
              });
            }
            
            // Count responses
            sectionResults[sectionId].total++;
            if (response.resposta === true) {
              sectionResults[sectionId].yes++;
            }
            
            if (riskId) {
              riskResults[riskId].total++;
              if (response.resposta === true) {
                riskResults[riskId].yes++;
              }
            }
            
            // Count responses by department
            employeeDeptIds.forEach(deptId => {
              if (!questionsByDeptResults[question.id].departmentCounts[deptId]) {
                questionsByDeptResults[question.id].departmentCounts[deptId] = { yes: 0, total: 0 };
              }
              
              questionsByDeptResults[question.id].departmentCounts[deptId].total++;
              if (response.resposta === true) {
                questionsByDeptResults[question.id].departmentCounts[deptId].yes++;
              }
            });
          }
        }
        
        // Convert to arrays and calculate percentages
        const sectionsArray = Object.entries(sectionResults).map(([sectionId, counts]) => {
          const section = sections.find(s => s.id === sectionId);
          return {
            sectionId,
            title: section?.titulo || "Desconhecido",
            yesCount: counts.yes,
            totalCount: counts.total,
            percentual: counts.total > 0 ? Math.round((counts.yes / counts.total) * 100) : 0
          };
        });
        
        const risksArray = Object.entries(riskResults).map(([riskId, data]) => {
          return {
            riskId,
            text: data.text || "Desconhecido",
            yesCount: data.yes,
            totalCount: data.total,
            percentual: data.total > 0 ? Math.round((data.yes / data.total) * 100) : 0
          };
        });
        
        const questionsByDeptArray = Object.entries(questionsByDeptResults).map(([questionId, data]) => {
          const departmentYesCounts: Record<string, { count: number; total: number; percentual: number }> = {};
          
          Object.entries(data.departmentCounts).forEach(([deptId, counts]) => {
            departmentYesCounts[deptId] = {
              count: counts.yes,
              total: counts.total,
              percentual: counts.total > 0 ? Math.round((counts.yes / counts.total) * 100) : 0
            };
          });
          
          return {
            questionId,
            questionText: data.text,
            sectionTitle: data.sectionTitle,
            departmentYesCounts
          };
        });
        
        // Sort and set state
        setSectionData(sectionsArray.sort((a, b) => a.percentual - b.percentual));
        setRiskData(risksArray.sort((a, b) => a.percentual - b.percentual));
        setQuestionByDepartment(questionsByDeptArray);
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erro ao carregar dados do relatório");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [companyId]);

  // Prepare chart data
  const radarData = sectionData.map(item => ({
    subject: item.title.split(' ')[0], // Use first word for shorter labels
    A: item.percentual,
    fullMark: 100
  }));
  
  if (isLoading) {
    return <div className="flex items-center justify-center p-12">Carregando dados...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 p-12">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Mapa de Risco Psicossocial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Nível de Risco"
                  dataKey="A"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip formatter={(value) => [`${value}%`, "Nível de Risco"]} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-500 text-center">
            Percentual de respostas "Sim" por seção
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Percentual de Respostas Positivas por Dimensão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4 justify-between">
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 bg-green-500 rounded-sm mr-1"></span>
              <span className="text-xs text-gray-600 mr-4">Baixo risco (≤ 20%)</span>
              
              <span className="inline-block w-4 h-4 bg-yellow-400 rounded-sm mr-1"></span>
              <span className="text-xs text-gray-600 mr-4">Atenção (21% - 29%)</span>
              
              <span className="inline-block w-4 h-4 bg-red-500 rounded-sm mr-1"></span>
              <span className="text-xs text-gray-600">Crítico (≥ 30%)</span>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dimensão</TableHead>
                <TableHead className="text-center">Sim</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Percentual</TableHead>
                <TableHead className="text-center">Escala Visual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riskData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.text}</TableCell>
                  <TableCell className="text-center">{item.yesCount}</TableCell>
                  <TableCell className="text-center">{item.totalCount}</TableCell>
                  <TableCell className={`text-center font-bold ${getTextColor(item.percentual)}`}>
                    {item.percentual}%
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="h-4 rounded-full"
                          style={{ 
                            width: `${item.percentual}%`, 
                            backgroundColor: getRiskColor(item.percentual)
                          }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>* Percentual de respostas "Sim" por tipo de risco.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Análise por Dimensão e Setor (Mapa de Calor)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Dimensão / Pergunta</TableHead>
                  {departments.map(dept => (
                    <TableHead key={dept.id} className="text-center">
                      {dept.nome}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionByDepartment.reduce((acc: React.ReactNode[], question, qIndex) => {
                  // Check if we need to add a section header
                  const sectionTitle = question.sectionTitle;
                  
                  if (qIndex === 0 || questionByDepartment[qIndex - 1].sectionTitle !== sectionTitle) {
                    acc.push(
                      <TableRow key={`section-${sectionTitle}`} className="bg-muted/30 font-medium">
                        <TableCell colSpan={departments.length + 1}>
                          {sectionTitle}
                        </TableCell>
                      </TableRow>
                    );
                  }
                  
                  // Add the question row
                  acc.push(
                    <TableRow key={`question-${question.questionId}`}>
                      <TableCell className="pl-8 text-sm">
                        {question.questionText}
                      </TableCell>
                      {departments.map(dept => {
                        const deptData = question.departmentYesCounts[dept.id];
                        const percentual = deptData?.percentual || 0;
                        const count = deptData?.count || 0;
                        const total = deptData?.total || 0;
                        
                        return (
                          <TableCell key={dept.id} className="text-center">
                            <div className="flex items-center justify-center">
                              <div 
                                className="w-8 h-8 rounded-full mr-2" 
                                style={{ backgroundColor: getRiskColor(percentual) }}
                              />
                              <span>
                                {count}/{total} ({percentual}%)
                              </span>
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                  
                  return acc;
                }, [])}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
