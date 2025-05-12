
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaCriticaData, getRankingAreasCriticas } from "@/services/relatorios/relatoriosService";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RankingAreasCriticasProps {
  companyId: string;
}

const RankingAreasCriticas: React.FC<RankingAreasCriticasProps> = ({ companyId }) => {
  const { data: areasRanking = [], isLoading, error } = useQuery({
    queryKey: ["areasRanking", companyId],
    queryFn: () => getRankingAreasCriticas(companyId),
    enabled: !!companyId
  });

  // Sort areas by total in descending order
  const sortedAreas = [...areasRanking].sort((a, b) => b.total - a.total);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Áreas Críticas</CardTitle>
        <CardDescription>
          Visualização das áreas com maior número de respostas positivas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-md" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar o ranking de áreas críticas
            </AlertDescription>
          </Alert>
        ) : sortedAreas.length > 0 ? (
          <div className="space-y-6">
            {sortedAreas.map((area) => (
              <div key={area.area} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{area.area}</span>
                  <span className="text-sm font-medium">{area.total} respostas positivas</span>
                </div>
                <Progress value={area.total} max={20} className="h-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            Nenhuma área crítica identificada
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RankingAreasCriticas;
