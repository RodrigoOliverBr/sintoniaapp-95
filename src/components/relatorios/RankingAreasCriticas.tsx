
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/ui/BarChart";
import { getFormResults } from "@/services/form/formService";
import { formSections } from "@/data/formData";

interface RankingAreasCriticasProps {
  companyId: string;
}

const RankingAreasCriticas: React.FC<RankingAreasCriticasProps> = ({ companyId }) => {
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, you would filter by company ID
        const results = await getFormResults();
        
        // Process the results to calculate the ranking data
        const areaScores: Record<string, number> = {};
        
        formSections.forEach((section) => {
          areaScores[section.title] = 0;
        });
        
        // This is a simplified calculation - in a real app, you'd need to
        // process actual form results based on your data structure
        results.forEach((result: any) => {
          formSections.forEach((section) => {
            // Simulate adding a score for this section
            areaScores[section.title] += Math.floor(Math.random() * 30) + 10;
          });
        });
        
        // Convert areaScores to the desired ranking data format
        const ranking = Object.keys(areaScores).map((area) => ({
          area,
          value: areaScores[area]
        }));
        
        // Sort the ranking data by value in descending order
        ranking.sort((a, b) => b.value - a.value);
        
        setRankingData(ranking);
      } catch (error) {
        console.error("Erro ao buscar resultados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [companyId]);

  const chartData = rankingData.map((item) => ({
    name: item.area,
    value: item.value
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Áreas Críticas</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Carregando...</p>
        ) : chartData.length > 0 ? (
          <div style={{ height: '400px' }}>
            <BarChart
              data={chartData}
              index="name"
              categories={["value"]}
              colors={["#f87171"]} // Red color for critical areas
              valueFormatter={(value) => `${value} pontos`}
              className="w-full h-full"
            />
          </div>
        ) : (
          <p>Nenhum dado disponível para o ranking.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RankingAreasCriticas;
