
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilterSection from "@/components/relatorios/FilterSection";
import RankingAreasCriticas from "@/components/relatorios/RankingAreasCriticas";
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
import { FileText, Download } from "lucide-react";

const RelatoriosPage: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("mapa");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);

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

  // Load companies
  useEffect(() => {
    const loadCompaniesData = async () => {
      try {
        const companiesData = await getCompanies();
        setCompanies(companiesData || []);
        if (companiesData && companiesData.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(companiesData[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar empresas:", error);
        toast.error("Erro ao carregar empresas");
      }
    };
    
    loadCompaniesData();
  }, []);

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
        return data;
      } catch (error) {
        console.error("Error fetching evaluations:", error);
        toast.error("Erro ao carregar avaliações do funcionário");
        return [];
      }
    },
    enabled: !!selectedEmployeeId
  });

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedEmployeeId("");
  };

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
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

  const handleExportPDF = () => {
    toast.success("Exportando relatório para PDF...");
    // Aqui implementaríamos a lógica real de exportação para PDF
    setTimeout(() => {
      toast.success("PDF gerado com sucesso!");
    }, 1500);
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null;
  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId) || null;

  return (
    <Layout title="Relatórios">
      <div className="space-y-6 px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div className="w-full md:w-2/3">
            <h1 className="text-2xl font-bold mb-2">Relatórios Psicossociais</h1>
            <p className="text-muted-foreground">
              Visualize e exporte relatórios detalhados sobre riscos psicossociais
            </p>
          </div>
          
          <div className="flex flex-col w-full md:w-1/3 gap-4">
            <FilterSection
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              selectedEmployeeId={selectedEmployeeId}
              employees={employees}
              onCompanyChange={handleCompanyChange}
              onEmployeeChange={handleEmployeeChange}
              onPeriodChange={handlePeriodChange}
              isGenerating={isGenerating}
            />
            
            <Button 
              onClick={handleGenerateReport} 
              disabled={!selectedCompanyId || isGenerating}
              className="w-full"
            >
              {isGenerating ? "Gerando..." : "Gerar Relatório"}
            </Button>
          </div>
        </div>

        {reportGenerated && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Resultados da Análise</h2>
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-8 w-full md:w-1/2">
                <TabsTrigger value="mapa">Mapa de Risco</TabsTrigger>
                <TabsTrigger value="pgr">Relatório PGR</TabsTrigger>
              </TabsList>

              <TabsContent value="mapa" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <MapaRiscoPsicossocial 
                      companyId={selectedCompanyId}
                      departmentId=""
                      dateRange={{ from: new Date(), to: new Date() }}
                    />
                  </div>
                  
                  <div className="md:col-span-1">
                    <RankingAreasCriticas companyId={selectedCompanyId} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pgr" className="mt-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    Programa de Gerenciamento de Riscos Psicossociais
                  </h3>
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>

                {selectedCompany ? (
                  <RelatorioPGR
                    company={selectedCompany}
                    employee={selectedEmployee}
                    questions={sampleQuestions}
                    answers={sampleAnswers}
                  />
                ) : (
                  <div className="flex items-center justify-center py-10 text-muted-foreground">
                    Selecione uma empresa para gerar o relatório PGR.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {!reportGenerated && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">Nenhum relatório gerado</h3>
            <p className="text-muted-foreground max-w-md">
              Selecione uma empresa e clique em "Gerar Relatório" para visualizar os resultados.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RelatoriosPage;
