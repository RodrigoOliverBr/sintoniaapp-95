
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResultsActionsProps {
  onPrint: () => void;
}

export const ResultsActions: React.FC<ResultsActionsProps> = ({ onPrint }) => {
  const { toast } = useToast();

  const handleExportPDF = () => {
    toast({
      title: "Exportação em PDF",
      description: "A funcionalidade de exportação em PDF será implementada em breve."
    });
  };

  return (
    <div className="flex items-center justify-between print:hidden">
      <h2 className="text-2xl font-bold">Resultado da Avaliação</h2>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onPrint} className="flex items-center gap-1">
          <Printer className="h-4 w-4 mr-1" />
          Imprimir
        </Button>
        <Button variant="default" onClick={handleExportPDF} className="flex items-center gap-1">
          <Download className="h-4 w-4 mr-1" />
          Exportar PDF
        </Button>
      </div>
    </div>
  );
};
