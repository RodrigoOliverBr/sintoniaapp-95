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
import { Question, FormResult } from "@/types/form";
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

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees", selectedCompanyId],
    queryFn: () => selectedCompanyId ? getEmployeesByCompany(selectedCompanyId) : Promise.resolve([]),
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

  // Sample form result for diagnostic, fixing the answers to include questionId
  const sampleFormResult: FormResult = {
    id: "sample-result",
    employeeId: selectedEmployeeId || "1",
    empresa_id: selectedCompanyId || "1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    answers: {
      q1: { answer: true, questionId: "q1" },
      q2: { answer: false, questionId: "q2" },
      q3: { answer: true, questionId: "q3" }
    },
    total_sim: 2,
    total_nao: 1,
    is_complete: true,
    last_updated: new Date().toISOString(),
    formulario_id: "f1"
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
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="diagnostico">Diagnóstico Individual</TabsTrigger>
            <TabsTrigger value="mapa">Mapa de Risco</TabsTrigger>
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
        </Tabs>
      </div>
    </Layout>
  );
};

export default RelatoriosPage;
