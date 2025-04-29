
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf";
import { Company } from "@/types/cadastro";
import { Risk, Severity, Mitigation } from '@/types/form';
import { Clock, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RelatorioPGRProps {
  companyId?: string;
}

// Status options for risk control measures
const STATUS_OPTIONS = [
  { value: "não_iniciado", label: "Não Iniciado", color: "bg-red-100 text-red-800" },
  { value: "planejando", label: "Planejando", color: "bg-orange-100 text-orange-800" },
  { value: "implementando", label: "Implementando", color: "bg-yellow-100 text-yellow-800" },
  { value: "monitorando", label: "Monitorando", color: "bg-blue-100 text-blue-800" },
  { value: "concluído", label: "Concluído", color: "bg-green-100 text-green-800" },
];

// Define interfaces
interface Employee {
  id: string;
  nome: string;
  cargo_id: string;
  cargo?: {
    nome: string;
  }
}

interface RiskAnalysis {
  id: string;
  texto: string;
  severidade: {
    id: string;
    nivel: string;
    ordem: number;
  };
  probability: number;
  affectedRoles: string[];
  mitigations: string[];
  borderColor: string;
  severityLevel: string;
  probabilityLevel: string;
  status: string;
  deadline: string;
  responsible: string;
}

const RelatorioPGR: React.FC<RelatorioPGRProps> = ({ companyId: propCompanyId }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>(propCompanyId || "");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [risks, setRisks] = useState<RiskAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
    loadCompanies();

    if (propCompanyId) {
      setSelectedCompany(propCompanyId);
      loadCompanyName(propCompanyId);
    }
  }, [propCompanyId]);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      
      if (data) {
        // Convert empresas data to Company type
        const companyData: Company[] = data.map(empresa => ({
          id: empresa.id,
          name: empresa.nome,
          type: empresa.tipo,
          // Add other required fields from Company type
          employees: empresa.numero_empregados || 0
        }));
        setCompanies(companyData);
      }
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    }
  };

  const loadCompanyName = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('nome')
        .eq('id', companyId)
        .single();
      
      if (error) throw error;
      if (data) setCompanyName(data.nome);
    } catch (error) {
      console.error("Erro ao carregar nome da empresa:", error);
    }
  };

  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value);
    loadCompanyName(value);
    setRisks([]);
  };

  const generateReport = async () => {
    if (!selectedCompany) {
      alert("Selecione uma empresa para gerar o relatório.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Get all employees for the company
      const { data: employees, error: employeesError } = await supabase
        .from('funcionarios')
        .select(`
          id,
          nome,
          cargo_id,
          cargos: cargo_id (nome)
        `)
        .eq('empresa_id', selectedCompany);

      if (employeesError) throw employeesError;

      // Map employees with their job roles
      const employeesWithRoles = employees?.map(emp => ({
        ...emp,
        cargo: {
          nome: emp.cargos?.nome || "Cargo não especificado"
        }
      })) || [];

      // 2. Get all evaluations for these employees
      const employeeIds = employeesWithRoles.map(emp => emp.id);
      
      let query = supabase
        .from('avaliacoes')
        .select('id, funcionario_id')
        .eq('empresa_id', selectedCompany)
        .eq('is_complete', true)
        .in('funcionario_id', employeeIds);

      if (startDate && endDate) {
        query = query.gte('created_at', startDate.toISOString())
                     .lte('created_at', endDate.toISOString());
      }

      const { data: evaluations, error: evaluationsError } = await query;
      
      if (evaluationsError) throw evaluationsError;

      if (!evaluations || evaluations.length === 0) {
        alert("Nenhuma avaliação encontrada para esta empresa no período selecionado.");
        setIsLoading(false);
        return;
      }

      // 3. Get all responses for these evaluations
      const evaluationIds = evaluations.map(evaluation => evaluation.id);
      const { data: responses, error: responsesError } = await supabase
        .from('respostas')
        .select(`
          pergunta_id,
          resposta,
          avaliacao_id,
          avaliacoes: avaliacao_id (funcionario_id)
        `)
        .in('avaliacao_id', evaluationIds);
      
      if (responsesError) throw responsesError;

      // 4. Get all questions with their risks
      const { data: questions, error: questionsError } = await supabase
        .from('perguntas')
        .select(`
          id,
          texto,
          risco_id,
          risco: riscos (
            id,
            texto,
            severidade_id,
            severidade: severidade (
              id,
              nivel,
              ordem
            )
          )
        `);
      
      if (questionsError) throw questionsError;

      // 5. Get mitigations for risks
      const { data: mitigations, error: mitigationsError } = await supabase
        .from('mitigacoes')
        .select('id, risco_id, texto');
        
      if (mitigationsError) throw mitigationsError;

      // Process the data to create risk analysis
      const riskMap = new Map<string, {
        risk: any;
        yesCount: number;
        totalCount: number;
        affectedRoles: Set<string>;
        affectedEmployeeIds: Set<string>;
        mitigations: string[];
      }>();

      // Process responses
      responses?.forEach(response => {
        const question = questions?.find(q => q.id === response.pergunta_id);
        if (!question || !question.risco || !response.avaliacoes) return;
        
        const risk = question.risco;
        const employeeId = response.avaliacoes.funcionario_id;
        const employee = employeesWithRoles.find(emp => emp.id === employeeId);
        
        if (!employee) return;

        const roleName = employee.cargo.nome;
        
        // Initialize or update risk data
        if (!riskMap.has(risk.id)) {
          riskMap.set(risk.id, {
            risk,
            yesCount: 0,
            totalCount: 0,
            affectedRoles: new Set<string>(),
            affectedEmployeeIds: new Set<string>(),
            mitigations: mitigations?.filter(m => m.risco_id === risk.id).map(m => m.texto) || []
          });
        }
        
        const riskData = riskMap.get(risk.id)!;
        
        // Count responses
        if (response.resposta === true) {
          riskData.yesCount++;
          riskData.affectedRoles.add(roleName);
          riskData.affectedEmployeeIds.add(employeeId);
        }
        
        if (response.resposta === true || response.resposta === false) {
          riskData.totalCount++;
        }
      });

      // Convert risk map to risk analysis array
      const riskAnalysis: RiskAnalysis[] = Array.from(riskMap.values())
        .filter(data => data.yesCount > 0) // Only include risks with at least one "Yes"
        .map(data => {
          const probability = data.totalCount > 0 ? (data.yesCount / data.totalCount) * 100 : 0;
          
          // Determine probability level
          let probabilityLevel = "Baixa";
          if (probability > 60) {
            probabilityLevel = "Alta";
          } else if (probability > 20) {
            probabilityLevel = "Média";
          }
          
          // Determine severity level based on the risk's severity
          let severityLevel = "Baixa";
          let borderColor = "border-green-500";
          
          if (data.risk.severidade?.nivel?.includes("EXTREMAMENTE")) {
            severityLevel = "Alta";
            borderColor = "border-red-500";
          } else if (data.risk.severidade?.nivel?.includes("PREJUDICIAL")) {
            severityLevel = "Média";
            borderColor = "border-yellow-500";
          }

          return {
            id: data.risk.id,
            texto: data.risk.texto,
            severidade: data.risk.severidade,
            probability,
            affectedRoles: Array.from(data.affectedRoles),
            mitigations: data.mitigations,
            borderColor,
            severityLevel,
            probabilityLevel,
            status: "não_iniciado", // default status
            deadline: "",
            responsible: ""
          };
        })
        .sort((a, b) => {
          // Sort by severity (high to low), then by probability (high to low)
          const severityComparison = (b.severidade?.ordem || 0) - (a.severidade?.ordem || 0);
          if (severityComparison !== 0) return severityComparison;
          return b.probability - a.probability;
        });

      setRisks(riskAnalysis);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório. Verifique o console para mais detalhes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (riskId: string, status: string) => {
    setRisks(prevRisks => 
      prevRisks.map(risk => 
        risk.id === riskId ? { ...risk, status } : risk
      )
    );
  };

  const handleDeadlineChange = (riskId: string, deadline: string) => {
    setRisks(prevRisks => 
      prevRisks.map(risk => 
        risk.id === riskId ? { ...risk, deadline } : risk
      )
    );
  };

  const handleResponsibleChange = (riskId: string, responsible: string) => {
    setRisks(prevRisks => 
      prevRisks.map(risk => 
        risk.id === riskId ? { ...risk, responsible } : risk
      )
    );
  };

  const handleMitigationChange = (riskId: string, mitigations: string[]) => {
    setRisks(prevRisks => 
      prevRisks.map(risk => 
        risk.id === riskId ? { ...risk, mitigations } : risk
      )
    );
  };

  const exportToPDF = () => {
    if (risks.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Add header
      doc.setFontSize(18);
      doc.text("Programa de Gerenciamento de Riscos Psicossociais", 20, 20);
      
      doc.setFontSize(12);
      doc.text(`ISTAS21-BR - Avaliação de Riscos Psicossociais (NR-01)`, 20, 30);
      
      // Company info
      doc.text(`Empresa: ${companyName}`, 20, 45);
      
      let dateRange = "Período completo";
      if (startDate && endDate) {
        dateRange = `${format(startDate, "dd/MM/yyyy")} a ${format(endDate, "dd/MM/yyyy")}`;
      }
      doc.text(`Período de Avaliação: ${dateRange}`, 120, 45);
      
      doc.text(`Data de Emissão: ${format(new Date(), "dd/MM/yyyy")}`, 20, 55);
      doc.text(`Metodologia: ISTAS21-BR (NR-01)`, 120, 55);
      
      let yPos = 70;

      // Add each risk
      risks.forEach((risk, index) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        // Risk title and description
        doc.setFillColor(index % 2 === 0 ? 245 : 240);
        doc.rect(15, yPos, 180, 8, "F");
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(risk.texto, 20, yPos + 6);
        
        yPos += 15;
        
        // Affected roles
        doc.setFontSize(10);
        doc.text("Funções Expostas:", 20, yPos);
        yPos += 5;
        
        const roleChunks = [];
        let currentChunk = "";
        
        risk.affectedRoles.forEach(role => {
          if (currentChunk.length + role.length > 60) {
            roleChunks.push(currentChunk);
            currentChunk = role;
          } else {
            currentChunk += (currentChunk ? ", " : "") + role;
          }
        });
        
        if (currentChunk) {
          roleChunks.push(currentChunk);
        }
        
        roleChunks.forEach(chunk => {
          doc.text(chunk, 25, yPos);
          yPos += 5;
        });
        
        yPos += 5;
        
        // Risk analysis
        doc.text("Análise de Risco:", 20, yPos);
        yPos += 10;
        
        doc.text(`Probabilidade: ${risk.probabilityLevel} (${risk.probability.toFixed(1)}%)`, 25, yPos);
        yPos += 5;
        doc.text(`Severidade: ${risk.severityLevel}`, 25, yPos);
        yPos += 5;
        
        const status = STATUS_OPTIONS.find(s => s.value === risk.status)?.label || "Não Iniciado";
        doc.text(`Status Atual: ${status}`, 25, yPos);
        yPos += 10;
        
        // Control measures
        doc.text("Medidas de Controle:", 20, yPos);
        yPos += 5;
        
        risk.mitigations.forEach(mitigation => {
          // Check if we need a new page
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text(`- ${mitigation}`, 25, yPos);
          yPos += 5;
        });
        
        yPos += 5;
        
        // Implementation deadline and responsible
        doc.text(`Prazo para Implementação: ${risk.deadline}`, 20, yPos);
        yPos += 5;
        doc.text(`Responsáveis: ${risk.responsible}`, 20, yPos);
        
        yPos += 15;
      });

      doc.save(`PGR_Psicossocial_${companyName}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
    } catch (error) {
      console.error("Erro ao exportar para PDF:", error);
      alert("Erro ao exportar para PDF. Verifique o console para mais detalhes.");
    }
  };

  const getRiskStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(opt => opt.value === status)?.color || "bg-gray-100 text-gray-800";
  };

  // Function to convert simple text mitigations to HTML with line breaks
  const formatMitigationsToHTML = (mitigations: string[]) => {
    return mitigations.join('\n');
  };
  
  // Function to convert textarea with line breaks to array of mitigations
  const parseMitigationsFromTextarea = (text: string): string[] => {
    return text.split('\n').filter(line => line.trim().length > 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório do Programa de Gerenciamento de Riscos Psicossociais (NR-01)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filter section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
          <div>
            <Label htmlFor="company">Empresa:</Label>
            <Select value={selectedCompany} onValueChange={handleCompanyChange}>
              <SelectTrigger className="w-full">
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
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label>Data Inicial:</Label>
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                locale={ptBR}
              />
            </div>
            <div className="flex-1">
              <Label>Data Final:</Label>
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                locale={ptBR}
              />
            </div>
          </div>
          
          <div className="md:col-span-2 flex justify-end">
            <Button 
              onClick={generateReport} 
              disabled={!selectedCompany || isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? "Gerando..." : "Gerar Relatório PGR"}
            </Button>
          </div>
        </div>
        
        {/* Report Header */}
        {risks.length > 0 && (
          <div className="border p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Empresa</h3>
                <p className="text-lg font-medium">{companyName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Período de Avaliação</h3>
                <p className="text-lg font-medium">
                  {startDate && endDate 
                    ? `${format(startDate, "dd/MM/yyyy")} a ${format(endDate, "dd/MM/yyyy")}` 
                    : "Período completo"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Data de Emissão</h3>
                <p className="text-lg font-medium">{format(new Date(), "dd/MM/yyyy")}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Metodologia</h3>
                <p className="text-lg font-medium">ISTAS21-BR (NR-01)</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Risks */}
        {risks.map((risk, index) => (
          <div 
            key={risk.id} 
            className={`border-l-4 ${risk.borderColor} p-4 rounded-md shadow-sm bg-white`}
          >
            <div className="flex flex-wrap justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{risk.texto}</h2>
              </div>
              <div>
                <Badge 
                  variant="outline" 
                  className={risk.severityLevel === "Alta" ? "bg-red-100 text-red-800 border-red-200" : 
                             risk.severityLevel === "Média" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : 
                             "bg-green-100 text-green-800 border-green-200"}
                >
                  {risk.severityLevel}
                </Badge>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Funções Expostas:</h3>
              <div className="flex flex-wrap gap-2">
                {risk.affectedRoles.map((role, i) => (
                  <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="border rounded-md p-3">
                <h3 className="text-sm font-medium mb-2">Probabilidade</h3>
                <div 
                  className={`text-center py-2 rounded-md font-medium ${
                    risk.probabilityLevel === "Alta" ? "bg-red-100 text-red-800" : 
                    risk.probabilityLevel === "Média" ? "bg-yellow-100 text-yellow-800" : 
                    "bg-green-100 text-green-800"
                  }`}
                >
                  {risk.probabilityLevel} ({risk.probability.toFixed(1)}%)
                </div>
              </div>
              
              <div className="border rounded-md p-3">
                <h3 className="text-sm font-medium mb-2">Severidade</h3>
                <div 
                  className={`text-center py-2 rounded-md font-medium ${
                    risk.severityLevel === "Alta" ? "bg-red-100 text-red-800" : 
                    risk.severityLevel === "Média" ? "bg-yellow-100 text-yellow-800" : 
                    "bg-green-100 text-green-800"
                  }`}
                >
                  {risk.severityLevel}
                </div>
              </div>
              
              <div className="border rounded-md p-3">
                <h3 className="text-sm font-medium mb-2">Status Atual</h3>
                <Select
                  value={risk.status}
                  onValueChange={(value) => handleStatusChange(risk.id, value)}
                >
                  <SelectTrigger className={`w-full ${getRiskStatusColor(risk.status)}`}>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Medidas de Controle:</h3>
              <Textarea 
                value={formatMitigationsToHTML(risk.mitigations)}
                onChange={(e) => handleMitigationChange(risk.id, parseMitigationsFromTextarea(e.target.value))}
                className="h-32"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`deadline-${risk.id}`} className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Prazo para Implementação:
                </Label>
                <Input 
                  id={`deadline-${risk.id}`}
                  value={risk.deadline}
                  onChange={(e) => handleDeadlineChange(risk.id, e.target.value)}
                  placeholder="Ex: 30 dias"
                />
              </div>
              <div>
                <Label htmlFor={`responsible-${risk.id}`}>Responsáveis:</Label>
                <Input 
                  id={`responsible-${risk.id}`}
                  value={risk.responsible}
                  onChange={(e) => handleResponsibleChange(risk.id, e.target.value)}
                  placeholder="Ex: RH, Gerência"
                />
              </div>
            </div>
          </div>
        ))}
        
        {/* Export button */}
        {risks.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={exportToPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RelatorioPGR;
