import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveBar } from "@nivo/bar";
import { getFormResults } from "@/services";
import { formSections } from "@/data/formData";

interface RankingData {
  area: string;
  value: number;
}

const RankingAreasCriticas = () => {
  const [rankingData, setRankingData] = React.useState<RankingData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

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
          <div style={{ height: '400px' }}>
            <ResponsiveBar
              data={chartData}
              keys={['score']}
              indexBy="area"
              margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
              padding={0.3}
              colors={{ scheme: 'category10' }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Área',
                legendPosition: 'middle',
                legendOffset: 32
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Pontuação',
                legendPosition: 'middle',
                legendOffset: -40
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
              legends={[
                {
                  dataFrom: 'keys',
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 120,
                  translateY: 0,
                  itemsSpacing: 2,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: 'left-to-right',
                  itemOpacity: 0.85,
                  symbolSize: 20,
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
              tooltip={({ data, indexValue, color }) => (
                <div style={{ padding: '10px', background: 'white', border: `1px solid ${color}` }}>
                  <strong>Área:</strong> {indexValue}<br />
                  <strong>Pontuação:</strong> {data.score}
                </div>
              )}
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
