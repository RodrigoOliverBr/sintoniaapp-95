import React from "react";
import FormSelector from "@/components/form/FormSelector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, Employee, Company } from "@/types/cadastro";

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
  isLoadingHistory
}) => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-muted/40">
        <CardTitle className="text-2xl text-primary">
          {false ? "Resultado da Avaliação" : "Preenchimento do Formulário"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {false
            ? "Visualize os resultados da avaliação e adicione suas observações."
            : "Selecione a empresa, o funcionário e o formulário para preencher."}
        </CardDescription>
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
