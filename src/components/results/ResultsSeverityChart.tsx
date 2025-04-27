
import React from "react";
import { BarChart } from "@/components/ui/BarChart";

interface ResultsSeverityChartProps {
  severityCounts: {
    "LEVEMENTE PREJUDICIAL": number;
    "PREJUDICIAL": number;
    "EXTREMAMENTE PREJUDICIAL": number;
  };
}

export const ResultsSeverityChart: React.FC<ResultsSeverityChartProps> = ({
  severityCounts,
}) => {
  const severityChartData = [
    {
      name: "Lev. Prejud.",
      total: severityCounts["LEVEMENTE PREJUDICIAL"] || 0,
    },
    {
      name: "Prejudicial",
      total: severityCounts["PREJUDICIAL"] || 0,
    },
    {
      name: "Extrema. Prej.",
      total: severityCounts["EXTREMAMENTE PREJUDICIAL"] || 0,
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
