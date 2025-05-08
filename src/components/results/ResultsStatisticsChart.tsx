
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
  const chartData = [
    { name: "Sim", total: totalYes },
    { name: "Não", total: totalNo },
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
