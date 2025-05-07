
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Company, Employee } from '@/types/cadastro';
import { generatePGRData } from '@/utils/relatorios/pgrDataUtils';
import { Question } from '@/types/form';
import { Badge } from '@/components/ui/badge';
import { supabase } from "@/integrations/supabase/client";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AvaliacaoResposta } from '@/types/avaliacao';
import { Loader2 } from 'lucide-react';

export interface RelatorioPGRProps {
  company: Company;
  employee: Employee;
  questions?: Question[];
  answers?: Record<string, any>;
  respostas?: AvaliacaoResposta[];
}

interface RiskSection {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  riskAnalysis: {
    probability: string;
    severity: string;
    status: string;
  };
  controlMeasures: string;
  implementationDeadline: string;
  responsible: string;
  affectedFunctions: string[];
}

const RelatorioPGR: React.FC<RelatorioPGRProps> = ({ 
  company, 
  employee,
  questions = [],
  answers = {},
  respostas = []
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [riskSections, setRiskSections] = useState<RiskSection[]>([]);
  const [mitigacoes, setMitigacoes] = useState<Record<string, string[]>>({});
  
  // For editable fields
  const [editableData, setEditableData] = useState<Record<string, {
    deadline: string;
    responsible: string;
    measures: string;
  }>>({});

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [company?.id, employee?.id, respostas]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Get all risks from the questions - consider both questions prop and respostas
      const risksSet = new Set<string>();
      
      // Add risks from questions prop
      questions.forEach(q => {
        if (q.risco_id && answers[q.id]) {
          risksSet.add(q.risco_id);
        }
      });
      
      // Add risks from respostas
      respostas.forEach(resp => {
        if (resp.pergunta?.risco?.id && resp.resposta === true) {
          risksSet.add(resp.pergunta.risco.id);
        }
      });
      
      const riskIds = Array.from(risksSet);
      
      if (riskIds.length === 0) {
        console.log("No risks found in answers");
        setRiskSections([]);
        return;
      }
      
      // 2. Get detailed risk info
      console.log("Getting details for risks:", riskIds);
      const { data: risksData, error: risksError } = await supabase
        .from('riscos')
        .select(`
          id, texto,
          severidade:severidade (id, nivel, descricao)
        `)
        .in('id', riskIds);
      
      if (risksError) {
        console.error("Error fetching risks:", risksError);
        return;
      }
      
      // 3. Get mitigations for each risk
      const { data: mitigacoesData, error: mitigacoesError } = await supabase
        .from('mitigacoes')
        .select('risco_id, texto')
        .in('risco_id', riskIds);
      
      if (mitigacoesError) {
        console.error("Error fetching mitigations:", mitigacoesError);
      } else if (mitigacoesData) {
        // Group mitigations by risk_id
        const mitigacoesMap: Record<string, string[]> = {};
        mitigacoesData.forEach(mit => {
          if (!mitigacoesMap[mit.risco_id]) {
            mitigacoesMap[mit.risco_id] = [];
          }
          mitigacoesMap[mit.risco_id].push(mit.texto);
        });
        setMitigacoes(mitigacoesMap);
      }

      // 4. Process the sections for each risk
      const sections: RiskSection[] = [];
      
      for (const risk of risksData || []) {
        // Find questions for this risk
        let riskQuestions = questions.filter(q => q.risco_id === risk.id);
        
        // If no questions from props, try from respostas
        if (riskQuestions.length === 0) {
          const filteredRespostas = respostas.filter(r => 
            r.pergunta?.risco?.id === risk.id && r.resposta === true
          );
          
          riskQuestions = filteredRespostas.map(r => ({
            id: r.pergunta_id,
            texto: r.pergunta.texto,
            risco_id: risk.id,
            secao_id: '',
            formulario_id: ''
          }));
        }
        
        // Skip if no questions
        if (riskQuestions.length === 0) continue;
        
        // Calculate risk probability based on yes answers
        const yesCount = countYesAnswers(risk.id, riskQuestions);
        const totalAnswers = getTotalQuestions(risk.id, riskQuestions); 
        const probability = calculateProbability(yesCount, totalAnswers);
        
        // Get severity from risk
        const severity = risk.severidade?.nivel || "Média";
        
        // Determine status based on severity and probability
        let status = "Em análise";
        if (severity.includes("EXTREMAMENTE") || probability === "Alta") {
          status = "Crítico";
        } else if (severity.includes("PREJUDICIAL") && probability !== "Baixa") {
          status = "Significativo";
        } else {
          status = "Sob controle";
        }
        
        // Add default editable data
        setEditableData(prev => ({
          ...prev,
          [risk.id]: {
            deadline: "90 dias",
            responsible: "Equipe de Saúde Ocupacional",
            measures: mitigacoes[risk.id]?.join(" ") || "Implementar medidas preventivas."
          }
        }));
        
        // Create a section for this risk
        sections.push({
          id: risk.id,
          title: risk.texto,
          description: `Este risco pode impactar o ambiente de trabalho com severidade ${severity.toLowerCase()}.`,
          questions: riskQuestions,
          riskAnalysis: {
            probability,
            severity: risk.severidade?.nivel || "Média",
            status
          },
          controlMeasures: mitigacoes[risk.id]?.join(" ") || "Implementar medidas preventivas.",
          implementationDeadline: "90 dias",
          responsible: "Equipe de Saúde Ocupacional",
          affectedFunctions: [employee.role || "Todos os funcionários"]
        });
      }
      
      setRiskSections(sections);
      
    } catch (error) {
      console.error("Error loading PGR data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to count yes answers for a specific risk
  const countYesAnswers = (riskId: string, riskQuestions: Question[]): number => {
    // Count from questions prop
    let count = riskQuestions.filter(q => answers[q.id]).length;
    
    // Count from respostas
    count += respostas.filter(r => 
      r.pergunta?.risco?.id === riskId && 
      r.resposta === true
    ).length;
    
    return count;
  };

  // Helper to get total questions for a specific risk
  const getTotalQuestions = (riskId: string, riskQuestions: Question[]): number => {
    // Count from questions prop
    let count = riskQuestions.length;
    
    // Count from respostas if no questions
    if (count === 0) {
      count = respostas.filter(r => r.pergunta?.risco?.id === riskId).length;
    }
    
    return count || 1; // Avoid division by zero
  };

  // Helper to calculate probability based on yes answers
  const calculateProbability = (yesCount: number, totalQuestions: number): string => {
    if (totalQuestions === 0) return "Média";
    
    const percentage = (yesCount / totalQuestions) * 100;
    
    if (percentage >= 70) return "Alta";
    if (percentage >= 30) return "Média";
    return "Baixa";
  };

  // Handler for editable fields
  const handleFieldChange = (riskId: string, field: string, value: string) => {
    setEditableData(prev => ({
      ...prev,
      [riskId]: {
        ...prev[riskId],
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-10 flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 mb-4 mx-auto animate-spin text-primary" />
            <p>Carregando dados para o relatório PGR...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (riskSections.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Relatório de Programa de Gerenciamento de Riscos (PGR)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-gray-500">
            <p className="mb-2">Não foram identificados riscos nas avaliações deste funcionário.</p>
            <p>Complete uma avaliação com respostas que identifiquem riscos para gerar o relatório.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Relatório de Programa de Gerenciamento de Riscos (PGR)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium">Dados da Empresa</h3>
          <p>Nome: {company.name}</p>
          <p>CNPJ/CPF: {company.cpfCnpj || '00.000.000/0000-00'}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium">Dados do Funcionário</h3>
          <p>Nome: {employee.name}</p>
          <p>Email: {employee.email || 'N/A'}</p>
          <p>CPF: {employee.cpf || 'N/A'}</p>
          <p>Cargo: {employee.role || 'N/A'}</p>
          <p>Empresa: {company.name}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium">Avaliação de Riscos Psicossociais</h3>
          {riskSections.map((section, idx) => (
            <div key={idx} className="mb-8 p-4 border rounded-lg shadow-sm bg-white">
              <h4 className="font-medium text-lg mb-3">{section.title}</h4>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-sm text-gray-600">Descrição</p>
                  <p className="mt-1">
                    {section.description || "Riscos associados a esta categoria podem afetar a saúde e bem-estar dos colaboradores."}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium text-sm text-gray-600">Funções Expostas</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline">{employee.role || "Todas as funções"}</Badge>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-sm text-gray-600">Análise de Risco</p>
                  <div className="grid grid-cols-3 gap-4 mt-1">
                    <div>
                      <p className="text-xs text-gray-500">Probabilidade</p>
                      <p className="font-medium">
                        {section.riskAnalysis?.probability || "Média"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Severidade</p>
                      <p className="font-medium">
                        {section.riskAnalysis?.severity || "Média"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <Badge variant={section.riskAnalysis?.status === "Crítico" ? "destructive" : "outline"}>
                        {section.riskAnalysis?.status || "Em análise"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-sm text-gray-600">Medidas de Controle</p>
                  <textarea
                    className="w-full p-2 mt-1 border rounded-md"
                    value={editableData[section.id]?.measures || section.controlMeasures}
                    onChange={(e) => handleFieldChange(section.id, 'measures', e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-sm text-gray-600">Prazo para Implementação</p>
                    <Select
                      value={editableData[section.id]?.deadline || section.implementationDeadline}
                      onValueChange={(value) => handleFieldChange(section.id, 'deadline', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione o prazo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30 dias">30 dias</SelectItem>
                        <SelectItem value="60 dias">60 dias</SelectItem>
                        <SelectItem value="90 dias">90 dias</SelectItem>
                        <SelectItem value="180 dias">180 dias</SelectItem>
                        <SelectItem value="1 ano">1 ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-600">Responsáveis</p>
                    <Input 
                      className="mt-1"
                      value={editableData[section.id]?.responsible || section.responsible}
                      onChange={(e) => handleFieldChange(section.id, 'responsible', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-sm text-gray-600">Questões Respondidas</p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    {section.questions.map((question) => (
                      <li key={question.id}>
                        <p className="font-medium">{question.texto}</p>
                        <p className="text-gray-600">
                          Resposta: {answers[question.id] ? 'Sim' : 'Não'}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium">Conclusões e Recomendações</h3>
          <p className="text-gray-600">
            Com base na avaliação realizada, foram identificados fatores de risco psicossocial
            que devem ser abordados no plano de ação. Recomenda-se a implementação de medidas
            preventivas e corretivas conforme descrito nas normas regulamentadoras aplicáveis.
          </p>
        </div>

        <div className="flex justify-end">
          <Button>Exportar PDF</Button>
        </div>

        <div className="text-right text-sm text-gray-500 mt-8">
          <p>Data de emissão: {new Date().toLocaleDateString('pt-BR')}</p>
          <p>Validade: 12 meses</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioPGR;
