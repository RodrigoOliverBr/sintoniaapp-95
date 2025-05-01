
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilterSection from "@/components/relatorios/FilterSection";
import DiagnosticoIndividual from "@/components/relatorios/DiagnosticoIndividual";
import MapaRiscoPsicossocial from "@/components/relatorios/MapaRiscoPsicossocial";
import RankingAreasCriticas from "@/components/relatorios/RankingAreasCriticas";
import RelatorioPGR from "@/components/relatorios/RelatorioPGR";
import { useQuery } from "@tanstack/react-query";
import { getRankingAreasCriticas } from "@/services/relatorios/relatoriosService";
import { getCompanies } from "@/services/company/companyService";
import { getEmployeesByCompanyId } from "@/services/employee/employeeService";
import { Question } from "@/types/form";
import { Company, Employee } from "@/types/cadastro";

const RelatoriosPage: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("diagnostico");
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample questions and answers for demonstration
  const sampleQuestions: Question[] = [
    {
      id: "q1",
      texto: "Você se sente sobrecarregado no trabalho?",
      required: true,
      secao_id: "s1"
    },
    {
      id: "q2",
      texto: "Você tem autonomia para tomar decisões no seu trabalho?",
      required: true,
      secao_id: "s1"
    },
    {
      id: "q3",
      texto: "Seu ambiente de trabalho é adequado para suas necessidades?",
      required: true,
      secao_id: "s2"
    }
  ];

  const sampleAnswers = {
    q1: true,
    q2: false,
    q3: true
  };

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees", selectedCompanyId],
    queryFn: () => selectedCompanyId ? getEmployeesByCompanyId(selectedCompanyId) : Promise.resolve([]),
    enabled: !!selectedCompanyId
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
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  // Sample form result for diagnostic
  const sampleFormResult = {
    id: "sample-result",
    employee_id: selectedEmployeeId || "1",
    company_id: selectedCompanyId || "1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    answers: {
      q1: { answer: true },
      q2: { answer: false },
      q3: { answer: true }
    }
  };

  return (
    <Layout title="Relatórios">
      <div className="space-y-4 px-4 py-6">
        <FilterSection
          companies={companies}
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={handleCompanyChange}
          onGenerateReport={handleGenerateReport}
          isGenerating={isGenerating}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="diagnostico">Diagnóstico Individual</TabsTrigger>
            <TabsTrigger value="mapa">Mapa de Risco</TabsTrigger>
            <TabsTrigger value="areas">Ranking Áreas Críticas</TabsTrigger>
            <TabsTrigger value="pgr">Relatório PGR</TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostico" className="mt-0">
            <DiagnosticoIndividual
              result={sampleFormResult}
              questions={sampleQuestions}
            />
          </TabsContent>

          <TabsContent value="mapa" className="mt-0">
            <MapaRiscoPsicossocial 
              companyId={selectedCompanyId}
              departmentId=""
              dateRange={{ from: new Date(), to: new Date() }}
            />
          </TabsContent>

          <TabsContent value="areas" className="mt-0">
            <RankingAreasCriticas 
              selectedCompanyId={selectedCompanyId}
              companies={companies}
            />
          </TabsContent>

          <TabsContent value="pgr" className="mt-0">
            {selectedCompany && selectedEmployee ? (
              <RelatorioPGR 
                company={selectedCompany as Company}
                employee={selectedEmployee as Employee}
                questions={sampleQuestions}
                answers={sampleAnswers}
              />
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-md">
                <p className="text-gray-500">
                  Selecione uma empresa e um funcionário para visualizar o relatório PGR
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default RelatoriosPage;
