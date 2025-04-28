
import React from "react";
import FormSelector from "@/components/form/FormSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Company, Employee, Form } from "@/types/cadastro";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FormSelectionSectionProps {
  companies: Company[];
  employees: Employee[];
  availableForms: Form[];
  selectedCompanyId: string | undefined;
  selectedEmployeeId: string | undefined;
  selectedFormId: string;
  onCompanyChange: (value: string) => void;
  onEmployeeChange: (value: string) => void;
  onFormChange: (value: string) => void;
  isLoadingHistory: boolean;
  showNewEvaluationButton?: boolean;
  onNewEvaluation?: () => void;
}

const FormSelectionSection: React.FC<FormSelectionSectionProps> = ({
  companies,
  employees,
  availableForms,
  selectedCompanyId,
  selectedEmployeeId,
  selectedFormId,
  onCompanyChange,
  onEmployeeChange,
  onFormChange,
  isLoadingHistory,
  showNewEvaluationButton,
  onNewEvaluation
}) => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-muted/40">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl text-primary">
              {false ? "Resultado da Avaliação" : "Preenchimento do Formulário"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {false
                ? "Visualize os resultados da avaliação e adicione suas observações."
                : "Selecione a empresa, o funcionário e o formulário para preencher."}
            </CardDescription>
          </div>
          {showNewEvaluationButton && onNewEvaluation && selectedEmployeeId && (
            <Button 
              onClick={onNewEvaluation}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Nova Avaliação
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <FormSelector
          companies={companies}
          employees={employees}
          availableForms={availableForms}
          selectedCompanyId={selectedCompanyId}
          selectedEmployeeId={selectedEmployeeId}
          selectedFormId={selectedFormId}
          onCompanyChange={onCompanyChange}
          onEmployeeChange={onEmployeeChange}
          onFormChange={onFormChange}
        />
      </CardContent>
    </Card>
  );
};

export default FormSelectionSection;
