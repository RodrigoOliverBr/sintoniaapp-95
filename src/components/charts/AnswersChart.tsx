
import React from "react";
import { SimpleBarChart } from "./SimpleBarChart";

interface AnswersChartProps {
  yesCount: number;
  noCount: number;
}

export function AnswersChart({ yesCount, noCount }: AnswersChartProps) {
  const data = [
    {
      name: "Sim",
      value: yesCount,
      color: "#1EAEDB"
    },
    {
      name: "Não",
      value: noCount,
      color: "#E5E7EB"
    }
  ];

  return (
    <div className="space-y-4">
      <SimpleBarChart data={data} />
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted p-4 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">Sim</p>
          <p className="text-2xl font-bold text-primary">{yesCount}</p>
        </div>
        <div className="bg-muted p-4 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">Não</p>
          <p className="text-2xl font-bold text-muted-foreground">{noCount}</p>
        </div>
      </div>
    </div>
  );
}
