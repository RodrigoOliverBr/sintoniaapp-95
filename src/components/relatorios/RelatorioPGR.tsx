
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Company, Employee } from '@/types/cadastro';
import { Question } from '@/types/form';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRiscosPorEmpresa } from '@/services/relatorios/relatoriosService';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import RiscoCard from './RiscoCard';
import { getPlanoMitigacao, savePlanoMitigacao } from '@/services/relatorios/planosMitigacaoService';

export interface RelatorioPGRProps {
  company: Company;
  employee?: Employee | null;
  questions: Question[];
  answers: Record<string, any>;
}

interface RiscoPGR {
  id: string;
  titulo: string;
  descricao: string;
  funcoes: string[];
  probabilidade: string;
  totalYes?: number;
  totalQuestions?: number;
  severidade: string;
  status: string;
  medidasControle: string;
  prazo: string;
  responsavel: string;
}

const RelatorioPGR: React.FC<RelatorioPGRProps> = ({ 
  company, 
  employee = null,
  questions, 
  answers 
}) => {
  const companyId = company?.id;
  const companyName = company?.name || company?.nome || "Empresa";
  const queryClient = useQueryClient();
  
  // Estados para armazenar edições
  const [editedRisks, setEditedRisks] = useState<Record<string, Partial<RiscoPGR>>>({});
  
  // Fetch risks from the service
  const { data: riscos = [], isLoading } = useQuery({
    queryKey: ['riscos', companyId],
    queryFn: () => companyId ? getRiscosPorEmpresa(companyId) : Promise.resolve([]),
    enabled: !!companyId
  });
  
  // Função para definir valores padrão para os riscos quando carregados
  useEffect(() => {
    if (riscos.length > 0) {
      // Para cada risco, definimos valores padrão se estiverem vazios
      const defaults: Record<string, Partial<RiscoPGR>> = {};
      
      riscos.forEach((risco: RiscoPGR) => {
        if (!risco.prazo) {
          defaults[risco.id] = {
            ...defaults[risco.id],
            prazo: "30 dias"
          };
        }
        
        if (!risco.responsavel) {
          defaults[risco.id] = {
            ...defaults[risco.id],
            responsavel: "Recursos Humanos"
          };
        }
      });
      
      // Só atualizamos o estado se houver valores padrão para definir
      if (Object.keys(defaults).length > 0) {
        setEditedRisks(defaults);
      }
    }
  }, [riscos]);
  
  // Mutation for saving risk mitigation plans
  const saveMutation = useMutation({
    mutationFn: async ({ 
      riskId, 
      medidasControle, 
      prazo, 
      responsavel, 
      status 
    }: { 
      riskId: string; 
      medidasControle: string; 
      prazo: string; 
      responsavel: string; 
      status: string;
    }) => {
      if (!companyId) throw new Error("ID da empresa não disponível");
      
      return savePlanoMitigacao({
        empresa_id: companyId,
        risco_id: riskId,
        medidas_controle: medidasControle,
        prazo,
        responsavel,
        status: status as "Pendente" | "Implementando" | "Monitorando"
      });
    },
    onSuccess: () => {
      toast.success("Alterações salvas com sucesso!");
      // Invalidate and refetch the risks data
      queryClient.invalidateQueries({ queryKey: ['riscos', companyId] });
    },
    onError: (error) => {
      console.error("Erro ao salvar plano de mitigação:", error);
      toast.error("Erro ao salvar alterações");
    }
  });
  
  const handleMedidasChange = (riskId: string, value: string) => {
    setEditedRisks(prev => ({
      ...prev,
      [riskId]: {
        ...(prev[riskId] || {}),
        medidasControle: value
      }
    }));
  };
  
  const handlePrazoChange = (riskId: string, value: string) => {
    setEditedRisks(prev => ({
      ...prev,
      [riskId]: {
        ...(prev[riskId] || {}),
        prazo: value
      }
    }));
  };
  
  const handleResponsavelChange = (riskId: string, value: string) => {
    setEditedRisks(prev => ({
      ...prev,
      [riskId]: {
        ...(prev[riskId] || {}),
        responsavel: value
      }
    }));
  };
  
  const handleStatusChange = (riskId: string, value: string) => {
    setEditedRisks(prev => ({
      ...prev,
      [riskId]: {
        ...(prev[riskId] || {}),
        status: value
      }
    }));
  };
  
  const handleSaveChanges = (riskId: string) => {
    const editedRisk = editedRisks[riskId] || {};
    const risco = riscos.find((r: RiscoPGR) => r.id === riskId);
    
    if (!risco) {
      toast.error("Erro ao encontrar informações do risco");
      return;
    }
    
    const medidasControle = editedRisk.medidasControle !== undefined ? editedRisk.medidasControle : risco.medidasControle;
    const prazo = editedRisk.prazo !== undefined ? editedRisk.prazo : risco.prazo || "30 dias";
    const responsavel = editedRisk.responsavel !== undefined ? editedRisk.responsavel : risco.responsavel || "Recursos Humanos";
    const status = editedRisk.status !== undefined ? editedRisk.status : risco.status;
    
    saveMutation.mutate({ 
      riskId, 
      medidasControle, 
      prazo, 
      responsavel, 
      status 
    });
    
    // Clear edited state for this risk after saving
    setEditedRisks(prev => {
      const updated = { ...prev };
      delete updated[riskId];
      return updated;
    });
  };
  
  const handleExportPDF = () => {
    try {
      toast.info("Gerando PDF...");
      
      // Initialize jsPDF
      const doc = new jsPDF();
      
      // Add company information at the top
      doc.setFontSize(18);
      doc.text("Relatório de Gerenciamento de Riscos Psicossociais (PGR)", 14, 20);
      
      doc.setFontSize(12);
      doc.text(`Empresa: ${companyName}`, 14, 30);
      doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 36);
      doc.text(`Metodologia: ISTAS21-BR (NR-01)`, 14, 42);
      
      // Add risks information
      let yPosition = 55;
      doc.setFontSize(14);
      doc.text("Riscos Identificados e Planos de Mitigação", 14, yPosition);
      yPosition += 10;
      
      riscos.forEach((risco: RiscoPGR, index: number) => {
        if (yPosition > 250) { // Check if we need a new page
          doc.addPage();
          yPosition = 20;
        }
        
        const editedRisk = editedRisks[risco.id] || {};
        const medidasControle = editedRisk.medidasControle !== undefined ? 
            editedRisk.medidasControle : risco.medidasControle;
        const prazo = editedRisk.prazo !== undefined ? 
            editedRisk.prazo : risco.prazo;
        const responsavel = editedRisk.responsavel !== undefined ? 
            editedRisk.responsavel : risco.responsavel;
        const status = editedRisk.status !== undefined ? 
            editedRisk.status : risco.status;
            
        // Add risk title and description
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${risco.titulo}`, 14, yPosition);
        yPosition += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        // Split description into multiple lines if needed
        const descriptionLines = doc.splitTextToSize(risco.descricao, 180);
        doc.text(descriptionLines, 14, yPosition);
        yPosition += (descriptionLines.length * 5) + 5;
        
        // Add risk details in a table
        // @ts-ignore - jsPDF-AutoTable typing issue
        doc.autoTable({
          startY: yPosition,
          head: [['Informação', 'Valor']],
          body: [
            ['Probabilidade', risco.totalYes !== undefined && risco.totalQuestions !== undefined ? 
                `${risco.totalYes}/${risco.totalQuestions}` : risco.probabilidade],
            ['Severidade', risco.severidade],
            ['Status', status],
            ['Medidas de Controle', medidasControle || 'Não definidas'],
            ['Prazo', prazo || 'Não definido'],
            ['Responsável', responsavel || 'Não definido']
          ],
          theme: 'striped',
          margin: { left: 14, right: 14 },
          tableWidth: 'auto',
          styles: { overflow: 'linebreak', cellPadding: 3 },
          columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
        });
        
        // @ts-ignore - Get the final y position after the table
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      });
      
      // Add footer
      doc.setFontSize(8);
      doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 280);
      doc.text('Página 1 de 1', 170, 280);
      
      // Save the PDF
      doc.save(`PGR-${companyName}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar o PDF");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="bg-muted/40 border-none shadow-none">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Dados do Relatório</h3>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-sm font-medium text-muted-foreground w-32">Empresa:</span>
                  <span>{companyName}</span>
                </div>
                {employee && (
                  <div className="flex gap-2">
                    <span className="text-sm font-medium text-muted-foreground w-32">Funcionário:</span>
                    <span>{employee.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Informações Gerais</h3>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-sm font-medium text-muted-foreground w-32">Data de Emissão:</span>
                  <span>{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-sm font-medium text-muted-foreground w-32">Metodologia:</span>
                  <span>ISTAS21-BR (NR-01)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Riscos Identificados</h3>
        <Button variant="outline" onClick={handleExportPDF}>
          <FileDown className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>
      
      <div className="space-y-6">
        {riscos.map((risco: RiscoPGR) => {
          const editedRisk = editedRisks[risco.id] || {};
          const isEdited = Object.keys(editedRisk).length > 0;
          
          return (
            <RiscoCard
              key={risco.id}
              risco={risco}
              editedMedidasControle={editedRisk.medidasControle}
              editedPrazo={editedRisk.prazo || (!risco.prazo ? "30 dias" : undefined)}
              editedResponsavel={editedRisk.responsavel || (!risco.responsavel ? "Recursos Humanos" : undefined)}
              editedStatus={editedRisk.status}
              onMedidasChange={(value) => handleMedidasChange(risco.id, value)}
              onPrazoChange={(value) => handlePrazoChange(risco.id, value)}
              onResponsavelChange={(value) => handleResponsavelChange(risco.id, value)}
              onStatusChange={(value) => handleStatusChange(risco.id, value)}
              onSave={() => handleSaveChanges(risco.id)}
              isEdited={isEdited}
            />
          );
        })}
        
        {riscos.length === 0 && (
          <Card className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum risco identificado</h3>
            <p className="text-muted-foreground">
              Não foram encontrados riscos psicossociais relevantes para esta empresa.
            </p>
          </Card>
        )}
      </div>
      
      <div className="flex justify-between items-center border-t pt-4 text-sm text-muted-foreground">
        <p>Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
        <p>Página 1 de 1</p>
      </div>
    </div>
  );
};

export default RelatorioPGR;
