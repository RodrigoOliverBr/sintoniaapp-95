
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvaliacaoResposta } from '@/types/avaliacao';
import { getEmployeeResponses } from '@/services/form/evaluations';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface MapaRiscoPsicossocialProps {
  companyId: string;
  departmentId?: string;
  dateRange?: { from: Date; to: Date };
}

// Define interface for dimension data
interface DimensionData {
  nome: string;
  totalSim: number;
  totalNao: number;
  totalPerguntas: number;
  percentualSim: number;
}

const MapaRiscoPsicossocial: React.FC<MapaRiscoPsicossocialProps> = ({ 
  companyId, 
  departmentId, 
  dateRange 
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [respostas, setRespostas] = useState<AvaliacaoResposta[]>([]);
  const [dimensoes, setDimensoes] = useState<DimensionData[]>([]);

  // Sample dimension mapping - in a real app, load this from DB or define in a proper way
  const riscoParaDimensao: Record<string, string> = {
    "r1": "Sobrecarga de Trabalho",
    "r2": "Autonomia",
    "r3": "Ambiente de Trabalho",
    "r4": "Relações Interpessoais",
    "r5": "Suporte Social",
    "r6": "Reconhecimento",
    "r7": "Segurança e Estabilidade",
    "r8": "Equilíbrio Trabalho-Vida"
  };
  
  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId, departmentId, dateRange]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get all employees for the company
      const { data: employees, error: empError } = await supabase
        .from('funcionarios')
        .select('id')
        .eq('empresa_id', companyId);
        
      if (empError) throw empError;
      
      // Get all responses for all employees
      const allResponses: AvaliacaoResposta[] = [];
      
      for (const employee of employees || []) {
        const employeeResponses = await getEmployeeResponses(employee.id);
        if (Array.isArray(employeeResponses)) {
          const typedResponses: AvaliacaoResposta[] = employeeResponses.map(r => ({
            id: r.id,
            avaliacao_id: r.avaliacao_id,
            pergunta_id: r.pergunta_id,
            pergunta: r.pergunta,
            resposta: r.resposta,
            observacao: r.observacao,
            opcoes_selecionadas: r.opcoes_selecionadas 
              ? (Array.isArray(r.opcoes_selecionadas) 
                  ? r.opcoes_selecionadas 
                  : []) 
              : []
          }));
          allResponses.push(...typedResponses);
        }
      }
      
      setRespostas(allResponses);
      calculateDimensionPercentages(allResponses);
    } catch (error) {
      console.error("Error loading risk map data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateDimensionPercentages = (resps: AvaliacaoResposta[]) => {
    if (!Array.isArray(resps) || resps.length === 0) {
      setDimensoes([]);
      return;
    }
    
    // Create mapping for dimensions
    const dimensoesMap = new Map<string, DimensionData>();
    
    // Process all responses
    resps.forEach(resposta => {
      if (resposta.pergunta?.risco?.id) {
        const riscoId = resposta.pergunta.risco.id;
        const dimensaoNome = riscoParaDimensao[riscoId] || `Dimensão ${riscoId}`;
        
        // Get or initialize dimension data
        if (!dimensoesMap.has(dimensaoNome)) {
          dimensoesMap.set(dimensaoNome, {
            nome: dimensaoNome,
            totalSim: 0,
            totalNao: 0,
            totalPerguntas: 0,
            percentualSim: 0
          });
        }
        
        // Update counts
        const dimensao = dimensoesMap.get(dimensaoNome)!;
        dimensao.totalPerguntas += 1;
        
        if (resposta.resposta === true) {
          dimensao.totalSim += 1;
        } else if (resposta.resposta === false) {
          dimensao.totalNao += 1;
        }
      }
    });
    
    // Calculate percentages
    dimensoesMap.forEach(dimensao => {
      const totalRespondidas = dimensao.totalSim + dimensao.totalNao;
      dimensao.percentualSim = totalRespondidas > 0 
        ? Math.round((dimensao.totalSim / totalRespondidas) * 100) 
        : 0;
    });
    
    // Convert to array for rendering
    const dimensoesArray = Array.from(dimensoesMap.values());
    
    // Sort by percentage (highest first)
    dimensoesArray.sort((a, b) => b.percentualSim - a.percentualSim);
    
    setDimensoes(dimensoesArray);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Risco Psicossocial</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : respostas.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              Nenhum dado disponível para exibir.
            </div>
          ) : (
            <div className="space-y-8">
              {/* Radar chart would go here */}
              <div className="h-[300px] bg-muted/30 flex justify-center items-center">
                <p className="text-muted-foreground">Visualização em Radar (Implementação Futura)</p>
              </div>
              
              {/* Percentual por dimensão */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Percentual de Respostas Positivas por Dimensão</h3>
                <div className="space-y-3">
                  {dimensoes.map((dimensao, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-sm">
                          {dimensao.nome}: {dimensao.totalSim} / {dimensao.totalPerguntas} ({dimensao.percentualSim}%)
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {dimensao.percentualSim}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${dimensao.percentualSim}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MapaRiscoPsicossocial;
