
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRankingAreasCriticas, AreaCriticaData } from "@/services/relatorios/relatoriosService";
import { Company } from '@/types/cadastro';

interface RankingAreasCriticasProps {
  selectedCompanyId?: string;
  companies: Company[];
}

const RankingAreasCriticas: React.FC<RankingAreasCriticasProps> = ({ selectedCompanyId, companies }) => {
  const [data, setData] = useState<AreaCriticaData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAreas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (selectedCompanyId) {
          const areas = await getRankingAreasCriticas(selectedCompanyId);
          setData(areas);
        } else {
          setData([]);
        }
      } catch (err) {
        setError('Erro ao carregar o ranking das áreas críticas.');
        console.error('Erro ao carregar o ranking das áreas críticas:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAreas();
  }, [selectedCompanyId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Áreas Críticas</CardTitle>
        <CardDescription>
          Exibe o ranking das áreas mais críticas da empresa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && data.length === 0 && <p>Nenhum dado disponível para a empresa selecionada.</p>}
        {!isLoading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="area" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default RankingAreasCriticas;
