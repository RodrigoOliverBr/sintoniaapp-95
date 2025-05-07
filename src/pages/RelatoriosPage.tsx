
import React, { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilterSection from "@/components/relatorios/FilterSection";
import DiagnosticoIndividual from "@/components/relatorios/DiagnosticoIndividual";
import MapaRiscoPsicossocial from "@/components/relatorios/MapaRiscoPsicossocial";
import RelatorioPGR from "@/components/relatorios/RelatorioPGR";
import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "@/services/company/companyService";
import { getEmployeesByCompany } from "@/services/employee/employeeService";
import { Question } from "@/types/form";
import { Company, Employee } from "@/types/cadastro";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AvaliacaoResposta } from "@/types/avaliacao";
import { getEmployeeResponses, getFullEvaluation } from "@/services/form/evaluations";

const RelatoriosPage: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("diagnostico");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [respostas, setRespostas] = useState<AvaliacaoResposta[]>([]);
  const [avaliacaoId, setAvaliacaoId] = useState<string | null>(null);
  const [analystNotes, setAnalystNotes] = useState<string>("");

  // Sample questions and answers for demonstration
  const sampleQuestions: Question[] = [
    {
      id: "q1",
      texto: "Você se sente sobrecarregado no trabalho?",
      secao_id: "s1",
      formulario_id: "f1",
      risco_id: "r1"
    },
    {
      id: "q2",
      texto: "Você tem autonomia para tomar decisões no seu trabalho?",
      secao_id: "s1",
      formulario_id: "f1",
      risco_id: "r2"
    },
    {
      id: "q3",
      texto: "Seu ambiente de trabalho é adequado para suas necessidades?",
      secao_id: "s2",
      formulario_id: "f1",
      risco_id: "r3"
    }
  ];

  const sampleAnswers = {
    q1: true,
    q2: false,
    q3: true
  };

  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies
  });

  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees", selectedCompanyId],
    queryFn: () => selectedCompanyId ? getEmployeesByCompany(selectedCompanyId) : Promise.resolve([]),
    enabled: !!selectedCompanyId
  });

  // Fetch employee evaluations when employee is selected
  const { data: evaluations = [], isLoading: isLoadingEvaluations } = useQuery({
    queryKey: ["employeeEvaluations", selectedEmployeeId],
    queryFn: async () => {
      if (!selectedEmployeeId) return [];
      
      console.log("Fetching evaluations for employee:", selectedEmployeeId);
      try {
        const { data, error } = await supabase
          .from('avaliacoes')
          .select('*, formularios(*)')
          .eq('funcionario_id', selectedEmployeeId);
        
        if (error) throw error;
        console.log("Evaluations fetched:", data);
        
        // If evaluations exist, set avaliacaoId to the most recent one
        if (data && data.length > 0) {
          // Sort by created_at in descending order to get the most recent
          const sortedEvals = [...data].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setAvaliacaoId(sortedEvals[0].id);
          
          // Load analyst notes
          if (sortedEvals[0].notas_analista) {
            setAnalystNotes(sortedEvals[0].notas_analista);
          }
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching evaluations:", error);
        toast.error("Erro ao carregar avaliações do funcionário");
        return [];
      }
    },
    enabled: !!selectedEmployeeId
  });

  // Fetch responses for the selected employee
  const { data: employeeResponses = [], isLoading: isLoadingResponses } = useQuery({
    queryKey: ["employeeResponses", selectedEmployeeId, reportGenerated],
    queryFn: async () => {
      if (!selectedEmployeeId || !reportGenerated) return [];
      
      try {
        const responses = await getEmployeeResponses(selectedEmployeeId);
        return responses;
      } catch (error) {
        console.error("Error in employeeResponses query:", error);
        return [];
      }
    },
    enabled: !!selectedEmployeeId && reportGenerated
  });

  useEffect(() => {
    if (employeeResponses && employeeResponses.length > 0) {
      // Make sure we convert to the correct type
      const typedResponses: AvaliacaoResposta[] = employeeResponses.map(response => ({
        id: response.id,
        avaliacao_id: response.avaliacao_id,
        pergunta_id: response.pergunta_id,
        pergunta: response.pergunta,
        resposta: response.resposta,
        observacao: response.observacao,
        opcoes_selecionadas: response.opcoes_selecionadas 
          ? (Array.isArray(response.opcoes_selecionadas) 
              ? response.opcoes_selecionadas 
              : JSON.parse(response.opcoes_selecionadas))
          : []
      }));
      
      setRespostas(typedResponses);
    } else {
      setRespostas([]);
    }
  }, [employeeResponses]);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedEmployeeId("");
    setReportGenerated(false);
    setRespostas([]);
  };

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setReportGenerated(false);
    setRespostas([]);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setReportGenerated(false);
  };

  const handleGenerateReport = () => {
    if (!selectedCompanyId) {
      toast.warning("Por favor, selecione uma empresa primeiro");
      return;
    }
    
    setIsGenerating(true);
    // Simulate report generation (in a real app, this would fetch data from the API)
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
      toast.success("Relatório gerado com sucesso!");
    }, 1500);
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null;
  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId) || null;

  // Get the riscos and perguntas for PGR from the respostas
  const pgrData = useMemo(() => {
    const riscos = new Map();
    
    // Agrupe as perguntas por risco
    if (Array.isArray(respostas)) {
      respostas.forEach(resposta => {
        if (resposta.resposta && resposta.pergunta?.risco) {
          const risco = resposta.pergunta.risco;
          if (!riscos.has(risco.id)) {
            riscos.set(risco.id, {
              id: risco.id,
              texto: risco.texto,
              severidade: risco.severidade,
              perguntas: [],
              funcoesExpostas: new Set(),
              analiseRisco: {
                probabilidade: "Média",
                severidade: risco.severidade?.nivel || "Média",
                status: risco.severidade?.nivel === "EXTREMAMENTE PREJUDICIAL" ? "Crítico" : "Em análise"
              },
              medidasControle: "Implementar medidas preventivas e monitorar periodicamente.",
              prazoImplementacao: "90 dias",
              responsaveis: "Equipe de Saúde Ocupacional",
            });
          }
          
          const riscoData = riscos.get(risco.id);
          riscoData.perguntas.push({
            id: resposta.pergunta_id,
            texto: resposta.pergunta.texto,
            resposta: resposta.resposta
          });
          
          // Add employee role to funcoesExpostas if available
          if (selectedEmployee?.role) {
            riscoData.funcoesExpostas.add(selectedEmployee.role);
          }
        }
      });
    }
    
    // Convert map to array and Sets to Arrays for template rendering
    return Array.from(riscos.values()).map(risco => ({
      ...risco,
      funcoesExpostas: Array.from(risco.funcoesExpostas)
    }));
  }, [respostas, selectedEmployee]);

  return (
    <Layout title="Relatórios">
      <div className="space-y-4 px-4 py-6">
        <FilterSection
          companies={companies}
          selectedCompanyId={selectedCompanyId}
          selectedEmployeeId={selectedEmployeeId}
          onCompanyChange={handleCompanyChange}
          onEmployeeChange={handleEmployeeChange}
          onPeriodChange={handlePeriodChange}
          isGenerating={isGenerating}
        />
        
        <div className="flex justify-end mb-4">
          <Button 
            onClick={handleGenerateReport} 
            disabled={!selectedCompanyId || isGenerating}
          >
            {isGenerating ? "Gerando..." : "Gerar Relatório"}
          </Button>
        </div>

        {reportGenerated && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="diagnostico">Diagnóstico Individual</TabsTrigger>
              <TabsTrigger value="mapa">Mapa de Risco</TabsTrigger>
              <TabsTrigger value="pgr">Relatório PGR</TabsTrigger>
            </TabsList>

            <TabsContent value="diagnostico" className="mt-0">
              <DiagnosticoIndividual respostas={respostas} />
            </TabsContent>

            <TabsContent value="mapa" className="mt-0">
              <MapaRiscoPsicossocial 
                companyId={selectedCompanyId}
                departmentId=""
                dateRange={{ from: new Date(), to: new Date() }}
              />
            </TabsContent>

            <TabsContent value="pgr" className="mt-0">
              {selectedCompany && selectedEmployee ? (
                <RelatorioPGR
                  company={selectedCompany}
                  employee={selectedEmployee}
                  questions={sampleQuestions}
                  answers={sampleAnswers}
                  pgRiscos={pgrData}
                />
              ) : (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  Selecione uma empresa e um funcionário para gerar o relatório PGR.
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        {!reportGenerated && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            Selecione uma empresa e clique em "Gerar Relatório" para visualizar os resultados.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RelatoriosPage;
