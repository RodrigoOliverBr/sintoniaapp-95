
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getFormResults } from "@/services";
import { formSections } from "@/data/formData";

interface RankingData {
  area: string;
  value: number;
}

const RankingAreasCriticas = () => {
  const [rankingData, setRankingData] = useState<RankingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const results = await getFormResults();
        
        // Process the results to calculate the ranking data
        const areaScores: { [key: string]: number } = {};
        formSections.forEach(section => {
          areaScores[section.title] = 0;
        });

        results.forEach(result => {
          formSections.forEach(section => {
            // Assuming each question in the section contributes to the area score
            const sectionScore = Object.keys(result)
              .filter(key => formSections.find(s => s.title === section.title)?.questions.includes(key))
              .reduce((sum, key) => sum + (result[key] || 0), 0); // Ensure default value if result[key] is undefined
            
            areaScores[section.title] += sectionScore;
          });
        });

        // Convert areaScores to the desired ranking data format
        const ranking: RankingData[] = Object.keys(areaScores).map(area => ({
          area: area,
          value: areaScores[area]
        }));

        // Sort the ranking data by value in descending order
        ranking.sort((a, b) => b.value - a.value);

        setRankingData(ranking);
      } catch (error) {
        console.error("Erro ao buscar resultados:", error);
        // Handle error appropriately, e.g., display an error message
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = rankingData.map(item => ({
    area: item.area,
    score: item.value,
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
          <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="area" 
                  angle={-45} 
                  textAnchor="end"
                  height={80}
                />
                <YAxis name="Pontuação" />
                <Tooltip 
                  formatter={(value, name) => [`${value}`, 'Pontuação']}
                  labelFormatter={(label) => `Área: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="score" 
                  name="Pontuação" 
                  fill="#8884d8" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p>Nenhum dado disponível para o ranking.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RankingAreasCriticas;
