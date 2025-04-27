
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ProgressHeaderProps {
  employeeName: string;
  jobRole: string;
  currentSection: number;
  totalSections: number;
  formTitle?: string;
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  employeeName,
  jobRole,
  currentSection,
  totalSections,
  formTitle = "Formulário"
}) => {
  const progressPercentage = totalSections ? (currentSection / totalSections) * 100 : 0;

  return (
    <div className="bg-muted/40 p-4 rounded-lg mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">
            Avaliação para: {employeeName}
          </h2>
          <p className="text-sm text-muted-foreground">
            Função: {jobRole || "Não especificada"}
          </p>
          <p className="text-sm text-muted-foreground">
            Formulário: {formTitle}
          </p>
        </div>
        <div className="mt-2 md:mt-0 text-right">
          <div className="text-sm font-medium">
            Seção {currentSection} de {totalSections}
          </div>
          <div className="text-xs text-muted-foreground">
            {progressPercentage.toFixed(0)}% completo
          </div>
        </div>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default ProgressHeader;
