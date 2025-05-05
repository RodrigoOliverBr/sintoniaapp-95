
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface MapaRiscoPsicossocialProps {
  companyId: string;
  departmentId?: string;
  dateRange?: { from: Date; to: Date };
}

interface DimensionData {
  name: string;
  totalResponses: number;
  totalYes: number;
  percentYes: number;
  value: number;
  fullMark: number;
}

const DIMENSOES = {
  'compensacao': 'Compensação',
  'dupla_jornada': 'Dupla Jornada',
  'demandas': 'Demandas',
  'assedio': 'Assédio',
  'organizacao': 'Organização',
  'trabalho': 'Trabalho',
  'apoio': 'Apoio'
};

const MapaRiscoPsicossocial: React.FC<MapaRiscoPsicossocialProps> = ({
  companyId,
  departmentId,
  dateRange
}) => {
  const [dimensionData, setDimensionData] = useState<DimensionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (companyId) {
      loadDimensionData();
    }
  }, [companyId, departmentId, dateRange]);

  const loadDimensionData = async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      console.log("Carregando dados das dimensões para empresa:", companyId);
      
      // In a real implementation, we would retrieve the risk groups (dimensions) 
      // and aggregate the responses for each dimension
      
      // Simulating data for now
      const dimensions = Object.keys(DIMENSOES);
      const mockData: DimensionData[] = dimensions.map(dim => {
        const totalResponses = Math.floor(Math.random() * 20) + 10; // 10-30 responses
        const totalYes = Math.floor(Math.random() * totalResponses);
        const percentYes = totalResponses > 0 ? Math.round((totalYes / totalResponses) * 100) : 0;
        
        return {
          name: DIMENSOES[dim as keyof typeof DIMENSOES],
          totalResponses,
          totalYes,
          percentYes,
          value: percentYes,
          fullMark: 100
        };
      });
      
      // Sort by dimension name
      mockData.sort((a, b) => a.name.localeCompare(b.name));
      
      console.log("Dados das dimensões carregados:", mockData);
      setDimensionData(mockData);
    } catch (error) {
      console.error("Erro ao carregar dados das dimensões:", error);
      toast.error("Erro ao carregar dados do mapa de risco");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Risco Psicossocial</CardTitle>
        <CardDescription>
          Visualize a distribuição de respostas positivas por dimensão psicossocial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-8 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : dimensionData.length > 0 ? (
          <>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dimensionData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Percentual de Sim"
                    dataKey="value"
                    stroke="#1EAEDB"
                    fill="#1EAEDB"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Percentual de Respostas Positivas por Dimensão</h3>
              <div className="space-y-4">
                {dimensionData.map((dim) => (
                  <div key={dim.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{dim.name}</span>
                      <span className="text-sm">
                        {dim.totalYes} / {dim.totalResponses} ({dim.percentYes}%)
                      </span>
                    </div>
                    <Progress value={dim.percentYes} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            Não há dados disponíveis para exibir o mapa de risco.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapaRiscoPsicossocial;
