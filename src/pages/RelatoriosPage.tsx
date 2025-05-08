
import React, { useState, useEffect } from "react";
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
import { AvaliacaoResposta } from '@/types/avaliacao';

const RelatoriosPage: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("diagnostico");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [respostas, setRespostas] = useState<AvaliacaoResposta[]>([]);
  const [avaliacaoId, setAvaliacaoId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

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
          .eq('funcionario_id', selectedEmployeeId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        console.log("Evaluations fetched:", data);
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
  const fetchEmployeeResponses = async () => {
    if (!selectedEmployeeId || !reportGenerated) {
      setRespostas([]);
      return;
    }
    
    try {
      setIsGenerating(true);
      console.log("Fetching responses for employee:", selectedEmployeeId);
      
      // First get the evaluation ID
      const { data: avaliacao, error: avaliacaoError } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('funcionario_id', selectedEmployeeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (avaliacaoError) {
        console.error("Error fetching evaluation:", avaliacaoError);
        toast.error("Erro ao carregar avaliação do funcionário");
        setRespostas([]);
        return;
      }
      
      if (!avaliacao) {
        console.log("No evaluation found for employee:", selectedEmployeeId);
        toast.error("Nenhuma avaliação encontrada para este funcionário");
        setRespostas([]);
        return;
      }
      
      setAvaliacaoId(avaliacao.id);
      console.log("Found evaluation ID:", avaliacao.id);
      console.log("Evaluation details:", avaliacao);
      
      // Set result with the evaluation data
      setResult({
        id: avaliacao.id,
        employeeId: avaliacao.funcionario_id,
        empresa_id: avaliacao.empresa_id,
        formulario_id: avaliacao.formulario_id,
        total_sim: avaliacao.total_sim,
        total_nao: avaliacao.total_nao,
        totalYes: avaliacao.total_sim,
        totalNo: avaliacao.total_nao,
        is_complete: avaliacao.is_complete,
        notas_analista: avaliacao.notas_analista,
        created_at: avaliacao.created_at,
        updated_at: avaliacao.updated_at,
        last_updated: avaliacao.last_updated
      });
      
      // Then get the responses with the questions and risks
      const { data, error } = await supabase
        .from('respostas')
        .select(`
          id, 
          avaliacao_id,
          pergunta_id,
          resposta,
          observacao,
          opcoes_selecionadas,
          pergunta:perguntas (
            id,
            texto,
            risco:riscos (
              id,
              texto,
              severidade:severidade (
                id,
                nivel,
                descricao
              )
            )
          )
        `)
        .eq('avaliacao_id', avaliacao.id);
      
      if (error) {
        console.error("Error fetching responses:", error);
        toast.error("Erro ao carregar respostas do funcionário");
        setRespostas([]);
        return;
      }
      
      console.log("Fetched responses:", data);
      
      if (data && data.length > 0) {
        const typedRespostas = data.map(item => ({
          ...item,
          opcoes_selecionadas: Array.isArray(item.opcoes_selecionadas) 
            ? item.opcoes_selecionadas 
            : []
        })) as AvaliacaoResposta[];
        
        setRespostas(typedRespostas);
        toast.success("Relatório gerado com sucesso!");
      } else {
        console.log("No responses found for evaluation:", avaliacao.id);
        toast.warning("Nenhuma resposta encontrada para a avaliação");
        setRespostas([]);
      }
    } catch (error) {
      console.error("Error in fetchEmployeeResponses:", error);
      toast.error("Erro ao carregar dados para o relatório");
      setRespostas([]);
    } finally {
      setIsGenerating(false);
    }
  };

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
    
    if (!selectedEmployeeId) {
      toast.warning("Por favor, selecione um funcionário");
      return;
    }
    
    setReportGenerated(true);
    fetchEmployeeResponses();
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null;
  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId) || null;

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
            disabled={!selectedCompanyId || !selectedEmployeeId || isGenerating}
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
              <DiagnosticoIndividual 
                result={result} 
                respostas={respostas} 
              />
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
                  respostas={respostas}
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
            Selecione uma empresa e um funcionário, e clique em "Gerar Relatório" para visualizar os resultados.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RelatoriosPage;
