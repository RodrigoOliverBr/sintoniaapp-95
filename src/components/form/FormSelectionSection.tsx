
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Form } from "@/types/cadastro";
import { Company, Employee } from "@/types/cadastro";
import { Loader2, PlusCircle } from "lucide-react";
import CompanySelect from "@/components/form/CompanySelect";
import EmployeeSelect from "@/components/form/EmployeeSelect";
import FormSelector from "@/components/form/FormSelector";

interface FormSelectionSectionProps {
  companies: Company[];
  employees: Employee[];
  availableForms: Form[];
  selectedCompanyId?: string;
  selectedEmployeeId?: string;
  selectedFormId?: string;
  onCompanyChange: (value: string) => void;
  onEmployeeChange: (value: string) => void;
  onFormChange: (value: string) => void;
  showNewEvaluationButton?: boolean;
  onNewEvaluation?: () => void;
  isLoading?: boolean;
  isLoadingHistory?: boolean;
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
  showNewEvaluationButton = false,
  onNewEvaluation,
  isLoading = false,
  isLoadingHistory = false,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Seleção de Formulário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <CompanySelect
                companies={companies}
                value={selectedCompanyId}
                onChange={onCompanyChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employee">Funcionário</Label>
              <EmployeeSelect
                employees={employees}
                value={selectedEmployeeId}
                onChange={onEmployeeChange}
                disabled={!selectedCompanyId}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="form">Formulário</Label>
              <FormSelector
                forms={availableForms}
                value={selectedFormId}
                onChange={onFormChange}
                disabled={!selectedEmployeeId}
              />
            </div>
          </div>
        )}
        
        {showNewEvaluationButton && selectedEmployeeId && selectedFormId && (
          <div className="flex justify-end mt-4">
            <Button onClick={onNewEvaluation} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Nova Avaliação
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FormSelectionSection;
