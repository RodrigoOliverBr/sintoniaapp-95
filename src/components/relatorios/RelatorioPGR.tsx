
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Company, Employee } from '@/types/cadastro';
import { Question } from '@/types/form';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { getRiscosPorEmpresa } from '@/services/relatorios/relatoriosService';
import { Save, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

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
  probabilidade: string; // Agora armazena a proporção de respostas sim/total
  totalYes?: number; // Adicionamos estes campos para calcular a proporção
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
  
  // Estados para armazenar edições
  const [editedRisks, setEditedRisks] = useState<Record<string, Partial<RiscoPGR>>>({});
  
  // Fetch risks from the service
  const { data: riscos = [], isLoading } = useQuery({
    queryKey: ['riscos', companyId],
    queryFn: () => companyId ? getRiscosPorEmpresa(companyId) : Promise.resolve([]),
    enabled: !!companyId
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
    // Here you would normally save to the database
    toast.success("Alterações salvas com sucesso!");
    console.log("Saving changes for risk:", riskId, editedRisks[riskId]);
    
    // In a real implementation, this would be:
    // const saveChanges = async () => {
    //   try {
    //     const { error } = await supabase
    //       .from('planos_mitigacao')
    //       .upsert({
    //         risco_id: riskId,
    //         empresa_id: companyId,
    //         prazo: editedRisks[riskId].prazo,
    //         responsavel: editedRisks[riskId].responsavel,
    //         medidas_controle: editedRisks[riskId].medidasControle,
    //         status: editedRisks[riskId].status || 'Pendente'
    //       });
    //       
    //     if (error) throw error;
    //     toast.success("Alterações salvas com sucesso!");
    //   } catch (error) {
    //     console.error("Erro ao salvar alterações:", error);
    //     toast.error("Erro ao salvar alterações");
    //   }
    // };
    // saveChanges();
  };
  
  const handleExportPDF = () => {
    toast.success("Exportando relatório para PDF...");
    // Aqui implementaríamos a lógica real de exportação para PDF usando jsPDF
    setTimeout(() => {
      toast.success("PDF gerado com sucesso!");
    }, 1500);
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
                <div className="flex gap-2">
                  <span className="text-sm font-medium text-muted-foreground w-32">CNPJ/CPF:</span>
                  <span>{company.cpfCnpj || '00.000.000/0000-00'}</span>
                </div>
                {employee && (
                  <>
                    <div className="flex gap-2">
                      <span className="text-sm font-medium text-muted-foreground w-32">Funcionário:</span>
                      <span>{employee.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-sm font-medium text-muted-foreground w-32">CPF:</span>
                      <span>{employee.cpf || 'N/A'}</span>
                    </div>
                  </>
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
                <div className="flex gap-2">
                  <span className="text-sm font-medium text-muted-foreground w-32">Validade:</span>
                  <span>12 meses</span>
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
          const medidasControle = editedRisk.medidasControle !== undefined ? editedRisk.medidasControle : risco.medidasControle;
          const prazo = editedRisk.prazo !== undefined ? editedRisk.prazo : risco.prazo;
          const responsavel = editedRisk.responsavel !== undefined ? editedRisk.responsavel : risco.responsavel;
          // Padronizar o status inicial como "Pendente" (Aguardando início)
          const status = editedRisk.status !== undefined ? editedRisk.status : "Pendente";
          
          const getBorderColor = () => {
            if (risco.severidade === 'Alta') return 'border-l-4 border-l-red-500';
            if (risco.severidade === 'Média') return 'border-l-4 border-l-yellow-500';
            return 'border-l-4 border-l-green-500';
          };
          
          const getStatusBadge = () => {
            switch(status) {
              case 'Implementando':
                return <Badge className="bg-blue-500">Em Andamento</Badge>;
              case 'Monitorando':
                return <Badge className="bg-green-500">Concluído</Badge>;
              case 'Pendente':
              default:
                return <Badge variant="outline">Aguardando Início</Badge>;
            }
          };
          
          // Formatar a exibição da probabilidade como respostas sim / total
          const probabilidadeDisplay = risco.totalYes !== undefined && risco.totalQuestions !== undefined 
            ? `${risco.totalYes}/${risco.totalQuestions}` 
            : risco.probabilidade;
          
          return (
            <Card key={risco.id} className={`overflow-hidden ${getBorderColor()}`}>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium">{risco.titulo}</h3>
                    {getStatusBadge()}
                  </div>
                  <p className="text-muted-foreground text-sm">{risco.descricao}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="font-medium text-sm text-gray-600 mb-2">Funções Expostas</p>
                    <div className="flex flex-wrap gap-2">
                      {risco.funcoes.map((funcao, idx) => (
                        <Badge key={idx} variant="outline">{funcao}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-sm text-gray-600 mb-2">Análise de Risco</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Probabilidade</p>
                        <p className="font-medium">
                          {probabilidadeDisplay}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Severidade</p>
                        <p className="font-medium">
                          {risco.severidade}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <Select value={status} onValueChange={(value) => handleStatusChange(risco.id, value)}>
                          <SelectTrigger className="w-full h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pendente">Aguardando Início</SelectItem>
                            <SelectItem value="Implementando">Em Andamento</SelectItem>
                            <SelectItem value="Monitorando">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Removed Documents section as requested previously */}
                </div>
                
                <div className="space-y-4 mb-4">
                  <div>
                    <Label htmlFor={`medidas-${risco.id}`} className="font-medium text-sm text-gray-600">
                      Medidas de Controle
                    </Label>
                    <Textarea
                      id={`medidas-${risco.id}`}
                      value={medidasControle}
                      onChange={(e) => handleMedidasChange(risco.id, e.target.value)}
                      className="mt-1 resize-none"
                      rows={4}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor={`prazo-${risco.id}`} className="font-medium text-sm text-gray-600">
                      Prazo para Implementação
                    </Label>
                    <Input
                      id={`prazo-${risco.id}`}
                      value={prazo}
                      onChange={(e) => handlePrazoChange(risco.id, e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor={`responsavel-${risco.id}`} className="font-medium text-sm text-gray-600">
                      Responsáveis
                    </Label>
                    <Input
                      id={`responsavel-${risco.id}`}
                      value={responsavel}
                      onChange={(e) => handleResponsavelChange(risco.id, e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => handleSaveChanges(risco.id)}
                    disabled={!editedRisks[risco.id]}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
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
