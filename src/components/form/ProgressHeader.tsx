
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface ProgressHeaderProps {
  employeeName: string;
  jobRole: string;
  currentSection: number;
  totalSections: number;
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  employeeName,
  jobRole,
  currentSection,
  totalSections
}) => {
  const progress = (currentSection / totalSections) * 100;

  return (
    <div className="space-y-4 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-1">Avaliação para: {employeeName}</h2>
        <p className="text-muted-foreground">Função: {jobRole}</p>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Seção {currentSection} de {totalSections}</span>
          <span>{Math.round(progress)}% completo</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>
    </div>
  );
};

export default ProgressHeader;
