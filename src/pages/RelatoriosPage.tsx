
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilterSection from "@/components/relatorios/FilterSection";
import RankingAreasCriticas from "@/components/relatorios/RankingAreasCriticas";
import MapaRiscoPsicossocial from "@/components/relatorios/MapaRiscoPsicossocial";
import RelatorioPGR from "@/components/relatorios/RelatorioPGR";
import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "@/services/company/companyService";
import { Question } from "@/types/form";
import { Company } from "@/types/cadastro";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download } from "lucide-react";

const RelatoriosPage: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
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

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
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

  return (
    <Layout title="Relatórios">
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-6">
          <div className="w-full">
            <h1 className="text-2xl font-bold mb-2">Relatórios Psicossociais</h1>
            <p className="text-muted-foreground">
              Visualize e exporte relatórios detalhados sobre riscos psicossociais
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 bg-card p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Filtros</h2>
              <FilterSection
                companies={companies}
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={handleCompanyChange}
                onPeriodChange={handlePeriodChange}
                isGenerating={isGenerating}
              />
              
              <Button 
                onClick={handleGenerateReport} 
                disabled={!selectedCompanyId || isGenerating}
                className="w-full mt-6"
              >
                {isGenerating ? "Gerando..." : "Gerar Relatório"}
              </Button>
            </div>
            
            <div className="w-full md:w-2/3">
              {reportGenerated ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Resultados da Análise</h2>
                    <Button variant="outline" onClick={handleExportPDF}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar PDF
                    </Button>
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 mb-6 w-full">
                      <TabsTrigger value="mapa">Mapa de Risco</TabsTrigger>
                      <TabsTrigger value="pgr">Relatório PGR</TabsTrigger>
                    </TabsList>

                    <TabsContent value="mapa" className="mt-0 space-y-6">
                      <MapaRiscoPsicossocial 
                        companyId={selectedCompanyId}
                        departmentId=""
                        dateRange={{ from: new Date(), to: new Date() }}
                      />
                      
                      <RankingAreasCriticas companyId={selectedCompanyId} />
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
                          employee={null}
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
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-lg shadow-sm">
                  <FileText className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Nenhum relatório gerado</h3>
                  <p className="text-muted-foreground max-w-md">
                    Selecione uma empresa e clique em "Gerar Relatório" para visualizar os resultados.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RelatoriosPage;
