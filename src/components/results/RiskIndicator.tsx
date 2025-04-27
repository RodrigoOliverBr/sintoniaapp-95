
import React from "react";

interface RiskIndicatorProps {
  score: number;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ score }) => {
  const getRiskLevel = () => {
    if (score < 20) return { level: "Baixo", color: "#4CAF50", width: "20%" };
    if (score < 40) return { level: "Moderado", color: "#FFC107", width: "40%" };
    if (score < 60) return { level: "Considerável", color: "#FF9800", width: "60%" };
    if (score < 80) return { level: "Alto", color: "#FF5722", width: "80%" };
    return { level: "Extremo", color: "#F44336", width: "100%" };
  };

  const risk = getRiskLevel();

  return (
    <div className="space-y-2">
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: risk.width, backgroundColor: risk.color }}
        ></div>
      </div>
      <div className="flex justify-between text-xs">
        <span>Baixo</span>
        <span>Moderado</span>
        <span>Considerável</span>
        <span>Alto</span>
        <span>Extremo</span>
      </div>
      <div className="mt-4 text-center">
        <div className="text-sm text-muted-foreground">Nível de risco</div>
        <div className="text-2xl font-bold" style={{ color: risk.color }}>
          {risk.level} ({score.toFixed(0)}%)
        </div>
      </div>
    </div>
  );
};
