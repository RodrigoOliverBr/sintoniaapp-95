
import React from "react";
import { BarChart } from "@/components/ui/BarChart";

interface ResultsStatisticsChartProps {
  totalYes: number;
  totalNo: number;
}

export const ResultsStatisticsChart: React.FC<ResultsStatisticsChartProps> = ({
  totalYes,
  totalNo,
}) => {
  // Garantir que os valores são numéricos
  const yes = typeof totalYes === 'number' ? totalYes : 0;
  const no = typeof totalNo === 'number' ? totalNo : 0;
  
  console.log(`Exibindo gráfico com Sim: ${yes}, Não: ${no}`);
  
  const chartData = [
    { name: "Sim", total: yes },
    { name: "Não", total: no },
  ];

  return (
    <div className="h-[200px] w-full">
      <BarChart
        data={chartData}
        index="name"
        categories={["total"]}
        colors={["#1EAEDB"]}
        valueFormatter={(value) => `${value} resposta(s)`}
      />
    </div>
  );
};
