
import React from "react";
import { SimpleBarChart } from "./SimpleBarChart";

interface SeverityCount {
  light: number;
  medium: number;
  high: number;
}

interface SeverityChartProps {
  severityCounts: SeverityCount;
}

export function SeverityChart({ severityCounts }: SeverityChartProps) {
  const data = [
    {
      name: "Lev. Prej.",
      value: severityCounts.light,
      color: "#FFD700"
    },
    {
      name: "Prejudicial",
      value: severityCounts.medium,
      color: "#FF8C00"
    },
    {
      name: "Extrem. Prej.",
      value: severityCounts.high,
      color: "#FF4500"
    }
  ];

  return (
    <div className="space-y-4">
      <SimpleBarChart data={data} />
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#FFD700]/10 p-3 rounded-lg text-center">
          <p className="text-xs text-muted-foreground">Levemente Prejudicial</p>
          <p className="text-lg font-bold text-[#FFD700]">{severityCounts.light}</p>
        </div>
        <div className="bg-[#FF8C00]/10 p-3 rounded-lg text-center">
          <p className="text-xs text-muted-foreground">Prejudicial</p>
          <p className="text-lg font-bold text-[#FF8C00]">{severityCounts.medium}</p>
        </div>
        <div className="bg-[#FF4500]/10 p-3 rounded-lg text-center">
          <p className="text-xs text-muted-foreground">Extremamente Prejudicial</p>
          <p className="text-lg font-bold text-[#FF4500]">{severityCounts.high}</p>
        </div>
      </div>
    </div>
  );
}
