
import React from "react";
import { BarChart } from "@/components/ui/BarChart";

interface ResultsSeverityChartProps {
  severityCounts: {
    light: number;
    medium: number;
    high: number;
  };
}

export const ResultsSeverityChart: React.FC<ResultsSeverityChartProps> = ({
  severityCounts,
}) => {
  const severityChartData = [
    {
      name: "Lev. Prej.",
      total: severityCounts.light || 0,
    },
    {
      name: "Prejudicial",
      total: severityCounts.medium || 0,
    },
    {
      name: "Extrema. Prej.",
      total: severityCounts.high || 0,
    },
  ];

  return (
    <div className="h-[200px] w-full">
      <BarChart
        data={severityChartData}
        index="name"
        categories={["total"]}
        colors={["#FFD700", "#FF8C00", "#FF4500"]}
        valueFormatter={(value) => `${value}`}
      />
    </div>
  );
};
