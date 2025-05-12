
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilterSection from "@/components/relatorios/FilterSection";
import RankingAreasCriticas from "@/components/relatorios/RankingAreasCriticas";
import MapaRiscoPsicossocial from "@/components/relatorios/MapaRiscoPsicossocial";
import RelatorioPGR from "@/components/relatorios/RelatorioPGR";
import { getCompanies } from "@/services/company/companyService";
import { Question } from "@/types/form";
import { Company } from "@/types/cadastro";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText } from "lucide-react";

const RelatoriosPage: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState("mapa");
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

  return (
    <Layout title="Relatórios">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Relatórios Psicossociais</h1>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-2/3">
              <h2 className="text-base font-medium mb-2">Empresa</h2>
              <FilterSection
                companies={companies}
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={handleCompanyChange}
                isGenerating={isGenerating}
              />
            </div>
            <div className="w-full md:w-auto mt-4 md:mt-0">
              <Button 
                onClick={handleGenerateReport} 
                disabled={!selectedCompanyId || isGenerating}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? "Gerando..." : "Gerar Relatório"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        {reportGenerated ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Resultados da Análise</h2>
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
                />
                
                <RankingAreasCriticas companyId={selectedCompanyId} />
              </TabsContent>

              <TabsContent value="pgr" className="mt-0">
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
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-lg shadow-sm border border-gray-100 text-center">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">Nenhum relatório gerado</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Configure a empresa acima e clique em "Gerar Relatório" para visualizar os resultados.
            </p>
            {selectedCompanyId && (
              <Button 
                onClick={handleGenerateReport} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Gerar Relatório
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RelatoriosPage;
