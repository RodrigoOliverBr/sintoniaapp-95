import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getCompanies, getFormResultByEmployeeId } from "@/services";
import { jsPDF } from "jspdf";
import { Company } from "@/types/cadastro";
import { formSections } from "@/data/formData";

interface RelatorioPGRProps {
  // Define as props que o componente recebe, se necessário
}

const RelatorioPGR: React.FC<RelatorioPGRProps> = () => {
  const [selectedCompany, setSelectedCompany] = useState<string | undefined>(undefined);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [includePersonalInfo, setIncludePersonalInfo] = useState(false);
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);

  React.useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companiesData = await getCompanies();
        setCompanies(companiesData);
      } catch (error) {
        console.error("Erro ao carregar empresas:", error);
        // Lógica para tratar o erro, como exibir uma mensagem para o usuário
      }
    };

    loadCompanies();
  }, []);

  const generatePDF = () => {
    if (!selectedCompany) {
      alert("Selecione uma empresa para gerar o relatório.");
      return;
    }

    const doc = new jsPDF();
    doc.text("Relatório PGR", 10, 10);
    doc.text(`Empresa: ${selectedCompany}`, 10, 20);

    // Adicione aqui a lógica para adicionar informações ao PDF
    // Isso pode incluir dados da empresa, funcionários, resultados do formulário, etc.

    doc.save("relatorio-pgr.pdf");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório do Programa de Gerenciamento de Riscos (PGR)</CardTitle>
      </CardHeader>
      <CardContent className="pl-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="company">Selecione a Empresa:</Label>
            <Select onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-[380px]">
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block mb-2">Opções do Relatório:</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePersonalInfo"
                  checked={includePersonalInfo}
                  onCheckedChange={(checked) => setIncludePersonalInfo(!!checked)}
                />
                <Label htmlFor="includePersonalInfo">Incluir Informações Pessoais</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAnswers"
                  checked={includeAnswers}
                  onCheckedChange={(checked) => setIncludeAnswers(!!checked)}
                />
                <Label htmlFor="includeAnswers">Incluir Respostas do Questionário</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeRecommendations"
                  checked={includeRecommendations}
                  onCheckedChange={(checked) => setIncludeRecommendations(!!checked)}
                />
                <Label htmlFor="includeRecommendations">Incluir Recomendações</Label>
              </div>
            </div>
          </div>

          <Button onClick={generatePDF} disabled={!selectedCompany}>
            Gerar Relatório PGR
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioPGR;
